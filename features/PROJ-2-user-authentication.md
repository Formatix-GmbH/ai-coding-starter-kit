# PROJ-2: User Authentication

## Status: In Progress
**Created:** 2026-06-17
**Last Updated:** 2026-06-17

## Dependencies
- **Requires:** PROJ-1 (Supabase Infrastructure Setup) — Auth-Konfiguration, `profiles`-Tabelle, Auto-Profil-Trigger, RLS

## User Stories
- Als anonymer Nutzer möchte ich das Formular ohne Anmeldung ausfüllen und das PDF herunterladen können, damit ich keine Hürde vor der eigentlichen Aufgabe habe
- Als Nutzer möchte ich ein Konto anlegen können, damit ich meinen Antrag zwischenspeichern und später (auch auf einem anderen Gerät) weitermachen kann
- Als wiederkehrender Nutzer möchte ich mich ein- und ausloggen können, damit ich sicher auf meine gespeicherten Anträge zugreife
- Als Nutzer, der sein Passwort vergessen hat, möchte ich es zurücksetzen können, damit ich den Zugang zu meinen Daten nicht verliere
- Als datenschutzbewusster Nutzer möchte ich bei der Registrierung der Datenschutzerklärung aktiv zustimmen, damit klar ist, wie mit meinen Daten umgegangen wird

## Out of Scope
- Anonymes Ausfüllen, dynamische Feldlogik, PDF-Erzeugung & Download selbst → PROJ-3 / PROJ-5
- Entwurf speichern / Auto-Save / Datenübernahme aus anonymer Sitzung in den ersten Entwurf → PROJ-4
- PDF-Versand per E-Mail (Upgrade-Nutzen Nr. 2) → PROJ-7
- DSGVO-Einwilligung im **anonymen** Pfad (vor PDF-Erzeugung) → PROJ-3/PROJ-5
- Social-/SSO-Login (Google etc.), Magic-Link, 2FA → bewusst nicht im MVP
- Admin-/Rollenverwaltung → PROJ-9
- Echter juristischer Datenschutztext → nur Platzhalter-Seite `/datenschutz`; Inhalt liefert Anwalt
- Konto löschen / Datenexport (DSGVO-Betroffenenrechte) → späteres Feature, hier nur vormerken

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

**Registrierung**
- [ ] Angenommen ein anonymer Nutzer, wenn er „Konto erstellen" mit Name, gültiger E-Mail, regelkonformem Passwort + Bestätigung und gesetzter DSGVO-Checkbox absendet, dann wird ein Konto angelegt und eine Bestätigungs-E-Mail versendet
- [ ] Angenommen das Registrierungsformular, wenn die DSGVO-Checkbox nicht gesetzt ist, dann ist das Absenden nicht möglich und es erscheint ein Hinweis
- [ ] Angenommen das Passwort erfüllt die Regel nicht (min. 8 Zeichen, ≥1 Buchstabe, ≥1 Ziffer), wenn der Nutzer absendet, dann wird ein Validierungsfehler angezeigt und die Stärkeanzeige spiegelt dies wider
- [ ] Angenommen Passwort und Bestätigung stimmen nicht überein, wenn der Nutzer absendet, dann wird ein Fehler angezeigt
- [ ] Angenommen die E-Mail ist bereits registriert, wenn der Nutzer sie erneut verwendet, dann erscheint eine neutrale Meldung ohne Preisgabe, ob das Konto existiert (kein User-Enumeration)
- [ ] Angenommen ein Konto wurde erstellt, wenn der Trigger aus PROJ-1 läuft, dann existiert ein `profiles`-Eintrag mit dem angegebenen Namen

**E-Mail-Bestätigung (Double-Opt-In)**
- [ ] Angenommen ein Konto ist noch nicht bestätigt, wenn der Nutzer sich einzuloggen versucht, dann wird der Login verweigert mit Hinweis, die E-Mail zu bestätigen
- [ ] Angenommen der Nutzer klickt den Bestätigungslink, wenn dieser gültig ist, dann wird das Konto aktiviert und der Nutzer kann sich einloggen

**Login / Logout**
- [ ] Angenommen ein bestätigtes Konto, wenn der Nutzer korrekte Zugangsdaten eingibt, dann wird er eingeloggt und landet auf der geschützten Startseite
- [ ] Angenommen falsche Zugangsdaten, wenn der Nutzer den Login versucht, dann erscheint eine neutrale Fehlermeldung und die Eingabe (außer Passwort) bleibt erhalten
- [ ] Angenommen ein eingeloggter Nutzer, wenn er „Abmelden" klickt, dann wird die Sitzung beendet und er landet auf einer öffentlichen Seite

