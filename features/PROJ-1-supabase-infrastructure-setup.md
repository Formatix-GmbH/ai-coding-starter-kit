# PROJ-1: Supabase Infrastructure Setup

## Status: In Progress
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

## Implementation Notes (Backend)
**Stand:** 2026-06-16 — auf Branch `develop`

**Supabase-Projekte (bereits angelegt, EU/Frankfurt, eu-central-1):**
- `flexCover-dev` → `xctlfuhwnhknzqqibmgm`
- `flexCover-prod` → `ncrvjizufytvfofiqpjx` (Migration folgt in Deploy-Phase)

**Migrationen (`supabase/migrations/`):**
- `20260616120000_init_profiles_and_storage.sql` — `profiles`-Tabelle (id→auth.users ON DELETE CASCADE, full_name, created_at, updated_at), RLS default-deny + Eigenzugriffs-Policies (select/update), `updated_at`-Trigger, `handle_new_user`-Trigger (SECURITY DEFINER, legt Profil bei Registrierung an), privater Bucket `application-pdfs` + Storage-Policies (Eigenordner-Zugriff)
- `20260616120100_harden_functions.sql` — `set_updated_at` fester `search_path`; EXECUTE auf `handle_new_user` von public/anon/authenticated entzogen
- **Beide auf dev angewendet.** Security-Advisor: keine Findings mehr (`lints: []`).

**App-Code:**
- `src/lib/env.ts` — Zod-Validierung der NEXT_PUBLIC_-Variablen, klare Fehlermeldung statt stillem Absturz; `parsePublicEnv()` testbar ausgelagert
- `src/lib/supabase/client.ts` — Browser-Client
- `src/lib/supabase/server.ts` — Server-Client (Cookies)
- `src/lib/supabase/middleware.ts` + `src/middleware.ts` — Session-Refresh
- alter Platzhalter `src/lib/supabase.ts` (exportierte `null`) entfernt
- `src/lib/env.test.ts` — 5 Unit-Tests (alle grün)

**Manuell durch den Nutzer zu erledigen:**
- `.env.local` mit Dev-Werten befüllen (Datei ist durch Berechtigungen geschützt, daher nicht automatisch geschrieben):
  - `NEXT_PUBLIC_SUPABASE_URL=https://xctlfuhwnhknzqqibmgm.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_6aXDn6RNRV4FoTIqJQchoA_wAQwJRwJ`
- Auth: E-Mail/Passwort-Provider + Double-Opt-In im Dashboard aktivieren; Custom-SMTP für Prod als Platzhalter
- Migrationen vor Go-Live identisch auf `flexCover-prod` anwenden

**Bekanntes Template-Problem (nicht PROJ-1):** `npm run lint` schlägt fehl (`next lint` in Next 16 entfernt; ESLint 9 erwartet Flat-Config statt `.eslintrc.json`). TypeScript-Check (`tsc --noEmit`) und Tests laufen sauber.

## QA Test Results

**Tested:** 2026-06-16
**Umgebung:** flexCover-dev (`xctlfuhwnhknzqqibmgm`), DB-Ebene + Unit-Tests
**Tester:** QA Engineer (AI)
**Hinweis:** PROJ-1 hat keine UI — getestet wurde auf Datenbank-/Konfigurationsebene (SQL gegen dev) sowie per Vitest. Browser-/E2E-Tests sind erst ab PROJ-2 (erste UI) sinnvoll und werden dort ergänzt.

### Acceptance Criteria Status

#### AC-1: Zwei Projekte (Dev+Prod) EU/Frankfurt, App verbindet je nach Umgebung
- [x] Beide Projekte existieren, Region `eu-central-1`, Status ACTIVE_HEALTHY
- [x] Verbindung ist env-gesteuert (`publicEnv` aus `NEXT_PUBLIC_*`); Client-Code korrekt
- [ ] Abhängig von manueller Befüllung der `.env.local` durch Nutzer (siehe Implementation Notes)

#### AC-2: Fehlende Env-Variablen → klarer Konfigurationsfehler
- [x] `parsePublicEnv` wirft gesammelte, klare Fehlermeldung (kein stiller Absturz)
- [x] Durch 5 Unit-Tests abgedeckt (`src/lib/env.test.ts`), alle grün

#### AC-3: `.env.example` dokumentiert alle Variablen
- [ ] **Nicht verifizierbar** — Datei ist durch Berechtigungs-Hardening für Lese-/Schreibzugriff gesperrt. Nutzer muss bestätigen, dass `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` enthalten sind.

