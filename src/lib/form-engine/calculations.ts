import type { Calculation, FormValues } from "./types";
import { getByPath } from "./paths";
import { HandlerRegistry } from "./handlers";

/** Wandelt einen beliebigen Wert in eine Zahl um (für Summen). Nicht-Zahlen = 0. */
function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string" && value.trim() !== "") {
    // Deutsche Eingabe: Komma als Dezimaltrenner, Punkt als Tausendertrenner.
    const normalized = value.replace(/\./g, "").replace(",", ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/** Berechnet den Wert eines computed-Feldes. Pure (Registry als Parameter). */
export function computeValue(
  calc: Calculation,
  values: FormValues,
  registry: HandlerRegistry,
): number | string | null {
  if ("op" in calc && calc.op === "sum") {
    return calc.fields.reduce((sum, path) => sum + toNumber(getByPath(values, path)), 0);
  }
  if ("handler" in calc) {
    const fn = registry.getCalc(calc.handler);
    if (!fn) return null;
    return fn({ values });
  }
  return null;
}
