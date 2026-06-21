// PROJ-5: Austauschbare PDF-Grenze ("Daten rein → PDF raus").
// MVP-Adapter = @react-pdf/renderer (clientseitig). Ein späterer Wechsel auf
// Chromium/iText tauscht nur die Implementierung dieser Funktion — Aufrufer und
// Datenvertrag (bereinigte, XSD-konforme Engine-Werte) bleiben unverändert.

import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { FlexcoverDocument } from "./flexcover/document";
import type { FormValues } from "@/lib/form-engine/types";

/** Erzeugt das FlexCover-Antrags-PDF aus den (bereits validierten und bereinigten)
 *  Formularwerten und liefert es als Blob. */
export async function generateFlexcoverPdf(values: FormValues): Promise<Blob> {
  const element = createElement(FlexcoverDocument, { values }) as ReactElement<DocumentProps>;
  return pdf(element).toBlob();
}

/** Sprechender Dateiname mit Datum, z. B. flexcover-antrag-2026-06-19.pdf. */
export function flexcoverPdfFilename(date = new Date()): string {
  return `flexcover-antrag-${date.toISOString().slice(0, 10)}.pdf`;
}
