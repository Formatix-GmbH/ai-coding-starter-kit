# PROJ-3: Dynamic Form Engine

## Status: Architected
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
- [x] Custom-Handler-Registry: benannte Funktionen, **isomorph** (client+server) — geklärt (/architecture)
- [x] Modell B andockbar am einheitlichen HandlerRegistry-Aufruf — geklärt
- [x] Rekursives Datenmodell: verschachteltes Objekt, das die Definition spiegelt — geklärt
- [x] Ausgeblendete Felder: **nicht validiert & nicht gesendet** (Variante A) — geklärt
- [x] Validierung isomorph (Zod), serverseitig verbindlich in PROJ-6 — geklärt
- [x] Definition-Ablage: **Repo-Datei im MVP**, DB → PROJ-10 — geklärt
- [x] Einreichung als JSON-Dokument; Absende-Ziele via SubmitDispatcher — geklärt
- [ ] **Finales JSON-Schema der Definition** wird zu Beginn der Build-Phase (`/frontend`) festgeschrieben — Detailarbeit, kein Blocker

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
| react-hook-form als Zustands-Engine | Vorhanden; `useFieldArray` deckt (verschachtelte) Wiederholgruppen & dynamische Tabellen; `watch` treibt Sichtbarkeit/Berechnung | 2026-06-18 |
| Validierung: Zod **dynamisch aus der Definition** gebaut | Vorhandener Stack; isomorph (client+server); via `zodResolver` an RHF; zusammensetzbar für Verschachtelung | 2026-06-18 |
| Rekursiver NodeRenderer + Feldtyp-Register | Eine Stelle pro Feldtyp; Verschachtelung „kostenlos"; neuer Feldtyp = Register-Eintrag | 2026-06-18 |
| Deklarative Logik + benannte Handler (Modell A), isomorph | Einfache Fälle ohne Code; komplexe Logik als geprüfter TS-Code; gleiche Funktion client+server; kein `eval` | 2026-06-18 |
| Deutsche Zahlen/Währung über eingebautes `Intl` | Kein Zusatzpaket, konsistente Formatierung | 2026-06-18 |
| **Definition als Repo-Datei im MVP** (DB später → PROJ-10) | Einfachster, sicherer Start; Engine bleibt quellunabhängig (bekommt ein Definition-Objekt) | 2026-06-18 |
| **Ausgeblendete Felder: nicht validiert & nicht gesendet** | Keine Geister-Pflichtfelder; saubere Daten; DSGVO-Datenminimierung | 2026-06-18 |
| Rekursives Datenmodell (verschachteltes Objekt spiegelt Definition) | Ein- und Ausgabe identisch; beliebige Tiefe; als JSON persistierbar (PROJ-4/6) | 2026-06-18 |
| Keine neuen Pakete | RHF, zod, @hookform/resolvers, shadcn, Intl decken alles ab | 2026-06-18 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Grundidee
Die Engine ist ein **rekursiver Interpreter**: Sie liest eine **Definition** (Baum aus Abschnitten, Feldern, Gruppen, Tabellen) und baut daraus zur Laufzeit Formular, Validierung und Logik — kein formular-spezifischer UI-Code.

### A) Bausteine
```
FormEngine (bekommt eine Definition)
├── DefinitionLoader/Validator  → prüft, ob die Definition wohlgeformt ist
├── FormProvider (Zustand)       → react-hook-form hält alle Werte
├── LayoutRenderer               → Tabs | Wizard | Einseitig
│   └── SectionRenderer
│       └── NodeRenderer (REKURSIV) → je Knotentyp:
│            ├── FieldRenderer        → Feldtyp-Register (Text, Zahl, Währung, Auswahl, Ja/Nein, Datum …)
│            ├── RepeatGroupRenderer  → Instanzen (+/–), ruft NodeRenderer (Verschachtelung)
│            └── TableRenderer        → Raster (feste/dynamische Zeilen)
├── LogicEngine
│   ├── VisibilityEvaluator   → Sichtbarkeitsregeln aus den Werten
│   ├── CalculationEvaluator  → berechnete (read-only) Felder
│   └── ValidationBuilder     → baut Zod-Prüfregeln dynamisch aus der Definition
├── HandlerRegistry           → benannte JS/TS-Funktionen (Modell A), isomorph
└── SubmitDispatcher          → Gesamtvalidierung, strukturierte Daten, „abgesendet" + Absende-Ziele
```
Der **NodeRenderer ruft sich selbst auf** → verschachtelte Gruppen/Tabellen beliebiger Tiefe funktionieren automatisch.

### B) Die Definition (Konzept)
Baum aus Knoten mit Typ (`section`, `field`, `repeatGroup`, `table`) + Eigenschaften. Sichtbarkeit/Validierung/Berechnung stehen **deklarativ am Knoten** (`sichtbarWenn`, `pflicht`, `muster`, `berechne`); komplexe Fälle verweisen per Name auf einen **Handler** (`pruefe: "plausiSummeLaender"`). Das finale JSON-Schema wird zu Beginn der Build-Phase festgeschrieben.

### C) Datenmodell & Ablageort
- **Werte = Ausgabe**: verschachteltes Objekt, das die Definition spiegelt (Wiederholgruppen = Listen).
- **Definition im MVP**: versionierte **Datei im Projekt** (mit zugehörigen Handlern). DB-gestützt erst PROJ-10.
- **Persistenz**: Entwurf/Einreichung speichern dieses Objekt als **JSON-Dokument** (PROJ-4/6).
- **Ausgeblendete Felder**: nicht validiert, nicht im Ausgabe-Objekt enthalten.

### D) Technische Entscheidungen
Siehe Tabelle „Technical Decisions" oben.

### E) Abhängigkeiten
Keine neuen Pakete: `react-hook-form`, `zod`, `@hookform/resolvers`, shadcn (`tabs`, `select`, `radio-group`, `checkbox`, `input`, `textarea`), eingebautes `Intl`.

### F) Validierungs-Grenze (client/server)
Engine-MVP validiert clientseitig (Live-UX). Da Validierung aus **isomorpher** Zod-/Handler-Logik gebaut wird, kann **PROJ-6** dieselben Regeln serverseitig verbindlich erneut anwenden.

### G) Erweiterungsstellen (reserviert)
- **Modell B** (sandboxed JS in Definition): andockbar am einheitlichen `HandlerRegistry`-Aufruf.
- **Absende-Ziele** (PDF/DB/E-Mail/Webhook): `SubmitDispatcher` ruft registrierte Konnektoren nach Definition; neues Ziel = neuer Konnektor.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
