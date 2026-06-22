// @vitest-environment node
import { describe, test, expect } from "vitest";
import { renderToBuffer, Font } from "@react-pdf/renderer";
import { createElement } from "react";
import path from "node:path";
import type { FormValues } from "@/lib/form-engine/types";
import { FlexcoverDocument } from "./document";
import { flexcoverSampleData } from "@/lib/forms/flexcover/sample-data";

// Im Node-Kontext die Arimo-Familie per Dateipfad registrieren (überschreibt die
// Browser-URL-Registrierung des Dokuments; letzte Registrierung gewinnt).
Font.register({
  family: "Arimo",
  fonts: [
    { src: path.resolve("public/pdf/fonts/Arimo-Regular.woff"), fontWeight: "normal" },
    { src: path.resolve("public/pdf/fonts/Arimo-Bold.woff"), fontWeight: "bold" },
  ],
});

// Mini-PNG als Header (vermeidet Datei-/Netzabhängigkeit im Test).
const HEADER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function render(values: FormValues): Promise<Buffer> {
  return renderToBuffer(
    createElement(FlexcoverDocument, { values, headerSrc: HEADER }) as never,
  );
}
const isPdf = (b: Buffer) => b.subarray(0, 5).toString("latin1") === "%PDF-";

// react-pdf renderToBuffer hat im Node-Kaltstart (fontkit/yoga) eine längere
// Initialzeit → großzügiges Timeout je Test.
const TIMEOUT = 30000;

describe("FlexcoverDocument (PDF-Erzeugung)", () => {
  test("erzeugt ein gültiges, nicht-triviales PDF aus vollständigen Daten", async () => {
    const buf = await render(flexcoverSampleData);
    expect(isPdf(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(3000);
  }, TIMEOUT);

  test("rendert ohne Fehler bei komplett leeren Werten (alle Felder leer)", async () => {
    const buf = await render({});
    expect(isPdf(buf)).toBe(true);
  }, TIMEOUT);

  test("rendert ohne Fehler bei Teil-/Lückendaten (leere Listen, fehlende Abschnitte)", async () => {
    const buf = await render({
      Ansprechpartner: { vorname: "Max" },
      Unternehmen: { weitereBeguenstigte: "Nein", Beguenstigter: [] },
      SourcingWertschoepfung: { Einkauf: { Laender: [] } },
    });
    expect(isPdf(buf)).toBe(true);
  }, TIMEOUT);

  test("verarbeitet dynamische Listen (mehrere Begünstigte/Länder)", async () => {
    const many = {
      Unternehmen: {
        weitereBeguenstigte: "Ja",
        Beguenstigter: Array.from({ length: 6 }, (_, i) => ({
          vollstaendigeFirmierung: `Firma ${i + 1}`,
          sitzBeguenstigter: "Berlin",
          personenNummerBeguenstigter: String(1000 + i),
        })),
      },
      SourcingWertschoepfung: {
        Einkauf: {
          Laender: Array.from({ length: 8 }, (_, i) => ({
            Land: `Land ${i + 1}`,
            Betrag1: "1,0",
            Betrag2: "2,0",
            Betrag3: "3,0",
          })),
        },
      },
    };
    const buf = await render(many);
    expect(isPdf(buf)).toBe(true);
  }, TIMEOUT);
});
