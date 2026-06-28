// PROJ-16: Serverseitige Turnstile-Verifizierung (Cloudflare siteverify).
// Genutzt von den Auth-Server-Actions (PROJ-2) und der Einreichungs-Route (PROJ-6).
// Ist kein Secret konfiguriert, gilt der Schutz als deaktiviert → true (rollout-sicher).

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Prüft den Turnstile-Token gegen Cloudflare. Liefert true, wenn gültig (oder
 *  wenn der Schutz mangels Secret deaktiviert ist). Wirft nie. */
export async function verifyTurnstile(
  token: string | undefined | null,
  remoteIp?: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // nicht konfiguriert → Schutz aus
  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return data?.success === true;
  } catch {
    return false;
  }
}

/** Echte Client-IP hinter Cloudflare/Traefik (für die optionale remoteip-Prüfung). */
export function clientIpFromHeaders(headers: Headers): string | null {
  return headers.get("cf-connecting-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}
