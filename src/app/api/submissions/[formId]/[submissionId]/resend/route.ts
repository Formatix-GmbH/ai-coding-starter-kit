// PROJ-6: „E-Mail erneut senden" für eine bestehende Einreichung.
// Owner-only (Auth + RLS). Erzeugt das PDF erneut aus dem gespeicherten Snapshot
// und versendet es best-effort. Kein PII in Fehlerantworten.

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSubmissionRow } from "@/lib/submissions/store";
import { isSubmissionExpired } from "@/lib/submissions/expiry";
import { submissionIdSchema } from "@/lib/validation/submission";
import { renderFlexcoverPdfBuffer } from "@/lib/pdf/server";
import { flexcoverPdfFilename } from "@/lib/pdf";
import { sendSubmissionEmail } from "@/lib/email/resend";

export const runtime = "nodejs";

type Params = { params: Promise<{ formId: string; submissionId: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { submissionId } = await params;
  const id = submissionIdSchema.safeParse(submissionId);
  if (!id.success) {
    return NextResponse.json({ error: "Ungültige Einreichungs-ID" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  let submission;
  try {
    submission = await getSubmissionRow(supabase, id.data);
  } catch {
    return NextResponse.json({ error: "Einreichung konnte nicht geladen werden" }, { status: 500 });
  }

  // RLS liefert nur eigene; abgelaufene Einreichungen gelten als nicht vorhanden.
  if (!submission || isSubmissionExpired(submission.submitted_at)) {
    return NextResponse.json({ error: "Einreichung nicht gefunden" }, { status: 404 });
  }

  if (!user.email) {
    return NextResponse.json({ emailSent: false });
  }

  let emailSent = false;
  try {
    const pdf = await renderFlexcoverPdfBuffer(submission.data, submission.reference);
    emailSent = await sendSubmissionEmail({
      to: user.email,
      reference: submission.reference,
      pdf,
      filename: flexcoverPdfFilename(new Date(), submission.reference),
    });
  } catch {
    emailSent = false;
  }

  return NextResponse.json({ emailSent });
}
