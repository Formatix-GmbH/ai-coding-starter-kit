import { describe, it, expect } from "vitest";
import { evaluatePasswordStrength } from "./password-strength";

describe("evaluatePasswordStrength", () => {
  it("leeres Passwort → Score 0", () => {
    expect(evaluatePasswordStrength("").score).toBe(0);
  });

  it("kurzes Passwort ohne Vielfalt → schwach", () => {
    expect(evaluatePasswordStrength("abc").score).toBeLessThanOrEqual(1);
  });

  it("policy-konform (8+, Buchstabe+Ziffer) → mindestens mittel", () => {
    expect(evaluatePasswordStrength("abcdefg1").score).toBeGreaterThanOrEqual(2);
  });

  it("lang (12+) + Buchstabe/Ziffer/Sonderzeichen → stark", () => {
    expect(evaluatePasswordStrength("abcdefghij12!").score).toBe(4);
  });

  it("liefert immer ein Label", () => {
    expect(evaluatePasswordStrength("test1234").label).toBeTypeOf("string");
  });
});
