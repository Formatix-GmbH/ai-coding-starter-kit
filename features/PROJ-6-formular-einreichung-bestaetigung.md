# PROJ-6: Formular-Einreichung & Bestätigung

## Status: In Progress
**Created:** 2026-06-22
**Last Updated:** 2026-06-22

## Dependencies
- Requires: PROJ-2 (User Authentication) — für eingeloggte Nutzer (Server-Protokollierung, E-Mail, Einreichungs-Liste)
- Requires: PROJ-3 (Dynamic Form Engine) — Vollvalidierung des Antrags beim Einreichen
- Requires: PROJ-5 (PDF-Generierung & Download) — das eingereichte PDF (mit Referenznummer) und der bestehende „PDF herunterladen"-Button
- Requires: PROJ-1 (Supabase Infrastructure) — Tabelle `submissions`, RLS, pg_cron-Aufbewahrung
- Subsumiert: PROJ-7 (PDF-Versand per E-Mail) — die Bestätigungs-E-Mail mit PDF wird hier umgesetzt; PROJ-7 wird dadurch obsolet bzw. schrumpft auf spätere Mail-Anlässe

## Kontext / Abgrenzung
„Einreichen" ist im MVP **kein** Versand an eine Förderstelle (es gibt noch kein behördliches Auslieferungsziel — das ist PROJ-13 Webhook). Einreichen ist eine **bewusste Abschluss-Aktion des angemeldeten Antragstellers**: Vollvalidierung → finales PDF → serverseitige Protokollierung + Bestätigungs-E-Mail → Bestätigungsseite. **Einreichen setzt Anmeldung voraus** — nur dann ist es eine echte, belegbare Einreichung (Server-Eintrag, Referenz, E-Mail, auffindbar). **Anonyme Nutzer** können den Antrag weiterhin vollständig ausfüllen und über **„PDF herunterladen"** als PDF beziehen; statt „Einreichen" sehen sie einen Hinweis „Zum Einreichen bitte anmelden oder registrieren". Der bestehende reine **„PDF herunterladen"** bleibt von der Einreichung unabhängig.

## User Stories
- Als **anonymer Antragsteller** möchte ich meinen vollständig ausgefüllten Antrag als PDF herunterladen und beim Einreichen-Versuch klar zur Anmeldung geführt werden, damit ich weiß, dass eine echte Einreichung ein Konto braucht — mein PDF habe ich trotzdem.
- Als **registrierter Antragsteller** möchte ich nach dem Einreichen mein Antrags-PDF automatisch per E-Mail bekommen, damit ich es sicher archiviert habe, ohne es manuell speichern zu müssen.
- Als **registrierter Antragsteller** möchte ich meine bisherigen Einreichungen in einer schlichten Liste wiederfinden (Zeitpunkt, Referenz, PDF), damit ich nachschauen kann, was ich wann eingereicht habe.
- Als **Antragsteller** möchte ich nach einer Einreichung einen Antrag korrigieren und erneut einreichen können, damit ich Fehler beheben kann, ohne alles neu einzugeben.
- Als **Antragsteller** möchte ich, dass meine Eingaben bei einem Fehler während des Einreichens nicht verloren gehen und mir keine Einreichung fälschlich bestätigt wird, damit ich der Bestätigung vertrauen kann.
- Als **Antragsteller** möchte ich meinen vollständigen Antrag weiterhin ohne Einreichung als PDF herunterladen können, damit ich ihn unabhängig gegenlesen oder ausdrucken kann.

