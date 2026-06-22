// PROJ-6: Gemeinsame Typen für Einreichungen (Server + Client).

import type { FormValues } from "@/lib/form-engine/types";

/** Ein Einreichungs-Datensatz, wie ihn die Datenbank/Server-Schicht liefert. */
export interface SubmissionRow {
  id: string;
  user_id: string;
  form_id: string;
  reference: string;
  data: FormValues;
  submitted_at: string;
}

/** Antwort der Einreichungs-API an den Client. */
export interface SubmitResult {
  id: string;
  reference: string;
  submitted_at: string;
  /** Ob die Bestätigungs-E-Mail (best-effort) versendet werden konnte. */
  emailSent: boolean;
}

/** Nutzlast zum Einreichen (POST-Body). */
export interface SubmissionPayload {
  data: FormValues;
}
