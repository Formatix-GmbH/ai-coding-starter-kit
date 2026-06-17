/** Leichte Passwort-Stärke-Bewertung (kein Zusatzpaket), PROJ-2.
 *  Liefert Score 0–4 und ein Label. Bewertet Länge und Zeichenvielfalt. */
export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
};

const LABELS = ["Sehr schwach", "Schwach", "Mittel", "Gut", "Stark"] as const;

export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: LABELS[0] };

  let points = 0;
  if (password.length >= 8) points++;
  if (password.length >= 12) points++;
  if (/[A-Za-z]/.test(password) && /[0-9]/.test(password)) points++;
  if (/[^A-Za-z0-9]/.test(password)) points++;

  const score = Math.min(points, 4) as PasswordStrength["score"];
  return { score, label: LABELS[score] };
}
