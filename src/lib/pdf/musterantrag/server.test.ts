import { describe, it, expect } from "vitest";
import { renderMusterantragPdfBuffer } from "./server";
import { musterantragSampleData } from "@/lib/forms/musterantrag/sample-data";

// PROJ-18: Bestätigt, dass das neue Musterantrag-PDF-Layout serverseitig fehlerfrei
// zu einem gültigen PDF rendert (react-pdf-Kaltstart → großzügiges Timeout).

describe("renderMusterantragPdfBuffer", () => {
  it("rendert ein gültiges PDF aus den Beispieldaten", async () => {
    const buf = await renderMusterantragPdfBuffer(musterantragSampleData, "FC-2026-TEST01");
    expect(buf.length).toBeGreaterThan(1000);
    expect(buf.subarray(0, 4).toString("latin1")).toBe("%PDF");
  }, 60000);

  it("rendert auch ohne Referenz und mit leeren Werten", async () => {
    const buf = await renderMusterantragPdfBuffer({});
    expect(buf.subarray(0, 4).toString("latin1")).toBe("%PDF");
  }, 60000);
});
