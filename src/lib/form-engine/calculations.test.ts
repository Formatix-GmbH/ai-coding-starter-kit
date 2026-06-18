import { describe, it, expect } from "vitest";
import { computeValue } from "./calculations";
import { HandlerRegistry } from "./handlers";

describe("computeValue", () => {
  const registry = new HandlerRegistry().registerCalc("doppel", ({ values }) => {
    const n = typeof values.x === "number" ? values.x : 0;
    return n * 2;
  });

  it("summiert referenzierte Felder (deutsche Zahlen)", () => {
    const values = { g: { a: "1.000,50", b: "2,50" } };
    expect(computeValue({ op: "sum", fields: ["g.a", "g.b"] }, values, registry)).toBe(1003);
  });

  it("ignoriert nicht-numerische Werte als 0", () => {
    const values = { g: { a: "abc", b: 5 } };
    expect(computeValue({ op: "sum", fields: ["g.a", "g.b"] }, values, registry)).toBe(5);
  });

  it("ruft benannten Handler auf", () => {
    expect(computeValue({ handler: "doppel" }, { x: 21 }, registry)).toBe(42);
  });

  it("unbekannter Handler → null", () => {
    expect(computeValue({ handler: "fehlt" }, {}, registry)).toBeNull();
  });
});
