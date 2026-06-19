import type { Condition, FormValues } from "./types";
import { getByPath } from "./paths";

/** Parst einen Wert als Zahl (deutsches Format: , = Dezimal, . = Tausender).
 *  Leere/ungültige Werte → null, damit Zahlenvergleiche dann false ergeben. */
function asNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Wertet eine Sichtbarkeits-/Bedingung gegen die (gesamten) Formularwerte aus.
 *  Feldreferenzen sind absolute Pfade. Pure Funktion (testbar). */
export function evaluateCondition(
  condition: Condition | undefined,
  values: FormValues,
): boolean {
  if (!condition) return true; // keine Bedingung → sichtbar

  if ("all" in condition) {
    return condition.all.every((c) => evaluateCondition(c, values));
  }
  if ("any" in condition) {
    return condition.any.some((c) => evaluateCondition(c, values));
  }

  const actual = getByPath(values, condition.field);

  switch (condition.op) {
    case "eq":
      return actual === condition.value;
    case "neq":
      return actual !== condition.value;
    case "gt":
    case "gte":
    case "lt":
    case "lte": {
      const n = asNumber(actual);
      if (n === null) return false; // kein vergleichbarer Wert → Bedingung nicht erfüllt
      if (condition.op === "gt") return n > condition.value;
      if (condition.op === "gte") return n >= condition.value;
      if (condition.op === "lt") return n < condition.value;
      return n <= condition.value;
    }
    case "in":
      return condition.value.includes(actual as string | number | boolean);
    case "truthy":
      return Boolean(actual);
    case "falsy":
      return !actual;
    default:
      return true;
  }
}
