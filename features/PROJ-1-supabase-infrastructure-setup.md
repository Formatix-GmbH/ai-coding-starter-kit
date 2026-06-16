# PROJ-1: Supabase Infrastructure Setup

## Status: Architected
**Created:** 2026-06-16
**Last Updated:** 2026-06-16

## Dependencies
- None (Fundament für alle datengetriebenen Features)

## User Stories
- Als Entwickler möchte ich zwei getrennte Supabase-Projekte (Dev + Prod) haben, damit echte personenbezogene Produktivdaten niemals in der Entwicklung landen
- Als Entwickler möchte ich eine funktionierende, typisierte Supabase-Verbindung in der Next.js-App, damit ich Auth, Datenbank und Storage in den folgenden Features sofort nutzen kann
- Als Antragsteller möchte ich, dass meine späteren Daten in der EU gespeichert und sicher zugriffsgeschützt sind, damit ich der Plattform vertrauen kann
- Als Entwickler möchte ich eine dokumentierte RLS-Sicherheits-Baseline, damit jede künftige Tabelle von Anfang an abgesichert ist
- Als Betreiber möchte ich erzeugte PDFs in einem privaten Storage-Bucket ablegen, damit Dokumente niemals öffentlich abrufbar sind

## Out of Scope
- Login-, Registrierungs- und Passwort-Reset-Flows (UI + Logik) — gehören zu **PROJ-2**
- Antrags-/Formulardaten-Tabelle und Entwurfsspeicherung — gehören zu **PROJ-4**
- Tatsächliches Erzeugen/Hochladen von PDFs in den Bucket — gehört zu **PROJ-5**
- Finale Anbindung eines produktiven SMTP-Versanddienstes — nur als Platzhalter vorbereitet (final in PROJ-2/PROJ-7)
- Dritte Staging-/Test-Umgebung — erst später, vor erstem Kunden-Launch
- Self-Hosting von Supabase — bewusst verworfen zugunsten Supabase Cloud EU
- Admin-/Mehrmandanten-Strukturen — PROJ-9 / PROJ-10

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen zwei Supabase-Projekte (Dev + Prod) in der EU-Region (Frankfurt) sind angelegt, wenn die App startet, dann verbindet sie sich je nach Umgebung mit dem korrekten Projekt
- [ ] Angenommen die Umgebungsvariablen fehlen oder sind unvollständig, wenn die App startet, dann erscheint ein klarer Konfigurationsfehler statt eines stillen Absturzes
- [ ] Angenommen eine `.env.example` existiert, wenn ein Entwickler das Projekt neu aufsetzt, dann sind alle benötigten Variablen dokumentiert (ohne echte Secrets)
- [ ] Angenommen ein neuer Nutzer wird in `auth.users` angelegt, wenn die Registrierung erfolgt, dann wird automatisch ein zugehöriger `profiles`-Eintrag erzeugt
- [ ] Angenommen die `profiles`-Tabelle existiert, wenn ein Nutzer Daten abfragt, dann kann er per RLS ausschließlich seinen eigenen Profileintrag lesen/ändern
- [ ] Angenommen E-Mail-Bestätigung ist aktiviert, wenn sich ein Nutzer registriert, dann ist ein Login erst nach Bestätigung der E-Mail möglich
- [ ] Angenommen ein privater Storage-Bucket für PDFs existiert, wenn jemand eine Datei-URL ohne Berechtigung aufruft, dann wird der Zugriff verweigert (kein öffentlicher Zugriff)
- [ ] Angenommen ein Nutzerkonto wird gelöscht, wenn die Löschung ausgeführt wird, dann werden abhängige Datensätze (z.B. `profiles`) per `ON DELETE CASCADE` mitgelöscht

