// PROJ-3: Dynamic Form Engine — Definition-Schema (TypeScript-Typen).
// Eine Formular-Definition ist ein rekursiver Baum aus Knoten.

export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "integer"
  | "decimal"
  | "currency"
  | "percent"
  | "year"
  | "plz"
  | "select"
  | "yesno" // Radio Ja/Nein (Pflicht-Charakter über required)
  | "yesno_optional" // Ja/Nein/leer
  | "checkbox"
  | "date";

export type FormValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | FormValues
  | FormValues[];

export interface FormValues {
  [key: string]: FormValue;
}

/** Sichtbarkeits-/Bedingungslogik. Feldreferenzen sind absolute Pfade
 *  (z.B. "unternehmen.verlagerung"). */
export type Condition =
  | { field: string; op: "eq" | "neq"; value: string | number | boolean }
  | { field: string; op: "gt" | "gte" | "lt" | "lte"; value: number }
  | { field: string; op: "in"; value: (string | number | boolean)[] }
  | { field: string; op: "truthy" | "falsy" }
  | { all: Condition[] }
  | { any: Condition[] };

/** Berechnete (read-only) Felder: Summe referenzierter Pfade oder benannter Handler. */
export type Calculation =
  | { op: "sum"; fields: string[] }
  | { handler: string };

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldNode {
  kind: "field";
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: SelectOption[]; // für select
  pattern?: string; // Regex als String (z.B. PLZ)
  patternMessage?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  visibleWhen?: Condition;
  computed?: Calculation; // wenn gesetzt → read-only
  /** Name eines registrierten Validierungs-Handlers (feldübergreifend). */
  validateWith?: string;
}

export interface GroupNode {
  kind: "group";
  key: string;
  label?: string;
  children: FormNode[];
  visibleWhen?: Condition;
}

export interface RepeatGroupNode {
  kind: "repeat";
  key: string;
  label: string;
  itemLabel?: string; // z.B. "Begünstigter"
  min?: number;
  max?: number;
  children: FormNode[];
  visibleWhen?: Condition;
}

export interface TableColumn {
  key: string;
  label: string;
  type: FieldType;
}

export interface TableRowDef {
  key: string;
  label: string;
}

export interface TableNode {
  kind: "table";
  key: string;
  label: string;
  columns: TableColumn[];
  /** "fixed" → vordefinierte beschriftete Zeilen; "dynamic" → Nutzer fügt Zeilen hinzu. */
  mode: "fixed" | "dynamic";
  rows?: TableRowDef[]; // bei mode=fixed
  addLabel?: string; // bei mode=dynamic
  min?: number;
  max?: number;
  visibleWhen?: Condition;
}

export type FormNode = FieldNode | GroupNode | RepeatGroupNode | TableNode;

export interface SectionNode {
  key: string;
  title: string;
  children: FormNode[];
  visibleWhen?: Condition;
}

/** Deklarierte Aktion beim Absenden (Konnektoren kommen aus Folge-Features). */
export interface SubmitTarget {
  action: string; // z.B. "pdf", "saveDb", "email", "webhook"
  [option: string]: unknown;
}

export interface FormDefinition {
  id: string;
  title: string;
  layout: "tabs" | "wizard" | "single";
  sections: SectionNode[];
  submitTargets?: SubmitTarget[];
  submitLabel?: string;
  resetLabel?: string;
}
