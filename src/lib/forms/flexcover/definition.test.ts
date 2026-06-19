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
    // 3-Jahres-Container: Gruppe mit Berichtsjahren + fester Wertematrix
    const tabelleDE = (empty.Beschaeftigte as FormValues).Tabelle_DE as FormValues;
    expect(tabelleDE.jahr1).toBe("");
    expect(tabelleDE.werte).toEqual({});
    // Einkauf: Gruppe mit Berichtsjahren + dynamischer Länderliste
    const einkauf = (empty.SourcingWertschoepfung as FormValues).Einkauf as FormValues;
    expect(einkauf.jahr1).toBe("");
    expect(einkauf.Laender).toEqual([]);
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
        Tabelle_DE: {
          jahr1: "2022",
          jahr2: "2023",
          jahr3: "2024",
          werte: { produktion: { sp1: "12", sp2: "13", sp3: "14" } },
        },
      },
      SourcingWertschoepfung: {
        Einkauf: { jahr1: "2022", Laender: [{ Land: "Italien", Betrag1: "1000" }] },
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
    // 3-Jahres-Container: Berichtsjahre flach + Wertematrix unter "werte" (BUG-2)
    const tabelleDE = (out.Beschaeftigte as FormValues).Tabelle_DE as FormValues;
    expect(tabelleDE.jahr1).toBe("2022");
    expect(((tabelleDE.werte as FormValues).produktion as FormValues).sp1).toBe("12");
    // Einkauf: Berichtsjahre + dynamische Länderliste
    const einkauf = (out.SourcingWertschoepfung as FormValues).Einkauf as FormValues;
    expect(einkauf.jahr1).toBe("2022");
    expect(einkauf.Laender).toHaveLength(1);
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
