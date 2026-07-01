// PROJ-18: Lazy-Loader für Beispieldaten je (generischem) Formular.
// Getrennt gehalten, damit Beispieldaten nur bei Bedarf (Client) geladen werden.

import type { FormValues } from "@/lib/form-engine/types";

export async function loadSampleData(formId: string): Promise<FormValues | null> {
  switch (formId) {
    case "musterantrag":
      return (await import("@/lib/forms/musterantrag/sample-data")).musterantragSampleData;
    default:
      return null;
  }
}
