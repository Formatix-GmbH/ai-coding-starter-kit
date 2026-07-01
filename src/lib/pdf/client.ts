// PROJ-18: Client-PDF-Resolver für generische (Registry-)Formulare.
//
// ⚠️ NUR im Browser importieren! Registriert beim Import die Arimo-Schrift mit
// BROWSER-URL-Pfaden (`/pdf/fonts/…`). Serverseitig stattdessen der Node-Renderer
// (kommt in /backend) verwenden. Analog zu src/lib/pdf/index.ts (FlexCover).

import { pdf, Font, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import type { FormValues } from "@/lib/form-engine/types";
import { MusterantragDocument } from "./musterantrag/document";
import { musterantragPdfFilename } from "./musterantrag/filename";

Font.register({
  family: "Arimo",
  fonts: [
    { src: "/pdf/fonts/Arimo-Regular.woff", fontWeight: "normal" },
    { src: "/pdf/fonts/Arimo-Bold.woff", fontWeight: "bold" },
  ],
});

type DocComponent = (props: { values: FormValues; reference?: string }) => ReactElement<DocumentProps>;

const DOCUMENTS: Record<string, DocComponent> = {
  musterantrag: MusterantragDocument as unknown as DocComponent,
};

const FILENAMES: Record<string, (date?: Date, reference?: string) => string> = {
  musterantrag: musterantragPdfFilename,
};

/** Erzeugt das PDF eines generischen Formulars als Blob (clientseitig). */
export async function generateFormPdfBlob(
  formId: string,
  values: FormValues,
  reference?: string,
): Promise<Blob> {
  const Doc = DOCUMENTS[formId];
  if (!Doc) throw new Error(`Kein PDF-Layout für Formular „${formId}" registriert.`);
  const element = createElement(Doc, { values, reference }) as ReactElement<DocumentProps>;
  return pdf(element).toBlob();
}

/** Sprechender Dateiname für ein generisches Formular. */
export function formPdfFilename(formId: string, reference?: string): string {
  const fn = FILENAMES[formId];
  return fn ? fn(new Date(), reference) : `${formId}-${new Date().toISOString().slice(0, 10)}.pdf`;
}
