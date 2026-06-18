# PROJ-3: Dynamic Form Engine

## Status: Planned
**Created:** 2026-06-18
**Last Updated:** 2026-06-18

## Dependencies
- **Keine harte** (Fundament; rendert/validiert auch anonym ohne Login). Wird konsumiert von PROJ-11 (FlexCover-Definition), PROJ-4 (Entwurf), PROJ-5 (PDF), PROJ-6 (Einreichung).

## User Stories
- Als Entwickler möchte ich ein Formular als **Definition** (strukturierte Beschreibung) hinterlegen, damit ich komplexe dynamische Formulare ohne Einzel-Codierung jedes Felds erstellen kann
- Als Entwickler möchte ich **benannte JS/TS-Handler** für Berechnung/Validierung anstecken, damit ich komplexe Business-Logik umsetzen kann
- Als (anonymer) Nutzer möchte ich ein mehrteiliges Formular mit dynamischem Ein-/Ausblenden und Inline-Validierung ausfüllen, damit ich geführt werde und weniger Fehler mache
- Als Nutzer möchte ich wiederholbare Einträge (auch verschachtelt) hinzufügen/entfernen, damit ich variabel viele Daten erfassen kann
- Als Nutzer möchte ich Tabellen für mehrspaltige/mehrjährige Daten nutzen, damit ich strukturierte Zahlen eingeben kann

## Out of Scope
- **Konkrete FlexCover-Definition** → PROJ-11
- **Datei-Upload & gezeichnete Unterschrift** → PROJ-12 (Engine-Erweiterung; Storage/DSGVO)
- **Definition-eingebettetes, ausführbares JS (Modell B)** → später, mit Sandbox; Engine wird nur andock-offen entworfen
- **Ausdruckssprache/Formel-Editor** → spätere Option
- **Tabelle-in-Tabelle** → bewusst weggelassen
- **Entwurf speichern/Auto-Save** → PROJ-4 · **PDF** → PROJ-5 · **Einreichung/Persistenz** → PROJ-6
- **Konfigurierbare Absende-Ziele/Konnektoren** (DB-Mapping, **Webhook/externe API**) → die Engine sieht nur die Erweiterungsstelle vor (Submit-Event + Handler); konkrete Konnektoren downstream; externe Übermittlung/Webhook → PROJ-13. E-Mail-Versand → PROJ-7
- **Multi-Form/Multi-Mandanten-Verwaltung** → PROJ-10
- **Visueller Form-Builder (GUI)** — Definitionen werden im MVP als JSON von Entwicklern erstellt
- **Server-seitige verbindliche Re-Validierung** beim Absenden → Sache des konsumierenden Features (PROJ-6); die Engine liefert die Validierungslogik

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

**Rendering aus Definition**
- [ ] Angenommen eine gültige Formular-Definition, wenn die Engine sie lädt, dann werden Abschnitte und Felder automatisch als Oberfläche dargestellt
- [ ] Angenommen eine fehlerhafte/ungültige Definition, wenn die Engine sie lädt, dann erscheint ein kontrollierter Fehler (kein stiller Absturz)

**Feldtypen**
- [ ] Angenommen die Definition nutzt Feldtypen (Text, Mehrzeilig, E-Mail, Ganzzahl, Dezimal, Währung, Prozent, Jahr, PLZ/Muster, Auswahl, Ja/Nein, Ja/Nein/leer, Checkbox, Datum), wenn das Formular rendert, dann wird jeder Typ mit passender Eingabe + Formatierung dargestellt
- [ ] Angenommen ein Zahlen-/Währungsfeld, wenn der Nutzer Werte eingibt, dann gilt deutsche Formatierung (Dezimal-Komma, Tausenderpunkt, €)

**Layout-Modi**
- [ ] Angenommen die Definition setzt Layout = Tabs, wenn das Formular rendert, dann erscheinen Abschnitte als Reiter mit Status-/Fehler-Indikator je Reiter
- [ ] Angenommen Layout = Wizard bzw. Einseitig, wenn das Formular rendert, dann wird der jeweilige Modus dargestellt

