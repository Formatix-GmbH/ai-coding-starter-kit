// PROJ-5 (Dev-Hilfe): vollständiger, gültiger Beispieldatensatz für FlexCover.
// Struktur = Formularstand der Engine (gleiche Pfade wie die Definition). Wird nur
// über den Entwicklungs-Button „Testdaten laden" genutzt, nicht in Produktion.

import type { FormValues } from "@/lib/form-engine/types";

const jahre = { jahr1: "2022", jahr2: "2023", jahr3: "2024" };
const matrix4 = (a: string, b: string, c: string, d: string) => ({
  ...jahre,
  werte: {
    fe: { sp1: a, sp2: a, sp3: a },
    engineering: { sp1: b, sp2: b, sp3: b },
    produktion: { sp1: c, sp2: c, sp3: c },
    sonstige: { sp1: d, sp2: d, sp3: d },
  },
});
const matrixDeAus = (de: string, aus: string) => ({
  ...jahre,
  werte: { DE: { sp1: de, sp2: de, sp3: de }, AUS: { sp1: aus, sp2: aus, sp3: aus } },
});

export const flexcoverSampleData: FormValues = {
  Ansprechpartner: {
    anrede: "Frau",
    titel: "Dr.",
    vorname: "Erika",
    nachname: "Mustermann",
    email: "erika.mustermann@muster-gmbh.de",
    telefon: "+49 30 1234567",
    taetigkeitsbereich: "Geschäftsführung",
    weitereAnmerkungen: "Rückfragen bitte per E-Mail.",
  },
  Unternehmen: {
    unternehmensgegenstand: "Maschinenbau und Anlagentechnik für die Industrie",
    firma: "Muster GmbH",
    personenNr: "PN-001",
    unternehmenstyp: "Hersteller und Händler",
    adresse: { strasse: "Hauptstraße 1", plz: "80331", ort: "München", land: "Deutschland" },
    branche: "Maschinenbau",
    mitarbeiter: "250",
    website: "www.muster-gmbh.de",
    weitereBeguenstigte: "Ja",
    Beguenstigter: [
      { vollstaendigeFirmierung: "Muster Tochter GmbH", sitzBeguenstigter: "Berlin", personenNummerBeguenstigter: "1234567" },
      { vollstaendigeFirmierung: "Zweite Beteiligungs AG", sitzBeguenstigter: "Hamburg", personenNummerBeguenstigter: "7654321" },
    ],
    weitereAnmerkungen: "",
  },
  SitzUndBedeutung: {
    hauptsitz: "München, Deutschland",
    anzahlStandorteDE: "3",
    anzahlStandorteAusland: "2",
    StandorteNeu: "2 Produktionsstandorte in Polen und Tschechien",
    Begruendung: "Local-for-local-Strategie sowie Kostenoptimierung und Skalierung.",
    eignerstruktur: "GmbH, alleiniger Gesellschafter (Familienbesitz).",
    geaenderteEigentuemersruktur: "Nein",
    strukturschwach: "Ja",
    beschreibungStrukturschwach: "Ein Standort in einer strukturschwachen Region Ostdeutschlands.",
    regionaleBedeutung: "Ja",
    beschreibungRegionaleBedeutung: "Größter Arbeitgeber der Region mit Ausbildungsbetrieb.",
    steuerpflichtDE: "Ja",
    weitereAnmerkungen: "",
  },
  ForschungEntwicklung: {
    Beschaeftigte: matrixDeAus("45", "8"),
    Aufwendungen: matrixDeAus("12,5", "3,2"),
    veraenderungen: "Ausbau der Forschung am Standort Deutschland geplant.",
    schwerpunkte: "Deutschland",
    kooperationDE: "Ja",
    kooperationBeschreibung: "Kooperation mit der TU München (Materialforschung).",
    weitereAnmerkungen: "",
  },
  Investitionen: {
    Invest: matrixDeAus("20,0", "5,0"),
    investBeispieleDE: "Neue Fertigungshalle und Automatisierungstechnik.",
    investBeispieleAusland: "Aufbau eines Vertriebs- und Servicebüros.",
    investAusblick: "Weitere Automatisierung der Fertigung.",
    verlagerung: "Nein",
    weitereAnmerkungen: "",
  },
  Beschaeftigte: {
    Tabelle_DE: matrix4("50", "30", "120", "20"),
    Tabelle_AUS: matrix4("10", "5", "40", "5"),
    hochqualifiziertOrt: "Deutschland",
    hochqualifiziertBeschreibung: "F&E- und Engineering-Leitung in München.",
    veraenderungenBeschaeftigte: "Ja",
    veraenderungenBeschaeftigteText: "Aufbau eines neuen F&E-Teams (ca. 15 Stellen).",
    weitereAnmerkungen: "",
  },
  Ausbildung: {
    Azubis: { ...jahre, werte: { azubis: { sp1: "12", sp2: "14", sp3: "15" } } },
    ausblickAusbildung: "Ausbau auf 18 Ausbildungsplätze geplant.",
    ueberBedarfAusbildung: "Ja",
    kooperationBildung: "Ja",
    kooperationBildungText: "Kooperation mit der Berufsschule München.",
    weitereAnmerkungen: "",
  },
  SourcingWertschoepfung: {
    Einkauf: {
      ...jahre,
      Laender: [
        { Land: "Italien", Betrag1: "5,0", Betrag2: "5,5", Betrag3: "6,0" },
        { Land: "Polen", Betrag1: "3,0", Betrag2: "3,2", Betrag3: "3,4" },
      ],
    },
    Wertschoepfung: { ...jahre, werte: { anteil: { sp1: "65", sp2: "66", sp3: "68" } } },
    wertschoepfungBerechnung: "Anteil deutscher Vorprodukte und Dienstleistungen am Umsatz.",
    weitereAnmerkungen: "",
  },
  Sonstiges: {
    sonstigeHinweise: "Vielen Dank für die Prüfung unseres Antrags.",
    newsletter: true,
    Ort_Datum: "München, 21.06.2026",
    Unterschrift: "Erika Mustermann",
  },
};
