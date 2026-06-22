import { z } from "zod";

/** PROJ-6: Validierung für die Einreichungs-API (serverseitig). */

/** POST-Body zum Einreichen. Der Formularstand ist bewusst offen typisiert,
 *  da die Engine beliebige Formulardefinitionen tragen kann (wie beim Entwurf). */
export const submissionPayloadSchema = z.object({
  data: z.record(z.string(), z.unknown()),
});

/** Einreichungs-ID (Pfadparameter). */
export const submissionIdSchema = z.string().uuid("Ungültige Einreichungs-ID");

export type SubmissionPayloadInput = z.infer<typeof submissionPayloadSchema>;