#### AC-4: Neuer Nutzer → automatisch `profiles`-Eintrag
- [x] Trigger `on_auth_user_created` legt Profil an; `full_name` aus `raw_user_meta_data` übernommen
- [x] Ohne Metadaten → Profil mit NULL-Name (kein Fehler)

#### AC-5: `profiles`-RLS — Nutzer liest/ändert nur eigenes Profil
- [x] RLS aktiv; Policies korrekt definiert (`auth.uid() = id` für SELECT/UPDATE)
- [ ] **BUG-1:** Verhaltenstest schlägt fehl — Rolle `authenticated` hat keine Tabellen-GRANTs, Zugriff scheitert mit „permission denied" **vor** RLS-Auswertung. Eigenzugriff aktuell komplett blockiert.

#### AC-6: E-Mail-Bestätigung aktiv → Login erst nach Bestätigung
- [ ] **Nicht im Rahmen PROJ-1 testbar** — Auth-Provider-Konfiguration im Dashboard + Login-Flows gehören zu PROJ-2. Vom Nutzer manuell zu aktivieren.

#### AC-7: Privater Storage-Bucket, kein öffentlicher Zugriff
- [x] Bucket `application-pdfs` ist privat (`public = false`)
- [x] Storage-Policies für select/insert/update/delete beschränken auf Eigenordner (`auth.uid()`-Präfix)

#### AC-8: Nutzerkonto gelöscht → abhängige Datensätze kaskadieren
- [x] FK mit `ON DELETE CASCADE` (`confdeltype = 'c'`)
- [x] Verhaltenstest: Löschen der Auth-Nutzer entfernte zugehörige Profile (0 verblieben)

### Edge Cases Status
- [x] EC: Registrierung ohne `full_name` → Profil mit NULL-Name, kein Fehler
- [x] EC: Doppelte Profil-Anlage → `on conflict (id) do nothing` greift (idempotent)
- [ ] EC: Verwaister Auth-User ohne Profil → nicht reproduzierbar (Trigger zuverlässig); ok

### Security Audit Results
- [x] Supabase Security-Advisor: **keine Findings** (`lints: []`)
- [x] `handle_new_user` SECURITY DEFINER, EXECUTE für anon/authenticated entzogen, fester `search_path`
- [x] `set_updated_at` mit fixem `search_path`
- [x] RLS auf `profiles` aktiv (default deny), keine INSERT/DELETE-Policy für Nutzer
- [x] Storage-Bucket privat, kein öffentlicher Lesezugriff
- [x] Fehlende GRANTs sind **fail-closed** (kein Datenleck) — funktional aber zu restriktiv (siehe BUG-1)
- [x] Keine Secrets im Repo (`.mcp.json` gitignored; Service-Key nicht clientseitig)

### Bugs Found

#### BUG-1: Rolle `authenticated` hat keine Tabellen-Rechte auf `public.profiles`
- **Severity:** High
- **Steps to Reproduce:**
  1. Als Rolle `authenticated` (wie supabase-js/PostgREST mit User-JWT) `select * from public.profiles` ausführen
  2. Erwartet: eigene Profilzeile (durch RLS gefiltert)
  3. Tatsächlich: `ERROR 42501: permission denied for table profiles` — RLS wird nie erreicht
- **Ursache:** Per SQL-Migration erstellte Tabellen erhalten keine automatischen GRANTs an `anon`/`authenticated` (anders als per Dashboard erstellte). `has_table_privilege('authenticated', 'public.profiles', …)` = false für SELECT/UPDATE/INSERT.
- **Auswirkung:** Jeder Profilzugriff der App scheitert; blockiert PROJ-2 und alle profilabhängigen Features.
- **Empfohlener Fix (für /backend):** In einer Migration `grant select, update on public.profiles to authenticated;` (passend zu den vorhandenen RLS-Policies; INSERT bleibt dem Trigger vorbehalten). RLS schränkt danach wie vorgesehen auf die eigene Zeile ein.
- **Priority:** Fix before deployment

### Summary
- **Acceptance Criteria:** 4/8 vollständig bestanden (AC-2, AC-4, AC-7, AC-8); AC-1 & AC-3 abhängig von manueller Nutzer-Aktion; AC-6 zu PROJ-2 verschoben; **AC-5 fehlgeschlagen (BUG-1)**
- **Bugs Found:** 1 total (0 critical, 1 high, 0 medium, 0 low)
- **Security:** Pass (Advisor clean; fehlende GRANTs sind fail-closed, kein Sicherheitsrisiko)
- **Production Ready:** **NO**
- **Recommendation:** BUG-1 zuerst beheben (`/backend`), danach RLS-Isolationstest (AC-5) erneut verifizieren. UI-/E2E-Abdeckung ab PROJ-2.

## Deployment
_To be added by /deploy_
