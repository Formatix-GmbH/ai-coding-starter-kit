// PROJ-6/14: Reiner Dateinamen-Helfer — OHNE Seiteneffekte (keine Font-Registrierung).
// Bewusst getrennt von index.ts, damit serverseitige Aufrufer ihn importieren
// können, ohne die Browser-Font-Registrierung (URL-Pfad `/pdf/fonts/…`) mitzuziehen
// — die im Node-Kontext sonst als Dateipfad fehlschlägt.

/** Sprechender Dateiname. Mit Referenz: flexcover-antrag-FC-2026-A1B2C3.pdf,
 *  sonst datiert: flexcover-antrag-2026-06-28.pdf. */
export function flexcoverPdfFilename(date = new Date(), reference?: string): string {
  if (reference) return `flexcover-antrag-${reference}.pdf`;
  return `flexcover-antrag-${date.toISOString().slice(0, 10)}.pdf`;
}
