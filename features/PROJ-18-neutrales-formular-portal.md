# PROJ-18: Neutrales Formular-Portal (portal.eforms.de)

## Status: Planned
**Created:** 2026-07-01
**Last Updated:** 2026-07-01

## Dependencies
- Requires: PROJ-3 (Form Engine), PROJ-2 (Auth), PROJ-4 (Entwürfe/Auto-Save), PROJ-5 (PDF), PROJ-6 (Einreichung & Bestätigung/E-Mail), PROJ-16 (Turnstile), PROJ-17 (Barrierefreiheit)
- Infrastruktur analog PROJ-14/PROJ-15 (Docker/Traefik/Cloudflare, Staging-Muster)
- Legt den Grundstein für PROJ-10 (echte Multi-Form/Multi-Mandant-Verwaltung)

## Kontext & Ziel
Das Portal `portal.eforms.de` macht die Lösung **herstellerneutral** vorführbar: eine eigene Marke („eforms Portal") mit einem generischen **„Muster-Förderantrag"**, um die Engine verschiedenen Interessenten zu demonstrieren — **ohne** FlexCover-/Euler-Hermes-Bezug. Vollständiger Funktionsumfang inkl. Konto/Einreichung.

**Harte Rahmenbedingung:** Der Status quo von `flexcover.eforms.de` (Prod-App **und** PROD-Supabase-Projekt, an dem Euler Hermes gerade testet) darf sich durch dieses Feature **in keiner Weise** ändern.

**Strategische Leitplanke (extraktions-freundlich):** PROJ-18 entsteht bewusst im selben Repo, wird aber so gebaut, dass ein **späterer sauberer Fork** in ein eigenständiges Produkt-Repo mit echten Kunden ein **geplanter, günstiger Schritt** bleibt (siehe „Zukunftspfad").

## User Stories
- Als **Formatix-Vertrieb** möchte ich die Lösung unter `portal.eforms.de` **herstellerneutral** live vorführen, um sie verschiedenen Interessenten zu zeigen.
- Als **Interessent** möchte ich den **Muster-Förderantrag anonym** ausfüllen und als PDF herunterladen, um die Kernfunktion ohne Konto zu erleben.
- Als **Interessent** möchte ich mich **registrieren/anmelden**, einen **Entwurf speichern** und den Antrag **einreichen** (Bestätigung + E-Mail mit PDF), um den vollen Funktionsumfang zu sehen.
- Als **Formatix** möchte ich sicher sein, dass der laufende FlexCover-Antrag (EH-Test) **unverändert** bleibt.
- Als **Betreiber** möchte ich, dass FlexCover im Portal **nicht erreichbar/sichtbar** ist (Feature-Gating), damit die Demo wirklich neutral ist.

## Out of Scope
- **Echte Multi-Form-Verwaltung** (mehrere Formulare gleichzeitig, Auswahl-Startseite, Verwaltungs-UI) → **PROJ-10**; hier nur **ein** aktives Formular + Registry-Grundlage.
- **Multi-Mandanten-Trennung** (eigene Supabase-Projekte je Kunde) → PROJ-10.
- **Eigenes Produkt-Repo / Monorepo-Trennung** und **echte Kundenmandanten** → spätere Ausbaustufe (der „Zukunftspfad" wird hier nur *vorbereitet*, nicht umgesetzt).
- **Barrierefreies PDF/UA** → separates Feature.
- **Basic-Auth-Schutz** — vorerst nicht (öffentlich + `noindex`).
- **1:1-Kopie von FlexCover** — bewusst generischer Musterantrag (Variante B).

## Acceptance Criteria

**Neutralität & Erreichbarkeit**
- [ ] Angenommen ein Nutzer öffnet `portal.eforms.de`, wenn die Startseite lädt, dann erscheint die Marke „eforms Portal" (FX-Logo) ohne FlexCover-/Euler-Hermes-Bezug.
- [ ] Angenommen ein Nutzer ruft im Portal die FlexCover-Route auf, wenn FlexCover dort nicht aktiv ist, dann ist sie nicht erreichbar (404/Weiterleitung) und nirgends verlinkt.
- [ ] Angenommen eine Suchmaschine crawlt das Portal, wenn sie die Seiten liest, dann sind sie als `noindex` gekennzeichnet.

**Muster-Förderantrag (anonym)**
- [ ] Angenommen ein anonymer Nutzer, wenn er den Muster-Förderantrag ausfüllt und „PDF herunterladen" wählt, dann erhält er ein neutrales PDF (FX-Logo-Kopf, kein EH-Banner) ohne Konto.
- [ ] Angenommen Pflichtfelder fehlen, wenn er absendet, dann greift dieselbe barrierefreie Validierung/Fehlerführung wie im Hauptprodukt.

**Konto & Einreichung**
- [ ] Angenommen ein Interessent, wenn er sich unter `portal.eforms.de` registriert/anmeldet, dann funktioniert dies gegen das **DEV**-Supabase-Projekt inkl. Turnstile.
- [ ] Angenommen ein angemeldeter Nutzer, wenn er einen Entwurf bearbeitet, dann wird er (Auto-Save) unter der Form-ID des Musterantrags gespeichert und beim Wiederkommen fortgesetzt.
- [ ] Angenommen ein angemeldeter Nutzer, wenn er einreicht, dann erhält er Referenznummer, Bestätigungsseite und Bestätigungs-E-Mail mit PDF.

**Status quo (harte Rahmenbedingung)**
- [ ] Angenommen das Portal ist live, wenn `flexcover.eforms.de` aufgerufen wird, dann verhält es sich unverändert (Branding/Route/Funktionen) und nutzt weiterhin das **PROD**-Supabase-Projekt.
- [ ] Angenommen Portal-Nutzer legen Daten an, wenn diese gespeichert werden, dann landen sie im **DEV**-Projekt (nicht PROD) und sind per eigener Form-ID von FlexCover-Daten getrennt.

**Extraktions-Freundlichkeit / Zwei-Wege-Trennbarkeit (Architektur-Nachweis)**
- [ ] Angenommen ein Entwickler betrachtet den Musterantrag, wenn er dessen Code prüft, dann liegen Definition, PDF-Layout und Beispieldaten in einem **eigenen, isolierten Modul** und importieren keinen FlexCover-spezifischen Code.
- [ ] Angenommen das Portal wird gebrandet, wenn Portal-Name/Logo gesetzt werden, dann geschieht das über **Konfiguration** (nicht über verstreute Hardcodes im Code).
- [ ] Angenommen ein Entwickler prüft die Importe, wenn er das **FlexCover-Modul** betrachtet, dann importiert es **nichts aus der Portal-/Registry-Schicht** (FlexCover bleibt unabhängig herauslösbar).
- [ ] Angenommen ein Entwickler prüft den **gemeinsamen Kern** (Engine, Auth-/Entwurf-/Einreichungs-Plumbing, PDF-Kern), wenn er dessen Importe betrachtet, dann hängt er **von keiner der beiden Schichten** (FlexCover, Portal) ab.
- [ ] Angenommen der Registry-Eintrag für FlexCover existiert, wenn eine Einreichung serverseitig gerendert wird, dann zeigt er auf das **unveränderte FlexCover-PDF-Modul** (Indirektion ist mechanisch entfernbar, kein Umbau).

## Edge Cases
- **Geteilte DEV-Auth:** ein auf Staging registrierter Nutzer kann sich auch im Portal anmelden (gleiches DEV-Projekt) — für die Demo akzeptiert; keine Datenvermischung dank Form-ID.
- **Portal-Deploy darf Prod nicht verändern:** additive Änderungen, Prod-Config unangetastet, separate Bereitstellung; Regressionsprüfung nach Go-live.
- **E-Mail-Zustellung scheitert** (Resend) → best-effort wie im Hauptprodukt; Einreichung bleibt gültig.
- **Direktaufruf einer nicht-aktiven Form-ID** (z. B. FlexCover im Portal) → 404.
- **Auth-Redirect:** `portal.eforms.de` muss zu den DEV-Supabase Site-/Redirect-URLs ergänzt werden, sonst landen Bestätigungs-/Reset-Links falsch (Lektion aus PROJ-2/14).
- **Turnstile:** `eforms.de` deckt die Subdomain bereits ab — keine neue Widget-Konfiguration nötig.

## Technical Requirements (optional)
- Neue Subdomain `portal.eforms.de` (DNS/Cloudflare/Traefik-Route), eigener Container — analog PROJ-15.
- **Feature-Gating per Konfiguration** (welche Formulare aktiv sind) — Details in `/architecture`.
- **DEV-Supabase** mitnutzen; keine Migration nötig (bestehende `form_drafts`/`submissions` nach `form_id`).
- `noindex`; kein Basic-Auth (vorerst).
- DSGVO: keine PII in Logs; EU-Hosting; neutrale Datenschutz-/Barrierefreiheitsseiten.

## Zukunftspfad (nur vorbereiten, nicht umsetzen)
Falls die Demos ankommen und echte Kunden folgen: Das Produkt (Engine + generische Formulare + Portal-Branding) wird entlang der **Feature-Gating-/Registry-Naht** in ein **eigenes Repo** geforkt; FlexCover bleibt als Kundendeliverable im aktuellen Repo. Voraussetzung dafür ist genau die hier geforderte **Modul-Isolation je Formular** + **konfigurierbares Branding**. Der spätere Schritt ist dann ein Fork, kein Refactoring. (Reiht sich in PROJ-10 ein.)

## Open Questions
- [ ] **Logo-Datei (FX)** muss ins Repo gelegt werden (Format/Größe für PDF-Kopf + Web-Header) — beim `/frontend`-Schritt bereitzustellen.
- [ ] FX-Logo auch in der **Web-Kopfzeile** statt/neben dem Text „eforms Portal"? (Vorschlag: ja, für Konsistenz.)
- [ ] Eigene **Rechtstexte** fürs Portal (Datenschutz/Barrierefreiheit) — Platzhalter wie im Hauptprodukt, aber neutral?
- [ ] **Absender-Adresse** für Portal-Bestätigungs-Mails (Vorschlag: `portal@eforms.de`, im DEV/Resend).
- [ ] Konkreter Umfang/Inhalt des generischen Musterantrags (Abschnitte/Felder) — Detailentwurf in `/frontend`.
- [ ] **Portal-Deploy-Quelle:** `main` (stabil, empfohlen) vs. `develop` (aktuellste Stände) — bei Bedarf im `/deploy`-Schritt festlegen.
- [ ] **Migriert FlexCover später auf den generischen Weg** (dann ist FlexCover „nur noch ein Registry-Eintrag") — bewusst NICHT jetzt (Status quo); als Option für nach dem EH-Test vormerken.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Jetzt als PROJ-18 im selben Repo (kein Neustart/Rewrite) | Engine + gebaute Funktionen sind das Asset; Wiederverwendung + Tempo für die Demo schlagen Sauberkeit | 2026-07-01 |
| Bewusst **extraktions-freundlich** bauen (isolierte Formularmodule, Config-Branding, Registry-Naht) | Späterer Fork in ein eigenes Produkt-Repo mit echten Kunden soll ein geplanter, günstiger Schritt sein — kein Refactoring | 2026-07-01 |
| Konto-/Einreichungsfunktionen im MVP | Kunde will vollen Funktionsumfang live zeigen | 2026-07-01 |
| DEV-Supabase mitnutzen (nicht PROD) | schützt Prod/EH-Status-quo; keine Migration; Trennung über Form-ID | 2026-07-01 |
| Marke „eforms Portal" / Formular „Muster-Förderantrag" | herstellerneutral, passend zur Domain | 2026-07-01 |
| Generischer Musterantrag (B) statt 1:1-Kopie | IP/Neutralität ggü. Dritten; zeigt Engine trotzdem voll | 2026-07-01 |
| Öffentlich + `noindex`, kein Basic-Auth | reibungslose Demo, aber nicht auffindbar | 2026-07-01 |
| FX-Logo im PDF-Kopf statt EH-Banner | einziger visueller EH-Bezug wird ersetzt | 2026-07-01 |
| Status quo `flexcover.eforms.de`/PROD unantastbar | EH testet Prod aktiv — darf sich nicht ändern | 2026-07-01 |
| Feature-Gating jetzt (ein Formular aktiv, FlexCover im Portal aus) | schnell + neutral; echte Multi-Form-Verwaltung = PROJ-10 | 2026-07-01 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| FlexCover-Seiten unangetastet lassen; neuer generischer `/antrag/<formular>/…`-Weg für weitere Formulare | Statischer Routen-Vorrang schützt den EH-Test bausteinseitig; der generische Teil ist zugleich die Extraktions-Naht | 2026-07-01 |
| Form-Registry als einziger Katalog (ID → Definition, PDF-Layout, Beispieldaten, Einstellungen) | Formulare werden registriert statt im Code verstreut; ermöglicht Isolation + späteren Fork | 2026-07-01 |
| Aktive-Formulare-Gating zentral & per Konfiguration (nicht in Formularkomponenten) | FlexCover im Portal per Config auf 404, ohne dessen Code zu ändern | 2026-07-01 |
| Branding per Env, Default = heutige FlexCover-Werte | Eine Codebasis, zwei Erscheinungsbilder; Prod-Optik bleibt unverändert | 2026-07-01 |
| `musterantrag` als isoliertes Modul (Definition + eigenes PDF-Layout mit FX-Logo + Beispieldaten), ohne FlexCover-Importe | reale Trennlinie für spätere Extraktion | 2026-07-01 |
| Keine DB-Migration; Wiederverwendung `form_drafts`/`submissions` über `form_id`; DEV-Supabase | schnell, risikoarm, Trennung rein über Form-ID; PROD unberührt | 2026-07-01 |
| Serverseitige Einreichung (PDF/E-Mail) registry-gesteuert statt FlexCover-hardcodiert | additiv; FlexCover-Ergebnis bleibt identisch, weitere Formulare funktionieren | 2026-07-01 |
| Seiteneffektfreies PDF-Helfer-Muster beibehalten (`@/lib/pdf/filename`) | Lektion PROD-1: Server darf nicht aus dem Browser-Font-registrierenden `@/lib/pdf` importieren | 2026-07-01 |
| Portal = eigener Container/Env (gleiches Image), analog Staging (PROJ-15); Deploy-Quelle **`main`** (empfohlen) | stabile Demos; gleiche Basis wie Prod, nur andere Env (DEV-Supabase, Branding, aktive Formulare) | 2026-07-01 |
| Sicherheitsnetz = bestehende FlexCover-E2E müssen auf Staging grün bleiben | objektiver Nachweis „Status quo unverändert" vor jedem Prod-Deploy | 2026-07-01 |
| **Zwei-Wege-Trennbarkeit als Invariante:** Kern hängt von keiner Schicht ab; FlexCover- und Portal-Schicht nie voneinander; FlexCover bleibt direkt verdrahtet (nicht über Registry) | ermöglicht später *beide* Extraktionen (Produkt-Fork **und** eigenständiges FlexCover für EH) als mechanischen Schritt statt Rewrite; als Import-Grenze prüfbar (Abnahmekriterium) | 2026-07-01 |
| **Baseline-Tag `flexcover-baseline-2026-07-01`** auf dem Stand vor PROJ-18 gesetzt (auf `main`) | garantierte „genau wie heute"-Momentaufnahme des FlexCover-Stacks für einen EH-Deliverable, unabhängig von PROJ-18 | 2026-07-01 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Grundsatz
Wir bauen die **Plattform-Naht** ein, ohne FlexCover anzufassen. Der Trick: FlexCover behält seine **eigenen, dedizierten Seiten** (bleiben unverändert → Status quo bausteinseitig garantiert), und für **alle weiteren Formulare** entsteht ein **generischer, registry-gesteuerter Weg**. Genau dieser generische Teil ist später die saubere Abtrennungslinie für ein eigenes Produkt-Repo. Es sind **keine neuen Datentabellen** nötig.

### A) Was wird gebaut (Änderungs-Landkarte)
```
Formular-Registry (neu, zentraler Katalog)
└── je Formular: ID, Titel, Definition, PDF-Layout, Beispieldaten, Einstellungen
    ├── flexcover       (Eintrag zeigt auf bestehende Module – bleibt wie es ist)
    └── musterantrag    (neues, isoliertes Modul: Definition + eigenes PDF + Beispieldaten)

Formular-Auslieferung
├── FlexCover: bestehende Seiten /antrag/flexcover/…      (UNVERÄNDERT)
└── Generischer Weg /antrag/<formular>/…                  (NEU, registry-gesteuert)
    → rendert Engine + PDF-/Einreichungs-Verdrahtung anhand des Registry-Eintrags

Aktive-Formulare-Gating (neu, pro Deployment per Konfiguration)
└── zentrale Zugangsschranke: nicht-aktive Formulare → 404
    (Portal aktiviert nur „musterantrag" → FlexCover dort nicht erreichbar,
     ohne FlexCover-Code zu ändern)

Branding per Konfiguration (Env)
├── Portal-Name + FX-Logo (Kopfzeile, Startseite, Metadaten, PDF-Kopf)
└── Default = heutiges „FlexCover Antragsportal" → Prod-Deployment optisch unverändert

Serverseitige Einreichung (Anpassung)
└── PDF/E-Mail beim Einreichen wird registry-gesteuert (Formular liefert sein PDF-Layout)
    statt FlexCover fest zu importieren — additiv, FlexCover-Ergebnis bleibt identisch

Infrastruktur (analog Staging, PROJ-15)
└── portal.eforms.de: eigener Container (gleiches Image), eigene Traefik-Route,
    Cloudflare-DNS, Env: aktive Formulare = musterantrag, Branding = eforms,
    DEV-Supabase, noindex, Absender portal@eforms.de
```

### B) Datenmodell (unverändert)
Es entstehen **keine neuen Tabellen und keine Migration**. Entwürfe und Einreichungen liegen bereits in `form_drafts`/`submissions`, jeweils **nach `form_id` getrennt** (RLS: nur eigene Daten). Der Musterantrag bekommt schlicht die Form-ID **`musterantrag`** → seine Daten liegen sauber neben `flexcover`. Das Portal nutzt das **DEV-Supabase-Projekt**; PROD (Euler Hermes) wird nicht berührt.

### C) Tech-Entscheidungen (für PM begründet)
- **FlexCover unangetastet + neuer generischer Weg (statt FlexCover umzubauen):** schützt den laufenden EH-Test bausteinseitig und liefert zugleich exakt die wiederverwendbare Naht, die ein späterer Produkt-Fork mitnimmt. Das Beste aus „Status quo" und „extraktions-freundlich".
- **Registry als einziger Ort, der Formulare kennt:** neue Formulare werden *registriert*, nicht in den Code eingestreut. Das isolierte `musterantrag`-Modul importiert nichts FlexCover-Spezifisches → die Trennlinie fürs spätere Repo ist real.
- **Gating zentral & konfigurationsgesteuert (nicht in Formularkomponenten):** so ist FlexCover im Portal per Konfiguration unsichtbar, ohne dessen Code zu ändern; Prod aktiviert weiterhin nur FlexCover.
- **Branding per Env mit Default = heute:** eine Codebasis, zwei Erscheinungsbilder. Prod behält sein Aussehen, weil der Default die heutigen Werte sind.
- **DEV-Supabase mitnutzen, keine Migration:** schnellster, risikoärmster Weg; Trennung rein über `form_id`.
- **Sicherheitsnetz = bestehende E2E-Suite:** FlexCover-Tests (PROJ-5/6/11 …) müssen auf **Staging grün** bleiben, bevor überhaupt etwas nach Prod geht — das ist der objektive Nachweis „Status quo unverändert".

### D) Backend-Bedarf
Kein neues Datenmodell, aber **eine gezielte Backend-Anpassung**: die serverseitige Einreichung (PDF-Erzeugung + Bestätigungs-E-Mail) muss das PDF-Layout **aus der Registry** beziehen statt FlexCover fest zu verdrahten. Zusätzlich: DEV-Supabase-**Auth-URLs** um `portal.eforms.de` ergänzen (additiv). Deshalb nach `/frontend` noch ein `/backend`-Schritt.

### E) Abhängigkeiten (zu installieren)
- **Keine neuen Laufzeit-Pakete.** Alles wird wiederverwendet (Engine, PDF, Auth, Turnstile, Resend). Aufwand liegt in Registry/Generalisierung, Branding-Konfiguration, dem neuen Musterantrag-Modul und der Portal-Infrastruktur.
- Neu ist **Infrastruktur**, kein npm-Paket: DNS-Eintrag `portal.eforms.de`, Traefik-Route, Portal-Container/Env (analog Staging).

## Implementierungsnotizen (Frontend)
**Stand:** 2026-07-01 — Frontend-Registry-Naht + Branding + Musterantrag umgesetzt. **Backend offen** (registry-gesteuerte serverseitige Einreichung → `/backend`).

**Neu (Portal-/Produkt-Schicht, isoliert):**
- **Branding:** `src/lib/branding.ts` (Profile per `NEXT_PUBLIC_BRAND`, Default `flexcover`) → verdrahtet in `site-header.tsx` (Name + optional Logo), `layout.tsx` (Metadaten), `page.tsx` (Startseite). FX-Logo `public/portal/logo.svg` (SVG-Platzhalter, ersetzbar).
- **Musterantrag-Modul:** `src/lib/forms/musterantrag/{definition,sample-data}.ts` (generischer Förderantrag: alle Feldtypen, Sichtbarkeitslogik, Wiederholgruppe, feste + dynamische Tabelle, berechnetes Feld) + `src/lib/pdf/musterantrag/{document.tsx,filename.ts}` (neutraler Kopf mit gezeichneter FX-Marke — keine Bilddatei nötig).
- **Registry:** `src/lib/forms/registry.ts` (server-sicher, enthält bewusst **nur** generische Formulare — **nicht** FlexCover), `active.ts` (Aktive-Formulare per `NEXT_PUBLIC_ACTIVE_FORMS`, Default `flexcover`), `samples.ts` (Lazy-Loader), `src/lib/pdf/client.ts` (Browser-Client-PDF-Resolver, Font-Registrierung wie FlexCovers `index.ts`).
- **Generischer Weg:** `src/components/form-runner/FormRunner.tsx` (parametrisierte Fassung des FlexCover-Orchestrators) + `GenericSubmissionActions`/`GenericSubmissionPdfButton`; Seiten `src/app/antrag/[formId]/(page|eingereicht|eingereicht/[id])`.
- **Gating:** `src/proxy.ts` blockiert nicht-aktive `/antrag/<id>`-Pfade zentral (env-basiert, kein Registry-Import) → Rewrite auf `src/app/formular-nicht-verfuegbar/page.tsx` (404). So ist FlexCover auf dem Portal nicht erreichbar, **ohne FlexCover-Code zu ändern**.

**FlexCover unangetastet:** keine Datei unter `src/app/antrag/flexcover/`, `src/components/flexcover/`, `src/lib/forms/flexcover/`, `src/lib/pdf/flexcover/` geändert. Statischer Routen-Vorrang: `/antrag/flexcover` nutzt weiter die dedizierte Seite, `/antrag/musterantrag` den generischen `[formId]`-Weg.

**Zwei-Wege-Trennbarkeit gewahrt:** Registry/Portal-Schicht importiert nichts aus FlexCover; FlexCover importiert nichts aus Registry/Portal; Branding/Active sind env-basiert (Kern-nah, ohne Schicht-Kopplung).

**Verifikation (lokal):**
- `tsc --noEmit` sauber; ESLint sauber (nur vorbestehende Warnung).
- **Default-Modus** (= Prod): Startseite/Branding = FlexCover unverändert; `/antrag/flexcover` 200; `/antrag/musterantrag` 404 (gated). **FlexCover-E2E-Regression: 57 passed / 1 skipped (grün)** → Status quo bestätigt.
- **Portal-Modus** (`NEXT_PUBLIC_BRAND=eforms`, `NEXT_PUBLIC_ACTIVE_FORMS=musterantrag`): eforms-Marke + FX-Logo; `/antrag/musterantrag` 200; `/antrag/flexcover` 404. **`tests/PROJ-18-portal.spec.ts` (3 passed)** inkl. End-to-End Testdaten→Client-PDF-Download; Tests sind selbst-guardend (überspringen im Default-Modus).

## Implementierungsnotizen (Backend)
**Stand:** 2026-07-01 — serverseitige Einreichung registry-gesteuert, `musterantrag` voll funktionsfähig.

- **Kein neues Datenmodell / keine Migration:** `form_drafts`/`submissions` sind bereits nach `form_id` getrennt; `formIdSchema` (Regex `^[a-z0-9_-]{1,64}$`) akzeptiert `musterantrag`. Die **Entwurf-API** (`/api/drafts/[formId]`) war schon formularunabhängig → **unverändert**.
- **Server-PDF-Resolver** `src/lib/pdf/submission-pdf.ts` (Kompositions-Punkt): bildet `formId → Node-Renderer + Dateiname` ab (`flexcover` → unveränderter FlexCover-Renderer; `musterantrag` → neuer `src/lib/pdf/musterantrag/server.ts`). Einzige Stelle, die beide Formulare kennt — die Formular-Schichten importieren einander nicht.
- **Routen generalisiert (additiv, FlexCover-Verhalten identisch):** `POST /api/submissions/[formId]` und `…/[submissionId]/resend` nutzen jetzt `renderSubmissionPdf`/`submissionPdfFilename` statt fester FlexCover-Importe. Für `flexcover` dispatcht der Resolver auf denselben Renderer/Dateinamen wie zuvor → keine Verhaltensänderung. Resend validiert zusätzlich die `formId`.
- **Verifikation:** `tsc`/ESLint sauber; **118 Unit/Integration grün** (inkl. neuem Dispatch-Test „musterantrag → eigenes Layout" und unveränderten FlexCover-Fällen); `renderMusterantragPdfBuffer` rendert serverseitig ein gültiges PDF (mit Beispieldaten **und** leeren Werten).
- **Offen für `/deploy`:** DEV-Supabase **Auth-URLs** um `portal.eforms.de` ergänzen (Site-/Redirect-URLs); Portal-Container/Env (`NEXT_PUBLIC_BRAND=eforms`, `NEXT_PUBLIC_ACTIVE_FORMS=musterantrag`, DEV-Supabase, `noindex`, Absender `portal@eforms.de`) + Subdomain/Traefik-Route (analog Staging). Turnstile deckt `eforms.de` bereits ab.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
