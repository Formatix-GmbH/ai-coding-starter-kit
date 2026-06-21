# PROJ-11: FlexCover Formulardefinition

## Status: Approved
**Created:** 2026-06-18
**Last Updated:** 2026-06-19

## Dependencies
- **Requires:** PROJ-3 (Dynamic Form Engine)
- **Requires (kleine Engine-Erweiterung):** Vergleichsoperatoren `gt/gte/lt/lte` in `Condition` (für Sichtbarkeit wie `anzahlStandorteAusland > 0`) — zu Beginn der Build-Phase ergänzen
- Optional: PROJ-1/PROJ-2 nur für späteres Speichern/Versenden (anonymes Ausfüllen braucht keinen Login)

## Quellen-Aufteilung (wichtig)
- **XSD** (`flexcover_antrag_X.xsd`) = autoritativ für **Namen + Hierarchie** → bestimmt die **Ausgabe-Struktur** (XSD-konformes Datenkontrakt). XSD-Typen sind nur grob und **nicht** maßgeblich für die UI.
- **XDP** (`Antragsformular_flexcover-2.0.xdp`) = autoritativ für **Feldtypen, Beschriftungen, Validierungen, Sichtbarkeits-/Pflichtlogik** (`<ui>`, `<picture>`, `<caption>`, `<validate>`, `<script>`).

## User Stories
- Als Antragsteller möchte ich den FlexCover-Förderantrag als modernes Webformular ausfüllen, damit ich kein Adobe Acrobat brauche
- Als Antragsteller möchte ich, dass nur relevante Felder erscheinen (abhängig von meinen Antworten), damit das lange Formular überschaubar bleibt
- Als Antragsteller möchte ich klare Validierung pro Abschnitt, damit ich Fehler früh erkenne
- Als Betreiber möchte ich, dass die erfassten Daten **XSD-konform** strukturiert sind, damit sie später als XML in bestehende Systeme exportierbar sind
- Als Entwickler möchte ich, dass FlexCover **nur als Definition** existiert (kein Formular-Spezialcode), damit die Engine sich als Grundgerüst beweist

## Out of Scope
- Engine-Funktionalität selbst → PROJ-3 (hier nur Definition + ggf. benannte Handler)
- PDF-Erzeugung/Download → PROJ-5 · Entwurf/Auto-Save → PROJ-4 · Einreichung/Persistenz → PROJ-6
- XML-Export (XSD-konforme Ausgabe → XML-Datei) → späteres Feature
- Datei-Upload & gezeichnete Unterschrift → PROJ-12 (Unterschrift hier als **Text** wie in XSD)
- Kosmetische XFA-Eigenheiten (Seitenzahlen, Relayout, Druck-Layout) — nicht relevant fürs Web
- Komplexe/erzwungene Berechnungen — XDP enthält praktisch keine (1 `calculate`)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

**Struktur & Felder**
- [ ] Angenommen die Definition ist geladen, wenn das Formular rendert, dann erscheinen alle 9 Abschnitte (Ansprechpartner, Unternehmen, Sitz & Bedeutung, F&E, Investitionen, Beschäftigte, Ausbildung, Sourcing/Wertschöpfung, Sonstiges) als Tabs
- [ ] Angenommen die XDP-Felddefinition, wenn ein Feld rendert, dann entspricht sein **Engine-Feldtyp der XDP** (z.B. numericEdit mit Währungsformat → `currency`, Datumsfeld → `date`, choiceList → `select`), während **Name/Verschachtelung der XSD** folgen
- [ ] Angenommen der Pflicht-Status, wenn ein Feld rendert, dann folgt „Pflicht" aus XDP-`mandatory`/`validate` (ersatzweise XSD `minOccurs`)
- [ ] Angenommen Beschriftungen aus den XDP-`<caption>`, wenn Felder rendern, dann tragen sie die fachlich korrekten Labels
- [ ] Angenommen Auswahlfelder (Anrede, Unternehmenstyp, Ja/Nein, Deutschland/Ausland), wenn sie rendern, dann bieten sie die korrekten Optionen

