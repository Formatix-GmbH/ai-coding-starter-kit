// PROJ-5: Austauschbare PDF-Grenze ("Daten rein → PDF raus").
// MVP-Adapter = @react-pdf/renderer (clientseitig). Ein späterer Wechsel auf
// Chromium/iText tauscht nur die Implementierung dieser Funktion — Aufrufer und
// Datenvertrag (bereinigte, XSD-konforme Engine-Werte) bleiben unverändert.
//
// ⚠️ NUR im Browser importieren! Dieses Modul registriert beim Import die Arimo-
// Schrift mit einem BROWSER-URL-Pfad (`/pdf/fonts/…`). Im Node-/Server-Kontext
// versucht react-pdf, diese URL als Dateipfad zu öffnen → ENOENT (PROJ-6-Prod-Bug).
// Serverseitig stattdessen `@/lib/pdf/server` (Render) und `@/lib/pdf/filename`
// (reiner Helfer, ohne Font-Seiteneffekt) verwenden.

import { pdf, Font, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { FlexcoverDocument } from "./flexcover/document";
import type { FormValues } from "@/lib/form-engine/types";

// Arimo (Arial-metrisch-kompatibel, Apache-2.0) für die clientseitige Erzeugung.
// WOFF wird von react-pdf unterstützt (WOFF2 nicht); Dateien liegen unter /public.
Font.register({
  family: "Arimo",
  fonts: [
    { src: "/pdf/fonts/Arimo-Regular.woff", fontWeight: "normal" },
    { src: "/pdf/fonts/Arimo-Bold.woff", fontWeight: "bold" },
  ],
});

/** Erzeugt das FlexCover-Antrags-PDF aus den (bereits validierten und bereinigten)
 *  Formularwerten und liefert es als Blob. `reference` (optional, PROJ-6) druckt
 *  die Referenznummer einer Einreichung in die Fußzeile; ohne sie bleibt es das
 *  reine „PDF herunterladen" ohne Referenz. */
export async function generateFlexcoverPdf(
  values: FormValues,
  reference?: string,
): Promise<Blob> {
  const element = createElement(FlexcoverDocument, { values, reference }) as ReactElement<DocumentProps>;
  return pdf(element).toBlob();
}

// Dateiname-Helfer kommt aus dem seiteneffektfreien Modul (server-sicher); hier
// re-exportiert, damit Browser-Aufrufer ihn weiter aus "@/lib/pdf" beziehen können.
export { flexcoverPdfFilename } from "./filename";
