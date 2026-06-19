import { describe, it, expect } from "vitest";
import { evaluateCondition } from "./conditions";

const values = {
  a: { flag: "Ja", n: 5, on: true, off: false, str: "1.234,5", leer: "" },
};

describe("evaluateCondition", () => {
  it("ohne Bedingung → sichtbar", () => {
    expect(evaluateCondition(undefined, values)).toBe(true);
  });
  it("eq / neq über absoluten Pfad", () => {
    expect(evaluateCondition({ field: "a.flag", op: "eq", value: "Ja" }, values)).toBe(true);
    expect(evaluateCondition({ field: "a.flag", op: "neq", value: "Ja" }, values)).toBe(false);
  });
  it("in", () => {
    expect(evaluateCondition({ field: "a.n", op: "in", value: [1, 5, 9] }, values)).toBe(true);
    expect(evaluateCondition({ field: "a.n", op: "in", value: [1, 2] }, values)).toBe(false);
  });
  it("truthy / falsy", () => {
    expect(evaluateCondition({ field: "a.on", op: "truthy" }, values)).toBe(true);
    expect(evaluateCondition({ field: "a.off", op: "falsy" }, values)).toBe(true);
  });
  it("all / any kombinieren", () => {
    expect(
      evaluateCondition(
        { all: [{ field: "a.flag", op: "eq", value: "Ja" }, { field: "a.on", op: "truthy" }] },
        values,
      ),
    ).toBe(true);
    expect(
      evaluateCondition(
        { any: [{ field: "a.flag", op: "eq", value: "Nein" }, { field: "a.on", op: "truthy" }] },
        values,
      ),
    ).toBe(true);
  });
  it("gt / gte / lt / lte mit Zahl", () => {
    expect(evaluateCondition({ field: "a.n", op: "gt", value: 0 }, values)).toBe(true);
    expect(evaluateCondition({ field: "a.n", op: "gt", value: 5 }, values)).toBe(false);
    expect(evaluateCondition({ field: "a.n", op: "gte", value: 5 }, values)).toBe(true);
    expect(evaluateCondition({ field: "a.n", op: "lt", value: 6 }, values)).toBe(true);
    expect(evaluateCondition({ field: "a.n", op: "lte", value: 5 }, values)).toBe(true);
  });
  it("gt mit deutschem Zahlen-String", () => {
    expect(evaluateCondition({ field: "a.str", op: "gt", value: 1000 }, values)).toBe(true);
    expect(evaluateCondition({ field: "a.str", op: "lt", value: 1000 }, values)).toBe(false);
  });
  it("Zahlenvergleich auf leerem/fehlendem Wert → false", () => {
    expect(evaluateCondition({ field: "a.leer", op: "gt", value: 0 }, values)).toBe(false);
    expect(evaluateCondition({ field: "x.y", op: "gt", value: 0 }, values)).toBe(false);
    expect(evaluateCondition({ field: "a.flag", op: "gt", value: 0 }, values)).toBe(false);
  });
  it("fehlender Pfad → eq false, falsy true", () => {
    expect(evaluateCondition({ field: "x.y", op: "eq", value: "Ja" }, values)).toBe(false);
    expect(evaluateCondition({ field: "x.y", op: "falsy" }, values)).toBe(true);
  });
});