**Passwort-Reset**
- [ ] Angenommen ein Nutzer auf „Passwort vergessen", wenn er seine E-Mail eingibt, dann wird (falls ein Konto existiert) eine Reset-Mail versendet und immer eine neutrale Bestätigung angezeigt (kein User-Enumeration)
- [ ] Angenommen ein gültiger Reset-Link, wenn der Nutzer ein neues, regelkonformes Passwort setzt, dann ist der Login danach mit dem neuen Passwort möglich
- [ ] Angenommen ein abgelaufener/ungültiger Reset-Link, wenn der Nutzer ihn öffnet, dann erscheint ein klarer Fehler mit Möglichkeit, einen neuen anzufordern

**Routenschutz**
- [ ] Angenommen ein nicht eingeloggter Nutzer, wenn er eine geschützte Seite (z.B. Dashboard) aufruft, dann wird er zur Login-Seite umgeleitet und nach erfolgreichem Login zurück zur ursprünglich angeforderten Seite geführt
- [ ] Angenommen ein eingeloggter Nutzer, wenn er Login- oder Registrierungsseite aufruft, dann wird er zur Startseite umgeleitet
- [ ] Angenommen ein anonymer Nutzer, wenn er das Formular ausfüllt und das PDF herunterlädt, dann ist dafür **keine** Anmeldung nötig

## Edge Cases
- Was passiert, wenn der Nutzer den Bestätigungslink mehrfach anklickt? → idempotent, Hinweis „bereits bestätigt"
- Was passiert bei Login-Versuch eines unbestätigten Kontos? → klarer Hinweis + Option, Bestätigungsmail erneut zu senden
- Was passiert bei vielen schnellen Login-/Reset-Anfragen? → Rate-Limiting greift (Supabase-seitig), neutrale Meldung
- Was passiert, wenn die Sitzung während der Nutzung abläuft? → bei nächster geschützter Aktion Umleitung zum Login
- Was passiert, wenn ein anonymer Nutzer mit ungespeicherten Eingaben „Speichern" klickt? → Aufforderung zur Registrierung/Login (Übernahme der Daten ist PROJ-4)
- Was passiert bei gleichzeitigem Login in zwei Tabs/Geräten? → beide Sitzungen gültig (kein Single-Session-Zwang im MVP)

## Technical Requirements
- **Sicherheit:** kein User-Enumeration (neutrale Meldungen bei Registrierung/Reset); Passwörter nur über Supabase-Hashing; keine PII in Logs/Fehlermeldungen
- **Passwort-Policy:** min. 8 Zeichen, ≥1 Buchstabe, ≥1 Ziffer; Live-Stärkeanzeige
- **Double-Opt-In:** aktiv (PROJ-1)
- **Routenschutz:** über Middleware (PROJ-1) — geschützte Bereiche serverseitig absichern, nicht nur clientseitig
- **Barrierearmut/Responsiv:** Formulare auf 375/768/1440px nutzbar

