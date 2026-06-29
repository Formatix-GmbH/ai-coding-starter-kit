import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/lib/actions/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";

/**
 * Globale Kopfzeile auf allen Seiten. Der Portal-Name verlinkt immer zur
 * Startseite; rechts auth-bewusste Navigation. PROJ-2/PROJ-11.
 */
export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
      <Link href="/" className="font-semibold hover:underline" aria-label="Zur Startseite">
        FlexCover Antragsportal
      </Link>
      <nav className="flex items-center gap-2">
        {user ? (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <form action={logoutAction}>
              <LogoutButton />
            </form>
          </>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Anmelden</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/registrieren">Konto erstellen</Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}
