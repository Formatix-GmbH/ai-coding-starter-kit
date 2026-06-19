# PROJ-5: PDF-Generierung & Download

## Status: Planned
**Created:** 2026-06-19
**Last Updated:** 2026-06-19

## Dependencies
- **Requires:** PROJ-3 (Dynamic Form Engine) — Submit-Event, Validierung, Sichtbarkeitslogik
- **Requires:** PROJ-11 (FlexCover-Definition) — liefert Felder/Struktur/Reihenfolge (XSD-konforme Daten)
- Funktioniert **anonym und eingeloggt** (kein Konto nötig); unabhängig von PROJ-4

## Überblick
Am Ende des Ausfüllprozesses erzeugt das Portal aus den erfassten Daten ein **originalgetreues PDF** des FlexCover-Antrags und bietet es zum **Download** an. „Originalgetreu" = **optisch gleichwertig** zum amtlichen Formular (gleiche Abschnitte, Beschriftungen, Anordnung, Logo, A4) mit korrektem **dynamischem Umbruch** der wachsenden Teile — nicht byte-identisch zur XFA-Datei.

Das **vollständige Formularbild** ist zwingend: alle per Sichtbarkeitslogik **aktiven** Felder erscheinen — ausgefüllt **oder leer** (wie das echte Formular). Ausgeblendete/irrelevante Felder bleiben weg (konsistent mit Variante A).

## User Stories
- Als **Antragsteller** möchte ich meinen vollständig ausgefüllten Antrag als PDF herunterladen, damit ich ihn archivieren/einreichen kann — ohne Adobe Acrobat.
- Als **Antragsteller** möchte ich, dass das PDF **wie das amtliche Formular** aussieht, damit es fachlich/behördlich akzeptiert wird.
- Als **anonymer Nutzer** möchte ich das PDF **ohne Konto** herunterladen können.
- Als **Antragsteller** möchte ich, dass das PDF erst nach erfolgreicher Prüfung entsteht, damit ich kein unvollständiges Dokument einreiche.
- Als **Betreiber** möchte ich die **PDF-Erzeugung austauschbar** halten, damit ich später von react-pdf auf einen anderen Renderer wechseln kann, ohne den Rest umzubauen.

