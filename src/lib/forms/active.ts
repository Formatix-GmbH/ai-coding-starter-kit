// PROJ-18: Aktive-Formulare-Konfiguration pro Deployment.
// Liest die (Build-)Env `NEXT_PUBLIC_ACTIVE_FORMS` (Kommaliste). Default =
// "flexcover", damit das bestehende Deployment unverändert bleibt.
//
// Bewusst env-basiert (kein Registry-Import) → nutzbar auch in der Middleware,
// ohne die Portal-/Registry-Schicht hereinzuziehen.

export function getActiveFormIds(): string[] {
  const raw = process.env.NEXT_PUBLIC_ACTIVE_FORMS ?? "flexcover";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isFormActive(formId: string): boolean {
  return getActiveFormIds().includes(formId);
}