**Dynamische Sichtbarkeit & bedingte Pflicht**
- [ ] Angenommen `weitereBeguenstigte` = Ja, wenn gewählt, dann erscheint die Wiederholgruppe „Begünstigter"
- [ ] Angenommen ein Flag (z.B. `verlagerung`, `strukturschwach`, `kooperationDE`) = Ja, wenn gewählt, dann erscheint das zugehörige Beschreibungsfeld und ist dann Pflicht
- [ ] Angenommen `anzahlStandorteAusland` > 0, wenn eingegeben, dann erscheinen die abhängigen Standort-Felder und sind dann Pflicht
- [ ] Angenommen ein Detailfeld ist ausgeblendet, wenn abgesendet wird, dann blockiert es die Abgabe nicht

**Wiederholgruppen & Tabellen**
- [ ] Angenommen „Begünstigter", wenn der Nutzer hinzufügt/entfernt, dann lassen sich mehrere Begünstigte erfassen
- [ ] Angenommen die 3-Jahres-Tabellen (Beschäftigte, Ausbildung, Wertschöpfung), wenn sie rendern, dann erscheinen feste, beschriftete Zeilen × Jahresspalten
- [ ] Angenommen „Einkauf nach Ländern", wenn der Nutzer Zeilen hinzufügt, dann lassen sich beliebig viele Länder erfassen

**Validierung & Ausgabe**
- [ ] Angenommen Standard-Validierungen (PLZ-Muster, E-Mail, Jahr, Pflichtfelder), wenn verletzt, dann erscheinen Meldungen, und fehlerhafte Tabs zeigen die Fehleranzahl
- [ ] Angenommen ein vollständig korrekt ausgefülltes Formular, wenn abgesendet wird, dann ist die Ausgabe **XSD-konform** strukturiert (Element-Namen/Verschachtelung wie `flexcover_antrag_X.xsd`)

**Anonym**
- [ ] Angenommen ein nicht eingeloggter Nutzer, wenn er das Formular öffnet und ausfüllt, dann ist dafür kein Login nötig

## Edge Cases
- Flag wird von Ja auf Nein geändert, nachdem das Beschreibungsfeld ausgefüllt wurde → Feld ausgeblendet, Wert nicht in der Ausgabe (Variante A)
- `anzahlStandorteAusland` von >0 auf 0 → abhängige Felder verschwinden, keine Pflicht mehr
- Begünstigter entfernen → verbleibende Instanzen bleiben konsistent (optional: Bestätigungsdialog vor dem Entfernen, wie im XFA)
- Sehr viele Länder-Zeilen / Begünstigte → Formular bleibt bedienbar
- Unterschrift/Ort_Datum als Textfelder (kein gezeichnetes Signaturfeld im MVP)
- XDP-Feldtyp mehrdeutig → nächstpassender Engine-Typ (XDP-Format/Validierung disambiguiert meist); im Zweifel Rückfrage

