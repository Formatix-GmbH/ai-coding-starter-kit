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
          explanation:
            "Beschreiben Sie in wenigen Sätzen, worum es in Ihrem Vorhaben geht: Was ist das Ziel? Wie wollen Sie es erreichen? Welches Ergebnis erwarten Sie am Ende? Beispiel: „Wir entwickeln eine Software, mit der kleine Betriebe ihre Förderanträge digital stellen können. Ziel ist, den Papieraufwand um die Hälfte zu senken.“",
        },
        {
          kind: "field",
          key: "foerderbereich",
          label: "Förderbereich",
          type: "select",
          explanation:
            "Wählen Sie den Bereich, zu dem Ihr Vorhaben am besten passt: „Forschung & Entwicklung“ = etwas Neues erforschen oder entwickeln; „Digitalisierung“ = Abläufe oder Produkte digital machen; „Nachhaltigkeit“ = Umwelt- oder Klimaverbesserungen; „Qualifizierung“ = Aus- und Weiterbildung von Beschäftigten. Passt mehreres, wählen Sie den Schwerpunkt — den Bereich, in dem der größte Teil Ihres Vorhabens liegt.",
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
            {
              kind: "field",
              key: "personal",
              label: "Personalkosten",
              type: "currency",
              explanation:
                "Alle Kosten für die Mitarbeitenden, die am Vorhaben arbeiten: Bruttogehälter einschließlich der Arbeitgeberanteile zur Sozialversicherung. Arbeitet jemand nur teilweise am Vorhaben, zählt nur dieser Anteil. Beispiel: Eine Entwicklerin arbeitet zur Hälfte am Projekt — angesetzt wird die Hälfte ihrer Gehaltskosten.",
            },
            {
              kind: "field",
              key: "sachmittel",
              label: "Sachmittel",
              type: "currency",
              explanation:
                "Kosten für Dinge und Leistungen, die Sie für das Vorhaben einkaufen: Geräte, Material, Software-Lizenzen oder Leistungen externer Dienstleister. Nicht dazu zählen die Gehälter Ihrer eigenen Mitarbeitenden — die gehören in die Personalkosten.",
            },
            {
              kind: "field",
              key: "gesamt",
              label: "Gesamtkosten",
              type: "currency",
              explanation:
                "Dieses Feld wird automatisch berechnet: Personalkosten plus Sachmittel. Sie können hier nichts eintragen — korrigieren Sie bei Bedarf die beiden Felder davor.",
              computed: { op: "sum", fields: ["vorhaben.kosten.personal", "vorhaben.kosten.sachmittel"] },
            },
          ],
        },
        {
          kind: "field",
          key: "eigenmittel",
          label: "Eingesetzte Eigenmittel",
          type: "currency",
          explanation:
            "Der Betrag, den Ihre Organisation selbst zum Vorhaben beisteuert — eigenes Geld, keine Fördermittel. Eigenmittel zeigen, dass Sie hinter dem Vorhaben stehen; viele Förderprogramme erwarten eine Eigenbeteiligung. Beispiel: Bei Gesamtkosten von 100.000 € übernehmen Sie 30.000 € selbst.",
        },
        {
          kind: "table",
          key: "meilensteine",
          label: "Meilensteine",
          explanation:
            "Ein Meilenstein ist ein überprüfbares Zwischenergebnis mit Termin — z. B. „Konzept fertig“, „Prototyp einsatzbereit“ oder „Pilotbetrieb abgeschlossen“. Planen Sie so, dass sich der Fortschritt daran ablesen lässt: 3 bis 6 Meilensteine sind meist sinnvoll — nicht jede Kleinigkeit, aber auch nicht nur „Projektende“.",
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
          explanation:
            "Verteilen Sie die geplanten Kosten auf die Jahre, in denen sie voraussichtlich anfallen. Jahr 1 ist das erste Jahr des Vorhabens (ab dem geplanten Beginn). Die Summe über alle Jahre sollte zu Ihrem Kostenplan weiter oben passen.",
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
          explanation:
            "Gemeint sind Organisationen mit Sitz außerhalb Deutschlands, die aktiv am Vorhaben mitarbeiten — z. B. eine Partnerfirma in Österreich, die einen Teil der Entwicklung übernimmt. Reine Lieferanten oder Kunden im Ausland zählen nicht als Projektpartner.",
        },
        {
          kind: "field",
          key: "beschreibungInternational",
          label: "Beschreibung der internationalen Zusammenarbeit",
          type: "textarea",
          required: true,
          explanation:
            "Beschreiben Sie je Partner kurz: Wer ist es (Name, Land)? Welche Rolle hat er im Vorhaben? Was trägt er konkret bei? Beispiel: „Die Voorbeeld B.V. (Niederlande) testet unsere Software mit 20 Pilotkunden und liefert die Auswertung.“",
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
