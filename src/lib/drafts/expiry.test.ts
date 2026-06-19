import { describe, it, expect } from "vitest";
import { isDraftExpired } from "./expiry";

const days = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

describe("isDraftExpired", () => {
  it("frischer Entwurf → nicht abgelaufen", () => {
    expect(isDraftExpired(new Date().toISOString())).toBe(false);
  });
  it("13 Tage alt → nicht abgelaufen", () => {
    expect(isDraftExpired(days(13))).toBe(false);
  });
  it("15 Tage alt → abgelaufen", () => {
    expect(isDraftExpired(days(15))).toBe(true);
  });
});
