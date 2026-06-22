# PROJ-6: Formular-Einreichung & Bestätigung

## Status: Planned
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
- [ ] Barcode/QR der Referenznummer im eingereichten PDF: direkt im MVP oder Folgeerweiterung? (Klartext-Referenz ist gesetzt; Format Code128 vs. QR offen — Entscheidung in `/architecture`.)
- [ ] Konkreter E-Mail-Dienst (z. B. Resend vs. SMTP) und DSGVO-Auftragsverarbeitung — in `/architecture` festzulegen.
- [ ] URL-Schema der Bestätigungs-/Listenseiten (`/antrag/flexcover/eingereicht/[id]` vs. `/meine-antraege`) — Detailfestlegung in `/architecture`.

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
| _To be added by /architecture_ | | |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