**Dynamische Sichtbarkeit**
- [ ] Angenommen ein Feld hat eine Sichtbarkeitsregel (abhängig von anderem Feld), wenn die Bedingung erfüllt/nicht erfüllt ist, dann wird das Feld ein-/ausgeblendet
- [ ] Angenommen ein Pflichtfeld ist aktuell ausgeblendet, wenn der Nutzer absendet, dann blockiert dieses versteckte Feld die Abgabe **nicht**

**Validierung & Plausibilität**
- [ ] Angenommen ein Pflichtfeld ist leer, wenn der Nutzer das Feld verlässt bzw. absendet, dann erscheint eine Validierungsmeldung
- [ ] Angenommen ein Muster-/Bereichsfeld (z.B. PLZ, min/max), wenn die Eingabe ungültig ist, dann erscheint eine Meldung
- [ ] Angenommen eine feldübergreifende Plausibilitätsregel (z.B. Summe = Gesamt), wenn sie verletzt ist, dann erscheint eine Meldung beim Absenden
- [ ] Angenommen Tabs-Layout, wenn Felder fehlerhaft sind, dann zeigt der jeweilige Reiter die Fehleranzahl

**Berechnungen**
- [ ] Angenommen ein berechnetes (read-only) Feld (z.B. Summe), wenn sich Quellfelder ändern, dann aktualisiert sich der Wert automatisch

**Erweiterbarkeit (Custom-Handler, Modell A)**
- [ ] Angenommen die Definition referenziert einen benannten Custom-Handler (Berechnung/Validierung), wenn die Engine ihn auswertet, dann wird die registrierte JS/TS-Funktion aufgerufen und ihr Ergebnis angewandt

**Wiederholgruppen (inkl. verschachtelt)**
- [ ] Angenommen eine Wiederholgruppe, wenn der Nutzer „hinzufügen/entfernen" nutzt, dann werden Instanzen ergänzt/entfernt (unter Beachtung von min/max)
- [ ] Angenommen eine **verschachtelte** Wiederholgruppe, wenn der Nutzer auf einer inneren Ebene hinzufügt/entfernt, dann funktioniert dies unabhängig je Ebene
- [ ] Angenommen mehrere Instanzen, wenn validiert wird, dann wird jede Instanz einzeln geprüft

**Tabellen**
- [ ] Angenommen eine Tabelle mit festen Zeilen (z.B. 3 Jahre × Kategorien), wenn sie rendert, dann erscheinen beschriftete Zeilen/Spalten als Raster
- [ ] Angenommen eine Tabelle mit dynamischen Zeilen, wenn der Nutzer „Zeile hinzufügen" nutzt, dann lässt sich die Tabelle erweitern/reduzieren

**Aktionen & Absenden**
- [ ] Angenommen ein „Versenden"-Button, wenn der Nutzer ihn klickt und die Gesamtvalidierung besteht, dann löst die Engine das Ereignis „abgesendet" mit den strukturierten Daten aus (Weiterverarbeitung = PROJ-5/6)
- [ ] Angenommen die Definition deklariert Absende-Ziele (z.B. PDF, In-DB-Speichern, E-Mail, Webhook), wenn abgesendet wird, dann ruft die Engine die zugehörigen registrierten Handler/Konnektoren auf (Konnektoren selbst sind Sache der jeweiligen Features)
- [ ] Angenommen ein „Zurücksetzen"-Button, wenn der Nutzer ihn klickt, dann erscheint ein Bestätigungsdialog, bevor das Formular geleert wird

**Anonym & Responsiv**
- [ ] Angenommen ein nicht eingeloggter Nutzer, wenn er ein Formular öffnet und ausfüllt, dann funktioniert die Engine ohne Login
- [ ] Angenommen 375/768/1440px, wenn das Formular rendert, dann ist es responsiv und barrierearm (WCAG 2.1 AA)

