// PROJ-4: Ablaufprüfung für Entwürfe (rein, ohne Supabase). Bewusst in einem
// eigenen Modul, damit Route, Server-Komponenten und Tests dieselbe Logik teilen.

import { DRAFT_RETENTION_DAYS } from "./constants";

/** True, wenn ein Entwurf älter als die Aufbewahrungsfrist ist. */
export function isDraftExpired(updatedAt: string): boolean {
  const ageMs = Date.now() - new Date(updatedAt).getTime();
  return ageMs > DRAFT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
}
