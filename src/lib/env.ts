import { z } from "zod";

/**
 * Validiert die für Supabase benötigten Umgebungsvariablen beim Zugriff.
 * Fehlt etwas, gibt es eine klare Fehlermeldung statt eines stillen Absturzes
 * (PROJ-1 Acceptance Criterion). Es werden ausschließlich öffentliche
 * NEXT_PUBLIC_-Variablen geprüft — niemals der Service-Schlüssel.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_URL fehlt")
    .url("NEXT_PUBLIC_SUPABASE_URL ist keine gültige URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY fehlt"),
});

/**
 * Reine Parse-Funktion (testbar). Wirft bei fehlender/ungültiger Konfiguration
 * eine klare, gesammelte Fehlermeldung.
 */
export function parsePublicEnv(source: Record<string, string | undefined>) {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: source.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: source.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `- ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Supabase-Konfiguration unvollständig. Bitte .env.local prüfen:\n${issues}`,
    );
  }

  return parsed.data;
}

// NEXT_PUBLIC_-Variablen werden zur Buildzeit inlined, daher explizit referenziert.
export const publicEnv = parsePublicEnv({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
