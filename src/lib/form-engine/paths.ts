import type { FormValue, FormValues } from "./types";

/** Liest einen Wert aus einem verschachtelten Werte-Objekt per Pfad
 *  (Punkt-Notation, Array-Indizes erlaubt: "a.b.0.c"). */
export function getByPath(
  values: FormValues | undefined,
  path: string,
): FormValue {
  if (!values || !path) return undefined;
  const parts = path.split(".");
  let current: FormValue = values;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, FormValue>)[part];
  }
  return current;
}

/** Verbindet Pfadsegmente zu einem Pfad (leere Segmente werden ignoriert). */
export function joinPath(...segments: (string | number)[]): string {
  return segments
    .filter((s) => s !== "" && s !== undefined && s !== null)
    .join(".");
}
