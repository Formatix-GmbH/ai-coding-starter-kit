import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Erklärung zur Barrierefreiheit" };

// PROJ-17: Barrierefreiheitserklärung (BITV-Pflichtbestandteil). Statischer Inhalt.
// Konformitätsaussage, Erstellungsdatum sowie Feedback-Kontakt und
// Schlichtungsstelle sind PLATZHALTER und werden vor dem Produktivbetrieb durch
// die rechtsverbindlichen Angaben ersetzt.

export default function BarrierefreiheitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-semibold">Erklärung zur Barrierefreiheit</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Diese Erklärung gilt für das FlexCover Antragsportal.
      </p>

      <div className="space-y-8 text-sm leading-relaxed">
        <p className="rounded-md border border-dashed bg-muted/40 p-4 text-muted-foreground">
          Platzhalter — die rechtsverbindlichen Angaben (Konformitätsstatus,
          Erstellungsdatum, Kontakt und Schlichtungsstelle) werden vor dem
          Produktivbetrieb nach der internen Abnahme eingetragen.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Stand der Vereinbarkeit mit den Anforderungen</h2>
          <p>
            Wir sind bemüht, das FlexCover Antragsportal im Einklang mit den
            Vorgaben der Barrierefreie-Informationstechnik-Verordnung (BITV 2.0)
            barrierefrei zugänglich zu machen. Maßstab sind die Web Content
            Accessibility Guidelines (WCAG) 2.1 auf der Stufe AA.
          </p>
          <p>
            Diese Anwendung ist <strong>teilweise konform</strong> mit den
            genannten Anforderungen. „Teilweise konform“ bedeutet, dass einige
            Inhalte die Anforderungen noch nicht vollständig erfüllen (siehe
            folgender Abschnitt).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Nicht barrierefreie Inhalte</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Erzeugte PDF-Dokumente</strong> sind derzeit nicht vollständig
              barrierefrei (kein getaggtes PDF/UA). Eine barrierefreie PDF-Ausgabe
              ist in Vorbereitung. Auf Anfrage stellen wir die Antragsinhalte in
              einem zugänglichen Format bereit.
            </li>
            <li>
              <strong>Sicherheitsabfrage (Captcha):</strong> Zum Schutz vor
              automatisiertem Missbrauch wird der Dienst „Cloudflare Turnstile“
              eingesetzt. Dieser bietet einen barrierefreien Modus inklusive
              Audio-Alternative; einzelne Teile liegen außerhalb unseres direkten
              Einflussbereichs.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Erstellung dieser Erklärung</h2>
          <p>
            Diese Erklärung wurde am <strong>[Datum einsetzen]</strong> erstellt.
            Die Bewertung beruht auf einer internen Prüfung (automatisierte Tests
            mit axe-core sowie manuelle Prüfung per Tastatur und Screenreader).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Barrieren melden: Kontakt</h2>
          <p>
            Sind Ihnen Barrieren aufgefallen oder benötigen Sie Informationen in
            einem barrierefreien Format? Melden Sie sich bei uns:
          </p>
          <p>
            E-Mail:{" "}
            <a href="mailto:barrierefreiheit@example.org" className="underline">
              barrierefreiheit@example.org
            </a>{" "}
            <span className="text-muted-foreground">(Platzhalter)</span>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Schlichtungsverfahren</h2>
          <p>
            Wenn auch nach Ihrer Rückmeldung keine zufriedenstellende Lösung
            gefunden wurde, können Sie sich an die zuständige Schlichtungsstelle
            wenden. <span className="text-muted-foreground">[Zuständige
            Durchsetzungs-/Schlichtungsstelle einsetzen — Platzhalter.]</span>
          </p>
        </section>
      </div>

      <div className="mt-10">
        <Link href="/" className="text-sm underline">
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
