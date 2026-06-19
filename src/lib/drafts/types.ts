// PROJ-4: Gemeinsame Typen für Formular-Entwürfe (Server + Client).

import type { FormValues } from "@/lib/form-engine/types";

/** Ein Entwurf-Datensatz, wie er von der API zurückgegeben wird. */
export interface DraftRow {
  id: string;
  user_id: string;
  form_id: string;
  data: FormValues;
  active_section: string | null;
  created_at: string;
  updated_at: string;
}

/** Nutzlast zum Speichern eines Entwurfs (PUT-Body). */
export interface DraftPayload {
  data: FormValues;
  activeSection?: string | null;
  /** Zuletzt bekannter `updated_at`-Stand (optimistische Konflikterkennung). */
  expectedUpdatedAt?: string | null;
  /** Konfliktprüfung überspringen (z. B. bewusste Übernahme bei anonym→Konto). */
  force?: boolean;
}