## Open Questions
- [ ] Vollständige Label-Liste aus den XDP-`<caption>` beim Build extrahieren (Detailarbeit)
- [ ] Wenige XFA-Spezialvalidierungen prüfen, ob deklarativ abbildbar oder Custom-Handler nötig (Erwartung: fast alles deklarativ)
- [ ] Optional: Bestätigungsdialog beim Entfernen einer Wiederhol-Instanz (XFA hat ihn) — MVP ja/nein?
- [x] Kalenderjahr-Eingabe je 3-Jahres-Tabelle (XSD `jahr1/2/3`) — geklärt (QA BUG-2): drei Berichtsjahr-Felder je Tabelle ergänzt.
- [x] Zeilenbeschriftungen der Tabellen Azubis/Wertschoepfung — geklärt (QA BUG-1): je 1 Zeile (vom User bestätigt).
- [x] Route-Name: `/antrag/flexcover` (zukunftssicher für Multi-Form) — geklärt

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Ausgabe XSD-konform (Element-Namen/Struktur) | Interoperabilität; verlustfreier XML-Export später | 2026-06-18 |
| **Feldtypen aus XDP, Name/Struktur aus XSD** | XSD trägt nur grobe Typen; XDP hat die echten UI-Typen/Formate | 2026-06-18 |
| Vollständige Reproduktion aller 9 Abschnitte | FlexCover ist der Härtetest der Engine | 2026-06-18 |
| Labels aus XDP-`<caption>`, Logik aus XDP-Scripts | Echte Quelle statt Raten | 2026-06-18 |
| Sichtbarkeit inkl. Zahlenvergleich → Engine-Operatoren `gt/gte/lt/lte` (Variante A) | Häufiges Muster; generisch in der Engine besser als Custom-Handler | 2026-06-18 |
| Keine erzwungenen Berechnungen | XDP enthält praktisch keine (1 `calculate`) | 2026-06-18 |
| Unterschrift als Textfeld | Entspricht XSD; gezeichnete Unterschrift = PROJ-12 | 2026-06-18 |
| Layout = Tabs | FlexCover-Standard (aus PROJ-3) | 2026-06-18 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Engine um Vergleichsoperatoren `gt/gte/lt/lte` erweitern | FlexCover braucht Zahlenvergleich für Sichtbarkeit (`anzahlStandorteAusland > 0`); generisch wiederverwendbar | 2026-06-18 |
| Definition als typisiertes TS-Modul (`src/lib/forms/flexcover/definition.ts`) | Compile-Zeit-Sicherheit gegen FormDefinition; refactoring-fest | 2026-06-18 |
| Ablage unter `src/lib/forms/flexcover/` (Definition + Handler) | Trennt „Formulare" (Definitionen) klar von „Engine" | 2026-06-18 |
| Route `/antrag/flexcover`, anonym zugänglich | Auth-Modell (Ausfüllen ohne Login); zukunftssicher für Multi-Form | 2026-06-18 |
| Submit zeigt vorerst Bestätigung | PDF/Persistenz = PROJ-5/6; Engine-Submit-Event ist die Andockstelle | 2026-06-18 |
| Keine neuen Pakete | Engine + Operator-Erweiterung genügen | 2026-06-18 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
Konfiguration auf der Engine, kein neuer Engine-Kern. Es entstehen: (1) kleine Engine-Erweiterung (Vergleichsoperatoren), (2) FlexCover-Definition (XSD-konforme Keys; Typen/Labels/Logik aus XDP), (3) Seite, die das Formular rendert.

### A) Bausteine
```
src/lib/form-engine/conditions  → + Operatoren gt/gte/lt/lte
src/lib/forms/flexcover/
├── definition.ts   → FlexCover-FormDefinition (typisiert)
└── handlers.ts     → HandlerRegistry (voraussichtlich leer/minimal)
src/app/antrag/flexcover/page.tsx
└── <FormEngine definition={flexcover} /> (anonym); verlinkt von Landing + Dashboard
```

### B) XDP → Engine-Feldtyp (Übersetzungstabelle)
| XDP-Quelle | Engine-Feldtyp |
|---|---|
| `textEdit` einzeilig | `text` |
| `textEdit` `multiLine` | `textarea` |
| `numericEdit` / Zahl-`picture` | `integer` / `decimal` |
| Zahl-`picture` Währung | `currency` |
| Zahl-`picture` Prozent | `percent` |
| `dateTimeEdit` | `date` |
| Jahr (YYYY) | `year` |
| `choiceList` | `select` |
| `checkButton` in `exclGroup` | `yesno` |
| einzelner `checkButton` | `checkbox` |
| E-Mail/PLZ (Name/Validierung) | `email` / `plz` |

Name/Verschachtelung ← XSD; Typ/Label/Logik ← XDP.

