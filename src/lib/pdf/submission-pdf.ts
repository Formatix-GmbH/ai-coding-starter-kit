// PROJ-18: Server-PDF-Resolver für Einreichungen (Kompositions-Punkt).
//
// Bildet formId → Node-Renderer + Dateiname ab. Dies ist die EINZIGE Stelle, die
// alle Formulare kennt (wie der API-Route-Handler selbst) — die Formular-Schichten
// (FlexCover / Portal) importieren einander NICHT. Beim späteren Herauslösen wird
// hier mechanisch der jeweils andere Eintrag entfernt (siehe PROJ-18 Zwei-Wege-
// Trennbarkeit).

import { renderFlexcoverPdfBuffer } from "./server";
import { flexcoverPdfFilename } from "./filename";
import { renderMusterantragPdfBuffer } from "./musterantrag/server";
import { musterantragPdfFilename } from "./musterantrag/filename";
import type { FormValues } from "@/lib/form-engine/types";

type Renderer = (values: FormValues, reference?: string) => Promise<Buffer>;

const RENDERERS: Record<string, Renderer> = {
  flexcover: renderFlexcoverPdfBuffer,
  musterantrag: renderMusterantragPdfBuffer,
};

const FILENAMES: Record<string, (date?: Date, reference?: string) => string> = {
  flexcover: flexcoverPdfFilename,
  musterantrag: musterantragPdfFilename,
};

/** Rendert das Einreichungs-PDF (Node) für das Formular, oder null wenn kein
 *  Layout registriert ist (dann wird die E-Mail übersprungen — Einreichung bleibt gültig). */
export async function renderSubmissionPdf(
  formId: string,
  values: FormValues,
  reference?: string,
): Promise<Buffer | null> {
  const render = RENDERERS[formId];
  return render ? render(values, reference) : null;
}

/** Sprechender Dateiname für das Einreichungs-PDF. */
export function submissionPdfFilename(formId: string, reference?: string): string {
  const fn = FILENAMES[formId];
  return fn ? fn(new Date(), reference) : `${formId}-${new Date().toISOString().slice(0, 10)}.pdf`;
}
