import { describe, it, expect } from "vitest";
import { pruneHiddenValues } from "./output";
import type { FormDefinition } from "./types";

const definition: FormDefinition = {
  id: "t", title: "T", layout: "single",
  sections: [
    {
      key: "s", title: "S",
      children: [
        { kind: "field", key: "flag", label: "Flag", type: "yesno" },
        {
          kind: "field", key: "grund", label: "Grund", type: "text",
          visibleWhen: { field: "s.flag", op: "eq", value: "Ja" },
        },
        {
          kind: "repeat", key: "liste", label: "Liste",
          children: [{ kind: "field", key: "name", label: "Name", type: "text" }],
        },
      ],
    },
  ],
};

describe("pruneHiddenValues", () => {
  it("entfernt ausgeblendete Felder aus der Ausgabe", () => {
    const out = pruneHiddenValues(definition, {
      s: { flag: "Nein", grund: "geheim", liste: [{ name: "a" }] },
    });
    const s = out.s as Record<string, unknown>;
    expect(s.grund).toBeUndefined();
    expect(s.flag).toBe("Nein");
  });

  it("behält sichtbare Felder", () => {
    const out = pruneHiddenValues(definition, {
      s: { flag: "Ja", grund: "sichtbar", liste: [] },
    });
    const s = out.s as Record<string, unknown>;
    expect(s.grund).toBe("sichtbar");
  });

  it("übernimmt Wiederholgruppen als Liste", () => {
    const out = pruneHiddenValues(definition, {
      s: { flag: "Nein", liste: [{ name: "a" }, { name: "b" }] },
    });
    const s = out.s as Record<string, unknown>;
    expect((s.liste as unknown[]).length).toBe(2);
  });
});
