import Link from "next/link";

/**
 * Globaler Footer auf allen Seiten. Enthält die rechtlich von jeder Seite aus
 * erreichbaren Links (Datenschutz, Barrierefreiheit). PROJ-17.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t px-4 py-4 text-sm text-muted-foreground sm:px-6">
      <nav aria-label="Rechtliches" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <Link href="/datenschutz" className="underline hover:text-foreground">
          Datenschutzerklärung
        </Link>
        <Link href="/barrierefreiheit" className="underline hover:text-foreground">
          Barrierefreiheit
        </Link>
      </nav>
    </footer>
  );
}
