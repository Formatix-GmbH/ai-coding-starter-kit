"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { PRIVACY_VERSION } from "@/lib/constants";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  passwordSchema,
} from "@/lib/validation/auth";

/** Auth-Server-Actions (PROJ-2). Schemas werden serverseitig erneut geprüft. */
export type ActionResult = {
  ok: boolean;
  message?: string;
  redirectTo?: string;
};

async function getOrigin(): Promise<string> {
  const h = await headers();
  return h.get("origin") ?? "http://localhost:3000";
}

const TURNSTILE_FAIL =
  "Bot-Schutz fehlgeschlagen. Bitte die Verifizierung erneut durchführen.";

/** Liest den Turnstile-Token aus dem Formular. Wird an Supabase durchgereicht
 *  (Supabase-natives CAPTCHA, PROJ-16) — Verifizierung übernimmt Supabase. */
function captchaToken(formData: FormData): string | undefined {
  return formData.get("turnstileToken")?.toString() || undefined;
}

/** Erkennt Supabase-Captcha-Fehler, um eine sprechende Meldung zu liefern. */
function isCaptchaError(message: string): boolean {
  return message.toLowerCase().includes("captcha");
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("password"), // Bestätigung clientseitig geprüft
    consent: formData.get("consent") === "true",
  });
  if (!parsed.success) {
    return { ok: false, message: "Bitte überprüfe deine Eingaben." };
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        privacy_version: PRIVACY_VERSION,
      },
      emailRedirectTo: `${origin}/auth/callback`,
      captchaToken: captchaToken(formData),
    },
  });

  // Kein User-Enumeration: bei bereits existierender E-Mail liefert Supabase
  // (mit aktivierter Bestätigung) keinen Fehler. Echte Fehler neutral melden.
  if (error) {
    if (isCaptchaError(error.message)) return { ok: false, message: TURNSTILE_FAIL };
    return { ok: false, message: "Registrierung fehlgeschlagen. Bitte später erneut versuchen." };
  }
  return {
    ok: true,
    message:
      "Fast geschafft! Bitte bestätige deine E-Mail-Adresse über den zugesandten Link.",
  };
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Bitte überprüfe deine Eingaben." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { captchaToken: captchaToken(formData) },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (isCaptchaError(msg)) return { ok: false, message: TURNSTILE_FAIL };
    if (msg.includes("not confirmed") || msg.includes("not been confirmed")) {
      return {
        ok: false,
        message: "Bitte bestätige zuerst deine E-Mail-Adresse über den zugesandten Link.",
      };
    }
    return { ok: false, message: "E-Mail oder Passwort ist falsch." };
  }

  const target = safeRedirectPath(formData.get("returnTo")?.toString());
  return { ok: true, redirectTo: target };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function forgotPasswordAction(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  // Immer neutrale Antwort (kein User-Enumeration), auch bei ungültiger Eingabe.
  if (parsed.success) {
    const supabase = await createClient();
    const origin = await getOrigin();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${origin}/auth/callback?next=/passwort-zuruecksetzen`,
      captchaToken: captchaToken(formData),
    });
    // Nur ein Captcha-Fehler wird sprechend gemeldet (kein Enumeration-Risiko).
    if (error && isCaptchaError(error.message)) {
      return { ok: false, message: TURNSTILE_FAIL };
    }
  }
  return {
    ok: true,
    message: "Falls ein Konto existiert, wurde eine E-Mail versendet.",
  };
}

export async function resetPasswordAction(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = passwordSchema.safeParse(formData.get("password"));
  if (!parsed.success) {
    return { ok: false, message: "Passwort erfüllt die Anforderungen nicht." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) {
    return {
      ok: false,
      message: "Zurücksetzen fehlgeschlagen. Fordere ggf. einen neuen Link an.",
    };
  }
  return { ok: true, redirectTo: "/dashboard" };
}
