# PROJ-4: Formular-Entwurf & Auto-Save

## Status: Planned
**Created:** 2026-06-19
**Last Updated:** 2026-06-19

## Dependencies
- **Requires:** PROJ-3 (Dynamic Form Engine) — liefert den Formularstand, der gespeichert/wiederhergestellt wird
- **Requires:** PROJ-11 (FlexCover-Definition) — erstes Formular, an dem Entwürfe greifen
- **Requires (für Server-Entwürfe):** PROJ-1 (Supabase-Infrastruktur) + PROJ-2 (Authentifizierung) — eingeloggte, geräteübergreifende Entwürfe
- Anonyme (lokale) Entwürfe brauchen **kein** Konto

## Überblick
Zweistufige Entwurf-Speicherung, damit **kein Datenverlust** entsteht (PRD-Erfolgskriterium) und der „anonym ausfüllen → später Konto"-Pfad nahtlos bleibt:
1. **Anonym → lokaler Auto-Save (localStorage):** automatisch, ohne Konto, schützt vor Reload/Tab-Schließen/Absturz.
2. **Eingeloggt → serverseitiger Entwurf (Supabase):** automatisch + manuell, geräteübergreifend, „später weitermachen". Zusätzlich lokales Sicherheitsnetz.

## User Stories
- Als **anonymer Antragsteller** möchte ich, dass meine Eingaben bei Reload, Tab-Schließen oder Absturz erhalten bleiben, damit ich beruhigt ausfüllen kann.
- Als **eingeloggter Antragsteller** möchte ich, dass mein Antrag automatisch zwischengespeichert wird, damit ich später — auch auf einem anderen Gerät — weitermachen kann.
- Als **eingeloggter Nutzer** möchte ich jederzeit sehen, ob mein aktueller Stand gespeichert ist, damit ich der App vertraue.
- Als **Nutzer, der anonym begonnen hat**, möchte ich beim Registrieren/Anmelden meinen bisherigen Stand übernehmen, damit ich nicht von vorne anfangen muss.
- Als **eingeloggter Nutzer** möchte ich meinen Entwurf im Dashboard wiederfinden und fortsetzen oder verwerfen können.
- Als **Nutzer** möchte ich, dass auch bei Netzwerk-/Serverproblemen oder abgelaufener Sitzung nichts verloren geht.

## Out of Scope
- Endgültige **Einreichung/Persistenz** des fertigen Antrags und das submit-seitige Entfernen ausgeblendeter Felder (Variante A) → **PROJ-6**
- **PDF-Erzeugung & Download** → **PROJ-5**
- **PDF-/Entwurf-Versand per E-Mail**, inkl. Ablaufwarnung per Mail → **PROJ-7** / später
- **Mehrere parallele/benannte Entwürfe** desselben Formulars (z. B. Anträge für mehrere Entitäten gleichzeitig) → später (PROJ-10)
- **Echtzeit-Kollaboration / Sperren / Merging** mehrerer Nutzer am selben Entwurf
- Übergreifende **Entwurfsverwaltung über mehrere Formulare** hinaus (MVP listet den einen FlexCover-Entwurf)
- Server-seitiger **Lösch-Job** als Infrastruktur (Architektur/Backend legt Mechanik fest; hier nur die 14-Tage-Regel)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Auto-Save (anonym, lokal)
- [ ] Angenommen ein anonymer Nutzer füllt Felder aus, wenn ~2 Sekunden keine weitere Eingabe erfolgt, dann wird der Stand lokal im Browser gesichert und der Status zeigt „Lokal gesichert".
- [ ] Angenommen ein anonymer Nutzer hat Eingaben gemacht, wenn er die Seite neu lädt oder den Tab erneut öffnet, dann sind seine Eingaben wiederhergestellt.
- [ ] Angenommen ein wiederhergestellter lokaler Entwurf ist geladen, wenn der Nutzer „Verwerfen und neu beginnen" wählt, dann wird der lokale Entwurf gelöscht und das Formular ist leer.