## Out of Scope
- **Übermittlung an eine Behörde/Förderstelle** (Webhook/externe Absende-Ziele) — PROJ-13
- **Admin-Sicht auf fremde Einreichungen** / interne Antragsbearbeitung — PROJ-9 (Admin Dashboard)
- **Manuelles Löschen oder Bearbeiten einzelner Einreichungen** durch den Nutzer — bewusst nicht im MVP (nur Auto-Löschung nach 30 Tagen)
- **Serverseitige Speicherung des PDFs** — nur Daten-Snapshot wird gespeichert (PDF jederzeit identisch rekonstruierbar)
- **Serverseitige Idempotenz** gegen wiederholte Einreichung desselben Antrags — bewusste Wiedereinreichung ist erlaubt; Doppelklick-Schutz nur UI-seitig
- **Entwurfs-PDF mit Wasserzeichen** — verworfen; „PDF herunterladen" liefert das vollständige PDF (ohne Referenznummer)
- **Barcode/QR der Referenznummer** im PDF — optional, Entscheidung in `/architecture` (Klartext-Referenz ist Pflicht, Barcode kann Folgeerweiterung sein)
- **Einreichen für anonyme Nutzer** — Einreichen erfordert Anmeldung; anonym gibt es nur Ausfüllen + „PDF herunterladen" und einen Hinweis zur Anmeldung (keine symbolische Einreichung, kein Server-Eintrag, keine E-Mail)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Einreichen — eingeloggt
- [ ] Angenommen der Antrag enthält Validierungsfehler, wenn der eingeloggte Nutzer auf „Antrag einreichen" klickt, dann wird nicht eingereicht, der Nutzer wird zum ersten fehlerhaften Abschnitt/Feld geführt und es erfolgt weder ein Server-Eintrag noch eine E-Mail.
- [ ] Angenommen der Antrag ist vollständig valide, wenn der eingeloggte Nutzer auf „Antrag einreichen" klickt, dann wird ein finales PDF mit Referenznummer in der Fußzeile erzeugt und dem Nutzer zum Download angeboten.
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er erfolgreich einreicht, dann wird ein `submissions`-Datensatz mit Snapshot der eingereichten Werte, Zeitstempel, Referenz-ID und `user_id` gespeichert.
- [ ] Angenommen die Einreichung war erfolgreich, wenn der Vorgang abschließt, dann wird der Nutzer auf eine Bestätigungsseite mit Eingangsbestätigung, Einreichungszeitpunkt, Referenznummer und PDF-Download geleitet.
- [ ] Angenommen der Nutzer hat eingereicht, wenn die Bestätigungsseite erscheint, dann werden die Aktionen „Neuen Antrag stellen" und „Korrigieren / erneut einreichen" angeboten.
- [ ] Angenommen der Nutzer wählt „Korrigieren / erneut einreichen", wenn er bestätigt, dann wird aus dem eingereichten Snapshot ein frischer, editierbarer Entwurf erzeugt, und eine erneute Einreichung erzeugt einen eigenen neuen Eintrag (die vorherige bleibt erhalten).
- [ ] Angenommen die serverseitige Protokollierung war erfolgreich, wenn der Vorgang fortfährt, dann wird das PDF best-effort per E-Mail an die hinterlegte Adresse des Nutzers gesendet.
- [ ] Angenommen die Einreichung wurde protokolliert, wenn die Bestätigung erscheint, dann wird der Server-Entwurf (`form_drafts`) dieses Antrags geleert/entfernt und kein Auto-Save mehr darauf ausgeführt.
- [ ] Angenommen die E-Mail wurde versandt, wenn die Bestätigungsseite erscheint, dann zeigt sie „Eine Kopie wurde an <E-Mail> gesendet".

### Einreichen — anonym
- [ ] Angenommen der Nutzer ist nicht eingeloggt, wenn er den Antrag betrachtet, dann sieht er keinen „Antrag einreichen"-Button, sondern einen Hinweis „Zum Einreichen bitte anmelden oder registrieren" (mit Link) — der „PDF herunterladen"-Button bleibt verfügbar.
- [ ] Angenommen der Nutzer ist nicht eingeloggt und meldet sich aus dem Einreichen-Hinweis heraus an, wenn er zurückkehrt, dann bleiben seine bisherigen Eingaben erhalten (Übernahme des lokalen Entwurfs ins Konto, wie in PROJ-4) und „Antrag einreichen" steht zur Verfügung.

### Einreichungs-Liste (nur eingeloggt)
- [ ] Angenommen der Nutzer ist eingeloggt und hat mindestens eine Einreichung, wenn er die Einreichungs-Liste öffnet, dann sieht er ausschließlich seine eigenen Einreichungen, neueste zuerst, mit Zeitpunkt, Referenz-ID, Link zur Bestätigungsseite und PDF-Download.
- [ ] Angenommen der Nutzer ist eingeloggt und hat noch nichts eingereicht, wenn er die Einreichungs-Liste öffnet, dann sieht er einen Leerzustand „Sie haben noch keinen Antrag eingereicht" mit einem Button zum Ausfüllen.
- [ ] Angenommen ein anderer Nutzer ist eingeloggt, wenn er die Einreichungs-Liste oder eine fremde Bestätigungs-URL aufruft, dann sieht er keine fremden Einreichungen (RLS owner-only).

