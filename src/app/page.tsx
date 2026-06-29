import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center gap-6 px-4 py-16 text-center">
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
    </div>
  );
}
