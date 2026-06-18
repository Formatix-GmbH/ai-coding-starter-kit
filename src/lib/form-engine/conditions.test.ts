import { describe, it, expect } from "vitest";
import { evaluateCondition } from "./conditions";

const values = {
  a: { flag: "Ja", n: 5, on: true, off: false },
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
  it("fehlender Pfad → eq false, falsy true", () => {
    expect(evaluateCondition({ field: "x.y", op: "eq", value: "Ja" }, values)).toBe(false);
    expect(evaluateCondition({ field: "x.y", op: "falsy" }, values)).toBe(true);
  });
});
