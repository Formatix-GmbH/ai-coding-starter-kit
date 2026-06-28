// PROJ-16: Client-sichtbare Turnstile-Konfiguration (nur der ÖFFENTLICHE Site Key).
// Ist kein Site Key gesetzt, gilt Turnstile als deaktiviert → Formulare bleiben
// nutzbar (rollout-sicher). In Produktion/Staging ist der Key gesetzt.

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
export const turnstileEnabled = TURNSTILE_SITE_KEY.length > 0;
