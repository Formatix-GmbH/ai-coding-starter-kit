// PROJ-18: Serverseitige PDF-Erzeugung (Node) für den Muster-Förderantrag.
// Registriert Arimo per Dateipfad (kein Browser-URL) und rendert zu einem Buffer.
// Kein Kopf-Bild nötig (die FX-Marke wird per react-pdf-Primitiven gezeichnet).
// Analog zu src/lib/pdf/server.ts (FlexCover), aber isoliert (Portal-Schicht).

import { renderToBuffer, Font, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import path from "node:path";
import { MusterantragDocument } from "./document";
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

export async function renderMusterantragPdfBuffer(
  values: FormValues,
  reference?: string,
): Promise<Buffer> {
  ensureFonts();
  const element = createElement(MusterantragDocument, { values, reference }) as ReactElement<DocumentProps>;
  return renderToBuffer(element);
}