## Out of Scope
- **Endgültige Einreichung/Persistenz** des Antrags, Löschen des Entwurfs nach Abgabe → **PROJ-6** (PDF-Download lässt den Entwurf unberührt)
- **PDF-Versand per E-Mail** → **PROJ-7**
- **Entwurfs-/Vorschau-PDF eines unvollständigen** Antrags (nur vollständig validiert im MVP)
- **Byte-identischer XFA-Nachbau** / direktes Befüllen der dynamischen XFA-Datei
- **Serverseitiges Rendern** (Chromium) und **iText/pdfXFA** — nur als dokumentierter **Eskalationspfad**, nicht im MVP
- **Koordinaten-Overlay** auf der Originalseite — nur Eskalations-Option
- Mehrsprachigkeit (PDF ist deutsch)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Auslöser & Validierung
- [ ] Angenommen ein vollständig und gültig ausgefülltes Formular, wenn der Nutzer die Abschluss-Aktion („Antrag als PDF herunterladen") auslöst, dann wird ein PDF erzeugt und der Browser-Download gestartet.
- [ ] Angenommen ein Formular mit fehlenden Pflichtfeldern oder Plausibilitätsfehlern, wenn der Nutzer die Abschluss-Aktion auslöst, dann wird **kein** PDF erzeugt, die Fehler werden angezeigt (Fehleranzahl je Tab) und die Eingaben bleiben erhalten.
- [ ] Angenommen ein nicht eingeloggter Nutzer, wenn er ein gültiges Formular abschließt, dann erhält er das PDF **ohne Anmeldung**.

### Inhalt & Originaltreue
- [ ] Angenommen das amtliche Layout, wenn das PDF erzeugt wird, dann enthält es alle 9 Abschnitte mit den korrekten Beschriftungen, Anordnung, Logo/Kopf und A4-Format.
- [ ] Angenommen das vollständige Formularbild, wenn ein sichtbares Feld leer geblieben ist, dann erscheint es **leer, aber vorhanden** im PDF (wie das echte Formular).
- [ ] Angenommen ein per Sichtbarkeitslogik **ausgeblendetes** Feld, wenn das PDF erzeugt wird, dann erscheint dieses Feld **nicht**.
- [ ] Angenommen Auswahl-/Ja-Nein-Felder, wenn das PDF erzeugt wird, dann ist die getroffene Auswahl korrekt markiert/ausgegeben.

### Dynamische Inhalte
- [ ] Angenommen mehrere „weitere Begünstigte", wenn das PDF erzeugt wird, dann werden alle Einträge vollständig dargestellt und brechen bei Bedarf auf Folgeseiten um.
- [ ] Angenommen viele Länderzeilen im „Einkauf nach Ländern", wenn das PDF erzeugt wird, dann werden alle Zeilen dargestellt und paginieren korrekt.
- [ ] Angenommen die festen 3-Jahres-Tabellen, wenn das PDF erzeugt wird, dann erscheinen die beschrifteten Zeilen × Berichtsjahre mit den eingegebenen Werten.
- [ ] Angenommen ein Dokument über mehrere Seiten, wenn das PDF erzeugt wird, dann tragen die Seiten eine Seitennummerierung (z. B. „Seite X von Y").

### Renderer-Kapselung & DSGVO
- [ ] Angenommen die PDF-Erzeugung, wenn sie aufgerufen wird, dann geschieht das über **eine gekapselte Schnittstelle** („Daten rein → PDF raus"), sodass der Renderer austauschbar ist (MVP: react-pdf; Eskalation: Chromium/iText) ohne Änderung des Aufrufers oder des Datenvertrags.
- [ ] Angenommen ein anonymer Nutzer im MVP (clientseitige Erzeugung), wenn das PDF erzeugt wird, dann verlassen die Formulardaten den Browser **nicht**.

### Fehlerfälle
- [ ] Angenommen die PDF-Erzeugung schlägt fehl, wenn der Nutzer die Aktion auslöst, dann erscheint eine verständliche Fehlermeldung, die Eingaben bleiben erhalten und ein erneuter Versuch ist möglich.

## Edge Cases
- **Sehr großer Antrag** (viele Begünstigte/Länder, lange Texte) → korrekte Paginierung, keine abgeschnittenen Inhalte.
- **Lange Freitexte/Umbrüche** in mehrzeiligen Feldern → Text bricht im PDF sauber um.
- **Sonderzeichen/Umlaute** (ä/ö/ü/ß, „flex&cover") → korrekt eingebettet (Font mit passender Glyphenabdeckung).
- **Schrift Myriad Pro nicht frei einbettbar** → freie, sehr ähnliche Ersatzschrift; Layout bleibt stabil.
- **Browser blockiert/behandelt Downloads speziell** → Standard-Download-Mechanismus; Dateiname gesetzt.
- **Flache Vorlage kann in der Build-Umgebung nicht gerendert werden** (kein `pdftoppm`) → Treue wird **manuell/fachlich** abgenommen (siehe Prozess unten), nicht automatisiert pixelverglichen.

## Technical Requirements (optional)
- **A4**, deutschsprachig, eingebettete Schriften (keine System-Font-Abhängigkeit).
- **DSGVO:** MVP erzeugt clientseitig → keine PII an den Server; kein PII in Logs. Eskalation auf serverseitige Renderer ändert das Datenschutzmodell und ist dann gesondert zu bewerten.
- **Dateiname:** sprechend mit Datum, z. B. `flexcover-antrag-JJJJ-MM-TT.pdf` (Detail final in `/frontend`).

## Treue-Abnahme (Prozess, wichtig)
„Originalgetreu" wird **vor** dem Vollausbau abgesichert:
1. **Treue-Prototyp** mit react-pdf: **eine feste Sektion + eine dynamische Liste** (z. B. Begünstigte) gegen die flache Vorlage `Antragsformular flex&cover_flat.pdf`.
2. **Fachliche/behördliche Freigabe** dieses Prototyps.
3. Erst danach die übrigen Abschnitte ausmodellieren.
**Treue-Kriterien:** alle Abschnitte/Beschriftungen vorhanden, Tabellen korrekt, dynamische Listen paginieren, Logo/Kopf passend, A4, Seitennummern. Werden diese mit react-pdf nicht erreicht → Eskalation (Chromium → iText/pdfXFA).

## Open Questions
- [ ] Reicht die mit react-pdf erreichbare Treue für die behördliche Abnahme? (Entscheidung am Prototyp.)
- [ ] Ist **Myriad Pro** einbettbar/lizenziert, oder Ersatzschrift? (Lizenz prüfen.)
- [ ] Logo-Asset: aus der flachen Vorlage extrahieren oder separate Datei in besserer Auflösung?
- [ ] Genauer Dateiname/Metadaten (Titel, Autor) — final in `/frontend`.
- [ ] Eskalations-Schwelle/Datenschutzmodell bei serverseitigem Rendern (Chromium/iText) — Details in `/architecture`, falls eskaliert wird.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Originalgetreues PDF (optisch gleichwertig), kein byte-identischer XFA-Nachbau | Behördliche Akzeptanz nötig; pixel-/byte-Identität zu dynamischem XFA praktisch unmöglich/unnötig | 2026-06-19 |
| Vollständiges Formularbild: alle sichtbaren Felder, leere inklusive | Entspricht dem amtlichen Formular und der behördlichen Erwartung | 2026-06-19 |
| PDF nur bei vollständig validiertem Antrag (Abschluss-Aktion) | Kein unvollständiges Einreichdokument; MVP endet mit korrektem PDF | 2026-06-19 |
| Anonym + eingeloggt, kein Konto nötig | Self-Service-Auth-Modell | 2026-06-19 |
| Entwurf bleibt beim PDF-Download unberührt | Einreichung/Entwurf-Löschung gehört zu PROJ-6 | 2026-06-19 |
| Treue-Prototyp + fachliche Freigabe vor Vollausbau | Layout nicht zweimal bauen; Risiko früh klären | 2026-06-19 |

### Technical Decisions
<!-- Verfeinerung in /architecture; hier die im Interview bewusst getroffenen Richtungsentscheidungen -->
| Decision | Rationale | Date |
|----------|-----------|------|
| **Renderer hinter austauschbarer Grenze** („Daten rein → PDF raus") | Späterer Wechsel ohne Umbau; Datenvertrag (XSD-konform) bleibt konstant | 2026-06-19 |
| **MVP-Renderer: `@react-pdf/renderer`, clientseitig** | Im Node/Next-Stack, keine Lizenzkosten, dynamischer Umbruch, **anonyme Daten bleiben lokal** (DSGVO) | 2026-06-19 |
| **Eskalationspfad: react-pdf → Headless-Chromium (server) → iText/pdfXFA (server, kommerziell)** | Steigende Treue gegen Aufwand/Kosten/Serverseitigkeit; nur bei Bedarf | 2026-06-19 |
| Original-PDF ist **dynamisches XFA** (`/NeedsRendering`, keine nutzbare AcroForm) → kein Direkt-Befüllen/Overlay der Originaldatei | Aus PDF-Analyse bestätigt | 2026-06-19 |
| Flache statische Vorlage `Antragsformular flex&cover_flat.pdf` (4 Seiten, kein XFA) = optische Referenz + Logo-Quelle (+ späterer Overlay-Hintergrund) | Vom Nutzer bereitgestellt; renderbar/statisch | 2026-06-19 |
| Schrift: eingebettete Schrift nutzen, sonst freie Ersatzschrift (Myriad Pro ggf. lizenzpflichtig) | Originaltreue vs. Lizenz/Einbettbarkeit | 2026-06-19 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
