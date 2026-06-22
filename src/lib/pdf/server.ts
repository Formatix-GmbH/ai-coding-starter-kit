// PROJ-6: Serverseitige PDF-Erzeugung (Node) für den E-Mail-Anhang.
// Nutzt dieselbe Dokument-Definition wie der Browser-Pfad (src/lib/pdf/index.ts),
// registriert die Arimo-Schrift aber per Dateipfad und lädt das Kopf-Banner als
// Data-URL (im Node-Kontext sind öffentliche URLs nicht auflösbar). Liefert einen
// Buffer. Es wird nichts gespeichert — das PDF entsteht bei Bedarf neu aus den Daten.

import { renderToBuffer, Font, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { FlexcoverDocument } from "./flexcover/document";
import type { FormValues } from "@/lib/form-engine/types";

let fontsRegistered = false;
function ensureFonts(): void {
  if (fontsRegistered) return;
  Font.register({
    family: "Arimo",
    fonts: [
      { src: path.resolve(process.cwd(), "public/pdf/fonts/Arimo-Regular.woff"), fontWeight: "normal" },
      { src: path.resolve(process.cwd(), "public/pdf/fonts/Arimo-Bold.woff"), fontWeight: "bold" },
    ],
  });
  fontsRegistered = true;
}

let headerDataUrl: string | null = null;
function getHeaderSrc(): string {
  if (headerDataUrl) return headerDataUrl;
  const buf = readFileSync(path.resolve(process.cwd(), "public/pdf/flexcover-header.png"));
  headerDataUrl = `data:image/png;base64,${buf.toString("base64")}`;
  return headerDataUrl;
}

/** Rendert das FlexCover-PDF serverseitig zu einem Buffer (für den E-Mail-Anhang).
 *  `reference` setzt die Referenznummer in die Fußzeile (eingereichtes PDF). */
export async function renderFlexcoverPdfBuffer(
  values: FormValues,
  reference?: string,
): Promise<Buffer> {
  ensureFonts();
  const element = createElement(FlexcoverDocument, {
    values,
    reference,
    headerSrc: getHeaderSrc(),
  }) as ReactElement<DocumentProps>;
  return renderToBuffer(element);
}
