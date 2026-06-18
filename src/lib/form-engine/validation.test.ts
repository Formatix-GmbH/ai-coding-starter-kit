import { describe, it, expect } from "vitest";
import { validateForm, validateField } from "./validation";
import { HandlerRegistry } from "./handlers";
import type { FieldNode, FormDefinition } from "./types";

const reg = new HandlerRegistry();

describe("validateField", () => {
  const field = (over: Partial<FieldNode>): FieldNode => ({
    kind: "field", key: "f", label: "F", type: "text", ...over,
  });

  it("Pflichtfeld leer → Fehler", () => {
    expect(validateField(field({ required: true }), "", {}, reg)).toBe("Pflichtfeld");
  });
  it("optional leer → ok", () => {
    expect(validateField(field({ required: false }), "", {}, reg)).toBeNull();
  });
  it("E-Mail ungültig → Fehler, gültig → ok", () => {
    expect(validateField(field({ type: "email" }), "abc", {}, reg)).toMatch(/E-Mail/);
    expect(validateField(field({ type: "email" }), "a@b.de", {}, reg)).toBeNull();
  });
  it("PLZ-Muster", () => {
    expect(validateField(field({ type: "plz" }), "12", {}, reg)).toMatch(/PLZ/);
    expect(validateField(field({ type: "plz" }), "12345", {}, reg)).toBeNull();
  });
  it("Zahl mit min/max (deutsche Eingabe)", () => {
    const f = field({ type: "decimal", min: 0, max: 100 });
    expect(validateField(f, "150", {}, reg)).toMatch(/Höchstens/);
    expect(validateField(f, "1.000,5", {}, reg)).toMatch(/Höchstens/);
    expect(validateField(f, "50,5", {}, reg)).toBeNull();
  });
  it("Checkbox required muss true sein", () => {
    expect(validateField(field({ type: "checkbox", required: true }), false, {}, reg)).toBe("Bitte bestätigen");
    expect(validateField(field({ type: "checkbox", required: true }), true, {}, reg)).toBeNull();
  });
});

describe("validateForm — Sichtbarkeit & Verschachtelung", () => {
  const definition: FormDefinition = {
    id: "t", title: "T", layout: "single",
    sections: [
      {
        key: "s",
        title: "S",
        children: [
          { kind: "field", key: "flag", label: "Flag", type: "yesno" },
          {
            kind: "field", key: "grund", label: "Grund", type: "text", required: true,
            visibleWhen: { field: "s.flag", op: "eq", value: "Ja" },
          },
          {
            kind: "repeat", key: "liste", label: "Liste", min: 1,
            children: [
              { kind: "field", key: "name", label: "Name", type: "text", required: true },
              {
                kind: "repeat", key: "unter", label: "Unter",
                children: [
                  { kind: "field", key: "wert", label: "Wert", type: "text", required: true },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  it("ausgeblendetes Pflichtfeld blockiert nicht", () => {
    const errs = validateForm(definition, { s: { flag: "Nein", liste: [{ name: "x" }] } }, reg);
    expect(errs["s.grund"]).toBeUndefined();
  });

  it("eingeblendetes Pflichtfeld wird geprüft", () => {
    const errs = validateForm(definition, { s: { flag: "Ja", liste: [{ name: "x" }] } }, reg);
    expect(errs["s.grund"]).toBe("Pflichtfeld");
  });

  it("Wiederhol-min wird geprüft", () => {
    const errs = validateForm(definition, { s: { flag: "Nein", liste: [] } }, reg);
    expect(errs["s.liste"]).toMatch(/Mindestens/);
  });

  it("verschachtelte Instanz wird einzeln validiert", () => {
    const errs = validateForm(
      definition,
      { s: { flag: "Nein", liste: [{ name: "x", unter: [{ wert: "" }] }] } },
      reg,
    );
    expect(errs["s.liste.0.unter.0.wert"]).toBe("Pflichtfeld");
  });
});
