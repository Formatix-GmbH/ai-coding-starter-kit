import { describe, it, expect, vi, afterEach } from "vitest";
import { verifyTurnstile, clientIpFromHeaders } from "./verify";

// PROJ-16 — serverseitige Turnstile-Verifizierung.

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("verifyTurnstile", () => {
  it("ohne Secret → true (Schutz deaktiviert, rollout-sicher)", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    expect(await verifyTurnstile("irgendein-token")).toBe(true);
  });

  it("mit Secret, aber ohne Token → false", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "sec");
    expect(await verifyTurnstile(undefined)).toBe(false);
    expect(await verifyTurnstile("")).toBe(false);
  });

  it("gültiger Token (siteverify success) → true", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "sec");
    vi.stubGlobal("fetch", vi.fn(async () => ({ json: async () => ({ success: true }) })));
    expect(await verifyTurnstile("tok", "1.2.3.4")).toBe(true);
  });

  it("ungültiger Token (success:false) → false", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "sec");
    vi.stubGlobal("fetch", vi.fn(async () => ({ json: async () => ({ success: false }) })));
    expect(await verifyTurnstile("tok")).toBe(false);
  });

  it("Netzfehler → false (wirft nie)", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "sec");
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("network");
    }));
    expect(await verifyTurnstile("tok")).toBe(false);
  });
});

describe("clientIpFromHeaders", () => {
  it("bevorzugt CF-Connecting-IP", () => {
    const h = new Headers({ "cf-connecting-ip": "9.9.9.9", "x-forwarded-for": "1.1.1.1, 2.2.2.2" });
    expect(clientIpFromHeaders(h)).toBe("9.9.9.9");
  });
  it("fällt auf den ersten X-Forwarded-For-Eintrag zurück", () => {
    const h = new Headers({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" });
    expect(clientIpFromHeaders(h)).toBe("1.1.1.1");
  });
  it("null, wenn nichts vorhanden", () => {
    expect(clientIpFromHeaders(new Headers())).toBeNull();
  });
});
