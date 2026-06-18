import type { Condition, FormValues } from "./types";
import { getByPath } from "./paths";

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
