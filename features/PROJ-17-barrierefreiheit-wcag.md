# PROJ-17: Barrierefreiheit (WCAG 2.1 AA)

## Status: Planned
**Created:** 2026-06-29
**Last Updated:** 2026-06-29

## Dependencies
- Requires: PROJ-3 (Dynamic Form Engine) — die Engine ist die zentrale, wiederverwendbare Stelle; Fixes hier wirken für jedes künftige Formular
- Requires: PROJ-2 (User Authentication) — Login-/Registrieren-/Passwort-Formulare
- Requires: PROJ-5 (PDF-Generierung) / PROJ-6 (Einreichung & Bestätigung) / PROJ-11 (FlexCover-Definition) — betroffene Seiten/Flows
- Nachgelagert: PROJ-18 (Barrierefreies PDF / PDF/UA) wird separat gespect

## Kontext & Ziel
Der FlexCover-Förderantrag ist Teil eines Bundes-Programms („Hermesdeckungen"). Damit ist Barrierefreiheit eine **harte Abnahmebedingung (P0)**, nicht optional. Ziel ist die vollständige **WCAG 2.1 AA**-Konformität (= Maßstab von EN 301 549 / BITV 2.0 / BFSG) auf **allen Antragsteller-Flächen**. Die heutige Basis (shadcn/ui auf Radix-Primitiven, semantisches HTML, `<label>`/`<fieldset>`) ist solide; dieses Feature härtet die bekannten Lücken nach und macht Konformität prüfbar.

**Konformitäts-Maßstab (Abnahmekriterium):** WCAG 2.1 Stufe AA.

**Flächen im Umfang:** Formular-Engine (Antrag), Auth-Formulare (Login/Registrieren/Passwort-vergessen/-zurücksetzen), Startseite, Dashboard, Einreichungs-/Bestätigungsseiten + Einreichungsliste, Datenschutzseite, globale Kopfzeile/Footer, neue Barrierefreiheitserklärung.

## User Stories
- Als **blinder Antragsteller mit Screenreader** möchte ich den kompletten Antrag ausfüllen und einreichen können, wobei mir Beschriftungen, Pflichtangaben, Fehler und Statusmeldungen vorgelesen werden, damit ich keine fremde Hilfe brauche.
- Als **Antragsteller, der keine Maus benutzen kann**, möchte ich jede Funktion (Felder, Auswahl, Wiederholgruppen hinzufügen/entfernen, Tabellen, Buttons) allein per Tastatur bedienen und stets sehen, wo der Fokus steht, damit ich den Antrag vollständig bearbeiten kann.
- Als **sehbehinderter Antragsteller** möchte ich die Seite auf 200 % zoomen bzw. mit großer Schrift nutzen können, ohne dass Inhalte überlappen oder verschwinden, und ausreichende Farbkontraste vorfinden, damit ich alles lesen kann.
- Als **Antragsteller mit Lernschwierigkeiten/kognitiver Einschränkung** möchte ich klare Fehlermeldungen erhalten, die sagen, was zu tun ist, und nach einem Fehler direkt zum betroffenen Feld gelangen, damit ich den Antrag korrigieren kann.
- Als **Antragsteller** möchte ich eine Barrierefreiheitserklärung mit Kontakt-/Feedback-Möglichkeit finden, damit ich Barrieren melden und mein Recht auf Zugang wahrnehmen kann.

## Out of Scope
- **Barrierefreies PDF (PDF/UA, Tagged PDF)** — eigenes Feature **PROJ-18** (`@react-pdf/renderer` erzeugt keine getaggten PDFs; ggf. Renderer-Wechsel → architektonische Entscheidung wird dort isoliert)
- **Admin-Dashboard (PROJ-9)** — anderer Nutzerkreis, noch nicht gebaut; Barrierefreiheit wird bei dessen eigenem Bau berücksichtigt
- **Externe zertifizierte BITV-Prüfung** als formaler Rechtsnachweis — extern beauftragt; dieses Feature *bereitet darauf vor* (interne Abnahme + Behebung), führt sie aber nicht durch
- **WCAG 2.2-spezifische Kriterien** und **Stufe AAA** — nur 2.1 AA verbindlich
- **Mehrsprachigkeit / Leichte Sprache / Gebärdensprach-Video** — nicht gefordert (Anwendung ist deutschsprachig)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Tastaturbedienung & Fokus (WCAG 2.1.1, 2.4.3, 2.4.7)
- [ ] Angenommen ein Nutzer bedient ausschließlich die Tastatur, wenn er durch eine beliebige Antragsteller-Seite navigiert, dann sind alle interaktiven Elemente (Felder, Selects, Radios, Checkboxen, Buttons, Links, Wiederholgruppen- und Tabellen-Aktionen) erreichbar und bedienbar, ohne dass eine Tastaturfalle entsteht.
- [ ] Angenommen ein Element hat den Fokus, wenn der Nutzer per Tab navigiert, dann ist der Fokus jederzeit deutlich sichtbar.
- [ ] Angenommen eine Seite wird geladen, wenn der Nutzer Tab drückt, dann folgt die Fokusreihenfolge der visuellen/logischen Lesereihenfolge.
- [ ] Angenommen ein Nutzer befindet sich am Seitenanfang, wenn er den ersten „Zum Inhalt springen"-Link aktiviert, dann springt der Fokus an den Hauptinhalt unter Umgehung der Kopfzeile.

### Beschriftungen & Struktur (WCAG 1.1.1, 1.3.1, 2.4.1, 2.4.2, 2.4.6, 3.1.1, 4.1.2)
- [ ] Angenommen ein Formularfeld wird angezeigt, wenn ein Screenreader es fokussiert, dann werden Beschriftung, Feldtyp und ggf. Hilfetext programmatisch ermittelbar vorgelesen.
- [ ] Angenommen ein Button enthält nur ein Icon (z. B. Eintrag entfernen, hinzufügen), wenn ein Screenreader ihn erreicht, dann hat er einen aussagekräftigen barrierefreien Namen (z. B. „Eintrag 2 entfernen").
- [ ] Angenommen eine Seite wird geladen, wenn ein Screenreader sie öffnet, dann hat das Dokument `lang="de"`, einen aussagekräftigen, seitenspezifischen Titel, eine korrekte Überschriftenhierarchie und Landmark-Bereiche (header/main/footer).
- [ ] Angenommen eine Grafik wird angezeigt, wenn ein Screenreader sie erreicht, dann hat sie einen passenden Alternativtext oder ist (rein dekorativ) für assistive Technik ausgeblendet.
- [ ] Angenommen ein berechnetes/schreibgeschütztes Feld wird angezeigt, wenn ein Screenreader es erreicht, dann ist sein Wert wahrnehmbar und das Feld als schreibgeschützt (nicht „deaktiviert/ausgeblendet") gekennzeichnet.

### Pflichtfelder, Validierung & Fehler (WCAG 1.4.1, 3.3.1, 3.3.2, 3.3.3, 4.1.3)
- [ ] Angenommen ein Feld ist ein Pflichtfeld, wenn ein Screenreader es erreicht, dann ist die Pflicht programmatisch erkennbar (nicht allein über Farbe/„*").
- [ ] Angenommen ein Feld ist fehlerhaft, wenn der Nutzer es erreicht, dann ist der Fehlerzustand programmatisch verknüpft (Feld ist als ungültig markiert und auf die Fehlermeldung bezogen) und die Meldung beschreibt im Klartext, was zu tun ist.
- [ ] Angenommen ein Nutzer schickt das Formular mit Fehlern ab, wenn die Validierung anschlägt, dann wird die Fehlersituation für assistive Technik angekündigt und der Fokus auf das erste fehlerhafte Feld (oder eine Fehlerübersicht) gesetzt.
- [ ] Angenommen eine Fehler- oder Erfolgsmeldung erscheint (z. B. Auto-Save, erfolgreiche Einreichung, Login-Fehler), wenn sie eingeblendet wird, dann wird sie ohne Fokuswechsel für Screenreader angesagt.

### Kontrast, Zoom & Reflow (WCAG 1.4.3, 1.4.4, 1.4.10, 1.4.11)
- [ ] Angenommen eine Seite wird angezeigt, wenn Text und Bedienelemente gemessen werden, dann erfüllt normaler Text mind. 4,5:1 und großer Text / aktive UI-Komponenten/Zustände mind. 3:1 Kontrast (inkl. Hilfetexte, Platzhalter, Fehlertexte).
- [ ] Angenommen ein Nutzer zoomt den Browser auf 200 %, wenn er eine beliebige Seite nutzt, dann bleiben alle Inhalte und Funktionen ohne Informationsverlust verfügbar.
- [ ] Angenommen die Anzeige ist 320 px breit (Reflow), wenn der Nutzer eine Seite nutzt, dann gibt es kein Scrollen in zwei Richtungen außer bei dafür vorgesehenen Inhalten (z. B. breite Datentabellen).

### Dynamische Inhalte der Form-Engine (WCAG 1.3.1, 4.1.3)
- [ ] Angenommen eine Wiederholgruppe enthält Einträge, wenn der Nutzer einen Eintrag hinzufügt oder entfernt, dann bleibt der Fokus sinnvoll gesetzt (kein Sprung an den Seitenanfang) und die Änderung ist für Screenreader nachvollziehbar.
- [ ] Angenommen ein Feld wird durch Sichtbarkeitslogik (`visibleWhen`) ein- oder ausgeblendet, wenn sich die Bedingung ändert, dann geht der Tastaturfokus nicht verloren und neu erscheinende Felder sind erreichbar.
- [ ] Angenommen eine Tabelle (statisch oder dynamisch) wird angezeigt, wenn ein Screenreader eine Zelle liest, dann sind Zeilen-/Spaltenbezug erkennbar.

### Konformitäts-Nachweis (Abnahme)
- [ ] Angenommen die automatisierten Tests laufen, wenn axe-core gegen jede Antragsteller-Seite läuft, dann werden 0 kritische/schwere Verstöße gemeldet.
- [ ] Angenommen ein QA-Durchlauf, wenn die Kernflows (Antrag ausfüllen → einreichen, Registrieren, Login, Passwort-Reset) rein per Tastatur und mit NVDA-Screenreader durchgespielt werden, dann sind sie vollständig ohne Maus und ohne Sichtkontakt abschließbar (dokumentiert).

### Barrierefreiheitserklärung (BITV-Pflichtbestandteil)
- [ ] Angenommen ein Nutzer sucht Informationen zur Barrierefreiheit, wenn er den Footer-Link „Barrierefreiheit" aktiviert, dann erreicht er eine Seite mit Konformitätsstatus, bekannten Einschränkungen, Erstellungsdatum, Kontakt-/Feedback-Weg und Hinweis auf die Durchsetzungs-/Schlichtungsstelle.
- [ ] Angenommen die Erklärungsseite ist erreichbar, wenn sie geprüft wird, dann erfüllt sie selbst die WCAG-2.1-AA-Kriterien dieses Features.

## Edge Cases
- **Wiederholgruppe leeren bis Minimum:** Was passiert mit dem Fokus, wenn der letzte (oder min-begrenzte) Eintrag nicht entfernt werden darf — ist der deaktivierte Entfernen-Button für Screenreader nachvollziehbar?
- **Bedingte Felder springen:** Nutzer ändert ein Ja/Nein-Feld, wodurch ganze Gruppen erscheinen/verschwinden — Fokus darf nicht „ins Leere" laufen.
- **Drittanbieter-Captcha (Turnstile):** Cloudflare-Widget ist nicht von uns kontrollierbar — bietet der vorhandene barrierefreie Modus (inkl. Audio-Challenge) einen akzeptablen Pfad? Was ist der Fallback, wenn nicht?
- **Native Datums-/Zahlenfelder:** Verhalten von Screenreadern bei `type="date"`/`inputMode="decimal"` über Browser hinweg.
- **Lange Fehlerliste:** Bei vielen gleichzeitigen Fehlern — wird der Nutzer sinnvoll geführt (Übersicht + Sprung), ohne von einer Flut von Live-Ansagen überrollt zu werden?
- **Sehr breite Tabelle bei 320 px / 200 % Zoom:** horizontales Scrollen ist hier zulässig (Datentabelle) — sicherstellen, dass es bedienbar bleibt und nichts abgeschnitten ist.
- **Session-Timeout / Auth-Redirect mitten im Flow:** Wird der Nutzer (auch per Screenreader) über die Umleitung/den Grund informiert?
- **`prefers-reduced-motion`:** etwaige Übergänge/Animationen respektieren die Nutzereinstellung.

## Technical Requirements (optional)
- Standard: WCAG 2.1 AA (EN 301 549) auf allen unter „Flächen im Umfang" genannten Seiten
- Automatisierte Prüfung via axe-core, integriert in die Playwright-E2E-Suite (Regression)
- Manuelle Abnahme: Tastatur + NVDA, dokumentiert im QA-Abschnitt
- Browser-/AT-Support: aktuelle Chrome/Firefox/Edge/Safari; Screenreader NVDA (Referenz)
- Keine PII in etwaigen neuen Logs (DSGVO, projektweit)

## Open Questions
- [ ] Welcher konkrete **Feedback-Kontakt** kommt in die Barrierefreiheitserklärung (E-Mail/Adresse) und welche **Durchsetzungs-/Schlichtungsstelle** ist zu nennen? (Vorschlag: bestehende Kontakt-/Impressum-Adresse; Schlichtungsstelle nach BGG, falls öffentliche Stelle.)
- [ ] Reicht der barrierefreie Modus von **Cloudflare Turnstile** (inkl. Audio-Challenge) für AA, oder braucht es einen alternativen Verifizierungspfad?
- [ ] **Externer BITV-Test:** wann, durch wen, vor welcher (öffentlichen) Abnahme?
- [ ] Konkretes **Erstellungs-/Prüfdatum** und Konformitätsaussage („vollständig/teilweise konform") für die Erklärung — wird nach der internen Abnahme festgelegt.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| PDF-Barrierefreiheit (PDF/UA) ausgegliedert → PROJ-18 | `@react-pdf/renderer` erzeugt keine getaggten PDFs; Risiko/Renderer-Entscheidung isolieren, damit der große Web-UI-Nutzen nicht blockiert wird | 2026-06-29 |
| Standard = WCAG 2.1 AA | Exakter Maßstab von EN 301 549 / BITV 2.0 / BFSG; prüfbar und das, was eine öffentliche Abnahme verlangt | 2026-06-29 |
| Priorität P0 (MVP-kritisch) | Bundes-Programm-Kontext (Hermesdeckungen) → Barrierefreiheit ist harte Abnahmebedingung, nicht Nachgang | 2026-06-29 |
| Umfang = alle Antragsteller-Flächen, Admin (PROJ-9) ausgenommen | Login ist erster Touchpoint und muss mitgeprüft werden; Admin hat anderen Nutzerkreis und ist noch nicht gebaut | 2026-06-29 |
| Nachweis = axe-core (E2E) + manuell (Tastatur + NVDA) | axe allein findet nur ~30–40 % der Probleme; Tastatur-/Screenreader-Bedienung muss manuell verifiziert werden | 2026-06-29 |
| Barrierefreiheitserklärung als Seite + Feedback-Weg enthalten | Bei BITV für öffentliche Stellen Pflichtbestandteil; statische Seite gehört thematisch hierher | 2026-06-29 |
| Externe zertifizierte BITV-Prüfung außerhalb des Features | Wird extern beauftragt; Feature bereitet darauf vor (interne Abnahme + Behebung) | 2026-06-29 |

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
