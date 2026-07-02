# PROJ-20: Portal-Konsolidierung — Prod-Umzug + FlexCover-Prod-Stilllegung

## Status: Planned
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
- [ ] **portal-staging.eforms.de** — nachrüsten, sobald Portal-Änderungen vor Prod visuell geprüft werden sollen (aktuell bewusst verzichtet).
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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
