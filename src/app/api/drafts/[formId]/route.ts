// PROJ-4: Entwurf-API — Laden/Speichern/Verwerfen eines Formular-Entwurfs.
// Owner-only über Supabase-Auth + RLS. Optimistische Konflikterkennung über
// updated_at; Lazy-Guard für die 14-Tage-Aufbewahrung.

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getDraftRow,
  insertDraftRow,
  updateDraftRow,
  deleteDraftRow,
} from "@/lib/drafts/store";
import { MAX_DRAFT_BYTES } from "@/lib/drafts/constants";
import { isDraftExpired } from "@/lib/drafts/expiry";
import { draftPayloadSchema, formIdSchema } from "@/lib/validation/draft";
import type { FormValues } from "@/lib/form-engine/types";

type Params = { params: Promise<{ formId: string }> };

/** Lädt den aktuellen Entwurf (oder null). Abgelaufene Entwürfe werden nicht
 *  ausgeliefert und beim Zugriff gelöscht (Lazy-Guard). */
export async function GET(_req: NextRequest, { params }: Params) {
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

  try {
    const draft = await getDraftRow(supabase, formId.data);
    if (draft && isDraftExpired(draft.updated_at)) {
      await deleteDraftRow(supabase, formId.data);
      return NextResponse.json({ draft: null });
    }
    return NextResponse.json({ draft: draft ?? null });
  } catch {
    return NextResponse.json({ error: "Entwurf konnte nicht geladen werden" }, { status: 500 });
  }
}

/** Speichert (legt an oder aktualisiert) den Entwurf. */
export async function PUT(req: NextRequest, { params }: Params) {
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

  const parsed = draftPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" },
      { status: 400 },
    );
  }

  const { data, activeSection, expectedUpdatedAt, force } = parsed.data;

  // Größenbegrenzung (Schutz vor übergroßen Payloads).
  if (Buffer.byteLength(JSON.stringify(data), "utf8") > MAX_DRAFT_BYTES) {
    return NextResponse.json({ error: "Entwurf ist zu groß" }, { status: 413 });
  }

  try {
    const existing = await getDraftRow(supabase, formId.data);

    // Optimistische Konflikterkennung: existiert ein neuerer Server-Stand als der
    // beim Laden bekannte, nicht blind überschreiben (außer bei force).
    if (existing && !force && expectedUpdatedAt !== existing.updated_at) {
      return NextResponse.json(
        { error: "Entwurf wurde anderswo aktualisiert", conflict: true, draft: existing },
        { status: 409 },
      );
    }

    const section = activeSection ?? null;
    const values = data as FormValues;
    const draft = existing
      ? await updateDraftRow(supabase, formId.data, values, section)
      : await insertDraftRow(supabase, user.id, formId.data, values, section);

    return NextResponse.json({ draft });
  } catch {
    return NextResponse.json({ error: "Entwurf konnte nicht gespeichert werden" }, { status: 500 });
  }
}

/** Verwirft (löscht) den Entwurf. */
export async function DELETE(_req: NextRequest, { params }: Params) {
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

  try {
    await deleteDraftRow(supabase, formId.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Entwurf konnte nicht gelöscht werden" }, { status: 500 });
  }
}