### Auto-Save (eingeloggt, Server)
- [ ] Angenommen ein eingeloggter Nutzer ändert Eingaben, wenn ~2 Sekunden keine weitere Eingabe erfolgt, dann wird der Entwurf serverseitig gespeichert und der Status zeigt „Wird gespeichert…" → „Gespeichert vor X Min.".
- [ ] Angenommen ein eingeloggter Nutzer wechselt den Abschnitt/Tab oder verlässt die Seite, wenn ungespeicherte Änderungen bestehen, dann wird vorher gespeichert.
- [ ] Angenommen ein eingeloggter Nutzer, wenn er auf „Jetzt speichern" klickt, dann wird der aktuelle Stand sofort gespeichert und der Zeitstempel aktualisiert.
- [ ] Angenommen serverseitige Schreibvorgänge, wenn der Nutzer schnell tippt, dann werden die Speicheraufrufe gedrosselt (nicht für jeden Tastendruck ein Request).

### Inhalt & Fortsetzen
- [ ] Angenommen ein Nutzer hat ausgeblendete Felder befüllt (Flag später zurückgestellt), wenn der Entwurf gespeichert und wieder geladen wird, dann sind auch die zuvor ausgeblendeten Werte erhalten (verlustfrei).
- [ ] Angenommen ein Entwurf wird gespeichert, wenn das Formular unvollständig oder ungültig ist, dann wird trotzdem gespeichert (keine Validierung beim Speichern).
- [ ] Angenommen ein eingeloggter Nutzer mit bestehendem Entwurf, wenn er `/antrag/flexcover` öffnet, dann wird der Entwurf automatisch geladen und der zuletzt aktive Abschnitt ist vorausgewählt, mit Hinweis „Entwurf vom \<Datum\> geladen".
- [ ] Angenommen ein eingeloggter Nutzer, wenn er das Dashboard „Meine Anträge" öffnet, dann sieht er seinen laufenden Entwurf mit Formularname + „zuletzt gespeichert" und den Aktionen „Weiter bearbeiten" / „Verwerfen".

### Übernahme anonym → Konto
- [ ] Angenommen ein anonymer Nutzer hat einen lokalen Entwurf, wenn er sich anmeldet/registriert und **kein** Server-Entwurf existiert, dann wird der lokale Stand in den Account übernommen und der lokale Entwurf gelöscht.
- [ ] Angenommen ein anonymer Nutzer hat einen lokalen Entwurf und im Account existiert **bereits** ein Server-Entwurf, wenn er sich anmeldet, dann fragt das System „Lokalen Stand übernehmen oder vorhandenen Server-Entwurf behalten?" und überschreibt nichts ohne Bestätigung.

### Konflikt & Fehlerfälle
- [ ] Angenommen derselbe Entwurf wurde anderswo neuer gespeichert, wenn der aktuelle Tab speichern will, dann erscheint der Hinweis „Dieser Antrag wurde anderswo aktualisiert — neu laden?" statt blind zu überschreiben.
- [ ] Angenommen die Speicherung schlägt fehl (Netzwerk/Server), wenn der Auto-Save läuft, dann zeigt der Status „Nicht gespeichert — erneut versuchen", der Stand bleibt lokal erhalten und es wird automatisch erneut versucht.
- [ ] Angenommen die Sitzung ist abgelaufen, wenn ein eingeloggter Nutzer speichern will, dann erscheint „Sitzung abgelaufen, bitte erneut anmelden" und der aktuelle Stand bleibt lokal erhalten.

### Lebensdauer
- [ ] Angenommen ein Nutzer wählt „Verwerfen", wenn er bestätigt, dann wird der Entwurf (Server bzw. lokal) gelöscht und das Formular ist leer.
- [ ] Angenommen ein Server-Entwurf wurde 14 Tage nicht mehr bearbeitet, wenn der Nutzer das Formular/Dashboard öffnet, dann existiert kein Entwurf mehr (automatisch gelöscht) und es startet ein leeres Formular.

