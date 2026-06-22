import { describe, it, expect } from "vitest";
import { generateReference } from "./reference";

// PROJ-6 — Referenznummern-Format und Robustheit.

describe("generateReference", () => {
  it("erzeugt das Format FC-<Jahr>-<6 Zeichen>", () => {
    const ref = generateReference("FC", new Date("2026-06-22T00:00:00Z"));
    expect(ref).toMatch(/^FC-2026-[A-Z2-9]{6}$/);
  });

  it("enthält keine mehrdeutigen Zeichen (0/O/1/I/L)", () => {
    for (let i = 0; i < 200; i++) {
      const suffix = generateReference().split("-")[2];
      expect(suffix).not.toMatch(/[01OIL]/);
    }
  });

  it("ist über viele Aufrufe praktisch eindeutig", () => {
    const refs = new Set(Array.from({ length: 1000 }, () => generateReference()));
    // Bei 30^6 Möglichkeiten sind Kollisionen über 1000 Werte extrem unwahrscheinlich.
    expect(refs.size).toBe(1000);
  });
});
