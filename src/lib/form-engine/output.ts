import type { FormDefinition, FormNode, FormValues } from "./types";
import { evaluateCondition } from "./conditions";
import { getByPath, joinPath } from "./paths";

/** Erzeugt ein vollständiges, leeres Werte-Gerüst aus der Definition.
 *  Jede registrierte Feldstelle erhält einen leeren Wert — damit `reset(...)`
 *  alle Eingaben zuverlässig leert (RHF `reset({})` lässt registrierte Felder
 *  sonst teils stehen). Pure Funktion. */
export function buildEmptyValues(definition: FormDefinition): FormValues {
  const emptyForNodes = (nodes: FormNode[]): FormValues => {
    const out: FormValues = {};
    for (const node of nodes) {
      if (node.kind === "field") {
        out[node.key] = node.type === "checkbox" ? false : "";
      } else if (node.kind === "group") {
        out[node.key] = emptyForNodes(node.children);
      } else if (node.kind === "repeat") {
        out[node.key] = [];
      } else if (node.kind === "table") {
        out[node.key] = node.mode === "dynamic" ? [] : {};
      }
    }
    return out;
  };

  const out: FormValues = {};
  for (const section of definition.sections) {
    out[section.key] = emptyForNodes(section.children);
  }
  return out;
}

/** Erzeugt das Ausgabe-Objekt beim Absenden: ausgeblendete Knoten werden
 *  entfernt (Variante A — Datenminimierung). Pure Funktion. */
export function pruneHiddenValues(
  definition: FormDefinition,
  rootValues: FormValues,
): FormValues {
  const pruneNodes = (nodes: FormNode[], base: string): FormValues => {
    const out: FormValues = {};
    for (const node of nodes) {
      if (!evaluateCondition(node.visibleWhen, rootValues)) continue;

      if (node.kind === "field") {
        out[node.key] = getByPath(rootValues, joinPath(base, node.key)) ?? null;
      } else if (node.kind === "group") {
        out[node.key] = pruneNodes(node.children, joinPath(base, node.key));
      } else if (node.kind === "repeat") {
        const path = joinPath(base, node.key);
        const arr = (getByPath(rootValues, path) as FormValues[]) ?? [];
        out[node.key] = arr.map((_, i) =>
          pruneNodes(node.children, joinPath(path, i)),
        );
      } else if (node.kind === "table") {
        // Tabellen werden als Ganzes übernommen (Sichtbarkeit auf Knotenebene).
        out[node.key] = (getByPath(rootValues, joinPath(base, node.key)) as
          | FormValues
          | FormValues[]) ?? null;
      }
    }
    return out;
  };

  const out: FormValues = {};
  for (const section of definition.sections) {
    if (!evaluateCondition(section.visibleWhen, rootValues)) continue;
    out[section.key] = pruneNodes(section.children, section.key);
  }
  return out;
}
