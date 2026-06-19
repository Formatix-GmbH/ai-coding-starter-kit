// PROJ-4: Datenzugriffsschicht für Formular-Entwürfe.
// Kapselt die Supabase-Aufrufe, damit die Route-Handler-Logik (Auth, Validierung,
// Konflikt-/Ablaufprüfung) testbar bleibt. RLS scoped jeden Zugriff auf den
// eingeloggten Nutzer; zusätzlich wird user_id beim Anlegen gesetzt.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FormValues } from "@/lib/form-engine/types";
import type { DraftRow } from "./types";

const TABLE = "form_drafts";
const COLUMNS = "id, user_id, form_id, data, active_section, created_at, updated_at";

export async function getDraftRow(
  supabase: SupabaseClient,
  formId: string,
): Promise<DraftRow | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq("form_id", formId)
    .maybeSingle();
  if (error) throw error;
  return (data as DraftRow | null) ?? null;
}

export async function insertDraftRow(
  supabase: SupabaseClient,
  userId: string,
  formId: string,
  data: FormValues,
  activeSection: string | null,
): Promise<DraftRow> {
  const { data: row, error } = await supabase
    .from(TABLE)
    .insert({ user_id: userId, form_id: formId, data, active_section: activeSection })
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return row as DraftRow;
}

export async function updateDraftRow(
  supabase: SupabaseClient,
  formId: string,
  data: FormValues,
  activeSection: string | null,
): Promise<DraftRow> {
  const { data: row, error } = await supabase
    .from(TABLE)
    .update({ data, active_section: activeSection })
    .eq("form_id", formId)
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return row as DraftRow;
}

export async function deleteDraftRow(
  supabase: SupabaseClient,
  formId: string,
): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("form_id", formId);
  if (error) throw error;
}
