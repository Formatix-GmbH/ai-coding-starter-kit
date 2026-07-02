# PROJ-20: Portal-Konsolidierung — Prod-Umzug + FlexCover-Prod-Stilllegung

## Status: Deployed
**Created:** 2026-07-02
**Last Updated:** 2026-07-02

## Dependencies
- Requires: PROJ-18 (Neutrales Formular-Portal) — das Portal wird zum Produkt-Prod
- Requires: PROJ-14/15 (Deployment/Staging-Infrastruktur) — bestehende Pipeline & Muster
- Kontext: Euler Hermes benötigt die FlexCover-Lösung nicht mehr (Mitteilung 2026-07-02)

## Kontext & Ziel
Euler Hermes hat abgesagt — der FlexCover-Prod-Betrieb ist obsolet. Das **Portal (portal.eforms.de) wird zum primären Produkt**: Es zieht auf das dadurch frei werdende **PROD-Supabase-Projekt** um (echte Prod-Datenbank, sauber getrennt von Dev-/Demo-Daten), `flexcover.eforms.de` wird **stillgelegt**. `flexcover-staging.eforms.de` **bleibt vorerst bestehen** (weiterhin vorführbar, dient als Staging des gemeinsamen Codes von `develop`).

**Konservierung:** Der komplette FlexCover-Stand bleibt über den Baseline-Tag `flexcover-baseline-2026-07-01`, die Git-Historie und das unveränderte Code-Modul erhalten — es wird nichts gelöscht, nur der Prod-Betrieb beendet.

## User Stories
- Als **Formatix (Betreiber)** möchte ich das Portal auf einer echten Prod-Datenbank betreiben (getrennt von Dev/Demo), damit Interessenten-Daten sauber und DSGVO-konform liegen.
- Als **Formatix** möchte ich den obsoleten FlexCover-Prod-Betrieb beenden (Container, Route, DNS, Workflow), damit Server und Pipeline aufgeräumt sind und nichts Ungepflegtes öffentlich erreichbar bleibt.
- Als **Formatix-Vertrieb** möchte ich FlexCover weiterhin auf Staging vorführen können, falls ein Interessent das Referenzprojekt sehen will.
- Als **Interessent** möchte ich das Portal (Registrierung, Entwürfe, Einreichung, E-Mail) nach dem Umzug unverändert nutzen können.

## Out of Scope
- **Phase 2 „Code-Rückbau":** Entfernen des FlexCover-Moduls aus dem Repo + Portierung der FlexCover-gebundenen E2E-Suiten (PROJ-4/5/6/11) auf den Musterantrag + Default-Branding-Wechsel + ggf. Repo-Umbenennung → eigenes späteres Feature, bewusst getrennt (Regressionsnetz darf nicht verloren gehen).
- **portal-staging.eforms.de** — vorerst nicht (Entscheidung: flexcover-staging bleibt die Staging-Umgebung des gemeinsamen Codes); bei Bedarf später in ~1 h nach etabliertem Muster nachrüstbar.
- **Kündigung/Löschung des PROD-Supabase-Projekts** — im Gegenteil: es wird weiterverwendet (Portal).
- **Rechtstexte des Portals finalisieren** (Datenschutz/Barrierefreiheit-Platzhalter) — separates Thema, rückt aber näher.

## Acceptance Criteria

