// PROJ-6: Client-Helfer für die Einreichung. Kapselt die fetch-Aufrufe an die
// Einreichungs-API, damit die UI-Komponenten schlank bleiben.

import type { FormValues } from "@/lib/form-engine/types";
import type { SubmitResult } from "./types";

/** Fehler mit HTTP-Status, damit die UI z. B. 401 (Sitzung) gesondert behandeln kann. */
export class SubmitError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "SubmitError";
    this.status = status;
  }
}

/** Reicht den (validierten, bereinigten) Formularstand ein. Wirft `SubmitError`
 *  bei nicht erfolgreicher Einreichung — der Aufrufer hält dann den Entwurf.
 *  `turnstileToken` (PROJ-16) wird serverseitig gegen Cloudflare verifiziert. */
export async function submitForm(
  formId: string,
  data: FormValues,
  turnstileToken?: string,
): Promise<SubmitResult> {
  const res = await fetch(`/api/submissions/${encodeURIComponent(formId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, turnstileToken }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new SubmitError(body?.error ?? "Einreichung fehlgeschlagen", res.status);
  }
  return (await res.json()) as SubmitResult;
}

/** Versendet die Bestätigungs-E-Mail erneut (best-effort). Liefert true bei Erfolg. */
export async function resendSubmissionEmail(formId: string, id: string): Promise<boolean> {
  const res = await fetch(
    `/api/submissions/${encodeURIComponent(formId)}/${encodeURIComponent(id)}/resend`,
    { method: "POST" },
  );
  if (!res.ok) return false;
  const body = await res.json().catch(() => ({}));
  return Boolean(body?.emailSent);
}
