// PROJ-11: FlexCover-Formulardefinition.
//
// Diese Datei ist *Konfiguration* für die generische Form-Engine (PROJ-3) — sie
// enthält bewusst keinen Engine-Spezialcode. FlexCover ist der Härtetest der Engine.
//
// Quellen-Aufteilung (siehe Spec PROJ-11):
//   • Namen + Hierarchie (Ausgabe-Struktur) ← flexcover_antrag_X.xsd
//   • Feldtypen, Beschriftungen, Sichtbarkeits-/Pflichtlogik ← Antragsformular_flexcover-2.0.xdp
//
// 3-Jahres-Tabellen-Konvention (dokumentierte Abweichung):
//   Die XSD notiert Tabellenzellen flach (z. B. Z1SP1, maDE1). Die Engine-Tabelle
//   liefert die semantisch identische Verschachtelung {zeile: {spalte}}. Container-
//   Name und Jahresspalten bleiben XSD-konform; die flache Zellnotation ist eine
//   1:1-mechanische Umformung, die beim späteren XML-Export (eigenes Feature)
//   erzeugt wird.

import type {
  FieldNode,
  FormDefinition,
  GroupNode,
  TableColumn,
  TableRowDef,
} from "@/lib/form-engine/types";

/* ------------------------------------------------------------------ */
/* Helfer                                                              */
/* ------------------------------------------------------------------ */

/** Ja/Nein-Auswahl (XFA exclGroup ja/nein). */
function yesno(key: string, label: string): FieldNode {
  return { kind: "field", key, label, type: "yesno_optional" };
}

/** Beschreibungsfeld, das nur erscheint (und dann Pflicht ist), wenn ein Flag = "Ja". */
function shownWhenYes(
  key: string,
  label: string,
  flagPath: string,
): FieldNode {
  return {
    kind: "field",
    key,
    label,
    type: "textarea",
    required: true,
    visibleWhen: { field: flagPath, op: "eq", value: "Ja" },
  };
}

/** Ein Berichtsjahr-Eingabefeld (XSD jahr1/jahr2/jahr3). */
function yearField(key: string, label: string): FieldNode {
  return { kind: "field", key, label, type: "year", placeholder: "JJJJ" };
}

/** Die drei Werte-Spalten der Wertematrix (Spalte = Berichtsjahr 1/2/3). */
function valueCols(type: TableColumn["type"]): TableColumn[] {
  return [
    { key: "sp1", label: "1. Jahr", type },
    { key: "sp2", label: "2. Jahr", type },
    { key: "sp3", label: "3. Jahr", type },
  ];
}

/**
 * Container einer 3-Jahres-Tabelle (XSD-konform): drei Berichtsjahre (jahr1/2/3)
 * als direkte Kinder + eine feste Wertematrix (Zeilen × 3 Jahresspalten) unter
 * `werte`. Die Berichtsjahre stehen nebeneinander (inline).
 */
function yearTableGroup(
  key: string,
  label: string,
  rows: TableRowDef[],
  colType: TableColumn["type"],
): GroupNode {
  return {
    kind: "group",
    key,
    label,
    inline: true,
    children: [
      yearField("jahr1", "Berichtsjahr 1"),
      yearField("jahr2", "Berichtsjahr 2"),
      yearField("jahr3", "Berichtsjahr 3"),
      {
        kind: "table",
        key: "werte",
        label: "",
        mode: "fixed",
        columns: valueCols(colType),
        rows,
      },
    ],
  };
}

/** Zeilen Deutschland / Ausland (F&E-Beschäftigte, F&E-Aufwendungen, Investitionen). */
const DE_AUS_ROWS: TableRowDef[] = [
  { key: "DE", label: "Deutschland" },
  { key: "AUS", label: "Ausland" },
];

/** Zeilen der Bereichs-Tabellen (Beschäftigte in DE/Ausland). */
const BEREICH_ROWS: TableRowDef[] = [
  { key: "fe", label: "Forschungs- und Entwicklungsaktivitäten (F&E)" },
  { key: "engineering", label: "Engineering/Planung" },
  { key: "produktion", label: "Produktion" },
  { key: "sonstige", label: "Sonstige" },
];

/** Ausbildung: eine Zeile (Originalformular hat nur eine Beschriftung). */
const AZUBI_ROWS: TableRowDef[] = [
  { key: "azubis", label: "Auszubildende / Dualstudierende" },
];

/** Wertschöpfung: eine Zeile (Originalformular hat nur eine Beschriftung). */
const WERTSCHOEPFUNG_ROWS: TableRowDef[] = [
  { key: "anteil", label: "Anteil deutscher Wertschöpfung am Umsatz" },
];

/* ------------------------------------------------------------------ */
/* Definition                                                          */
/* ------------------------------------------------------------------ */

