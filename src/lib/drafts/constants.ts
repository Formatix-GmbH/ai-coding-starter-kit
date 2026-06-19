// PROJ-4: Konstanten für Formular-Entwürfe.

/** Aufbewahrungsfrist eines unbearbeiteten Entwurfs (Datenminimierung, DSGVO). */
export const DRAFT_RETENTION_DAYS = 14;

/** Obergrenze für die Größe des gespeicherten Formularstands (Schutz vor Missbrauch). */
export const MAX_DRAFT_BYTES = 1_000_000; // ~1 MB