## Open Questions
- [ ] Anonyme Sitzung technisch: Supabase Anonymous Sign-in vs. rein clientseitiger Browser-State? → Entscheidung in `/architecture`
- [ ] Wird der Einwilligungs-Zeitstempel (DSGVO) explizit gespeichert (z.B. in `profiles`)? → `/architecture`
- [ ] Aufräumen ungenutzter/abgebrochener anonymer Sitzungen — nur relevant, falls Architektur Supabase-Anonymous wählt
- [ ] Genauer Inhalt/Quelle der Datenschutzerklärung (juristisch) — außerhalb dieses Features
- [ ] Quelle der `privacy_version` (Konstante im Code, z.B. Datum) — Detail für `/backend`

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Registrierung optional statt verpflichtend | Niedrigste Einstiegshürde: anonym ausfüllen + PDF-Download ohne Konto; Konto nur für Speichern & E-Mail-Versand | 2026-06-17 |
| Konto nötig für Zwischenspeichern + PDF-Mailversand | Diese Funktionen brauchen dauerhafte, sichere Zuordnung; revidiert die ursprüngliche Account-Pflicht aus `/init` | 2026-06-17 |
| Felder: Name + E-Mail + Passwort (+ Bestätigung) | `full_name` für Begrüßung/Vorbelegung; weitere PII gehören ins Formular (Datenminimierung) | 2026-06-17 |
| Passwort-Policy 8/Buchstabe/Ziffer + Stärkeanzeige | Balance aus Sicherheit und Nutzerfreundlichkeit bei sensiblen Daten | 2026-06-17 |
| Pflicht-DSGVO-Checkbox + Platzhalter-`/datenschutz` | Nachweisbare aktive Einwilligung; echter Text später (Anwalt) | 2026-06-17 |
| Routenschutz mit Redirect + „return to" | Schutz geschützter Bereiche; gute UX bei Deep-Links (z.B. gespeicherter Antrag) | 2026-06-17 |
| Kein SSO/Magic-Link/2FA im MVP | Fokus auf Kernfluss; spätere Erweiterung möglich | 2026-06-17 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Anonyme Sitzung rein clientseitig (kein Supabase-User) | Vermeidet verwaiste Konten & `is_anonymous`-RLS; passt exakt zum Spec-Modell (anonym speichert nichts) | 2026-06-17 |
| DSGVO-Einwilligung in `profiles` (`consent_accepted_at` + `privacy_version`) | Nachweisbarer Beleg (Zeitpunkt + Version); minimal-invasiv über Erweiterung des `handle_new_user`-Triggers | 2026-06-17 |
| Server Actions statt API-Routen für Auth-Flows | In Next 16 idiomatisch: weniger Boilerplate, sichere Cookie-/Session-Behandlung, direkte RSC-Integration | 2026-06-17 |
| Gemeinsame Zod-Schemas (Client + Server) | Eine Validierungsquelle; Client für UX, Server als verbindliche Prüfung | 2026-06-17 |
| Passwort-Stärkeanzeige ohne Zusatzpaket | Leichte eigene Logik gegen die Policy statt schwerer Lib (z.B. zxcvbn) | 2026-06-17 |
| `/auth/callback`-Route-Handler (PKCE-Code-Tausch) | Supabase-Links (Bestätigung & Reset) liefern Code, der serverseitig gegen Sitzung getauscht wird | 2026-06-17 |
| Routenschutz in Middleware (serverseitig) | Sicher gegen clientseitiges Umgehen; setzt PROJ-1-Middleware fort | 2026-06-17 |
| Deutsche Routen-Slugs (`/registrieren`, `/passwort-vergessen` …) | Konsistent mit Zielgruppe | 2026-06-17 |
| Keine neuen Pakete | Alles Nötige vorhanden (`@supabase/ssr`, `react-hook-form`, `zod`, `@hookform/resolvers`, `sonner`, shadcn) | 2026-06-17 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
PROJ-2 baut den optionalen Konto-Bereich: Registrierung, Login/Logout, Passwort-Reset, E-Mail-Bestätigung und Routenschutz. Der anonyme Pfad braucht nichts davon — er bleibt komplett offen (Formular + Download ohne Konto, PROJ-3/5).

### A) Seiten- & Komponentenstruktur

```
Öffentlich (Redirect zur Startseite, wenn bereits eingeloggt)
├── /registrieren
│   └── RegisterForm: Name · E-Mail · Passwort · Passwort-Bestätigung
│        · Passwort-Stärkeanzeige · DSGVO-Pflicht-Checkbox (Link → /datenschutz)
├── /login
│   └── LoginForm: E-Mail · Passwort · „Passwort vergessen?"
├── /passwort-vergessen
│   └── ForgotPasswordForm: E-Mail → neutrale Bestätigung (kein Enumeration)
└── /passwort-zuruecksetzen   (geöffnet über Reset-Link)
    └── ResetPasswordForm: neues Passwort + Bestätigung + Stärkeanzeige

Öffentlich (statisch)
├── /datenschutz              (Platzhaltertext, später juristisch befüllt)
└── /auth/callback            (unsichtbarer Route-Handler: tauscht den Code aus
                               Bestätigungs-/Reset-Mail gegen eine Sitzung)

Geschützt (Login nötig)
└── /dashboard
    ├── Begrüßung „Willkommen, [Name]"
    ├── Bereich „Meine Anträge" (Platzhalter → PROJ-4)
    ├── Button „Neuen Antrag starten" (→ PROJ-3)
    └── Abmelden

Querschnitt
├── Middleware: Sitzung aktualisieren + Routenschutz (Redirect + „returnTo")
├── Server Actions: registrieren · einloggen · ausloggen · Reset anfordern · Passwort setzen
└── Validierung: gemeinsame Zod-Schemas (Client + Server) via react-hook-form
```

