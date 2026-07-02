// PROJ-18: Muster-Förderantrag — neutrale, herstellerneutrale Beispieldefinition
// für das eforms Portal. Bewusst generisch (kein FlexCover-/Euler-Hermes-Bezug),
// zeigt aber den vollen Engine-Umfang: Feldtypen, Sichtbarkeitslogik,
// Wiederholgruppe, feste + dynamische Tabelle und ein berechnetes Feld.
//
// Isoliert (Portal-Schicht): importiert nur Engine-Typen, nichts FlexCover-Spezifisches.

import type { FormDefinition } from "@/lib/form-engine/types";

export const musterantragDefinition: FormDefinition = {
  id: "musterantrag",
  title: "Muster-Förderantrag",
  layout: "tabs",
  submitLabel: "Antrag einreichen",
  sections: [
    {
      key: "kontakt",
      title: "Ansprechpartner",
      children: [
        {
          kind: "field",
          key: "anrede",
          label: "Anrede",
          type: "select",
          options: [
            { value: "Frau", label: "Frau" },
            { value: "Herr", label: "Herr" },
            { value: "Divers", label: "Divers" },
            { value: "Keine Angabe", label: "Keine Angabe" },
          ],
        },
        { kind: "field", key: "titel", label: "Akademischer Titel", type: "text" },
        {
          kind: "group",
          key: "name",
          inline: true,
          children: [
            { kind: "field", key: "vorname", label: "Vorname", type: "text", required: true },
            { kind: "field", key: "nachname", label: "Nachname", type: "text", required: true },
          ],
        },
        { kind: "field", key: "email", label: "E-Mail-Adresse", type: "email", required: true },
        { kind: "field", key: "telefon", label: "Telefonnummer", type: "text" },
        {
          kind: "field",
          key: "anmerkungen",
          label: "Weitere Anmerkungen",
          type: "textarea",
          help: "Optional — z. B. beste Erreichbarkeit.",
        },
      ],
    },
    {
      key: "organisation",
      title: "Organisation",
      children: [
        { kind: "field", key: "name", label: "Name der Organisation", type: "text", required: true },
        {
          kind: "field",
          key: "rechtsform",
          label: "Rechtsform",
          type: "select",
          options: [
            { value: "GmbH", label: "GmbH" },
            { value: "AG", label: "AG" },
            { value: "GbR", label: "GbR" },
            { value: "e.V.", label: "e. V." },
            { value: "Einzelunternehmen", label: "Einzelunternehmen" },
            { value: "Sonstige", label: "Sonstige" },
          ],
        },
        {
          kind: "group",
          key: "adresse",
          label: "Anschrift",
          inline: true,
          children: [
            { kind: "field", key: "strasse", label: "Straße und Hausnummer", type: "text" },
            { kind: "field", key: "plz", label: "PLZ", type: "plz" },
            { kind: "field", key: "ort", label: "Ort", type: "text" },
          ],
        },
        { kind: "field", key: "land", label: "Land", type: "text" },
        { kind: "field", key: "website", label: "Website", type: "text", placeholder: "https://" },
        {
          kind: "group",
          key: "kennzahlen",
          inline: true,
          children: [
            { kind: "field", key: "mitarbeiter", label: "Mitarbeitende", type: "integer" },
            { kind: "field", key: "gruendungsjahr", label: "Gründungsjahr", type: "year", placeholder: "JJJJ" },
          ],
        },
      ],
    },
    {
      key: "vorhaben",
      title: "Vorhaben",
      children: [
        { kind: "field", key: "titel", label: "Titel des Vorhabens", type: "text", required: true },
        {
          kind: "field",
          key: "beschreibung",
          label: "Kurzbeschreibung des Vorhabens",
          type: "textarea",
          required: true,
          help: "Worum geht es, welches Ziel wird verfolgt?",
        },
        {
          kind: "field",
          key: "foerderbereich",
          label: "Förderbereich",
          type: "select",
          options: [
            { value: "Forschung & Entwicklung", label: "Forschung & Entwicklung" },
            { value: "Digitalisierung", label: "Digitalisierung" },
            { value: "Nachhaltigkeit", label: "Nachhaltigkeit" },
            { value: "Qualifizierung", label: "Qualifizierung" },
            { value: "Sonstiges", label: "Sonstiges" },
          ],
        },
        { kind: "field", key: "beginn", label: "Geplanter Beginn", type: "date" },
        {
          kind: "group",
          key: "kosten",
          label: "Kostenplan (berechnete Gesamtsumme)",
          inline: true,
          children: [
            { kind: "field", key: "personal", label: "Personalkosten", type: "currency" },
            { kind: "field", key: "sachmittel", label: "Sachmittel", type: "currency" },
            {
              kind: "field",
              key: "gesamt",
              label: "Gesamtkosten",
              type: "currency",
              computed: { op: "sum", fields: ["vorhaben.kosten.personal", "vorhaben.kosten.sachmittel"] },
            },
          ],
        },
        { kind: "field", key: "eigenmittel", label: "Eingesetzte Eigenmittel", type: "currency" },
        {
          kind: "table",
          key: "meilensteine",
          label: "Meilensteine",
          mode: "dynamic",
          addLabel: "Meilenstein hinzufügen",
          columns: [
            { key: "bezeichnung", label: "Bezeichnung", type: "text" },
            { key: "termin", label: "Termin", type: "date" },
            { key: "budget", label: "Budget", type: "currency" },
          ],
        },
        {
          kind: "table",
          key: "mittelverwendung",
          label: "Mittelverwendung nach Jahr (in EUR)",
          mode: "fixed",
          columns: [
            { key: "jahr1", label: "Jahr 1", type: "currency" },
            { key: "jahr2", label: "Jahr 2", type: "currency" },
            { key: "jahr3", label: "Jahr 3", type: "currency" },
          ],
          rows: [
            { key: "personal", label: "Personal" },
            { key: "sachmittel", label: "Sachmittel" },
          ],
        },
        // Bewusst als letzte Frage des Abschnitts (nach den Tabellen), damit die
        // eingeblendeten Bereiche (Beschreibung + Partner) nicht mit den
        // unabhängigen Tabellen optisch verschmelzen.
        {
          kind: "field",
          key: "international",
          label: "Gibt es internationale Projektpartner?",
          type: "yesno",
        },
        {
          kind: "field",
          key: "beschreibungInternational",
          label: "Beschreibung der internationalen Zusammenarbeit",
          type: "textarea",
          required: true,
          visibleWhen: { field: "vorhaben.international", op: "eq", value: "Ja" },
        },
        {
          kind: "repeat",
          key: "partner",
          label: "Projektpartner",
          itemLabel: "Partner",
          visibleWhen: { field: "vorhaben.international", op: "eq", value: "Ja" },
          children: [
            { kind: "field", key: "partnername", label: "Name des Partners", type: "text", required: true },
            { kind: "field", key: "land", label: "Land", type: "text" },
          ],
        },
      ],
    },
    {
      key: "abschluss",
      title: "Erklärung & Abschluss",
      children: [
        {
          kind: "field",
          key: "hinweise",
          label: "Was möchten Sie uns darüber hinaus mitteilen?",
          type: "textarea",
        },
        {
          kind: "group",
          key: "unterschrift",
          inline: true,
          children: [
            { kind: "field", key: "ort", label: "Ort", type: "text" },
            { kind: "field", key: "datum", label: "Datum", type: "date" },
          ],
        },
        {
          kind: "field",
          key: "datenschutz",
          label: "Ich habe die Datenschutzhinweise gelesen und stimme der Verarbeitung meiner Angaben zu.",
          type: "checkbox",
          required: true,
        },
        {
          kind: "field",
          key: "newsletter",
          label: "Ich möchte gelegentlich Informationen zu Förderthemen per E-Mail erhalten.",
          type: "checkbox",
        },
      ],
    },
  ],
};
