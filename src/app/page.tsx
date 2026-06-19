import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="font-semibold">FlexCover Antragsportal</span>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Anmelden</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/registrieren">Konto erstellen</Link>
          </Button>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          FlexCover-Förderantrag — online ausfüllen
        </h1>
        <p className="text-muted-foreground">
          Fülle den Antrag bequem im Browser aus und lade dein PDF herunter —
          ganz ohne Anmeldung. Ein Konto brauchst du nur, wenn du
          zwischenspeichern oder dir das PDF per E-Mail schicken lassen möchtest.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/antrag/flexcover">Antrag starten</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/registrieren">Konto erstellen</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Kostenlos und ohne Anmeldung — Ihre Eingaben bleiben im Browser.
        </p>
      </main>

      <footer className="border-t px-6 py-4 text-center text-sm text-muted-foreground">
        <Link href="/datenschutz" className="underline">
          Datenschutzerklärung
        </Link>
      </footer>
    </div>
  );
}
