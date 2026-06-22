// PROJ-6: Erzeugung der menschenlesbaren Referenznummer (z. B. FC-2026-A1B2C3).
// Server-seitig vergeben — der Server ist die einzige verlässliche Quelle.

import { randomInt } from "node:crypto";

// Alphabet ohne mehrdeutige Zeichen (kein 0/O, 1/I/L) für gute Lesbarkeit auf
// Papier und beim Vorlesen.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const SUFFIX_LENGTH = 6;

/** Erzeugt eine Referenznummer im Format `<Prefix>-<Jahr>-<6 Zeichen>`. */
export function generateReference(prefix = "FC", date = new Date()): string {
  let suffix = "";
  for (let i = 0; i < SUFFIX_LENGTH; i++) {
    suffix += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `${prefix}-${date.getFullYear()}-${suffix}`;
}
