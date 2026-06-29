"use client";

import { toast } from "sonner";
import { FormEngine } from "@/components/form-engine/FormEngine";
import { HandlerRegistry } from "@/lib/form-engine/handlers";
import type { FormDefinition, FormValues } from "@/lib/form-engine/types";
import { getByPath } from "@/lib/form-engine/paths";

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "")
    return Number(v.replace(/\./g, "").replace(",", ".")) || 0;
  return 0;
}

const registry = new HandlerRegistry().registerValidator(
  "maxHundert",
  (value, { values }) => {
    const a = num(getByPath(values, "zahlen.a"));
    const b = num(value);
    return a + b > 100 ? "a + b darf 100 nicht überschreiten" : null;
  },
);

const demo: FormDefinition = {
  id: "demo",
  title: "Engine-Demo",
  layout: "tabs",
  submitLabel: "Absenden",
  sections: [
    {
      key: "kontakt",
      title: "Kontakt",
      children: [
        {
          kind: "field",
          key: "anrede",
          label: "Anrede",
          type: "select",
          required: true,
          options: [
            { value: "Frau", label: "Frau" },
            { value: "Herr", label: "Herr" },
            { value: "Divers", label: "Divers" },
          ],
        },
        { kind: "field", key: "email", label: "E-Mail", type: "email", required: true },
        { kind: "field", key: "telefon", label: "Telefon", type: "text" },
      ],
    },
    {
      key: "firma",
      title: "Firma",
      children: [
        { kind: "field", key: "verlagerung", label: "Verlagerung geplant?", type: "yesno" },
        {
          kind: "field",
          key: "beschreibungVerlagerung",
          label: "Beschreibung der Verlagerung",
          type: "textarea",
          required: true,
          visibleWhen: { field: "firma.verlagerung", op: "eq", value: "Ja" },
        },
        { kind: "field", key: "weitereBeguenstigte", label: "Weitere Begünstigte?", type: "yesno" },
        {
          kind: "repeat",
          key: "beguenstigte",
          label: "Begünstigte",
          itemLabel: "Begünstigter",
          visibleWhen: { field: "firma.weitereBeguenstigte", op: "eq", value: "Ja" },
          children: [
            { kind: "field", key: "firmierung", label: "Firmierung", type: "text", required: true },
            { kind: "field", key: "sitz", label: "Sitz", type: "text" },
            {
              kind: "repeat",
              key: "ansprechpartner",
              label: "Ansprechpartner",
              itemLabel: "Ansprechpartner",
              children: [
                { kind: "field", key: "name", label: "Name", type: "text", required: true },
                { kind: "field", key: "email", label: "E-Mail", type: "email" },
              ],
            },
          ],
        },
      ],
    },
    {
      key: "zahlen",
      title: "Zahlen",
      children: [
        { kind: "field", key: "a", label: "Wert a", type: "decimal" },
        { kind: "field", key: "b", label: "Wert b", type: "decimal", validateWith: "maxHundert" },
        {
          kind: "field",
          key: "summe",
          label: "Summe (a + b)",
          type: "decimal",
          computed: { op: "sum", fields: ["zahlen.a", "zahlen.b"] },
        },
        { kind: "field", key: "plz", label: "PLZ", type: "plz" },
        {
          kind: "table",
          key: "beschaeftigte",
          label: "Beschäftigte (3 Jahre)",
          mode: "fixed",
          columns: [
            { key: "jahr1", label: "Jahr 1", type: "decimal" },
            { key: "jahr2", label: "Jahr 2", type: "decimal" },
            { key: "jahr3", label: "Jahr 3", type: "decimal" },
          ],
          rows: [
            { key: "vollzeit", label: "Vollzeit" },
            { key: "teilzeit", label: "Teilzeit" },
          ],
        },
        {
          kind: "table",
          key: "laender",
          label: "Einkauf nach Ländern",
          mode: "dynamic",
          addLabel: "Land hinzufügen",
          columns: [
            { key: "land", label: "Land", type: "text" },
            { key: "betrag", label: "Betrag", type: "currency" },
          ],
        },
      ],
    },
  ],
};

export default function FormDemoPage() {
  function handleSubmit(values: FormValues) {
    toast.success("Formular abgesendet (Daten in der Konsole).");
    console.log("Form output:", values);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold">{demo.title}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Demonstriert die Form-Engine: Tabs, Feldtypen, Sichtbarkeitslogik,
        Validierung, berechnetes Feld, verschachtelte Wiederholgruppen und
        Tabellen.
      </p>
      <FormEngine definition={demo} registry={registry} onSubmit={handleSubmit} />
    </div>
  );
}
