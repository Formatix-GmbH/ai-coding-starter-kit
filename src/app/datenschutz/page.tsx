import type { Metadata } from "next";
import Link from "next/link";
import { PRIVACY_VERSION } from "@/lib/constants";

export const metadata: Metadata = { title: "Datenschutzerklärung" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-semibold">Datenschutzerklärung</h1>
      <p className="mb-8 text-sm text-muted-foreground">Version {PRIVACY_VERSION}</p>

      <div className="space-y-4 text-sm leading-relaxed">
        <p className="rounded-md border border-dashed bg-muted/40 p-4 text-muted-foreground">
          Platzhalter — der rechtsverbindliche Text wird vor dem Produktivbetrieb
          eingefügt. Dieser Abschnitt dient nur dazu, den Registrierungs- und
          Einwilligungs-Flow abzubilden.
        </p>
        <p>
          Diese Anwendung verarbeitet personenbezogene Daten ausschließlich zur
          Erstellung und Bearbeitung von Förderanträgen. Es gilt der Grundsatz
          der Datenminimierung. Daten werden in der EU (Frankfurt) gespeichert.
        </p>
        <p>
          Eingegebene Antragsdaten werden im anonymen Modus nicht serverseitig
          gespeichert. Ein Konto wird nur benötigt, um Anträge
          zwischenzuspeichern oder das PDF per E-Mail zu erhalten.
        </p>
      </div>

      <div className="mt-8">
        <Link href="/" className="text-sm underline">
          Zur Startseite
        </Link>
      </div>
    </main>
  );
}
