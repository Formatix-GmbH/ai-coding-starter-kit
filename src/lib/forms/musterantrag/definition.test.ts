import { describe, it, expect } from "vitest";
import { musterantragDefinition } from "./definition";
import type { FormNode } from "@/lib/form-engine/types";

// PROJ-19: Schreibt den Stufe-1-Umfang der Feld-Erklärungen fest — genau die
// bestätigten 10 Knoten im Abschnitt „Vorhaben" tragen eine Erklärung, sonst
// keiner. Schlägt an, wenn Erklärungen versehentlich entfernt oder unabgestimmt
// ergänzt werden.

function collectExplained(nodes: FormNode[], base: string, out: string[]): void {
  for (const node of nodes) {
    const path = `${base}.${node.key}`;
    if ((node.kind === "field" || node.kind === "table") && node.explanation) {
      out.push(path);
      // Erklärtexte sollen substanziell sein (einfache Sprache mit Beispiel).
      expect(node.explanation.length).toBeGreaterThan(80);
    }
    if (node.kind === "group" || node.kind === "repeat") {
      collectExplained(node.children, path, out);
    }
  }
}

describe("Musterantrag — Feld-Erklärungen (Stufe 1)", () => {
  it("genau die 10 bestätigten Knoten im Abschnitt „Vorhaben“ haben Erklärungen", () => {
    const explained: string[] = [];
    for (const section of musterantragDefinition.sections) {
      collectExplained(section.children, section.key, explained);
    }
    expect(explained.sort()).toEqual(
      [
        "vorhaben.beschreibung",
        "vorhaben.foerderbereich",
        "vorhaben.kosten.personal",
        "vorhaben.kosten.sachmittel",
        "vorhaben.kosten.gesamt",
        "vorhaben.eigenmittel",
        "vorhaben.international",
        "vorhaben.beschreibungInternational",
        "vorhaben.meilensteine",
        "vorhaben.mittelverwendung",
      ].sort(),
    );
  });
});
