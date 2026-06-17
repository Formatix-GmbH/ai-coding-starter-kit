# PROJ-2: User Authentication

## Status: Planned
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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
