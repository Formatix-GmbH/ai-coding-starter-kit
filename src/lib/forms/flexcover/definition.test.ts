import { describe, it, expect } from "vitest";
import { flexcoverDefinition } from "./definition";
import { pruneHiddenValues, buildEmptyValues } from "@/lib/form-engine/output";
import type { FormValues } from "@/lib/form-engine/types";

// PROJ-11 — belegt die XSD-konforme Ausgabestruktur (Element-Namen/Verschachtelung
// wie flexcover_antrag_X.xsd) und das Pruning ausgeblendeter Felder (Variante A).

describe("FlexCover-Definition", () => {
  it("hat genau die 9 XSD-Abschnitte mit korrekten Namen", () => {
    expect(flexcoverDefinition.sections.map((s) => s.key)).toEqual([
      "Ansprechpartner",
      "Unternehmen",
      "SitzUndBedeutung",
      "ForschungEntwicklung",
      "Investitionen",
      "Beschaeftigte",
      "Ausbildung",
      "SourcingWertschoepfung",
      "Sonstiges",
    ]);
  });

  it("buildEmptyValues erzeugt ein Gerüst über alle Abschnitte", () => {
    const empty = buildEmptyValues(flexcoverDefinition);
    expect(Object.keys(empty)).toContain("Ansprechpartner");
    expect((empty.Unternehmen as FormValues).adresse).toBeTypeOf("object");
    // dynamische Tabelle → leeres Array, feste Tabelle → leeres Objekt
    expect((empty.SourcingWertschoepfung as FormValues).Einkauf).toEqual([]);
    expect((empty.Beschaeftigte as FormValues).Tabelle_DE).toEqual({});
  });

  it("Ausgabe ist XSD-konform verschachtelt (Namen/Hierarchie)", () => {
    const values: FormValues = {
      Ansprechpartner: { anrede: "Frau", vorname: "Erika", nachname: "Muster", email: "e@firma.de" },
      Unternehmen: {
        unternehmensgegenstand: "Maschinenbau",
        firma: "Muster GmbH",
        adresse: { strasse: "Hauptstr. 1", plz: "80331", ort: "München", land: "Deutschland" },
        branche: "Industrie",
        mitarbeiter: "50",
        weitereBeguenstigte: "Ja",
        Beguenstigter: [
          { vollstaendigeFirmierung: "Tochter GmbH", sitzBeguenstigter: "Berlin", personenNummerBeguenstigter: "42" },
        ],
      },
      SitzUndBedeutung: {
        hauptsitz: "München",
        anzahlStandorteDE: "3",
        anzahlStandorteAusland: "2",
        StandorteNeu: "2 Produktionsstandorte",
        Begruendung: "Local-for-local",
        eignerstruktur: "GmbH",
      },
      Beschaeftigte: {
        Tabelle_DE: { produktion: { jahr1: "12", jahr2: "13", jahr3: "14" } },
      },
      SourcingWertschoepfung: {
        Einkauf: [{ Land: "Italien", Betrag1: "1000" }],
      },
    };

    const out = pruneHiddenValues(flexcoverDefinition, values);

    // Top-Level-Namen + Verschachtelung
    expect((out.Ansprechpartner as FormValues).email).toBe("e@firma.de");
    expect(((out.Unternehmen as FormValues).adresse as FormValues).plz).toBe("80331");
    // Wiederholgruppe als Array
    expect((out.Unternehmen as FormValues).Beguenstigter).toHaveLength(1);
    expect(
      ((out.Unternehmen as FormValues).Beguenstigter as FormValues[])[0].vollstaendigeFirmierung,
    ).toBe("Tochter GmbH");
    // feste Tabelle: Container.Zeile.Spalte
    expect(
      (((out.Beschaeftigte as FormValues).Tabelle_DE as FormValues).produktion as FormValues).jahr1,
    ).toBe("12");
    // dynamische Tabelle als Array
    expect((out.SourcingWertschoepfung as FormValues).Einkauf).toHaveLength(1);
  });

  it("blendet versteckte Felder aus der Ausgabe aus (Variante A)", () => {
    const values: FormValues = {
      Investitionen: {
        verlagerung: "Nein",
        beschreibungVerlagerung: "veralteter Text", // Flag steht auf Nein → muss raus
      },
      SitzUndBedeutung: {
        anzahlStandorteAusland: "0",
        StandorteNeu: "veraltet", // > 0 nicht erfüllt → muss raus
      },
    };

    const out = pruneHiddenValues(flexcoverDefinition, values);
    expect("beschreibungVerlagerung" in (out.Investitionen as FormValues)).toBe(false);
    expect("StandorteNeu" in (out.SitzUndBedeutung as FormValues)).toBe(false);
    // sichtbares Flag bleibt erhalten
    expect((out.Investitionen as FormValues).verlagerung).toBe("Nein");
  });

  it("nimmt abhängige Felder auf, sobald die Zahlenbedingung erfüllt ist (gt)", () => {
    const values: FormValues = {
      SitzUndBedeutung: { anzahlStandorteAusland: "3", StandorteNeu: "Standortdetails" },
    };
    const out = pruneHiddenValues(flexcoverDefinition, values);
    expect((out.SitzUndBedeutung as FormValues).StandorteNeu).toBe("Standortdetails");
  });
});