## Edge Cases
- Zirkuläre Sichtbarkeits-/Berechnungsabhängigkeit → Engine bricht kontrolliert ab/ignoriert sicher, kein Endlosloop
- Berechnetes/Plausibilitäts-Feld referenziert nicht existierendes Feld → klarer Definitionsfehler
- Entfernen einer Wiederholgruppen-Instanz, auf die eine Berechnung verweist → Werte konsistent neu berechnet
- Sehr großes Formular / tiefe Verschachtelung → akzeptable Performance, kein Einfrieren
- Verstecktes Feld mit Wert wird ausgeblendet → Wert wird bei der Abgabe nicht als Pflicht erzwungen (Verwerfen-vs-Behalten in Architektur festlegen)
- Ungültige Zahlen-Eingabe (Buchstaben in Zahlenfeld) → abgefangen, klare Meldung

## Technical Requirements
- **Definition-getrieben:** Formularaufbau, Feldtypen, Logik, Validierung aus einer Definition (Format → `/architecture`)
- **Erweiterbar:** benannte Custom-Handler (JS/TS im Projekt, Modell A); Architektur so, dass definition-eingebettetes JS (Modell B, sandboxed) später andockbar ist
- **Submit-Grenze:** Engine erzeugt validierte, strukturierte Daten + „abgesendet"-Ereignis; Absende-Ziele (PDF/DB/E-Mail/Webhook) als andockbare Handler, nicht im Engine-Kern
- **Rekursiv:** Daten-/Definitionsmodell unterstützt verschachtelte Gruppen/Wiederholgruppen beliebiger Tiefe
- **Lokalisierung:** Deutsch (Zahlen-/Währungsformat)
- **Barrierefreiheit/Responsiv:** WCAG 2.1 AA; 375/768/1440px
- **Sicherheit:** kein Ausführen beliebiger Strings als Code im MVP (nur registrierte Handler)

## Open Questions
- [ ] Genaues Definition-Format (JSON-Struktur, Schema) → `/architecture`
- [ ] Custom-Handler-Registry: Mechanismus + ob Handler client-/serverseitig (isomorph) laufen → `/architecture`
- [ ] Wie Modell B (sandboxed Definition-JS) später andockt → `/architecture`
- [ ] Repräsentation des rekursiven Datenmodells → `/architecture`
- [ ] Verhalten der Werte ausgeblendeter Felder (verwerfen vs. behalten) → `/architecture`
- [ ] Wird die Validierungslogik client+server geteilt? → `/architecture` (verbindliche Prüfung beim Absenden = PROJ-6)
- [ ] Generische Einreichungs-Speicherung als JSONB-Dokument pro Definition + Dispatch der Absende-Ziele → `/architecture`

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Engine ist definitionsgesteuert, nicht hartkodiert | Wiederverwendbares Grundgerüst ist das Produktziel; FlexCover nur Beispiel | 2026-06-18 |
| 3 Layout-Modi (Tabs/Wizard/Einseitig), Tabs = FlexCover-Standard | Abschnitte unabhängig; Reiter geben Überblick + Status | 2026-06-18 |
| Feldtyp-Katalog inkl. Datums-Picker | Deckt FlexCover + gängige Formulare ab | 2026-06-18 |
| Berechnungen + Plausibilität „in einfach" (deklarativ) | FlexCover-typische Summen/Prüfungen ohne Mini-Programmiersprache | 2026-06-18 |
| Erweiterung über benannte Handler (Modell A) jetzt; Modell B später | Volle JS-Mächtigkeit sicher (geprüfter Projektcode); kein unsicheres eval im MVP | 2026-06-18 |
| Verschachtelte Wiederholgruppen als Erstklasse-Fähigkeit | Vom Nutzer als Pflicht für künftige Formulare bestätigt | 2026-06-18 |
| Absenden über entkoppeltes Event + andockbare Ziele (PDF/DB/E-Mail/Webhook) | Daten-Weiterverarbeitung frei erweiterbar ohne Engine-Umbau | 2026-06-18 |
| Datei-Upload + gezeichnete Unterschrift ausgelagert (PROJ-12) | Binärdaten/Storage/DSGVO + Konflikt mit Anonym-Modell → bewusst eigenes Feature | 2026-06-18 |
| Tabelle-in-Tabelle weggelassen | Selten, hohe Komplexität; via Alternativen lösbar | 2026-06-18 |
| Kein visueller Form-Builder im MVP | Definitionen werden als JSON von Entwicklern erstellt | 2026-06-18 |

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
