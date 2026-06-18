import { z } from "zod";
import type {
  FieldNode,
  FormDefinition,
  FormNode,
  FormValues,
  SectionNode,
} from "./types";
import { evaluateCondition } from "./conditions";
import { getByPath, joinPath } from "./paths";
import { HandlerRegistry } from "./handlers";

/** Deutsche Zahl ("1.234,56") → number; ungültig → NaN. */
function parseGermanNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const t = v.trim();
    if (t === "") return NaN;
    return Number(t.replace(/\./g, "").replace(",", "."));
  }
  return NaN;
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

/** Baut ein Zod-Schema für einen NICHT-leeren Feldwert (Typ + Constraints). */
export function buildFieldSchema(field: FieldNode): z.ZodTypeAny {
  const numeric = (opts?: { int?: boolean }) =>
    z.preprocess(
      (v) => parseGermanNumber(v),
      (() => {
        let s = z.number({ error: "Bitte eine gültige Zahl eingeben" });
        if (opts?.int) s = s.int("Bitte eine ganze Zahl eingeben");
        if (typeof field.min === "number") s = s.min(field.min, `Mindestens ${field.min}`);
        if (typeof field.max === "number") s = s.max(field.max, `Höchstens ${field.max}`);
        return s;
      })(),
    );

  switch (field.type) {
    case "email":
      return z.string().email("Bitte eine gültige E-Mail-Adresse eingeben");
    case "integer":
      return numeric({ int: true });
    case "decimal":
    case "currency":
    case "percent":
      return numeric();
    case "year":
      return z.preprocess(
        (v) => parseGermanNumber(v),
        z
          .number({ error: "Bitte ein gültiges Jahr eingeben" })
          .int()
          .gte(1000, "Ungültiges Jahr")
          .lte(9999, "Ungültiges Jahr"),
      );
    case "plz":
      return z
        .string()
        .regex(
          field.pattern ? new RegExp(`^${field.pattern}$`) : /^\d{4,10}$/,
          field.patternMessage ?? "Ungültige PLZ",
        );
    case "checkbox":
      return z.boolean();
    default: {
      // text, textarea, select, yesno, yesno_optional, date
      let s = z.string();
      if (typeof field.minLength === "number")
        s = s.min(field.minLength, `Mindestens ${field.minLength} Zeichen`);
      if (typeof field.maxLength === "number")
        s = s.max(field.maxLength, `Höchstens ${field.maxLength} Zeichen`);
      if (field.pattern)
        s = s.regex(
          new RegExp(`^${field.pattern}$`),
          field.patternMessage ?? "Ungültiges Format",
        );
      return s;
    }
  }
}

/** Validiert einen einzelnen Feldwert. Liefert Fehlermeldung oder null. */
export function validateField(
  field: FieldNode,
  value: unknown,
  rootValues: FormValues,
  registry: HandlerRegistry,
): string | null {
  // Pflichtfeld-Prüfung zuerst
  if (field.type === "checkbox") {
    if (field.required && value !== true) return "Bitte bestätigen";
  } else if (isEmpty(value)) {
    return field.required ? "Pflichtfeld" : null;
  }

  // Typ-/Constraint-Prüfung (nur bei nicht-leerem Wert)
  if (!(field.type === "checkbox") && !isEmpty(value)) {
    const result = buildFieldSchema(field).safeParse(value);
    if (!result.success) {
      return result.error.issues[0]?.message ?? "Ungültige Eingabe";
    }
  }

  // Feldübergreifende Custom-Validierung
  if (field.validateWith) {
    const fn = registry.getValidator(field.validateWith);
    if (fn) {
      const msg = fn(value, { values: rootValues });
      if (msg) return msg;
    }
  }

  return null;
}

/** Traversiert die Definition und sammelt alle Fehler als { Pfad: Meldung }.
 *  Ausgeblendete Knoten werden übersprungen (nicht validiert). Pure Funktion. */
export function validateForm(
  definition: FormDefinition,
  rootValues: FormValues,
  registry: HandlerRegistry,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const walkNodes = (nodes: FormNode[], base: string) => {
    for (const node of nodes) {
      if (!evaluateCondition(node.visibleWhen, rootValues)) continue;

      if (node.kind === "field") {
        if (node.computed) continue; // read-only
        const path = joinPath(base, node.key);
        const msg = validateField(node, getByPath(rootValues, path), rootValues, registry);
        if (msg) errors[path] = msg;
      } else if (node.kind === "group") {
        walkNodes(node.children, joinPath(base, node.key));
      } else if (node.kind === "repeat") {
        const path = joinPath(base, node.key);
        const arr = (getByPath(rootValues, path) as FormValues[]) ?? [];
        if (typeof node.min === "number" && arr.length < node.min)
          errors[path] = `Mindestens ${node.min} Einträge erforderlich`;
        arr.forEach((_, i) => walkNodes(node.children, joinPath(path, i)));
      } else if (node.kind === "table") {
        const path = joinPath(base, node.key);
        if (node.mode === "fixed") {
          for (const row of node.rows ?? []) {
            for (const col of node.columns) {
              const cellPath = joinPath(path, row.key, col.key);
              const cellField: FieldNode = {
                kind: "field",
                key: col.key,
                label: col.label,
                type: col.type,
              };
              const msg = validateField(
                cellField,
                getByPath(rootValues, cellPath),
                rootValues,
                registry,
              );
              if (msg) errors[cellPath] = msg;
            }
          }
        } else {
          const arr = (getByPath(rootValues, path) as FormValues[]) ?? [];
          arr.forEach((_, i) => {
            for (const col of node.columns) {
              const cellPath = joinPath(path, i, col.key);
              const cellField: FieldNode = {
                kind: "field",
                key: col.key,
                label: col.label,
                type: col.type,
              };
              const msg = validateField(
                cellField,
                getByPath(rootValues, cellPath),
                rootValues,
                registry,
              );
              if (msg) errors[cellPath] = msg;
            }
          });
        }
      }
    }
  };

  for (const section of definition.sections as SectionNode[]) {
    if (!evaluateCondition(section.visibleWhen, rootValues)) continue;
    walkNodes(section.children, section.key);
  }

  return errors;
}