### PDF-Download (Bestandsverhalten, bleibt erhalten)
- [ ] Angenommen ein Nutzer (anonym oder eingeloggt) hat einen vollständig validen Antrag, wenn er auf „PDF herunterladen" klickt, dann erhält er das vollständige PDF ohne Referenznummer und ohne dass eine Einreichung protokolliert wird.

## Edge Cases
- **PDF-Erzeugung scheitert beim Einreichen:** Abbruch mit Fehlermeldung „Antrag konnte nicht eingereicht werden, bitte erneut versuchen"; kein Server-Eintrag, Entwurf bleibt vollständig erhalten.
- **Serverseitige Protokollierung scheitert (eingeloggt, Netzfehler/Session abgelaufen):** Einreichung gilt als **nicht erfolgreich**; Fehlermeldung, Entwurf bleibt erhalten, erneute Einreichung möglich. Bei abgelaufener Session: Hinweis zum erneuten Anmelden (Stand bleibt erhalten).
- **E-Mail-Versand scheitert (eingeloggt):** Einreichung gilt **trotzdem als erfolgreich**; Bestätigungsseite zeigt dezenten Hinweis „E-Mail konnte nicht zugestellt werden — bitte PDF hier herunterladen" + Button „E-Mail erneut senden".
- **Entwurf-Leeren scheitert nach erfolgreichem Server-Eintrag:** Einreichung gilt als erfolgreich (Bestätigung wird gezeigt); Leeren wird best-effort nachgezogen — eine verwaiste Entwurfskopie ist unkritisch.
- **Doppelklick / langsames Netz:** „Antrag einreichen" wird beim Klick sofort deaktiviert und zeigt „Wird eingereicht…", bis der Vorgang abschließt; verhindert Doppel-Einreichungen/Doppel-Mails.
- **Aufruf einer abgelaufenen Bestätigungs-/Einreichungs-URL (> 30 Tage, Auto-Löschung):** freundlicher „nicht (mehr) gefunden"-Zustand statt Fehler.
- **Bewusste Wiedereinreichung nach Korrektur:** erlaubt; erzeugt einen eigenständigen neuen Eintrag mit eigener Referenz; die frühere Einreichung bleibt unverändert bestehen.
- **Anonymer Nutzer will einreichen:** kein „Antrag einreichen"-Button, stattdessen klarer Hinweis + Link zur Anmeldung/Registrierung; „PDF herunterladen" bleibt nutzbar, damit der Antrag nicht verloren ist.
- **Session läuft genau während des Einreichens ab (eingeloggt):** behandelt wie „Protokollierung scheitert" → nicht erfolgreich, Hinweis zum erneuten Anmelden, Stand bleibt erhalten.

