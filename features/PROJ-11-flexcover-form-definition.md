# PROJ-11: FlexCover Formulardefinition

## Status: Architected
**Created:** 2026-06-18
**Last Updated:** 2026-06-18

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

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