## Edge Cases
- Was passiert, wenn die Supabase-Verbindung zur Laufzeit nicht erreichbar ist? → App zeigt einen kontrollierten Fehlerzustand, keine PII in der Fehlermeldung
- Was passiert, wenn versehentlich Prod-Credentials in der Dev-Umgebung gesetzt werden? → Trennung über getrennte `.env`-Dateien/Projekte; Doku warnt explizit davor
- Was passiert, wenn der eingebaute Dev-E-Mail-Versand sein Limit erreicht? → In Dev akzeptabel; Doku verweist auf Custom-SMTP für Prod
- Was passiert bei doppelter Registrierung derselben E-Mail? → Supabase verhindert Duplikate; Verhalten wird in PROJ-2 nutzerseitig behandelt
- Was passiert, wenn ein Trigger zur `profiles`-Erstellung fehlschlägt? → Registrierung schlägt nachvollziehbar fehl, kein verwaister Auth-User ohne Profil

## Technical Requirements
- **Datenresidenz:** Supabase Cloud, EU-Region (Frankfurt); AVV mit Supabase abgeschlossen
- **Sicherheit:** RLS auf jeder Tabelle aktiviert; Default-Deny als Baseline; Secrets ausschließlich über Umgebungsvariablen
- **Logging/DSGVO:** keine personenbezogenen Daten in Logs oder Fehlermeldungen
- **Auth:** E-Mail/Passwort-Provider, Double-Opt-In aktiv, Custom-SMTP als dokumentierter Platzhalter
- **Storage:** privater Bucket für PDFs, kein öffentlicher Lesezugriff

## Open Questions
- [ ] Welcher konkrete SMTP-Dienst wird für die Produktion genutzt (Resend / Postmark / Hetzner-Mailserver)? — Entscheidung spätestens in PROJ-2/PROJ-7
- [ ] Werden die Supabase-Projekte manuell im Dashboard oder per Supabase-CLI/MCP provisioniert? — Klärung in `/architecture`

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Supabase Cloud EU (Frankfurt) statt Self-Hosting | DSGVO-Datenresidenz per EU-Region + AVV abgedeckt; Self-Hosting verkompliziert MVP erheblich; Migration später möglich | 2026-06-16 |
| Zwei Umgebungen (Dev + Prod) statt drei | Solo-Entwickler; Staging lohnt sich erst vor Kunden-Launch; Trennung echter Prod-Daten bereits erfüllt | 2026-06-16 |
| PROJ-1 legt nur app-unabhängiges Fundament | Single Responsibility; Antrags-Tabelle gehört zu PROJ-4, wo sie genutzt wird | 2026-06-16 |
| E-Mail-Bestätigung (Double-Opt-In) aktiv | Echtheit der Adresse, Schutz vor Fake-Accounts, DSGVO-konforme Einwilligung | 2026-06-16 |
| Custom-SMTP nur als Platzhalter vorbereiten | Eingebauter Versand reicht für Dev; produktiver Dienst erst bei Bedarf | 2026-06-16 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Paket `@supabase/ssr` ergänzen | Next.js 16 App Router braucht sichere Server-/Browser-/Middleware-Sitzungen; einfacher Browser-Client reicht für Auth + RLS nicht | 2026-06-16 |
| Drei Verbindungs-Zugänge (Browser/Server/Middleware) | Voraussetzung für sicheres Auth + RLS im App Router | 2026-06-16 |
| Profil-Anlage per Datenbank-Trigger auf `auth.users` | Garantiert: kein Login-Konto ohne Profil, unabhängig vom Registrierungsweg; zuverlässiger als App-Code | 2026-06-16 |
| RLS-Baseline „default deny" | Sicherheit ab Tag 1; jede künftige Tabelle erbt das Prinzip | 2026-06-16 |
| Privater Storage-Bucket `application-pdfs` + signierte Links | PDFs können sensible Unternehmensdaten enthalten; niemals öffentlich erreichbar | 2026-06-16 |
| `profiles` mit `ON DELETE CASCADE` zum Auth-Konto | Erfüllt Löschkonzept; keine verwaisten Profildaten | 2026-06-16 |
| Provisionierung: Projekte manuell, Schema per Migration | Account/Region/Billing/AVV sind menschlich-rechtliche Schritte; Schema/RLS/Trigger reproduzierbar & auf Prod wiederholbar | 2026-06-16 |
| Konfig-Validierung der Env-Variablen (zod) beim Start | Klare Fehlermeldung statt stillem Absturz bei fehlender Konfiguration | 2026-06-16 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
PROJ-1 hat keine sichtbare UI. Es ist das technische Fundament: zwei Datenbank-Umgebungen, eine sichere Verbindung aus der App, ein erstes Nutzerprofil-Konzept, abgesicherter Datei-Speicher und ein Sicherheitsstandard, auf den alle weiteren Features aufbauen.

