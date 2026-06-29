import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

/**
 * Tauscht den Code aus E-Mail-Links (Bestätigung & Passwort-Reset) gegen eine
 * Sitzung und leitet anschließend auf das Ziel (`next`) weiter. PROJ-2.
 *
 * Hinter dem Reverse-Proxy (Traefik/Cloudflare) ist `request.url` die INTERNE
 * Container-Adresse (0.0.0.0:3000). Die öffentliche Origin daher aus den
 * Forwarded-Headern bestimmen, sonst landen Redirects auf 0.0.0.0:3000 (PROJ-14/16).
 */
function publicOrigin(request: Request): string {
  const h = request.headers;
  const url = new URL(request.url);
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? url.host;
  const proto = h.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = publicOrigin(request);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"), "/dashboard");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
