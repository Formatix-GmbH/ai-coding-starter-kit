// PROJ-6: Ablaufprüfung für Einreichungen (rein, ohne Supabase). Eigenes Modul,
// damit Route, Server-Komponenten (Bestätigung/Liste) und Tests dieselbe Logik
// teilen — analog zum Entwurfs-Lazy-Guard (PROJ-4).

import { SUBMISSION_RETENTION_DAYS } from "./constants";

/** True, wenn eine Einreichung älter als die Aufbewahrungsfrist ist. */
export function isSubmissionExpired(submittedAt: string): boolean {
  const ageMs = Date.now() - new Date(submittedAt).getTime();
  return ageMs > SUBMISSION_RETENTION_DAYS * 24 * 60 * 60 * 1000;
}
