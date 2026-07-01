// PROJ-18: Formular-Registry (server-sicher).
//
// Zentraler Katalog der über den GENERISCHEN Weg (/antrag/<formId>/…)
// ausgelieferten Formulare. FlexCover ist bewusst NICHT enthalten — es behält
// seine eigenen, dedizierten Seiten (Status quo) und ist von hier unabhängig.
// Diese Trennung ist die Extraktions-Naht: die Registry gehört zur Produkt-/
// Portal-Schicht und referenziert nichts FlexCover-Spezifisches.
//
// Server-sicher: importiert nur Definitionen + seiteneffektfreie Dateinamen-Helfer
// (keine react-pdf-Dokumente, keine Browser-Font-Registrierung).

import type { FormDefinition, FormValues } from "@/lib/form-engine/types";
import { musterantragDefinition } from "@/lib/forms/musterantrag/definition";
import { musterantragPdfFilename } from "@/lib/pdf/musterantrag/filename";

export interface FormMeta {
  id: string;
  title: string;
  definition: FormDefinition;
  /** Seiteneffektfreier Dateiname-Helfer (server-sicher). */
  pdfFilename: (reference?: string) => string;
  /** Intro-Text für die Antragsseite. */
  intro: string;
}

const FORMS: Record<string, FormMeta> = {
  musterantrag: {
    id: musterantragDefinition.id,
    title: musterantragDefinition.title,
    definition: musterantragDefinition,
    pdfFilename: (reference) => musterantragPdfFilename(new Date(), reference),
    intro:
      "Füllen Sie den Muster-Förderantrag Abschnitt für Abschnitt aus. Ihre Eingaben werden automatisch gesichert.",
  },
};

export function getForm(formId: string): FormMeta | undefined {
  return FORMS[formId];
}

export function getRegisteredFormIds(): string[] {
  return Object.keys(FORMS);
}

// Nur zur Typ-Hilfe für Consumer.
export type { FormValues };
