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

**Extraktions-Freundlichkeit (Architektur-Nachweis)**
- [ ] Angenommen ein Entwickler betrachtet den Musterantrag, wenn er dessen Code prüft, dann liegen Definition, PDF-Layout und Beispieldaten in einem **eigenen, isolierten Modul** und importieren keinen FlexCover-spezifischen Code.
- [ ] Angenommen das Portal wird gebrandet, wenn Portal-Name/Logo gesetzt werden, dann geschieht das über **Konfiguration** (nicht über verstreute Hardcodes im Code).

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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