## Edge Cases
- **localStorage nicht verfügbar** (Privatmodus/voll): einmaliger dezenter Hinweis, dass automatisches Sichern gerade nicht möglich ist; das Formular bleibt voll bedienbar.
- **Sitzung läuft während des Ausfüllens ab:** Hinweis + lokaler Erhalt; nach erneutem Login nahtlos weiter.
- **Zwei Tabs/Geräte gleichzeitig:** last-write-wins, plus „neuer Stand erkannt"-Hinweis vor dem Überschreiben.
- **Entwurf älter als 14 Tage:** automatisch gelöscht → leeres Formular beim nächsten Öffnen.
- **Formular-Definition hat sich seit dem Entwurf geändert:** Werte werden per Feldpfad zugeordnet; nicht mehr existierende Felder werden ignoriert (kein Absturz), fehlende Felder bleiben leer.
- **Sehr großer Entwurf** (viele Wiederholgruppen/Tabellenzeilen): Speicherung bleibt durch Debounce/Throttle performant.
- **Anonymer Entwurf + danach anonym „verwerfen":** nur lokaler Stand betroffen, keine Serverdaten.

## Technical Requirements (optional)
- **Sicherheit:** Server-Entwürfe sind streng nutzergebunden (Owner-only-Zugriff; RLS). Kein Zugriff auf fremde Entwürfe.
- **DSGVO:** Datenminimierung — automatische Löschung nach 14 Tagen Inaktivität; keine PII in Logs/Fehlermeldungen; Entwurfsdaten nur so lange wie nötig.
- **Performance:** Debounced (~2 s) + gedrosselte Server-Writes; spürbar verzögerungsfreies Tippen.
- **Robustheit:** lokales Sicherheitsnetz auch für eingeloggte Nutzer (Server-Ausfall darf nichts verlieren).

## Open Questions
- [ ] Konkrete Debounce-/Throttle-Werte (Feinabstimmung in Architektur/Frontend; ~2 s als Richtwert).
- [ ] Soll vor der 14-Tage-Löschung eine Warnung erfolgen (z. B. Hinweis beim Öffnen „läuft in X Tagen ab")? Mail-Warnung eher PROJ-7/später.
- [ ] Verschlüsselung der Entwurfsdaten at-rest über den Supabase-Standard hinaus? → DSGVO-Bewertung in der Architektur.
- [ ] Mechanik der automatischen Löschung (DB-TTL/Cron/Edge Function) — Entscheidung in `/architecture`.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Zweistufig: anonym = localStorage, eingeloggt = Server + lokales Netz | Erfüllt „kein Datenverlust" für alle und hält den anonymen Self-Service intakt | 2026-06-19 |
| Debounced Auto-Save (~2 s) + bei Tab-Wechsel + beim Verlassen, Server-Writes gedrosselt | Verlässliches Sichern ohne Last/Kosten-Exzesse | 2026-06-19 |
| Statusanzeige statt Pflicht-Button **plus** expliziter „Jetzt speichern"-Button | Transparenz + Nutzerkontrolle; Wunsch nach sichtbarem Speichern | 2026-06-19 |
| Übernahme lokaler Entwürfe beim Login/Registrieren, mit Konfliktabfrage | Nahtloser „anonym → Konto"-Pfad ohne kommentarloses Überschreiben | 2026-06-19 |
| Genau ein Entwurf pro (Nutzer, Formular), an Formular-ID gebunden | Einfaches MVP; mehrere/benannte Entwürfe später | 2026-06-19 |
| Auto-Laden beim Öffnen + Dashboard-Listung (eingeloggt); nur Auto-Laden (anonym) | Schnelles Fortsetzen an beiden sinnvollen Einstiegspunkten | 2026-06-19 |
| Aufbewahrung: 14 Tage Inaktivität → automatische Löschung | Strikte Datenminimierung (DSGVO) | 2026-06-19 |
| Konflikt: last-write-wins **plus** „neuer Stand erkannt"-Hinweis | Einfach für Solo-Antragsteller, aber kein stilles Überschreiben | 2026-06-19 |
| Entwurf verlustfrei inkl. ausgeblendeter Felder; keine Validierung beim Speichern; aktiven Abschnitt merken | Verlustfreies Fortsetzen; Pruning/Validierung gehören zum Absenden (PROJ-6) | 2026-06-19 |
| Löschen bei „Verwerfen" und nach erfolgreicher Einreichung | Saubere Lebensdauer; Einreichungslogik selbst in PROJ-6 | 2026-06-19 |

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
