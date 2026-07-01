// PROJ-18: Beispieldatensatz für den Muster-Förderantrag ("Testdaten laden").
// Struktur spiegelt die Definition (Abschnitts-/Gruppen-/Tabellen-Pfade).

import type { FormValues } from "@/lib/form-engine/types";

export const musterantragSampleData: FormValues = {
  kontakt: {
    anrede: "Frau",
    titel: "Dr.",
    name: { vorname: "Alex", nachname: "Muster" },
    email: "alex.muster@example.org",
    telefon: "+49 30 1234567",
    anmerkungen: "Erreichbar werktags von 9–17 Uhr.",
  },
  organisation: {
    name: "Musterorganisation gGmbH",
    rechtsform: "GmbH",
    adresse: { strasse: "Musterstraße 1", plz: "10115", ort: "Berlin" },
    land: "Deutschland",
    website: "https://www.example.org",
    kennzahlen: { mitarbeiter: "42", gruendungsjahr: "2015" },
  },
  vorhaben: {
    titel: "Digitalisierung des Antragsprozesses",
    beschreibung:
      "Aufbau eines barrierefreien Online-Portals zur Erfassung und Prüfung von Förderanträgen.",
    foerderbereich: "Digitalisierung",
    beginn: "2026-09-01",
    kosten: { personal: "120000", sachmittel: "45000" },
    eigenmittel: "30000",
    international: "Ja",
    beschreibungInternational:
      "Zusammenarbeit mit Partnern in Österreich und den Niederlanden bei der Barrierefreiheitsprüfung.",
    partner: [
      { partnername: "Beispiel Partner GmbH", land: "Österreich" },
      { partnername: "Voorbeeld B.V.", land: "Niederlande" },
    ],
    meilensteine: [
      { bezeichnung: "Konzeption", termin: "2026-10-31", budget: "20000" },
      { bezeichnung: "Pilotbetrieb", termin: "2027-03-31", budget: "60000" },
    ],
    mittelverwendung: {
      personal: { jahr1: "60000", jahr2: "40000", jahr3: "20000" },
      sachmittel: { jahr1: "25000", jahr2: "15000", jahr3: "5000" },
    },
  },
  abschluss: {
    hinweise: "Wir freuen uns auf eine Rückmeldung.",
    unterschrift: { ort: "Berlin", datum: "2026-07-01" },
    datenschutz: true,
    newsletter: true,
  },
};