### C) Übersetzungs-Vorgehen (Build)
Abschnittsweise: XDP-Felder (caption, ui, picture, validate, script) → XSD-Namen → Engine-Knoten. Sichtbarkeits-Skripte → deklarative `visibleWhen` (Flag=Ja → `eq`; Zahl>0 → `gt`); bedingte Pflicht = `required` + `visibleWhen`. Sehr wenige Sonderfälle als benannte Handler.

### D) Datenmodell
Ausgabe = verschachteltes JSON in XSD-Struktur (`Ansprechpartner.email`, `Investitionen.Invest.jahr1`, `Unternehmen.Beguenstigter[]` …).

### E) Absenden
Vorerst Bestätigung; PDF-Download (PROJ-5) dockt am Submit-Event an.

### F) Abhängigkeiten
Keine neuen Pakete.

## Implementation Notes (Frontend, 2026-06-19)

**Engine-Erweiterung (PROJ-3, Voraussetzung):** `Condition` um Operatoren `gt/gte/lt/lte` ergänzt (`types.ts`, `conditions.ts`) inkl. deutscher Zahlen-Parsing-Logik (leere/ungültige Werte → Vergleich false). 5 neue Unit-Tests in `conditions.test.ts` (gesamt grün).

**Definition:** `src/lib/forms/flexcover/definition.ts` — typisiertes `FormDefinition`-Modul, alle 9 Abschnitte als Tabs. Namen/Hierarchie aus XSD, Feldtypen/Labels aus XDP (`<caption>`, `<picture>`, `<ui>`, exclGroups). DRY-Helfer für Ja/Nein-Felder, bedingte Beschreibungsfelder und 3-Jahres-Tabellen.

**Keine Custom-Handler nötig:** Sämtliche Logik (Sichtbarkeit, bedingte Pflicht, Zahlenvergleich) ist deklarativ abbildbar — `handlers.ts` wurde bewusst **nicht** angelegt. Das belegt die Tragfähigkeit der Engine als Grundgerüst. (XDP hatte 0 erzwungene Berechnungen, alle Sichtbarkeits-Skripte → `visibleWhen`.)

**Sichtbarkeits-/Pflichtlogik (aus XDP-Skripten abgeleitet):**
- Flag=Ja → zugehöriges Beschreibungsfeld sichtbar **und** Pflicht: `geaenderteEigentuemersruktur`, `strukturschwach`, `regionaleBedeutung`, `steuerpflichtDE`(*), `verlagerung`, `kooperationDE`, `kooperationBildung`, `veraenderungenBeschaeftigte`.
- `anzahlStandorteAusland > 0` (neuer `gt`-Operator) → `StandorteNeu` + `Begruendung` sichtbar + Pflicht.
- `weitereBeguenstigte=Ja` → Wiederholgruppe `Beguenstigter` (Firmierung/Sitz/Personen-Nr. pflicht).

**Route:** `src/app/antrag/flexcover/page.tsx` (anonym; nur `/dashboard` ist in der Middleware geschützt). Die Engine liefert dem `onSubmit` bereits XSD-konform strukturierte, von ausgeblendeten Feldern bereinigte Werte (Variante A); die Seite zeigt nur einen Bestätigungs-Toast (kein Logging → DSGVO). PDF/Download dockt am Submit an (PROJ-5). „Antrag starten" auf Landing + Dashboard verlinkt hierher.

**3-Jahres-Tabellen (nach QA-Fix BUG-2):** Jeder XSD-Container (z. B. `Tabelle_DE`, `Invest`, `Einkauf`) ist eine `group` mit drei Berichtsjahr-Feldern `jahr1/jahr2/jahr3` (XSD-konform, flach) + einer Wertematrix unter `werte` (feste Zeilen × Spalten `sp1/sp2/sp3`). Bei `Einkauf` ist die dynamische Länderliste die XSD-`Laender[]`. Die Berichtsjahre stehen über die neue Engine-Option `GroupNode.inline` nebeneinander.

