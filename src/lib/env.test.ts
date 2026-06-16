import { describe, it, expect } from "vitest";
import { parsePublicEnv } from "./env";

const validUrl = "https://example.supabase.co";
const validKey = "sb_publishable_testkey";

describe("parsePublicEnv", () => {
  it("akzeptiert vollständige, gültige Konfiguration", () => {
    const result = parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: validUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: validKey,
    });
    expect(result.NEXT_PUBLIC_SUPABASE_URL).toBe(validUrl);
    expect(result.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe(validKey);
  });

  it("wirft, wenn die URL fehlt", () => {
    expect(() =>
      parsePublicEnv({ NEXT_PUBLIC_SUPABASE_ANON_KEY: validKey }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("wirft, wenn der Anon-Key fehlt", () => {
    expect(() =>
      parsePublicEnv({ NEXT_PUBLIC_SUPABASE_URL: validUrl }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  });

  it("wirft bei ungültiger URL", () => {
    expect(() =>
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "nicht-eine-url",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: validKey,
      }),
    ).toThrow(/gültige URL/);
  });

  it("sammelt mehrere Fehler in einer Meldung", () => {
    expect(() => parsePublicEnv({})).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL[\s\S]*NEXT_PUBLIC_SUPABASE_ANON_KEY/,
    );
  });
});
