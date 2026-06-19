# PROJ-4: Formular-Entwurf & Auto-Save

## Status: Architected
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
- [ ] Konkrete Debounce-/Throttle-Werte final beim `/frontend` (~2 s als Richtwert).
- [ ] Soll vor der 14-Tage-Löschung eine Warnung erfolgen (z. B. Hinweis beim Öffnen „läuft in X Tagen ab")? Mail-Warnung eher PROJ-7/später.
- [ ] Verschlüsselung der Entwurfsdaten at-rest über den Supabase-Standard hinaus? → DSGVO-Bewertung (Standard-Verschlüsselung at-rest ist gegeben; zusätzlich nur bei Bedarf).
- [x] Mechanik der automatischen Löschung — geklärt: **pg_cron-Job + Lazy-Guard**.
- [ ] **pg_cron-Extension** in beiden Supabase-Projekten (Dev/Prod) aktivieren — beim `/backend`.
- [ ] Kleine Engine-Anpassung nötig: aktiver Tab/Abschnitt **kontrolliert** + Callback (damit der aktive Abschnitt gespeichert/wiederhergestellt werden kann).
- [ ] Obergrenze für die Größe des `data`-JSON (Payload-Limit) zum Schutz vor Missbrauch — beim `/backend` festlegen.

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
| Server-Entwürfe in DB-Tabelle `form_drafts` (JSON-Spalte) statt Storage-Datei | strukturiert, atomar, RLS-absicherbar, pro Nutzer abfragbar | 2026-06-19 |
| Eindeutigkeit (user_id, form_id) → ein Entwurf pro Nutzer/Formular | erzwingt das Produktziel; Speichern = einfacher Upsert | 2026-06-19 |
| RLS owner-only nach PROJ-1-Muster; `set_updated_at`-Trigger wiederverwenden | Sicherheit „by default", Konsistenz | 2026-06-19 |
| Entwurf-API als REST-Route-Handler (Laden/Speichern/Verwerfen) | testbar, passt zu häufigem Auto-Save, klare Trennung | 2026-06-19 |
| Optimistische Konflikterkennung über `updated_at`-Versionsmarke | „neuer Stand erkannt"-Hinweis ohne echtes Locking | 2026-06-19 |
| localStorage-Fallback auch für eingeloggte Nutzer | Robustheit gegen Server-/Sitzungsfehler | 2026-06-19 |
| Auto-Save-Hook mit selbstgebautem Debounce/Throttle | keine neue Abhängigkeit nötig | 2026-06-19 |
| 14-Tage-Löschung: pg_cron-Job + Lazy-Guard beim Laden | native Löschung + garantierte Korrektheit | 2026-06-19 |
| `data` speichert vollständigen Stand inkl. ausgeblendeter Felder | verlustfreies Fortsetzen (Pruning erst beim Absenden, PROJ-6) | 2026-06-19 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
Zwei Speicherwege auf einer gemeinsamen Logik: ein **Auto-Save-Hook** beobachtet den Formularstand und schreibt ihn — anonym in den **Browser (localStorage)**, eingeloggt über eine **Entwurf-API** in die **Datenbank** (mit localStorage als Sicherheitsnetz). Beim Öffnen wird der passende Entwurf wiederhergestellt. Es entstehen: eine neue DB-Tabelle, eine kleine REST-API, ein Client-Hook samt Statusanzeige, eine Wiederherstellungs-/Übernahme-Logik und eine Dashboard-Karte.

### A) Bausteine (Struktur)
```
Formularseite /antrag/flexcover
├── FormEngine (PROJ-3)
│   ├── Kopfbereich (header-Slot)
│   │   └── Speicher-Statusanzeige  ("Wird gespeichert…" / "Gespeichert vor X Min." /
│   │       "Lokal gesichert" / "Nicht gespeichert — erneut versuchen")
│   │       + Button "Jetzt speichern"   + Button "Verwerfen" (mit Bestätigung)
│   ├── … Abschnitte / Felder …
│   └── meldet den aktiven Abschnitt (kleine Engine-Anpassung: kontrollierter Tab)
│
├── Auto-Save-Hook (Client)
│   ├── beobachtet Formularwerte + aktiven Abschnitt
│   ├── speichert debounced (~2 s) + bei Tab-Wechsel / Seite-verlassen
│   ├── anonym → localStorage  |  eingeloggt → Entwurf-API (+ localStorage-Fallback)
│   └── liefert Status: leer / speichert / gespeichert / Fehler / "neuer Stand erkannt"
│
├── Wiederherstellung beim Laden
│   ├── eingeloggt → API lädt Server-Entwurf (Quelle der Wahrheit), sonst lokaler Fallback
│   ├── anonym → localStorage
│   └── Hinweis "Entwurf vom <Datum> geladen" + "Verwerfen und neu beginnen"
│
└── Übernahme anonym → Konto (nach Login/Registrierung)
    └── lokalen Entwurf erkennen → übernehmen  |  bei vorhandenem Server-Entwurf: Konfliktabfrage

Dashboard /dashboard
└── Karte "Meine Anträge"
    └── Entwurf-Eintrag: Formularname + "zuletzt gespeichert" + "Weiter bearbeiten" / "Verwerfen"

Backend (neu)
├── Entwurf-API (Route Handlers)
│   ├── Laden  → aktuellen Entwurf holen (Lazy-Guard: nie etwas > 14 Tage)
│   ├── Speichern → anlegen/aktualisieren mit Konflikterkennung
│   └── Verwerfen → Entwurf löschen
├── Tabelle form_drafts (RLS: nur Eigenzugriff)
└── pg_cron-Job: tägliche Löschung von Entwürfen > 14 Tage
```

### B) Datenmodell (Klartext)
**Server-Entwurf** (`public.form_drafts`):
- **id** — eindeutige Kennung
- **user_id** — Eigentümer (Verweis auf das Auth-Konto)
- **form_id** — welches Formular (z. B. „flexcover"); zukunftssicher für Multi-Form
- **data** — kompletter Formularstand als JSON, **inkl. aktuell ausgeblendeter Felder** (verlustfrei)
- **active_section** — zuletzt aktiver Abschnitt/Tab
- **created_at / updated_at** — Zeitstempel; `updated_at` dient zugleich als **Versionsmarke** für die Konflikterkennung
- **Eindeutigkeit:** genau **ein** Entwurf pro (user_id, form_id)
- **Zugriff:** Row Level Security, ausschließlich Eigenzugriff (Lesen/Anlegen/Ändern/Löschen nur für den Eigentümer) — gleiches Muster wie `profiles`
- **Aufbewahrung:** pg_cron löscht alles, das 14 Tage nicht bearbeitet wurde; die Lade-Funktion gibt zusätzlich nie einen abgelaufenen Entwurf zurück (Lazy-Guard)

**Lokaler Entwurf** (localStorage):
- Schlüssel pro Formular (z. B. `flexcover:draft`), enthält `data` + `active_section` + Zeitstempel
- anonym: Quelle der Wahrheit; eingeloggt: nur Sicherheitsnetz bei Server-/Sitzungsfehlern

### C) Wichtige Tech-Entscheidungen (Begründung)
- **Server-Entwürfe in der Datenbank (JSON-Spalte)** statt als Datei im Storage: strukturiert, atomar aktualisierbar, RLS-absicherbar, einfach pro Nutzer abfragbar.
- **Ein Datensatz pro (Nutzer, Formular)** über eine Eindeutigkeitsregel: setzt „ein Entwurf" technisch durch und macht Speichern zu einem einfachen Anlegen-oder-Aktualisieren.
- **Entwurf-API als REST-Route-Handler** (Laden/Speichern/Verwerfen) statt Server Actions: gut testbar (Integrationstests), passt zum häufigen Auto-Save und trennt die drei Operationen sauber. Erste API-Routen des Projekts.
- **Optimistische Konflikterkennung über den Zeitstempel**: ermöglicht den „neuer Stand erkannt"-Hinweis ohne echtes Sperren — leichtgewichtig und für einen Solo-Antragsteller ausreichend.
- **localStorage-Fallback auch für Eingeloggte**: Server-Ausfall oder abgelaufene Sitzung führen nicht zu Datenverlust.
- **Selbstgebauter Debounce/Throttle im Hook**: keine neue Abhängigkeit nötig.
- **pg_cron + Lazy-Guard**: native, zuverlässige Löschung; korrekt selbst dann, wenn der Job einmal nicht läuft.
- **Wiederverwendung der PROJ-1-Muster** (`set_updated_at`-Trigger, RLS default-deny + Eigenzugriff): Konsistenz und Sicherheit „by default".

### D) Abläufe (kurz)
- **Anonym:** Tippen → ~2 s → localStorage; Reload → Wiederherstellung; „Verwerfen" → lokal leeren.
- **Eingeloggt:** Tippen → ~2 s (gedrosselt) → API speichert; Status „Gespeichert vor X"; parallel lokales Netz.
- **Übernahme:** nach Login prüft die App den lokalen Entwurf → kein Server-Entwurf: übernehmen; vorhandener Server-Entwurf: nachfragen.
- **Konflikt:** Speichern mit veralteter Versionsmarke → API meldet „neuer Stand" → Hinweis „neu laden?".
- **Fehler:** Speichern scheitert → Status „Nicht gespeichert", lokaler Erhalt, automatischer Neuversuch; Sitzung abgelaufen → Hinweis „erneut anmelden", lokaler Erhalt.

### E) Abhängigkeiten
**Keine neuen Pakete.** Nutzt vorhandenes Supabase (DB/Auth/RLS) + react-hook-form (Formularstand). Voraussetzung: **pg_cron-Extension** in beiden Supabase-Projekten (Dev/Prod) aktivieren — beim `/backend` einrichten.

## Implementation Notes (Backend, 2026-06-19)

**Migrationen** (`supabase/migrations/`):
- `20260619120000_form_drafts.sql` — Tabelle `public.form_drafts` (id, user_id→auth.users ON DELETE CASCADE, form_id, data jsonb, active_section, created_at, updated_at), Unique `(user_id, form_id)`, RLS **owner-only** (select/insert/update/delete je `auth.uid() = user_id`), explizite GRANTs für `authenticated` (kein `anon`), `set_updated_at`-Trigger (wiederverwendet), Index auf `updated_at`.
- `20260619120100_form_drafts_retention.sql` — `pg_cron`-Job „delete-stale-form-drafts" (täglich 03:00 UTC, löscht `updated_at < now() - 14 days`). Lazy-Guard in der API garantiert Korrektheit auch ohne laufenden Job.

**Entwurf-API** (`src/app/api/drafts/[formId]/route.ts`):
- **GET** — lädt den Entwurf (oder `null`); Lazy-Guard löscht/verschweigt > 14 Tage alte Entwürfe.
- **PUT** — speichert (Insert/Update); optimistische Konflikterkennung über `expectedUpdatedAt` vs. Server-`updated_at` → **409** mit `conflict:true` + aktuellem Server-Stand; `force:true` überschreibt (für Übernahme anonym→Konto); **413** bei > 1 MB; **400** bei ungültigem Body; **401** ohne Anmeldung.
- **DELETE** — verwirft den Entwurf.
- Auth via Supabase-Server-Client (Cookies) + RLS als zweite Verteidigungslinie.

**Hilfsmodule:** `src/lib/drafts/{types,constants,store}.ts` (Datenzugriff gekapselt, testbar), `src/lib/validation/draft.ts` (Zod: `formIdSchema`, `draftPayloadSchema`).

**Tests:** `src/app/api/drafts/[formId]/route.test.ts` — 14 Integrationstests (401/400/413/409, Insert/Update/force, Lazy-Guard, DELETE). Gesamt 61 Unit-Tests grün, `tsc`/ESLint/`build` ✓.

**Offen für Folge-Schritte:**
- Migrationen müssen noch auf **Dev/Prod** angewendet und **pg_cron** aktiviert werden (RLS-Freigabe + Anwenden mit Nutzer).
- Frontend-Anbindung (Auto-Save-Hook, Statusanzeige, Wiederherstellung/Übernahme, Dashboard-Karte, kontrollierter aktiver Tab) → `/frontend PROJ-4`.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
