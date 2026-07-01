import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isFormActive } from "@/lib/forms/active";

// PROJ-18: Zentrales Gating aktiver Formulare. Ein `/antrag/<formId>`-Pfad, dessen
// Formular im aktuellen Deployment NICHT aktiv ist (NEXT_PUBLIC_ACTIVE_FORMS),
// wird auf eine 404-Seite umgeschrieben — so ist FlexCover auf dem Portal nicht
// erreichbar, ohne dessen (dedizierte) Seiten zu verändern. Env-basiert, kein
// Registry-Import → Kern bleibt frei von der Portal-/Formular-Schicht.
function blockedFormPath(pathname: string): boolean {
  const m = pathname.match(/^\/antrag\/([^/]+)(?:\/.*)?$/);
  if (!m) return false;
  return !isFormActive(m[1]);
}

// Next.js 16: "proxy" ersetzt die frühere "middleware"-Konvention (gleiche API).
export async function proxy(request: NextRequest) {
  if (blockedFormPath(request.nextUrl.pathname)) {
    return NextResponse.rewrite(new URL("/formular-nicht-verfuegbar", request.url));
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Auf allen Pfaden außer statischen Assets und Bildern.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
