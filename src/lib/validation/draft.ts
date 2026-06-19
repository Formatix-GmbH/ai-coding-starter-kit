import { z } from "zod";

/** PROJ-4: Validierung für die Entwurf-API (serverseitig). */

/** Formular-ID (Pfadparameter). Eng begrenzt gegen ungültige/böswillige Werte. */
export const formIdSchema = z
  .string()
  .regex(/^[a-z0-9_-]{1,64}$/, "Ungültige Formular-ID");

/** PUT-Body zum Speichern eines Entwurfs. */
export const draftPayloadSchema = z.object({
  // Vollständiger Formularstand (verschachteltes Objekt). Inhalt bewusst offen,
  // da die Engine beliebige Formulardefinitionen tragen kann.
  data: z.record(z.string(), z.unknown()),
  activeSection: z.string().max(128).nullish(),
  expectedUpdatedAt: z.string().max(64).nullish(),
  force: z.boolean().optional(),
});

export type DraftPayloadInput = z.infer<typeof draftPayloadSchema>;