**Neue Engine-Optionen (PROJ-3):** `GroupNode.inline` (Feld-Kinder im Raster nebeneinander, übrige Kinder volle Breite); `TableView` rendert den Titel nur bei nicht-leerem `label`.

**Dokumentierte Abweichungen vom XSD (bewusst):**
1. **3-Jahres-Tabellen-Zellnotation:** XSD notiert die Matrixzellen flach (`Z1SP1`, `maDE1`). Die Engine liefert die semantisch identische Verschachtelung `werte.{zeile}.{spalte}` unter dem korrekten Container-Namen. Die flache Notation ist eine 1:1-mechanische Umformung beim späteren **XML-Export** (eigenes Feature). Container-Namen + Berichtsjahre (`jahr1/2/3`) sind XSD-konform.
2. **`StandorteNeu`/`Begruendung`** sind echte XDP-Felder, aber nicht in der XSD. Sie sind in der AC ausdrücklich gefordert und erscheinen daher in der Ausgabe unter `SitzUndBedeutung` (kleine, bewusste Erweiterung).
3. **`weitereAnmerkungen`** — ~~weggelassen~~ **nachträglich aufgenommen (2026-06-21, im Zuge von PROJ-5/Option 3):** je Abschnitt außer „Sonstiges" ein Textfeld am Ende (im Web-Formular erfassbar + im originalgetreuen PDF). Nicht in der XSD → bewusste Erweiterung wie `StandorteNeu`. Umsetzung: Schleife am Ende von `definition.ts`.
4. **Boolesche XSD-Felder** werden als `yesno_optional` ("Ja"/"Nein") erfasst statt `true/false`; Mapping auf `xs:boolean` erfolgt beim XML-Export.

**Verifikation (nach Bugfixes):** `tsc --noEmit` ✓, ESLint ✓, `vitest run` 47/47 ✓, `playwright test` 64/64 ✓, `npm run build` ✓.

### Offene Punkte aus dem Build
- „Gesamtzahl Beschäftigte über alle Bereiche" (Summenzeile im XFA) ist nicht persistiert (XSD kennt nur Z1–Z4) — bewusst weggelassen.
- BUG-4 (Low, offen): Labels einiger optionaler Felder (`investBeispiele*`, `investAusblick`, `ausblickAusbildung`, `wertschoepfungBerechnung`) hatten im XDP keine `<caption>` — frei formuliert, fachlich gegenlesen.

## QA Test Results

**Getestet:** 2026-06-19 · **Tester:** QA (automatisiert + Code-Audit) · **Build:** `4275e43`
**Umgebung:** Chromium (Desktop) + Mobile Safari (iPhone 13), Next 16 Dev-Server.

### Zusammenfassung
- **Acceptance Criteria:** 14 von 14 bestanden.
- **Automatisierte Tests (nach Bugfixes):** 47 Unit (Vitest) + 64 E2E (Playwright, beide Browser) — **alle grün**.
- **Bugs:** 0 Critical · 0 High · 2 Medium · 2 Low → **BUG-1/2/3 behoben** (Folge-`/frontend`), BUG-4 (Low) offen.
- **Produktionsreife:** ✅ **READY** (keine Critical/High).

