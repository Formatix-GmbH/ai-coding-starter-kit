import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";

/** Pfade, die einen Login erfordern. */
const PROTECTED_PREFIXES = ["/dashboard"];
/** Auth-Seiten, die eingeloggte Nutzer nicht sehen sollen (Reset bewusst ausgenommen). */
const GUEST_ONLY_PATHS = ["/login", "/registrieren", "/passwort-vergessen"];

/**
 * Hält die Supabase-Auth-Sitzung aktuell und erzwingt den Routenschutz.
 * Muss bei jeder Anfrage laufen, damit Tokens serverseitig erneuert werden.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // WICHTIG: getUser() erneuert das Token. Nicht entfernen.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Nicht eingeloggt + geschützte Seite → zum Login mit returnTo
  if (!user && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("returnTo", pathname);
    return copyCookies(NextResponse.redirect(url), supabaseResponse);
  }

  // Eingeloggt + reine Gast-Seite → zur Startseite des Kontobereichs
  if (user && GUEST_ONLY_PATHS.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return copyCookies(NextResponse.redirect(url), supabaseResponse);
  }

  return supabaseResponse;
}

/** Überträgt die von Supabase gesetzten Cookies auf eine Redirect-Antwort. */
function copyCookies(target: NextResponse, source: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}