### B) Datenmodell (Erweiterung aus PROJ-1)
**`profiles`** bekommt zwei zusätzliche Felder:
- `consent_accepted_at` — Zeitpunkt der DSGVO-Zustimmung
- `privacy_version` — akzeptierte Version der Datenschutzerklärung

Befüllung automatisch beim Anlegen des Kontos (Erweiterung des `handle_new_user`-Triggers: Version aus Registrierungs-Metadaten, Zeitstempel aus Kontoanlage). `full_name` bereits vorhanden. Keine neue Tabelle, kein anonymer Datensatz.

### C) Technische Entscheidungen
Siehe Tabelle „Technical Decisions" im Decision Log oben.

### D) Abhängigkeiten
Keine neuen Pakete. Vorhanden: `@supabase/ssr`, `react-hook-form`, `zod`, `@hookform/resolvers`, `sonner`, shadcn `form/input/label/button/card/checkbox/alert`.

### E) Notwendige Dashboard-Konfiguration (manuell, analog PROJ-1)
- Auth → Passwort-Policy im Supabase-Dashboard ebenfalls auf min. 8 Zeichen + erforderliche Zeichenklassen setzen (serverseitige Durchsetzung zusätzlich zur Client-Validierung)
- Redirect-URLs für `/auth/callback` hinterlegen (lokal `http://localhost:3000/auth/callback`)

### F) Sicherheitsdetails
- Kein User-Enumeration: neutrale Meldungen bei Registrierung & Reset
- „returnTo"-Allowlist: nur interne Pfade zulassen (Schutz vor Open-Redirect)
- Keine PII in Logs/Fehlermeldungen

## Implementation Notes (Frontend)
**Stand:** 2026-06-17 — Branch `develop`

**Seiten (alle gebaut, Build grün, 9 Routen):**
- `/` — öffentliche Startseite (Hero, „Antrag starten" deaktiviert bis PROJ-3, Login/Registrieren, Datenschutz-Link)
- `(auth)/registrieren`, `/login`, `/passwort-vergessen`, `/passwort-zuruecksetzen` — zentriertes Card-Layout (Route-Group `(auth)`)
- `/datenschutz` — Platzhalterseite mit `PRIVACY_VERSION`
- `/dashboard` — Begrüßung + „Neuen Antrag starten" (deaktiviert bis PROJ-3) + „Meine Anträge"-Platzhalter (PROJ-4) + Abmelden

**Komponenten (`src/components/auth/`):**
- `register-form`, `login-form`, `forgot-password-form`, `reset-password-form` — react-hook-form + zodResolver, shadcn `form/input/checkbox/button/card`, sonner-Toasts
- `password-strength-meter` — nutzt reine Funktion `evaluatePasswordStrength`

**Logik/Validierung:**
- `src/lib/validation/auth.ts` — gemeinsame Zod-Schemas (register/login/forgot/reset), Passwort-Policy (8+, Buchstabe, Ziffer), Consent als `literal(true)`
- `src/lib/validation/password-strength.ts` (+ Unit-Test, 5 Fälle) — Score 0–4
- `src/lib/constants.ts` — `PRIVACY_VERSION`
- `src/app/layout.tsx` — `lang="de"`, Sonner-`Toaster`, Metadaten-Template

**Bewusst noch Platzhalter (→ /backend):**
- `src/lib/actions/auth.ts` — Server-Actions als Platzhalter (TODO-markiert); geben aktuell „Server-Logik folgt" zurück. Echte Supabase-Aufrufe, Consent-Speicherung, `/auth/callback`, Redirects in `/backend`
- Routenschutz (Middleware-Logik) + Begrüßungsname aus Profil → `/backend`

**Tests/Qualität:** `tsc --noEmit` sauber · `npm run lint` 0 Errors · `npm run build` grün · `npm test` 10/10.

**Follow-ups für /backend:**
- `middleware.ts` → `proxy.ts` umbenennen (Next-16-Deprecation) und dabei Routenschutz + returnTo ergänzen
- ESLint-Config erlaubt jetzt `_`-präfixierte ungenutzte Args (für Platzhalter-Signaturen)

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
