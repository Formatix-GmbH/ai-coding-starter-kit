import { z } from "zod";

/**
 * Gemeinsame Auth-Validierung (Client + Server), PROJ-2.
 * Passwort-Policy: min. 8 Zeichen, mindestens ein Buchstabe und eine Ziffer.
 */
export const passwordSchema = z
  .string()
  .min(8, "Mindestens 8 Zeichen")
  .regex(/[A-Za-z]/, "Mindestens ein Buchstabe")
  .regex(/[0-9]/, "Mindestens eine Ziffer");

export const emailSchema = z
  .string()
  .min(1, "E-Mail ist erforderlich")
  .email("Bitte eine gültige E-Mail-Adresse eingeben");

export const registerSchema = z
  .object({
    fullName: z.string().min(1, "Name ist erforderlich").max(200),
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: z.string().min(1, "Bitte Passwort bestätigen"),
    consent: z.literal(true, {
      error: "Bitte stimme der Datenschutzerklärung zu",
    }),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Die Passwörter stimmen nicht überein",
    path: ["passwordConfirm"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Passwort ist erforderlich"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: z.string().min(1, "Bitte Passwort bestätigen"),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Die Passwörter stimmen nicht überein",
    path: ["passwordConfirm"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