## Technical Requirements (optional)
- **Sicherheit/DSGVO:** `submissions` mit RLS owner-only; kein PII in Logs, Fehlermeldungen oder Monitoring (nur technische Fehlercodes). PDF wird nicht serverseitig gespeichert.
- **Aufbewahrung:** Einreichungen werden nach **30 Tagen** automatisch gelöscht (pg_cron, analog zu `form_drafts`).
- **Reihenfolge (Atomarität):** Validierung → PDF → Server-Protokollierung (= „erfolgreich eingereicht"-Moment) → E-Mail (best-effort) → Entwurf leeren (best-effort) → Bestätigung. So gehen im Fehlerfall nie Daten verloren und wird nie eine Einreichung fälschlich bestätigt.
- **E-Mail:** Transaktions-Mail-Dienst (kein Supabase-Auth-Mailer) mit PDF-Anhang; Versand serverseitig. Konkrete Wahl in `/architecture`.
- **Browser:** Chrome, Firefox, Safari; responsiv (375/768/1440px).

## Open Questions
- [x] Barcode/QR der Referenznummer: **gelöst** — nur Klartext-Referenz in der Fußzeile (kein Barcode im MVP).
- [x] E-Mail-Dienst: **gelöst** — Resend (EU-Region); AVV mit Resend ist vor Produktivnutzung abzuschließen.
- [x] URL-Schema: **gelöst** — `/antrag/flexcover/eingereicht` (Liste) und `/antrag/flexcover/eingereicht/[id]` (Bestätigung).
- [ ] Vor Produktivbetrieb: AVV mit Resend abschließen und Absender-Domain (SPF/DKIM) verifizieren — operative Aufgabe für `/deploy`.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| „Einreichen" ist eine Abschluss-Aktion ohne behördliche Übermittlung | Es gibt im MVP kein Auslieferungsziel; echte Übermittlung ist PROJ-13 | 2026-06-22 |
| Einreichen erfordert Anmeldung; anonym nur Ausfüllen + „PDF herunterladen" + Anmelde-Hinweis | Ohne Konto gibt es keinen Empfänger/Eintrag/E-Mail/Wiederauffindbarkeit — ein „Einreichen" wäre eine hohle Geste und würde Scheinsicherheit erzeugen. (Revidiert eine frühere Annahme im Interview.) | 2026-06-22 |
| Eingeloggt: Server-Eintrag in `submissions` (Snapshot, kein PDF) | PDF ist aus Snapshot identisch rekonstruierbar → Datenminimierung | 2026-06-22 |
| Aufbewahrung 30 Tage, dann Auto-Löschung | Einreichung soll eine Weile auffindbar sein, ohne dauerhaft PII zu horten | 2026-06-22 |
| Nach Einreichung: Entwurf wird geleert/read-only, „Korrigieren" erzeugt neuen Entwurf | Klarer Abschluss; Korrektur erzeugt eigene neue Einreichung, alte bleibt erhalten | 2026-06-22 |
| Schlichte Einreichungs-Liste schon im MVP (nur eigene, nur ansehen + PDF) | Nutzer wünscht Wiederauffindbarkeit; kein Löschen/Bearbeiten im MVP (DSGVO-Auto-Löschung reicht) | 2026-06-22 |
| Referenznummer ins PDF (Fußzeile, kleine Schrift), Barcode optional | Papier und System sollen zusammenpassen; Barcode darf MVP nicht blockieren | 2026-06-22 |
| „PDF herunterladen" bleibt für alle, ohne Referenznummer; eingereichtes PDF mit Referenznummer | Am PDF erkennbar, ob es eine formale Einreichung repräsentiert | 2026-06-22 |
| Bestätigungs-E-Mail mit PDF ist Teil von PROJ-6 (Variante A) | E-Mail ist untrennbar vom Einreichungs-Erlebnis; PROJ-7 wird dadurch obsolet/schrumpft | 2026-06-22 |
| E-Mail-Versand ist best-effort, entscheidet nicht über Einreichungserfolg | Eine protokollierte Einreichung darf nicht an einem Mail-Fehler scheitern; „erneut senden" als Ausweg | 2026-06-22 |
| Doppel-Einreichung nur UI-seitig verhindert (Button-Disable), keine Server-Idempotenz | Bewusste Wiedereinreichung nach Korrektur soll erlaubt bleiben | 2026-06-22 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Neue Tabelle `submissions` (Snapshot, kein PDF), RLS owner-only | Spiegelt das bewährte `form_drafts`-Muster; PDF ist aus Snapshot reproduzierbar → Datenminimierung | 2026-06-22 |
| 30-Tage-Aufbewahrung via pg_cron + Lazy-Guard | Identisches, erprobtes Muster wie bei Entwürfen; korrekt auch ohne laufenden Job | 2026-06-22 |
| Referenznummer serverseitig vergeben, Format `FC-<Jahr>-<Zufall>`, menschenlesbar + eindeutig | Server ist die einzige verlässliche Quelle; Klartext genügt (kein Barcode im MVP) | 2026-06-22 |
| PDF serverseitig aus Snapshot erzeugen (gleiche react-pdf-Grenze, Node) für den E-Mail-Anhang | Kein PDF speichern, kein PDF-Upload vom Client; identisches PDF an allen Stellen | 2026-06-22 |
| PDF-Grenze um optionalen Referenz-Parameter erweitern | Unterscheidet eingereichtes PDF (mit Referenz) vom reinen Download (ohne) ohne zweite Erzeugungslogik | 2026-06-22 |
| Einreichen als `POST /api/submissions/[formId]`; Bestätigung/Liste als Server-Components (kein Lese-API) | Konsistent mit bestehender Antragsseite, die Entwürfe serverseitig per RLS liest | 2026-06-22 |
| E-Mail-Dienst Resend (EU-Region), Versand synchron best-effort | EU-Datenhaltung + AVV, geringster Integrationsaufwand; kein Queue im MVP nötig | 2026-06-22 |
| E-Mail-Versand entkoppelt vom Einreichungserfolg (best-effort + „erneut senden") | Eine protokollierte Einreichung darf nicht an einem Mail-Fehler scheitern | 2026-06-22 |
| Neue Secrets `RESEND_API_KEY`, `SUBMISSION_EMAIL_FROM` (kein NEXT_PUBLIC) | Server-seitiger Versand; Secrets nie im Browser exponieren | 2026-06-22 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
Einreichen ist ein **angemeldeter** Vorgang. Beim Klick auf „Antrag einreichen" schickt das Formular die bereits validierten, bereinigten Werte an eine neue Server-Schnittstelle. Der Server vergibt eine **Referenznummer**, legt einen **Einreichungs-Datensatz** an (nur die Daten, kein PDF), **erzeugt das PDF serverseitig** und **versendet es per E-Mail** (best-effort). Danach wird der Nutzer auf eine **Bestätigungsseite** geleitet, die das PDF erneut zum Download anbietet. Eine schlichte **Einreichungs-Liste** zeigt eigene Einreichungen. Anonyme Nutzer sehen statt „Einreichen" einen Hinweis zur Anmeldung — der bestehende „PDF herunterladen"-Button bleibt für alle erhalten.

### A) Komponenten- & Seitenstruktur
```
Antragsseite  /antrag/flexcover                (bestehend, erweitert)
├── FormEngine (bestehend)
├── „PDF herunterladen"        → vollständiges PDF OHNE Referenz (bestehend, bleibt)
├── eingeloggt:  „Antrag einreichen"-Button
│      └── beim Klick: deaktiviert + „Wird eingereicht…"  → ruft Einreichungs-Schnittstelle
└── anonym:      Hinweisbox „Zum Einreichen bitte anmelden oder registrieren" (Link zu Login/Registrierung)

Bestätigungsseite  /antrag/flexcover/eingereicht/[id]   (neu, Server-Component, nur eigene)
├── Eingangsbestätigung + Einreichungszeitpunkt + Referenznummer
├── E-Mail-Status:  „Kopie an <E-Mail> gesendet"  ODER  Hinweis + „E-Mail erneut senden"
├── „PDF herunterladen" (erzeugt dasselbe eingereichte PDF MIT Referenz)
├── „Neuen Antrag stellen"
└── „Korrigieren / erneut einreichen"  → erzeugt aus dem Snapshot einen frischen Entwurf

Einreichungs-Liste  /antrag/flexcover/eingereicht        (neu, Server-Component, nur eigene)
├── Liste: Zeitpunkt · Referenz · Link zur Bestätigung · „PDF herunterladen"   (neueste zuerst)
└── Leerzustand: „Sie haben noch keinen Antrag eingereicht" + Button „Antrag ausfüllen"
```

Die Bestätigungs- und Listenseite lesen ihre Daten — wie die bestehende Antragsseite die Entwürfe — **direkt serverseitig über die Datenbank mit owner-only-Zugriff (RLS)**. Es braucht dafür keine zusätzlichen Lese-Schnittstellen.

### B) Datenmodell (Klartext)
Neue Tabelle **„Einreichungen" (`submissions`)**, eine Zeile je Einreichung:
- **ID** — eindeutig, wird in der URL der Bestätigungsseite verwendet
- **Besitzer** — der einreichende (angemeldete) Nutzer
- **Formular-ID** — welches Formular eingereicht wurde (hier: FlexCover)
- **Referenznummer** — menschenlesbar, z. B. `FC-2026-A1B2C3` (Jahr + kurzer Zufallsteil), eindeutig
- **Daten-Snapshot** — die eingereichten, bereinigten Werte (dieselben, die ins PDF fließen). **Kein PDF gespeichert** — es ist daraus jederzeit identisch reproduzierbar (Datenminimierung).
- **Eingereicht am** — Zeitstempel

Eigenschaften:
- **RLS owner-only** (jeder sieht/liest nur eigene Einreichungen) — wie bei den Entwürfen.
- **Aufbewahrung 30 Tage**, dann automatische Löschung per Hintergrund-Job (pg_cron), plus „Lazy-Guard": abgelaufene Einreichungen werden beim Aufruf nicht mehr angezeigt — analog zum bestehenden Entwurfs-Muster.
- Mehrere Einreichungen pro Nutzer/Formular sind erlaubt (Wiedereinreichung nach Korrektur = eigener neuer Eintrag).

### C) Ablauf beim Einreichen (Reihenfolge = Fehlersicherheit)
1. **Validierung** (Formular-Engine, clientseitig) — bei Fehlern: Sprung zum ersten Fehler, kein Server-Aufruf.
2. Werte an die **Einreichungs-Schnittstelle** senden (POST). Diese prüft Anmeldung erneut und validiert die Werte serverseitig (Zod) — Sicherheit nicht nur clientseitig.
3. **Referenznummer vergeben** und **Einreichungs-Datensatz speichern** → das ist der „erfolgreich eingereicht"-Moment.
4. **PDF serverseitig erzeugen** (aus dem Snapshot, mit Referenz) und **per E-Mail versenden** — *best-effort*: scheitert das, bleibt die Einreichung gültig; der E-Mail-Status wird vermerkt.
5. **Server-Entwurf leeren** (best-effort) — der Antrag ist abgeschlossen.
6. Antwort an den Client mit ID + Referenz → Weiterleitung zur **Bestätigungsseite**.

Geht Schritt 2/3 schief (Netz, Session abgelaufen): Einreichung gilt als **nicht erfolgreich**, Entwurf bleibt erhalten, der Nutzer kann erneut einreichen (bei abgelaufener Session: Hinweis zum erneuten Anmelden).

### D) PDF & Referenznummer
Die bestehende **austauschbare PDF-Grenze** (`generateFlexcoverPdf`) wird um einen **optionalen Referenz-Parameter** erweitert:
- **„PDF herunterladen"** (ohne Einreichen): ohne Referenz → keine Fußzeilen-Referenz.
- **Eingereichtes PDF** (E-Mail-Anhang serverseitig + Download auf der Bestätigungsseite): mit Referenz → kleine Klartext-Referenz in der Fußzeile.

Dieselbe react-pdf-Erzeugung läuft sowohl im Browser (Download) als auch **serverseitig** (für den E-Mail-Anhang, über die vorhandene Node-Fähigkeit von react-pdf). Damit bleibt das PDF an beiden Stellen identisch, ohne das PDF irgendwo zu speichern oder vom Client hochzuladen.

### E) Schnittstellen (neu)
- **Einreichen** (`POST /api/submissions/[formId]`): Anmeldung + Zod-Validierung + Größenlimit (wie bei Entwürfen), legt Einreichung an, erzeugt PDF, versendet E-Mail (best-effort), leert Entwurf, liefert ID + Referenz.
- **E-Mail erneut senden** (`POST /api/submissions/[formId]/[submissionId]/resend`): owner-only; erzeugt das PDF erneut aus dem Snapshot und versendet es. Best-effort, kein PII in Fehlerantworten.
- Bestätigungs- und Listenseite brauchen **keine** eigenen Lese-Schnittstellen (Server-Components lesen direkt per RLS).

### F) E-Mail-Versand
- **Resend (EU-Region)** als Transaktions-Mail-Dienst; API-Key als Secret (Server-seitig, nie im Browser). AVV mit Resend erforderlich (DSGVO).
- Versand **synchron im Einreichen-Request** (best-effort) — kein Queue/Job-System im MVP nötig.
- Inhalt: kurze Bestätigung + Referenz + **PDF als Anhang**. Empfänger ist die eigene Konto-E-Mail des Nutzers (PII geht nur an die betroffene Person selbst).
- Fehler werden nur als technischer Status geloggt — **kein PII in Logs/Fehlermeldungen**.

### G) Nach der Einreichung
- **Entwurf-Leeren:** Server-Entwurf wird entfernt, lokaler Entwurf geleert → kein Auto-Save mehr auf dem abgeschlossenen Antrag.
- **„Korrigieren / erneut einreichen":** aus dem gespeicherten Snapshot wird ein **frischer Entwurf** erzeugt (der Nutzer landet wieder im Formular mit seinen Werten); eine erneute Einreichung ist ein eigener neuer Eintrag.
- **„Neuen Antrag stellen":** startet ein leeres Formular.

### H) Dependencies (zu installieren)
- **`resend`** — offizielles SDK des E-Mail-Dienstes (Server-seitiger Versand mit Anhang).
- Keine weitere Bibliothek nötig (PDF, Validierung, Supabase, RLS-Muster sind bereits vorhanden). **Kein** QR-/Barcode-Paket (Klartext-Referenz gewählt).

### I) Neue Umgebungsvariablen (in `.env.local.example` dokumentieren)
- `RESEND_API_KEY` — Secret für den E-Mail-Versand (nur Server).
- `SUBMISSION_EMAIL_FROM` — Absenderadresse (verifizierte Domain bei Resend).
(Beide ohne `NEXT_PUBLIC_`-Präfix — niemals im Browser.)

## Implementation Notes

### Backend (2026-06-22) — fertig, getestet
**Datenbank** (`supabase/migrations/`):
- `20260622120000_submissions.sql` — Tabelle `submissions` (id, user_id, form_id, reference unique, data jsonb, submitted_at). RLS owner-only: nur `select_own` + `insert_own` (bewusst keine update/delete-Policy — Einreichungen sind unveränderlich; Löschen nur über den Aufbewahrungs-Job). GRANT select/insert nur an `authenticated`. Indizes `(user_id, submitted_at desc)` und `(submitted_at)`.
- `20260622120100_submissions_retention.sql` — pg_cron-Job `delete-stale-submissions` (täglich 03:00 UTC, > 30 Tage).
- **Status:** Auf DEV (`flexCover-dev`, xctlfuhwnhknzqqibmgm) per Supabase-MCP **angewandt** (2026-06-22); `public.submissions` mit aktiver RLS angelegt, Security-Advisor ohne neue Findings (nur vorbestehender Auth-Hinweis „Leaked Password Protection"). PROD-Anwendung erfolgt bei `/deploy`.

**Lib-Schicht** (`src/lib/submissions/`): `types.ts`, `constants.ts` (30 Tage, 1 MB), `expiry.ts` (Lazy-Guard), `reference.ts` (`FC-<Jahr>-<6 Zeichen>`, Alphabet ohne 0/O/1/I/L), `store.ts` (insert mit Referenz-Retry bei Kollision, get, list), `client.ts` (`submitForm`, `resendSubmissionEmail`, `SubmitError` mit Status).

**E-Mail** (`src/lib/email/resend.ts`): `sendSubmissionEmail` über Resend, best-effort (wirft nie, liefert boolean), kein PII in Logs.

**PDF** (`src/lib/pdf/`): `index.ts` `generateFlexcoverPdf(values, reference?)` + `flexcoverPdfFilename(date, reference?)`; neues `server.ts` `renderFlexcoverPdfBuffer(values, reference?)` (Node: Arimo per Dateipfad, Header als Data-URL, `renderToBuffer`); `flexcover/document.tsx` um `reference?`-Prop + Fußzeilen-Referenz erweitert.

**API** (`src/app/api/submissions/`): `[formId]/route.ts` POST (Auth → Zod → Größenlimit → protokollieren → PDF+E-Mail best-effort → Entwurf leeren), `[formId]/[submissionId]/resend/route.ts` POST (owner-only, Lazy-Guard 404, best-effort). Beide `runtime = "nodejs"`.

**Tests:** Integrationstests beider Routen (Auth/Validierung/413/Best-effort-Pfade), Unit-Test Referenz-Generator, Node-Test serverseitiges PDF inkl. Referenz. Gesamt **108 Unit-Tests grün**, tsc + eslint sauber. (Timeout der react-pdf-Node-Tests auf 60s erhöht — Kaltstart unter Last.)

**Dependency:** `resend` ^6.x installiert.

**Manueller Schritt offen:** `.env.local.example` um `RESEND_API_KEY` und `SUBMISSION_EMAIL_FROM` ergänzen (Deny-Regel auf `.env*` verhindert automatische Bearbeitung).

**Noch nicht gebaut (→ `/frontend PROJ-6`):** „Antrag einreichen"-Button + anonymer Anmelde-Hinweis in der Antragsseite, Bestätigungsseite `/antrag/flexcover/eingereicht/[id]`, Einreichungs-Liste `/antrag/flexcover/eingereicht` (beide Server-Components, lesen per RLS über `getSubmissionRow`/`listSubmissionRows`).

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
