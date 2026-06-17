"use server";

/**
 * Auth-Server-Actions (PROJ-2).
 *
 * PLATZHALTER — wird in der /backend-Phase implementiert:
 *  - Supabase-Aufrufe (signUp / signInWithPassword / resetPasswordForEmail / updateUser)
 *  - Speichern der DSGVO-Einwilligung (consent_accepted_at + privacy_version)
 *  - „returnTo"-Allowlist & Redirects (window.location bzw. redirect())
 *  - kein User-Enumeration (neutrale Meldungen)
 *
 * Die Schemas in @/lib/validation/auth.ts sind bereits die verbindliche Quelle
 * und müssen serverseitig erneut geprüft werden.
 */

export type ActionResult = {
  ok: boolean;
  message?: string;
};

const NOT_IMPLEMENTED: ActionResult = {
  ok: false,
  message: "Server-Logik folgt in der /backend-Phase.",
};

export async function registerAction(
  _formData: FormData,
): Promise<ActionResult> {
  // TODO(/backend): supabase.auth.signUp + Consent speichern
  return NOT_IMPLEMENTED;
}

export async function loginAction(_formData: FormData): Promise<ActionResult> {
  // TODO(/backend): supabase.auth.signInWithPassword + returnTo-Redirect
  return NOT_IMPLEMENTED;
}

export async function logoutAction(): Promise<void> {
  // TODO(/backend): supabase.auth.signOut + redirect auf öffentliche Seite
}

export async function forgotPasswordAction(
  _formData: FormData,
): Promise<ActionResult> {
  // TODO(/backend): supabase.auth.resetPasswordForEmail (immer neutrale Antwort)
  return NOT_IMPLEMENTED;
}

export async function resetPasswordAction(
  _formData: FormData,
): Promise<ActionResult> {
  // TODO(/backend): supabase.auth.updateUser({ password })
  return NOT_IMPLEMENTED;
}