### Acceptance Criteria (Detail)
| # | Kriterium | Ergebnis | Nachweis |
|---|-----------|----------|----------|
| 1 | 9 Abschnitte als Tabs | ✅ | E2E „rendert alle 9 Abschnitte" |
| 2 | Engine-Feldtyp folgt XDP (select/currency/date/…) | ✅ | E2E Anrede-Select; Code-Review Typmapping |
| 3 | Pflicht aus XSD `minOccurs` | ✅ | E2E leeres Absenden; Unit-Output |
| 4 | Labels aus XDP-`<caption>` | ✅ | Code-Review; sichtbare Captions |
| 5 | Auswahloptionen korrekt (Anrede/Typ/Ja-Nein/DE-Ausland) | ✅ | E2E Anrede; Code-Review |
| 6 | `weitereBeguenstigte`=Ja → Wiederholgruppe | ✅ | E2E „Wiederholgruppe" |
| 7 | Flag=Ja → Beschreibungsfeld sichtbar + Pflicht | ✅ | E2E „Verlagerung = Ja" |
| 8 | `anzahlStandorteAusland`>0 → abhängige Felder (gt) | ✅ | E2E „Zahlenvergleich (gt)" |
| 9 | Ausgeblendetes Detailfeld blockiert Abgabe nicht | ✅ | E2E „blockiert die Abgabe nicht" |
| 10 | Begünstigte hinzufügen/entfernen | ✅ | E2E Wiederholgruppe |
| 11 | 3-Jahres-Tabellen: feste Zeilen × Jahresspalten | ✅ | E2E „feste 3-Jahres-Tabelle" |
| 12 | Einkauf nach Ländern: Zeilen hinzufügen | ✅ | E2E „dynamische Tabelle" |
| 13 | Standard-Validierung + Tab-Fehlerzähler | ✅ | E2E Validierung + PLZ |
| 14 | XSD-konforme Ausgabe-Struktur | ✅ | Unit „Ausgabe ist XSD-konform verschachtelt" |
| — | Anonym ohne Login | ✅ | E2E „anonymer Zugriff" |

### Edge Cases
- Flag Ja→Nein nach Befüllen → Wert wird aus Ausgabe entfernt (Variante A): ✅ Unit „blendet versteckte Felder aus".
- `anzahlStandorteAusland` >0 → 0 → abhängige Felder verschwinden: ✅ E2E.
- Leeres `gt`-Feld → Bedingung false (kein Crash): ✅ Unit (`conditions.test.ts`).
- Viele Begünstigte/Länder: bedienbar (keine feste Obergrenze gesetzt): ✅ manuell/Code-Review.

### Security / DSGVO-Audit (Red Team)
- **Anonyme, reine Client-Seite** — kein API-/DB-Zugriff, keine Auth zu umgehen; Route korrekt **nicht** in `PROTECTED_PREFIXES`. ✅
- **XSS:** alle Werte React-controlled, Labels statisch aus der Definition, kein `dangerouslySetInnerHTML`. Kein Injection-Sink. ✅
- **Secrets/Netzwerk:** beim Absenden kein Netzwerkverkehr; keine PII verlässt den Browser. ✅ (DSGVO-Datenminimierung erfüllt) — siehe aber BUG-3.

### Bugs / Findings
| ID | Sev. | Beschreibung | Status |
|----|------|--------------|--------|
| BUG-1 | Medium | Tabellen-Zeilenlabels für **Azubis** und **Wertschoepfung** waren Platzhalter (4 Bereiche). XDP-Analyse + User bestätigt: je **1 Zeile**. | ✅ behoben (`AZUBI_ROWS`/`WERTSCHOEPFUNG_ROWS`) |
| BUG-2 | Medium | Kalenderjahr-Werte (XSD `jahr1/2/3`) wurden nicht erfasst. | ✅ behoben (3 Berichtsjahr-Felder je Tabelle, `GroupNode.inline`) |
| BUG-3 | Low | Submit-Handler `console.log`te Formulardaten (PII) in die Konsole. | ✅ behoben (Logging entfernt) |
| BUG-4 | Low | Frei formulierte Labels (`investBeispiele*`, `investAusblick`, `ausblickAusbildung`, `wertschoepfungBerechnung`) mangels XDP-`<caption>` — fachlich gegenlesen. | offen |

### Neue Testdateien
- `tests/PROJ-11-flexcover.spec.ts` — 11 E2E-Tests (× 2 Browser).
- `src/lib/forms/flexcover/definition.test.ts` — 5 Unit-Tests (XSD-Struktur, Pruning, gt-Bedingung).

## Deployment
_To be added by /deploy_

## Deployment
_To be added by /deploy_
