// PROJ-18: Aktive-Formulare-Konfiguration pro Deployment.
// Liest die (Build-)Env `NEXT_PUBLIC_ACTIVE_FORMS` (Kommaliste). Default =
// "flexcover", damit das bestehende Deployment unverändert bleibt.
//
// Bewusst env-basiert (kein Registry-Import) → nutzbar auch in der Middleware,
// ohne die Portal-/Registry-Schicht hereinzuziehen.

export function getActiveFormIds(): string[] {
  // `||` statt `??`: Docker-Build-Args liefern bei „nicht gesetzt" einen
  // LEERSTRING — der muss genauso wie undefined auf den Default fallen,
  // sonst wäre in Prod plötzlich gar kein Formular aktiv (alles 404).
  const raw = process.env.NEXT_PUBLIC_ACTIVE_FORMS || "flexcover";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isFormActive(formId: string): boolean {
  return getActiveFormIds().includes(formId);
}
