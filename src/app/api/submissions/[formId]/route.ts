// PROJ-6: Einreichungs-API — POST legt eine Einreichung an, erzeugt das PDF
// serverseitig und versendet es per E-Mail (best-effort), leert dann den Entwurf.
// Owner-only über Supabase-Auth + RLS.
//
// Reihenfolge = Fehlersicherheit (vgl. Spec): Validierung → Protokollierung
// (= „erfolgreich eingereicht") → PDF + E-Mail (best-effort) → Entwurf leeren
// (best-effort). So gehen im Fehlerfall keine Daten verloren und es wird nie eine
// Einreichung fälschlich bestätigt.

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { insertSubmissionRow } from "@/lib/submissions/store";
import { deleteDraftRow } from "@/lib/drafts/store";
import { MAX_SUBMISSION_BYTES } from "@/lib/submissions/constants";
import { submissionPayloadSchema } from "@/lib/validation/submission";
import { formIdSchema } from "@/lib/validation/draft";
import { renderFlexcoverPdfBuffer } from "@/lib/pdf/server";
import { flexcoverPdfFilename } from "@/lib/pdf";
import { sendSubmissionEmail } from "@/lib/email/resend";
import type { FormValues } from "@/lib/form-engine/types";

// react-pdf/fontkit benötigt die Node-Laufzeit (nicht Edge).
export const runtime = "nodejs";

type Params = { params: Promise<{ formId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const formId = formIdSchema.safeParse((await params).formId);
  if (!formId.success) {
    return NextResponse.json({ error: "Ungültige Formular-ID" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Request-Body" }, { status: 400 });
  }

  const parsed = submissionPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" },
      { status: 400 },
    );
  }

  const values = parsed.data.data as FormValues;
  if (Buffer.byteLength(JSON.stringify(values), "utf8") > MAX_SUBMISSION_BYTES) {
    return NextResponse.json({ error: "Antrag ist zu groß" }, { status: 413 });
  }

  // 1) Einreichung protokollieren — das ist der „erfolgreich eingereicht"-Moment.
  let submission;
  try {
    submission = await insertSubmissionRow(supabase, user.id, formId.data, values);
  } catch {
    return NextResponse.json(
      { error: "Einreichung konnte nicht gespeichert werden" },
      { status: 500 },
    );
  }

  // 2) PDF erzeugen + per E-Mail versenden (best-effort; Einreichung bleibt gültig).
  let emailSent = false;
  try {
    if (user.email) {
      const pdf = await renderFlexcoverPdfBuffer(values, submission.reference);
      emailSent = await sendSubmissionEmail({
        to: user.email,
        reference: submission.reference,
        pdf,
        filename: flexcoverPdfFilename(new Date(), submission.reference),
      });
    }
  } catch (err) {
    // Best-effort, aber Ursache protokollieren (technischer Fehler, kein PII).
    console.error(
      "[submissions] PDF/E-Mail-Schritt fehlgeschlagen:",
      err instanceof Error ? (err.stack ?? err.message) : String(err),
    );
    emailSent = false;
  }

  // 3) Entwurf leeren (best-effort) — der Antrag ist abgeschlossen.
  try {
    await deleteDraftRow(supabase, formId.data);
  } catch {
    // unkritisch: eine verwaiste Entwurfskopie schadet nicht.
  }

  return NextResponse.json({
    id: submission.id,
    reference: submission.reference,
    submitted_at: submission.submitted_at,
    emailSent,
  });
}
