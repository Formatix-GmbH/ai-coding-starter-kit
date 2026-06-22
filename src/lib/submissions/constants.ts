// PROJ-6: Konstanten für Einreichungen.

/** Aufbewahrungsfrist einer Einreichung (Datenminimierung, DSGVO). */
export const SUBMISSION_RETENTION_DAYS = 30;

/** Obergrenze für die Größe des eingereichten Formularstands (Schutz vor Missbrauch). */
export const MAX_SUBMISSION_BYTES = 1_000_000; // ~1 MB
