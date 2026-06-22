// @vitest-environment node
import { describe, test, expect } from "vitest";
import { renderFlexcoverPdfBuffer } from "./server";
import { flexcoverSampleData } from "@/lib/forms/flexcover/sample-data";

// PROJ-6 — Serverseitige PDF-Erzeugung (Node): registriert Arimo per Dateipfad
// und lädt das Kopf-Banner als Data-URL aus public/. Bestätigt, dass daraus ein
// gültiges PDF entsteht — auch mit Referenznummer (eingereichtes PDF).

const isPdf = (b: Buffer) => b.subarray(0, 5).toString("latin1") === "%PDF-";

// react-pdf hat im Node-Kaltstart (fontkit/yoga) eine längere Initialzeit;
// der erste Render kann unter Last >30s brauchen.
const TIMEOUT = 60000;

describe("renderFlexcoverPdfBuffer (serverseitig)", () => {
  test("erzeugt ein gültiges PDF mit Referenznummer", async () => {
    const buf = await renderFlexcoverPdfBuffer(flexcoverSampleData, "FC-2026-A1B2C3");
    expect(isPdf(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(3000);
  }, TIMEOUT);

  test("erzeugt ein gültiges PDF auch ohne Referenz", async () => {
    const buf = await renderFlexcoverPdfBuffer({});
    expect(isPdf(buf)).toBe(true);
  }, TIMEOUT);
});