export const flexcoverDefinition: FormDefinition = {
  id: "flexcover",
  title: "flex&cover – Förderantrag",
  layout: "tabs",
  submitLabel: "Antrag absenden",
  resetLabel: "Zurücksetzen",
  submitTargets: [{ action: "pdf" }], // PDF/Download = PROJ-5 (Andockstelle)
  sections: [
    /* ---------- 1: Ansprechpartner ---------- */
    {
      key: "Ansprechpartner",
      title: "Ansprechpartner",
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
        { kind: "field", key: "titel", label: "Akademischer Titel", type: "text" },
        { kind: "field", key: "vorname", label: "Vorname", type: "text", required: true },
        { kind: "field", key: "nachname", label: "Nachname", type: "text", required: true },
        { kind: "field", key: "email", label: "E-Mail-Adresse", type: "email", required: true },
        { kind: "field", key: "telefon", label: "Telefonnummer", type: "text" },
        {
          kind: "field",
          key: "taetigkeitsbereich",
          label: "Ihr Tätigkeitsbereich",
          type: "text",
        },
      ],
    },

    /* ---------- 2: Unternehmensangaben ---------- */
    {
      key: "Unternehmen",
      title: "Unternehmen",
      children: [
        {
          kind: "field",
          key: "unternehmensgegenstand",
          label: "Bitte beschreiben Sie den Unternehmensgegenstand",
          type: "textarea",
          required: true,
        },
        {
          kind: "field",
          key: "firma",
          label: "Vollständige Firmierung Ihrer Entität (Antragsteller)",
          type: "textarea",
          required: true,
        },
        { kind: "field", key: "personenNr", label: "Ggf. Personen-Nummer", type: "text" },
        {
          kind: "field",
          key: "unternehmenstyp",
          label: "Unternehmenstyp",
          type: "select",
          options: [
            { value: "Hersteller", label: "Hersteller" },
            { value: "Händler", label: "Händler" },
            { value: "Hersteller und Händler", label: "Hersteller und Händler" },
          ],
        },
        {
          kind: "group",
          key: "adresse",
          label: "Anschrift",
          children: [
            { kind: "field", key: "strasse", label: "Straße und Hausnummer", type: "text", required: true },
            { kind: "field", key: "plz", label: "PLZ", type: "plz", required: true },
            { kind: "field", key: "ort", label: "Ort", type: "text", required: true },
            { kind: "field", key: "land", label: "Land", type: "text", required: true },
          ],
        },
        { kind: "field", key: "branche", label: "Branche", type: "text", required: true },
        {
          kind: "field",
          key: "mitarbeiter",
          label: "Mitarbeiteranzahl Ihrer Entität",
          type: "integer",
          required: true,
        },
        { kind: "field", key: "website", label: "Website", type: "text" },
        yesno(
          "weitereBeguenstigte",
          "Gibt es weitere begünstigte Entitäten als Begünstigte des flex&cover-Antrags?",
        ),
        {
          kind: "repeat",
          key: "Beguenstigter",
          label: "Weitere Begünstigte",
          itemLabel: "Begünstigter",
          visibleWhen: { field: "Unternehmen.weitereBeguenstigte", op: "eq", value: "Ja" },
          children: [
            {
              kind: "field",
              key: "vollstaendigeFirmierung",
              label: "Vollständige Firmierung",
              type: "text",
              required: true,
            },
            {
              kind: "field",
              key: "sitzBeguenstigter",
              label: "Sitz des Begünstigten",
              type: "text",
              required: true,
            },
            {
              kind: "field",
              key: "personenNummerBeguenstigter",
              label: "Personen-Nr. des Begünstigten",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },

    /* ---------- 3: Firmensitz und Bedeutung ---------- */
    {
      key: "SitzUndBedeutung",
      title: "Firmensitz und Bedeutung",
      children: [
        {
          kind: "field",
          key: "hauptsitz",
          label: "Hauptsitz Ihres Unternehmens (Standort)",
          type: "textarea",
          required: true,
        },
        {
          kind: "field",
          key: "anzahlStandorteDE",
          label: "Anzahl der Standorte in Deutschland",
          type: "integer",
          required: true,
        },
        {
          kind: "field",
          key: "anzahlStandorteAusland",
          label: "Anzahl der Standorte im Ausland",
          type: "integer",
          required: true,
        },
        {
          kind: "field",
          key: "StandorteNeu",
          label:
            "Geben Sie genau an, um wie viele Produktions- und wie viele Servicestandorte es sich handelt und wo sich diese befinden.",
          type: "textarea",
          required: true,
          visibleWhen: { field: "SitzUndBedeutung.anzahlStandorteAusland", op: "gt", value: 0 },
        },
        {
          kind: "field",
          key: "Begruendung",
          label:
            "Bitte erläutern Sie die strategische Begründung für diese Standortstruktur (z. B. Local-for-local-Strategie, Herstellung von Vorprodukten, Kostenoptimierung/Skalierung).",
          type: "textarea",
          required: true,
          visibleWhen: { field: "SitzUndBedeutung.anzahlStandorteAusland", op: "gt", value: 0 },
        },
        {
          kind: "field",
          key: "eignerstruktur",
          label: "Detaillierte Beschreibung der Eigentümerstruktur",
          type: "textarea",
          required: true,
        },
        yesno(
          "geaenderteEigentuemersruktur",
          "Sind Änderungen der Eigentümerstruktur in den nächsten 3 Jahren geplant?",
        ),
        shownWhenYes(
          "beschreibungGeplanteAenderungen",
          "Beschreibung der geplanten Änderungen",
          "SitzUndBedeutung.geaenderteEigentuemersruktur",
        ),
        yesno(
          "strukturschwach",
          "Befinden sich Standorte in strukturschwachen Regionen Deutschlands?",
        ),
        shownWhenYes(
          "beschreibungStrukturschwach",
          "Beschreibung der entsprechenden Standorte",
          "SitzUndBedeutung.strukturschwach",
        ),
        yesno("regionaleBedeutung", "Hat Ihr Unternehmen besondere regionale Bedeutung?"),
        shownWhenYes(
          "beschreibungRegionaleBedeutung",
          "Detaillierte Beschreibung der regionalen Bedeutung",
          "SitzUndBedeutung.regionaleBedeutung",
        ),
        yesno("steuerpflichtDE", "Besteht Steuerpflicht in Deutschland?"),
      ],
    },

    /* ---------- 4: Forschung & Entwicklung ---------- */
    {
      key: "ForschungEntwicklung",
      title: "Forschung & Entwicklung",
      children: [
        yearTableGroup(
          "Beschaeftigte",
          "Beschäftigte in F&E (Deutschland und Ausland, jeweils für die letzten 3 Geschäftsjahre)",
          DE_AUS_ROWS,
          "integer",
        ),
        yearTableGroup(
          "Aufwendungen",
          "Aufwendungen für F&E (Deutschland und Ausland, jeweils für die letzten 3 Geschäftsjahre)",
          DE_AUS_ROWS,
          "currency",
        ),
        {
          kind: "field",
          key: "veraenderungen",
          label: "Beschreibung der zukünftigen erwarteten Veränderungen der F&E",
          type: "textarea",
        },
        {
          kind: "field",
          key: "schwerpunkte",
          label: "Schwerpunkte der F&E",
          type: "select",
          options: [
            { value: "Deutschland", label: "Deutschland" },
            { value: "Ausland", label: "Ausland" },
          ],
        },
        yesno("kooperationDE", "Bestehen Kooperationen mit deutschen Forschungseinrichtungen?"),
        shownWhenYes(
          "kooperationBeschreibung",
          "Beschreibung und/oder Beispiele solcher Kooperation(en)",
          "ForschungEntwicklung.kooperationDE",
        ),
      ],
    },

    /* ---------- 5: Investitionen ---------- */
    {
      key: "Investitionen",
      title: "Investitionen",
      children: [
        yearTableGroup(
          "Invest",
          "Investitionen in Standorte (Deutschland und Ausland, jeweils für die letzten 3 Geschäftsjahre)",
          DE_AUS_ROWS,
          "currency",
        ),
        {
          kind: "field",
          key: "investBeispieleDE",
          label: "Beispiele für Investitionen in Deutschland",
          type: "textarea",
        },
        {
          kind: "field",
          key: "investBeispieleAusland",
          label: "Beispiele für Investitionen im Ausland",
          type: "textarea",
        },
        {
          kind: "field",
          key: "investAusblick",
          label: "Ausblick auf geplante Investitionen",
          type: "textarea",
        },
        yesno(
          "verlagerung",
          "Sind größere Verlagerungen von Produktion oder anderen Unternehmensbereichen ins Ausland geplant?",
        ),
        shownWhenYes(
          "beschreibungVerlagerung",
          "Beschreibung der geplanten Verlagerung",
          "Investitionen.verlagerung",
        ),
      ],
    },

    /* ---------- 6: Beschäftigte ---------- */
    {
      key: "Beschaeftigte",
      title: "Beschäftigte",
      children: [
        yearTableGroup(
          "Tabelle_DE",
          "Anzahl Beschäftigte in Deutschland nach Bereichen",
          BEREICH_ROWS,
          "integer",
        ),
        yearTableGroup(
          "Tabelle_AUS",
          "Anzahl Beschäftigte im Ausland nach Bereichen",
          BEREICH_ROWS,
          "integer",
        ),
        {
          kind: "field",
          key: "hochqualifiziertOrt",
          label: "Ansiedlung der höher qualifizierten Jobs",
          type: "select",
          options: [
            { value: "Deutschland", label: "Deutschland" },
            { value: "Ausland", label: "Ausland" },
          ],
        },
        {
          kind: "field",
          key: "hochqualifiziertBeschreibung",
          label: "Nähere Beschreibung",
          type: "textarea",
        },
        yesno(
          "veraenderungenBeschaeftigte",
          "Werden größere Veränderungen in Anzahl und/oder Struktur der Beschäftigten erwartet?",
        ),
        shownWhenYes(
          "veraenderungenBeschaeftigteText",
          "Beschreibung der erwarteten Veränderungen",
          "Beschaeftigte.veraenderungenBeschaeftigte",
        ),
      ],
    },

    /* ---------- 7: Ausbildungsaktivitäten ---------- */
    {
      key: "Ausbildung",
      title: "Ausbildung",
      children: [
        yearTableGroup(
          "Azubis",
          "Auszubildende / Dualstudierende (Anzahl, je Berichtsjahr)",
          AZUBI_ROWS,
          "integer",
        ),
        {
          kind: "field",
          key: "ausblickAusbildung",
          label: "Ausblick auf geplante Ausbildungsaktivitäten",
          type: "textarea",
        },
        yesno(
          "ueberBedarfAusbildung",
          "Bildet Ihr Unternehmen über den eigenen Bedarf hinaus aus? (z. B. für andere Unternehmen oder Branchen)",
        ),
        yesno(
          "kooperationBildung",
          "Bestehen Kooperationen mit Bildungs- oder Forschungseinrichtungen?",
        ),
        shownWhenYes(
          "kooperationBildungText",
          "Beschreibung der Kooperation(en)",
          "Ausbildung.kooperationBildung",
        ),
      ],
    },

    /* ---------- 8: Sourcing und Wertschöpfung ---------- */
    {
      key: "SourcingWertschoepfung",
      title: "Sourcing & Wertschöpfung",
      children: [
        {
          kind: "group",
          key: "Einkauf",
          label: "Einkaufsvolumen nach Ländern (für die letzten 3 Geschäftsjahre)",
          inline: true,
          children: [
            yearField("jahr1", "Berichtsjahr 1"),
            yearField("jahr2", "Berichtsjahr 2"),
            yearField("jahr3", "Berichtsjahr 3"),
            {
              kind: "table",
              key: "Laender",
              label: "",
              mode: "dynamic",
              addLabel: "Land hinzufügen",
              columns: [
                { key: "Land", label: "Land", type: "text" },
                { key: "Betrag1", label: "1. Jahr", type: "currency" },
                { key: "Betrag2", label: "2. Jahr", type: "currency" },
                { key: "Betrag3", label: "3. Jahr", type: "currency" },
              ],
            },
          ],
        },
        yearTableGroup(
          "Wertschoepfung",
          "Anteil deutscher Wertschöpfung am Umsatz (in %, je Berichtsjahr)",
          WERTSCHOEPFUNG_ROWS,
          "percent",
        ),
        {
          kind: "field",
          key: "wertschoepfungBerechnung",
          label: "Erläuterung zur Berechnung der Wertschöpfung",
          type: "textarea",
        },
      ],
    },

    /* ---------- 9: Sonstiges ---------- */
    {
      key: "Sonstiges",
      title: "Sonstiges",
      children: [
        {
          kind: "field",
          key: "sonstigeHinweise",
          label: "Was möchten Sie uns darüber hinaus noch mitteilen?",
          type: "textarea",
        },
        {
          kind: "field",
          key: "newsletter",
          label: "Ich möchte den flex&cover-Newsletter erhalten.",
          type: "checkbox",
        },
        { kind: "field", key: "Ort_Datum", label: "Ort und Datum", type: "text" },
        {
          kind: "field",
          key: "Unterschrift",
          label: "Unterschrift des Antragstellers / Firmenstempel",
          type: "text",
          help: "Bitte tippen Sie Ihren vollständigen Namen als Unterschrift ein.",
        },
      ],
    },
  ],
};

// Amtliches Freitextfeld „Weitere Anmerkungen" am Ende jedes Abschnitts (außer
// Sonstiges). Nicht in der XSD — bewusste Erweiterung für Originaltreue (PROJ-5,
// Option 3: online erfassbar + im PDF). Wird ans Ende der Abschnittsfelder gehängt.
for (const section of flexcoverDefinition.sections) {
  if (section.key === "Sonstiges") continue;
  section.children.push({
    kind: "field",
    key: "weitereAnmerkungen",
    label: "Weitere Anmerkungen",
    type: "textarea",
  });
}
