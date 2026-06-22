// PROJ-6: Datenzugriffsschicht für Einreichungen.
// Kapselt die Supabase-Aufrufe, damit die Route-Logik (Auth, Validierung,
// PDF/E-Mail) testbar bleibt. RLS scoped jeden Zugriff auf den eingeloggten
// Nutzer; zusätzlich wird user_id beim Anlegen gesetzt.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FormValues } from "@/lib/form-engine/types";
import type { SubmissionRow } from "./types";
import { generateReference } from "./reference";

const TABLE = "submissions";
const COLUMNS = "id, user_id, form_id, reference, data, submitted_at";

// Postgres unique_violation — tritt bei (astronomisch seltener) Referenzkollision auf.
const UNIQUE_VIOLATION = "23505";
const MAX_REFERENCE_ATTEMPTS = 3;

/** Legt eine Einreichung an und vergibt eine eindeutige Referenznummer.
 *  Bei einer Referenzkollision wird mit neuer Referenz erneut versucht. */
export async function insertSubmissionRow(
  supabase: SupabaseClient,
  userId: string,
  formId: string,
  data: FormValues,
): Promise<SubmissionRow> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < MAX_REFERENCE_ATTEMPTS; attempt++) {
    const reference = generateReference();
    const { data: row, error } = await supabase
      .from(TABLE)
      .insert({ user_id: userId, form_id: formId, reference, data })
      .select(COLUMNS)
      .single();
    if (!error) return row as SubmissionRow;
    if ((error as { code?: string }).code !== UNIQUE_VIOLATION) throw error;
    lastError = error;
  }
  throw lastError;
}

/** Lädt eine Einreichung anhand ihrer ID (RLS liefert nur eigene). */
export async function getSubmissionRow(
  supabase: SupabaseClient,
  id: string,
): Promise<SubmissionRow | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as SubmissionRow | null) ?? null;
}

/** Listet die eigenen Einreichungen eines Formulars, neueste zuerst. */
export async function listSubmissionRows(
  supabase: SupabaseClient,
  formId: string,
): Promise<SubmissionRow[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq("form_id", formId)
    .order("submitted_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data as SubmissionRow[]) ?? [];
}