**Portal auf PROD-Supabase**
- [ ] Angenommen das PROD-Supabase-Projekt ist vorbereitet, wenn ein Nutzer sich auf portal.eforms.de registriert/anmeldet, dann läuft dies gegen das PROD-Projekt (inkl. Turnstile, deutscher Mail-Templates, Absender „eforms Portal").
- [ ] Angenommen ein angemeldeter Portal-Nutzer, wenn er Entwürfe speichert und einreicht, dann liegen `form_drafts`/`submissions` im PROD-Projekt (RLS owner-only) und die Bestätigungs-E-Mail mit PDF kommt an.
- [ ] Angenommen der Umzug ist erfolgt, wenn man das PROD-Projekt inspiziert, dann enthält es keine EH-Testdaten mehr (Alt-Nutzer/-Einreichungen/-Entwürfe bereinigt) und ein bestätigtes Demo-Konto existiert.
- [ ] Angenommen die Auth-Konfiguration des PROD-Projekts, wenn Bestätigungs-/Reset-Links erzeugt werden, dann zeigen sie auf portal.eforms.de (Site URL/Redirect URLs korrekt).

**FlexCover-Prod-Stilllegung**
- [ ] Angenommen die Stilllegung ist erfolgt, wenn flexcover.eforms.de aufgerufen wird, dann ist die Seite nicht mehr erreichbar (DNS entfernt bzw. Route/Container gestoppt).
- [ ] Angenommen die Pipeline, wenn auf `main` gepusht wird, dann wird kein FlexCover-Prod-Deploy mehr ausgelöst (Workflow entfernt); Portal- und Staging-Deploys funktionieren unverändert.
- [ ] Angenommen der Server, wenn man ihn inspiziert, dann sind FlexCover-Prod-Container und -Verzeichnis entfernt/gestoppt und die Traefik-Route ist ausgebaut.

**Unverändert bleibt**
- [ ] Angenommen flexcover-staging.eforms.de, wenn es nach dem Umbau aufgerufen wird, dann funktioniert es unverändert (FlexCover-Branding, Basic-Auth, DEV-Supabase, develop-Auto-Deploy).
- [ ] Angenommen die E2E-Regression läuft gegen den Stand, dann bleiben alle bestehenden Suiten grün (kein Code-Verhalten geändert; reiner Infra-/Config-Umbau).

**Dokumentation**
- [ ] Angenommen PRD/INDEX, wenn der Umbau abgeschlossen ist, dann spiegeln sie den neuen Zustand (Portal = Produkt-Prod; FlexCover-Prod = eingestellt; PROJ-6/14 Deployment-Hinweise aktualisiert).

## Edge Cases
- **Bestehende Portal-Konten liegen in DEV** (z. B. hillmer@formatix.de): Sie funktionieren nach dem Umzug auf portal.eforms.de nicht mehr → bewusst akzeptiert (Demo-Konten, werden im PROD-Projekt neu angelegt und manuell bestätigt). flexcover-staging nutzt weiter DEV → dort bleiben sie gültig.
- **EH-Altdaten im PROD-Projekt:** enthalten personenbezogene Testdaten aus dem EH-Test → vor dem Portal-Go-live bereinigen (DSGVO-Datenminimierung).
- **Supabase-Auth-Konfiguration je Projekt:** SMTP-Absendername, deutsche Templates, Turnstile-Secret und URL-Konfiguration sind Projekt-Einstellungen → müssen im PROD-Projekt gesetzt werden (Dashboard, Betreiber).
- **DNS-Cache:** flexcover.eforms.de kann nach DNS-Entfernung noch kurz auflösen → zusätzlich Route/Container stoppen, damit sofort nichts mehr ausgeliefert wird.
- **Rollback:** Falls nach dem Umzug etwas klemmt → Portal-`.env` zurück auf DEV drehen und neu bauen (Minuten); FlexCover-Prod ließe sich aus Git + Baseline-Tag jederzeit reaktivieren.
- **In-Flight-Nutzung:** Während des Umbaus angemeldete Portal-Sessions (DEV-Token) werden ungültig → kurzes Wartungsfenster, verschmerzbar im Demo-Betrieb.

## Technical Requirements (optional)
- Kein Code-/Verhaltensänderung der App — reiner Infrastruktur-/Konfigurations-Umbau (Env, Supabase-Projekt-Konfig, Server, DNS, Workflow).
- DSGVO: EH-Testdaten im PROD-Projekt löschen; keine PII in Logs (unverändert).
- Kosten: unverändert (gleicher Server, ein Container weniger; beide Supabase-Projekte bleiben im Free-Tier belegt wie bisher).

## Open Questions
- [ ] **Zeitpunkt Phase 2 (Code-Rückbau + Test-Portierung auf Musterantrag)** — nach Bewährung des neuen Setups separat planen.
- [x] **portal-staging.eforms.de** — nachgerüstet am 2026-07-02 (siehe Deployment-Nachtrag).
- [ ] **Rechtstexte des Portals** (Datenschutz/Barrierefreiheit) — Platzhalter ersetzen, bevor echte Interessenten-Daten nennenswert anfallen.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Portal wird primäres Produkt; FlexCover-Prod wird eingestellt | EH benötigt die Lösung nicht mehr; Portal ist der Go-to-Market | 2026-07-02 |
| flexcover-staging bleibt vorerst bestehen | weiterhin vorführbares Referenzprojekt + Staging des gemeinsamen Codes (develop) | 2026-07-02 |
| Portal-Prod zieht auf das frei werdende PROD-Supabase-Projekt | echte Prod-DB, Trennung von Dev-/Demo-Daten, Free-Tier-Limit bleibt eingehalten | 2026-07-02 |
| Keine eigene portal-staging (vorerst) | bewusster Verzicht; Nachrüstung jederzeit nach etabliertem Muster möglich; Regressionsnetz läuft über flexcover-staging/develop | 2026-07-02 |
| EH-Testdaten im PROD-Projekt werden gelöscht | DSGVO-Datenminimierung; es waren Testdaten | 2026-07-02 |
| DEV-Portal-Konten verfallen (Neuanlage in PROD) | Demo-Konten, Neuanlage in Minuten; saubere Trennung wichtiger | 2026-07-02 |
| Code-Rückbau (FlexCover raus) bewusst NICHT jetzt | E2E-Suiten hängen am FlexCover-Formular; erst Test-Portierung planen (Phase 2), sonst Regressionsnetz-Verlust | 2026-07-02 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| „Erst vorbereiten, dann umschalten" (PROD komplett fertig, dann Env-Wechsel) | Umschaltung dauert Minuten statt riskanter Live-Operation; kein Ausfall während der Vorbereitung | 2026-07-02 |
| Rollback = Portal-`.env` zurück auf DEV + Rebuild | DEV bleibt unangetastet → Rückweg jederzeit in Minuten | 2026-07-02 |
| FlexCover-Prod-Abbau erst NACH verifizierter Portal-Umschaltung | zu keinem Zeitpunkt ohne funktionierendes Prod-System | 2026-07-02 |
| Stilllegung = Container/Route/DNS/Workflow entfernen, Code/Historie bleiben | Baseline-Tag + Git konservieren alles; Betrieb beenden ≠ löschen | 2026-07-02 |
| DNS entfernen UND Route/Container stoppen | DNS-Cache-Fenster überbrücken — sofort wirksam | 2026-07-02 |
| Einzige Repo-Änderung: `deploy.yml` (FlexCover-Prod-Workflow) entfernen | Pipeline aufgeräumt; Portal-/Staging-Workflows unangetastet | 2026-07-02 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Grundsatz
**Kein Code-Umbau** — die App bleibt unverändert; es ändern sich Konfiguration (Portal-`.env`), Supabase-Projekt-Einstellungen, Server/DNS und ein Pipeline-Workflow. Leitprinzip: **„Erst vorbereiten, dann umschalten"** — das PROD-Projekt wird vollständig fertig gemacht, *während* das Portal noch auf DEV läuft. Die eigentliche Umschaltung ist dann ein Env-Wechsel + Rebuild (Minuten), mit trivialem Rollback (Env zurück).

### A) Umzugsplan (Phasen & Reihenfolge)
```
Phase A — PROD-Supabase vorbereiten (Portal läuft weiter auf DEV, kein Ausfall)
├── EH-Testdaten bereinigen: Alt-Nutzer, Einreichungen, Entwürfe löschen (DSGVO)
├── Migrationen prüfen (form_drafts/submissions inkl. Aufräum-Jobs sind bereits drauf)
└── Auth-Konfiguration im Dashboard (Betreiber):
    ├── Site URL + Redirect URLs → portal.eforms.de
    ├── SMTP-Absendername „eforms Portal" + deutsche Mail-Templates
    └── Turnstile-Secret prüfen (war für FlexCover-Prod schon korrekt gesetzt)

Phase B — Portal umschalten (kurzes Wartungsfenster, Minuten)
├── Portal-.env: Supabase-URL/Key von DEV → PROD; Container neu bauen
├── Smoke-Test: Registrieren → Bestätigen → Anmelden → Entwurf → Einreichen → E-Mail
└── Demo-Konto im PROD-Projekt anlegen + manuell bestätigen (Betreiber)

Phase C — FlexCover-Prod stilllegen
├── Container stoppen + Verzeichnis /opt/flexcover entfernen (Git/Baseline konserviert alles)
├── Traefik-Route flexcover.yml ausbauen
├── DNS-Eintrag flexcover.eforms.de entfernen (Betreiber, Cloudflare)
└── Workflow deploy.yml (main→FlexCover-Prod) aus dem Repo entfernen
    → einzige Repo-Änderung; Portal-/Staging-Workflows bleiben unangetastet

Phase D — Dokumentation
└── PRD-Vision (Portal = Produkt, FlexCover = eingestelltes Referenzprojekt),
    INDEX, Deployment-Notizen in PROJ-6/14, Projekt-Merker
```

### B) Datenmodell (unverändert — nur Daten-Hygiene)
Keine Schema-Änderung. Das PROD-Projekt hat dieselben Tabellen/Migrationen wie DEV bereits installiert. Es werden ausschließlich **EH-Testdaten gelöscht** (Datenminimierung) — danach ist das Projekt der saubere Prod-Speicher des Portals. DEV bleibt unverändert der Speicher für Staging (inkl. bestehender Demo-Konten dort).

### C) Tech-Entscheidungen (für PM begründet)
- **„Erst vorbereiten, dann umschalten":** Alle PROD-Einstellungen entstehen, während das Portal ungestört auf DEV läuft — die Umschaltung selbst ist ein minutenkurzer Env-Wechsel statt einer riskanten Live-Operation.
- **Rollback trivial by design:** Solange DEV unangetastet bleibt (bleibt es), ist der Rückweg jederzeit „Env zurück auf DEV + Rebuild". FlexCover-Prod wäre über Git + Baseline-Tag reaktivierbar.
- **Stilllegen = Betrieb beenden, nicht löschen:** Code, Historie und Baseline-Tag bleiben; nur Container/Route/DNS/Workflow verschwinden. Kein Datenverlust-Risiko.
- **Reihenfolge C nach B:** FlexCover-Prod wird erst abgebaut, wenn das Portal nachweislich auf PROD läuft — kein Zeitpunkt ohne funktionierendes Prod-System.
- **DNS entfernen UND Route/Container stoppen:** wegen DNS-Cache reicht DNS allein nicht — doppelt abgesichert ist sofort wirksam.

### D) Abhängigkeiten
**Keine neuen Pakete/Dienste.** Benötigt werden nur Betreiber-Handgriffe in zwei Dashboards (Supabase PROD: Auth-Konfiguration; Cloudflare: DNS-Eintrag entfernen) — der Rest läuft über SSH/MCP wie gewohnt.

## QA Test Results
_To be added by /qa_

## Deployment
**Umgesetzt:** 2026-07-02 · **Tag:** `v1.4.0-PROJ-20`

**Phase A — PROD-Supabase vorbereitet (Projekt umbenannt in `portal-prod`):**
- EH-Testdaten vollständig gelöscht (3 Nutzer, 1 Entwurf, 1 Einreichung; Kaskade verifiziert 0/0/0/0). Migrationen paritätisch (alle 7).
- Betreiber: Site-/Redirect-URLs → portal.eforms.de, SMTP-Absender „eforms Portal", deutsche Mail-Templates. DEV-Projekt umbenannt in `portal-dev`.
- **Zwischenfall behoben:** Beim Bearbeiten der SMTP-Einstellungen war „Custom SMTP" deaktiviert worden → Mails gingen über Supabases eingebauten Mailer (`noreply@mail.app.supabase.io`, 2/h-Limit, Zustellprobleme). Diagnose über Auth-Logs (`mail_from`), Fix: Custom SMTP reaktiviert (Resend, `noreply@eforms.de`); danach Zustellung nachweislich ok. Folge-„Fehler" beim Passwort-Reset war nur `422 same_password` (neues = altes Passwort) — kein Systemfehler; sprechende Fehlermeldung als UX-Nacharbeit notiert.

**Phase B — Portal umgeschaltet:**
- `/opt/flexcover-portal/.env`: Supabase DEV→PROD (Rollback-Kopie `.env.bak-dev` liegt bereit), Rebuild. Supabase-Zugriff ist in dieser App komplett serverseitig → Laufzeit-Env maßgeblich (verifiziert im Container).
- **End-to-End vom Betreiber bestätigt:** Registrieren → Bestätigungs-Mail → Login → Musterantrag einreichen → Bestätigungsseite + E-Mail mit PDF. Demo-Konto `demo@eforms.de` angelegt + bestätigt.
- **Nachbesserung:** Bestätigungs-E-Mail-Betreff war noch „Ihr flex&cover-Antrag …" → `sendSubmissionEmail` um `formLabel` erweitert (Kompositions-Punkt `submissionEmailLabel`: flexcover → „flex&cover-Antrag", musterantrag → „Muster-Förderantrag").

**Phase C — FlexCover-Prod stillgelegt:**
- Container `flexcover-app-1` gestoppt/entfernt, `/opt/flexcover` gelöscht, Traefik-Route `flexcover.yml` ausgebaut → flexcover.eforms.de = 404. Workflow `deploy.yml` aus dem Repo entfernt. DNS-Eintrag `flexcover` durch Betreiber in Cloudflare gelöscht.
- Server-Endzustand: `flexcover-portal-app-1` (Prod, main, portal-prod-DB) + `flexcover-staging-app-1` (develop, portal-dev-DB) + Traefik. Staging extern verifiziert unverändert (200, FlexCover-Branding).

**Referenz-Nummern:** Präfix `FC-` bleibt vorerst (kosmetisch); neutrales Präfix als optionale Nacharbeit notiert.

### Nachtrag: portal-staging.eforms.de (2026-07-02)
Auf Betreiber-Wunsch direkt nachgerüstet (Open Question geschlossen): dritter Container `/opt/flexcover-portal-staging` (Branch `develop`, Supabase `portal-dev`, eforms-Branding, nur `musterantrag`, Testdaten-Button an, Absender `staging@eforms.de`), Traefik-Route mit **Basic-Auth `eforms`/`123xyz`** + noindex. `deploy-staging.yml` deployt jetzt **beide** Stagings bei Push auf `develop`. Serverseitig verifiziert (401→200, eforms-H1, noindex, musterantrag 200, flexcover 404). **Promotion-Modell:** `develop` → flexcover-staging + portal-staging · `main` → portal.eforms.de (Prod).