### A) Bausteine

```
Supabase-Fundament
├── Umgebung "Development"  (Supabase-Projekt EU/Frankfurt)
│   └── für Entwicklung & Tests — nie echte Personendaten
├── Umgebung "Production"   (Supabase-Projekt EU/Frankfurt)
│   └── für echten Betrieb — getrennte Credentials
│
├── App-Verbindung (3 Zugänge für Next.js)
│   ├── Browser-Zugang   → für Aktionen im Browser des Nutzers
│   ├── Server-Zugang    → für serverseitiges Rendern & geschützte Abfragen
│   └── Middleware-Zugang→ hält die Anmelde-Sitzung gültig
│
├── Datenbank
│   └── Tabelle "profiles" (Nutzerprofil, 1:1 zum Login-Konto)
│       └── wird automatisch angelegt, sobald sich jemand registriert
│
├── Sicherheit (RLS-Baseline)
│   └── Standard: alles gesperrt, außer ausdrücklich erlaubt
│       └── jeder sieht nur seine eigenen Daten
│
└── Datei-Speicher
    └── privater Bucket "application-pdfs" (kein öffentlicher Zugriff)
```

### B) Datenmodell (Klartext)

**Profil (`profiles`)** — ergänzt das Login-Konto um anzeigbare Stammdaten:
- Verknüpfung zum Login-Konto (eindeutige ID, identisch mit dem Auth-Konto)
- Anzeige-/Kontaktangaben (z.B. Name) — bewusst minimal, Datenminimierung
- Zeitstempel „erstellt am" / „geändert am"

Regeln:
- Wird automatisch erzeugt, wenn ein neues Login-Konto entsteht (Datenbank-Trigger)
- Wird automatisch mitgelöscht, wenn das Login-Konto gelöscht wird (Kaskaden-Löschung) → erfüllt das Löschkonzept
- Jeder Nutzer kann nur sein eigenes Profil lesen/ändern (RLS)

**Datei-Speicher (`application-pdfs`)**:
- Privat — Dateien nur über zeitlich begrenzte, signierte Links erreichbar
- Inhalt (PDFs) folgt erst in PROJ-5; hier wird nur der Bucket samt Zugriffsregeln angelegt

*Die Antrags-/Formulardaten-Tabelle gehört bewusst zu PROJ-4 — siehe „Out of Scope".*

### C) Technische Entscheidungen
Siehe Tabelle „Technical Decisions" im Decision Log oben.

### D) Abhängigkeiten (zu installieren)
- **`@supabase/ssr`** — Server-/Browser-/Middleware-Auth für Next.js App Router

*Bereits vorhanden:* `@supabase/supabase-js`, `zod` (Konfig-Validierung der Env-Variablen).

### E) Umgebungsvariablen (Konzept)
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Browser, öffentlich)
- Server-seitiger Service-Schlüssel nur serverseitig, niemals an den Browser — separat in `.env.local.example` dokumentiert
- Getrennte Werte je Umgebung (Dev/Prod) — niemals vermischen

### F) Provisionierungs-Workflow
1. Nutzer legt manuell zwei Supabase-Projekte (Dev + Prod, EU/Frankfurt) an inkl. Billing & AVV
2. Auth-Provider E-Mail/Passwort + Double-Opt-In aktivieren; Custom-SMTP als Platzhalter dokumentieren
3. Schema (`profiles`), Trigger, RLS-Policies und Storage-Bucket werden per Migration (Supabase MCP) angewendet — zuerst Dev, später identisch auf Prod

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
