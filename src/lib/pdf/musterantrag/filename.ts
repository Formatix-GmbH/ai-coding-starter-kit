// PROJ-18: Seiteneffektfreier Dateinamen-Helfer (server-sicher, keine Font-Registrierung).

/** Mit Referenz: musterantrag-FC-2026-A1B2C3.pdf, sonst datiert. */
export function musterantragPdfFilename(date = new Date(), reference?: string): string {
  if (reference) return `musterantrag-${reference}.pdf`;
  return `musterantrag-${date.toISOString().slice(0, 10)}.pdf`;
}
