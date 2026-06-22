# PROJ-5: PDF-Generierung & Download

## Status: Approved
**Created:** 2026-06-19
**Last Updated:** 2026-06-22

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
- **Arial nicht frei einbettbar** → metrisch-kompatible freie Ersatzschrift (Arimo / Liberation Sans, optisch identisch); Layout bleibt stabil.
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
- [ ] **Arial** lizenziert einbettbar, oder metrisch-kompatibles freies Pendant (Arimo/Liberation Sans)? (Lizenz prüfen.)
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
| Zielschrift **Arial**; bei Lizenzunsicherheit metrisch-kompatibles freies Pendant (Arimo/Liberation Sans) | Arial entspricht den XDP-Captions; freie Pendants sind optisch identisch und einbettbar | 2026-06-19 |
| **Dediziertes FlexCover-PDF-Layout** hinter generischer Renderer-Grenze (kein generisches Auto-Layout) | Echte Originaltreue ist je Amtsformular spezifisch; Grenze bleibt wiederverwendbar | 2026-06-19 |
| **Eingabe = `pruneHiddenValues`-Ausgabe** (Engine `onSubmit`) | Liefert genau „alle sichtbaren Felder inkl. leer, ohne ausgeblendete" | 2026-06-19 |
| Clientseitig, keine Persistenz; Blob → Browser-Download | DSGVO-Datenminimierung; MVP endet mit PDF | 2026-06-19 |
| Neues Paket `@react-pdf/renderer` (+ Schrift-/Logo-Asset) | Clientseitige PDF-Erzeugung mit dynamischem Umbruch | 2026-06-19 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
Rein **clientseitige** PDF-Erzeugung beim Abschließen des Formulars — kein Backend, keine Persistenz, keine PII an den Server. Die Erzeugung liegt hinter **einer austauschbaren Grenze** („Daten rein → PDF raus"). Im MVP steckt dahinter ein **react-pdf-Adapter** mit einer **dediziert nachgebauten FlexCover-Vorlage** (originalgetreu zur flachen Referenzseite). Spätere Renderer (Chromium, iText) docken an derselben Grenze an.

### A) Bausteine (Struktur)
```
Formularseite /antrag/flexcover (FlexCoverAntrag, schon vorhanden)
└── Abschluss-Aktion „Antrag absenden / als PDF herunterladen"
    └── FormEngine validiert (Pflicht + Plausibilität, Fehler je Tab)
        gültig → onSubmit liefert bereinigte Werte (pruneHiddenValues:
        alle sichtbaren Felder inkl. leer, ausgeblendete entfernt)
        │
        ▼
   PDF-Grenze (Port)  „generateFlexcoverPdf(werte) → PDF-Bytes"
   └── MVP-Adapter: react-pdf
       ├── FlexCover-PDF-Layout (dedizierte Vorlage = amtliches Bild)
       │   ├── Kopf/Logo, Abschnittsüberschriften (alle 9)
       │   ├── Feldzeilen (Beschriftung + Wert, leer = leeres Feld)
       │   ├── feste 3-Jahres-Tabellen (Zeilen × Berichtsjahre)
       │   ├── dynamische Listen (Begünstigte, Länder) → Umbruch/Folgeseiten
       │   └── Seitennummern „Seite X von Y"
       ├── Assets: eingebettete Schrift + Logo (aus flacher Referenz)
       └── liefert PDF-Bytes
        │
        ▼
   Download im Browser (Dateiname flexcover-antrag-JJJJ-MM-TT.pdf)

Eskalationspfad (gleiche Grenze, anderer Adapter):
   react-pdf (client)  →  Headless-Chromium (server)  →  iText/pdfXFA (server)
   – Aufrufer + Datenvertrag bleiben gleich; bei Server-Adaptern ändert sich
     das Datenschutzmodell (PII verlässt den Browser → gesondert bewerten).
```

### B) Datenmodell (Klartext)
- **Keine Datenbank, keine Persistenz.** Eingabe der PDF-Grenze = das **bereinigte Werte-Objekt** der Engine (XSD-konform verschachtelt; alle **sichtbaren** Felder, leere als leer; ausgeblendete entfernt — exakt die `pruneHiddenValues`-Ausgabe, die `onSubmit` bereits liefert).
- **Beschriftungen/Struktur** des PDF stammen aus der **dedizierten FlexCover-Vorlage** (am amtlichen Bild orientiert), Werte werden per Feldpfad eingesetzt.
- **Assets** (Logo-Bild, Schrift) sind in der App gebündelt; das Logo wird aus `Antragsformular flex&cover_flat.pdf` gewonnen.
- Ergebnis ist eine **flüchtige Datei** (Blob) im Browser → Download; danach nichts gespeichert.

### C) Wichtige Tech-Entscheidungen (Begründung)
- **Clientseitig mit react-pdf:** im Node/Next-Stack, keine Lizenzkosten, dynamischer Umbruch — und **anonyme Daten bleiben lokal** (DSGVO-Datenminimierung).
- **Generische Renderer-Grenze + dediziertes FlexCover-Layout:** die Grenze ist wiederverwendbar/austauschbar; das Layout ist je amtlichem Formular eigen (echte Originaltreue ist nicht generisch ableitbar). Ein generisches Auto-Layout ist bewusst **nicht** das Ziel.
- **`pruneHiddenValues` als Eingabe wiederverwenden:** liefert genau „alle sichtbaren Felder inkl. leer, ohne ausgeblendete" — passt 1:1 zum geforderten vollständigen Formularbild.
- **Schrift eingebettet:** kein Verlass auf System-Fonts; **Arial** als Zielschrift, bei Lizenzunsicherheit metrisch-kompatibles freies Pendant (**Arimo / Liberation Sans**, optisch identisch).
- **Eskalation ohne Umbau:** nur der Adapter hinter der Grenze wird getauscht; Auslösung, Validierung, Datenaufbereitung, Download-Verdrahtung bleiben.

### D) Auslösung & Fehler
- Die bestehende Abschluss-Aktion ersetzt den bisherigen Platzhalter-Toast: bei **gültigem** Formular → Grenze aufrufen → Download; bei **ungültigem** → Fehleranzeige (Tabs), kein PDF.
- **Fehler bei der Erzeugung** → verständliche Meldung, Eingaben bleiben, erneuter Versuch möglich.
- **Entwurf (PROJ-4)** bleibt unberührt (Löschen erst bei echter Einreichung, PROJ-6).

### E) Abhängigkeiten
- **Neu:** `@react-pdf/renderer` (clientseitige PDF-Erzeugung). Plus ggf. eine **Schriftdatei** (frei einbettbar) und ein **Logo-Bild** (aus der flachen Referenz extrahiert).
- Keine Server-/DB-Abhängigkeiten im MVP.

### F) Hinweis zur Treue-Abnahme
Die flache Referenz lässt sich in der Build-Umgebung nicht automatisch rendern (kein `pdftoppm`) → **menschliche/fachliche Abnahme** am Prototyp (siehe „Treue-Abnahme" oben). Die Entwicklung rendert lokal gegen `Antragsformular flex&cover_flat.pdf`.

## Implementation Notes (Frontend, 2026-06-21)

**Renderer-Grenze:** `src/lib/pdf/index.ts` — `generateFlexcoverPdf(values) → Blob` (+ `flexcoverPdfFilename()`). Austauschbar: aktueller Adapter = `@react-pdf/renderer` (^4.5.1), clientseitig. Wechsel auf Chromium/iText tauscht nur diese Implementierung; Datenvertrag (bereinigte Engine-Werte) bleibt.

**Layout:** `src/lib/pdf/flexcover/document.tsx` — dediziertes, originalgetreues FlexCover-Layout über **alle 9 Abschnitte**: amtliches Kopf-Banner (Seite 1), Label+Linien-Felder, zweispaltige Felder (PLZ/Ort, Standorte), Ja/Nein- und DE/Ausland-Auswahl mit Radio-Markierung, die 3-Jahres-Tabellen (Beschäftigte DE/AUS inkl. berechneter „Gesamtzahl"-Zeile; F&E Mitarbeiter/Aufwendungen; Investitionen; Azubis; Wertschöpfung), dynamische Begünstigten-Boxen + Länder-Tabelle, Unterschrift/Ort-Datum, Fußzeile „Seite X von Y". Eingabe = `pruneHiddenValues`-Ausgabe (sichtbare Felder inkl. leer; ausgeblendete fehlen → erscheinen nicht).

**Assets:** `public/pdf/flexcover-header.png` (amtliches Banner, aus der flachen Vorlage gerendert/zugeschnitten, RGB). Schrift: Helvetica (Arial-ähnlich, eingebaut) — exaktes Arial via Arimo-Einbettung als Folgeschritt offen.

**Auslösung:** `FlexCoverAntrag` Submit → bei gültigem Antrag PDF erzeugen + Download (dynamischer Import von `@/lib/pdf`, damit react-pdf nur im Browser bei Klick lädt). Fehler → Toast, Eingaben bleiben.

**PROJ-11-Erweiterung (Option 3):** „Weitere Anmerkungen" je Abschnitt (außer Sonstiges) ins Formular aufgenommen (`definition.ts`), erscheint im Web-Formular und im PDF. Nicht in der XSD → bewusste Erweiterung (wie StandorteNeu). Siehe auch PROJ-11.

**Treue-Methode:** Vorlage in der Build-Umgebung via Poppler (`pdftoppm`) zu PNG gerendert und visuell gegen `Antragsformular flex&cover_flat.pdf` (4 Seiten) abgeglichen; Layout vom Nutzer freigegeben (Linienstärke angepasst).

**Verifikation:** `tsc` ✓, ESLint ✓, `vitest run` 84/84 ✓, `playwright test` 70/70 ✓, `npm run build` ✓.

**Offen:** Arial-Einbettung (Arimo) für exakte Schrift; finale fachliche/behördliche Treue-Abnahme; Dateiname/Metadaten-Feinschliff. → für `/qa` bzw. Folgeschliff.

## QA Test Results

**Getestet:** 2026-06-22 · **Tester:** QA (automatisiert + visueller Treue-Abgleich + Audit) · **Build:** `d6f95f3`
**Umgebung:** Chromium + Mobile Safari, Next 16 Dev-Server, Poppler-Render gegen die flache Vorlage.

### Zusammenfassung
- **Acceptance Criteria:** alle erfüllt.
- **Automatisierte Tests:** 88 Unit/Integration (Vitest) + 74 E2E (Playwright, beide Browser) — **alle grün** (E2E mit vorgewärmtem Dev-Server). Neu: `src/lib/pdf/flexcover/document.test.tsx` (4: gültiges PDF, leere/Lückendaten, dynamische Listen), `tests/PROJ-5-pdf.spec.ts` (2×2: Download-Flow, Validierungssperre).
- **Bugs:** 0 Critical · 0 High · 0 Medium · 2 Low → **BUG-1 behoben** (Arimo eingebettet); BUG-2 (externe Treue-Abnahme) offen.
- **Produktionsreife:** ✅ **READY** (keine Critical/High).

### Acceptance Criteria (Detail)
| Bereich | Ergebnis | Nachweis |
|---|---|---|
| Gültiger Antrag → PDF-Download | ✅ | E2E „gültiger Antrag erzeugt PDF-Download" (prüft Dateiname + `%PDF`) |
| Ungültig → kein PDF, Fehler, Eingaben bleiben | ✅ | E2E „unvollständiger Antrag … Validierungsfehler" |
| Anonym ohne Login | ✅ | E2E (kein Auth-Kontext) |
| 9 Abschnitte, Labels, Logo, A4 | ✅ | Visueller Abgleich (Poppler) Seiten 1–4 |
| Sichtbare leere Felder erscheinen leer | ✅ | Visuell + Unit (leere Werte) |
| Ausgeblendete Felder erscheinen nicht | ✅ | Eingabe = `pruneHiddenValues`; `has()`-Gating der bedingten Felder |
| Ja/Nein & DE/Ausland korrekt markiert | ✅ | Visuell (Radio gefüllt) |
| Mehrere Begünstigte/Länder paginieren | ✅ | Unit „dynamische Listen" + visuell |
| Feste 3-Jahres-Tabellen (Jahresspalten, Werte, Gesamtzeile) | ✅ | Visuell Seiten 2–4 |
| Seitennummerierung | ✅ | Fußzeile „Seite X von Y" + Schmuckquadrat |
| Renderer hinter austauschbarer Grenze | ✅ | `generateFlexcoverPdf(values) → Blob` (Code-Review) |
| Anonym clientseitig: Daten verlassen Browser nicht | ✅ | Submit ohne Netzwerk-POST; nur statisches Header-Asset wird geladen |
| Erzeugungsfehler → Meldung, Eingaben bleiben | ✅ | `try/catch` → Fehler-Toast (Code-Review) |

### Security / DSGVO-Audit
- **Clientseitige Erzeugung:** PDF entsteht im Browser; beim Absenden kein Versand der Formulardaten an den Server (nur GET des statischen Banner-Assets). PII bleibt lokal. ✅
- **Kein Injection-Sink:** Werte werden als Text in react-pdf gesetzt (keine HTML-/XSS-Fläche). ✅
- **Keine Secrets**, kein serverseitiger Zustand. ✅
- **Dev-Button „Testdaten laden"** nur bei `NODE_ENV !== production` → in Produktion ausgeblendet. ✅

### Bugs / Findings
| ID | Sev. | Beschreibung | Empfehlung |
|----|------|--------------|------------|
| BUG-1 | Low | Schrift war Helvetica statt exaktes Arial. | ✅ **behoben**: **Arimo** (Arial-metrisch-kompatibel, Apache-2.0, WOFF) eingebettet — Browser via `/public`-URL (in `src/lib/pdf/index.ts`), Node via Dateipfad. Per `pdffonts` als eingebettete Subset-Schrift bestätigt; Umlaute korrekt. |
| BUG-2 | Low | Finale **fachliche/behördliche Treue-Abnahme** steht aus (Prozess-Punkt aus der Spec). | Vor Produktiv-Einreichung extern bestätigen lassen. |

### Umgebungs-Hinweis (kein Code-Defekt)
Die **volle E2E-Suite ist in dieser Umgebung instabil**, weil der Dropbox-Sync den `.next`-Ordner sperrt (`EPERM rename …app-paths-manifest.json` → Next-Dev-Server bricht beim Kaltstart ab). Mit vorgewärmtem Dev-Server laufen **74/74** grün. **Empfehlung:** `.next` aus dem Dropbox-Sync ausnehmen (oder Projekt außerhalb Dropbox), dann sind Build/Tests stabil.

### Neue Testdateien
- `src/lib/pdf/flexcover/document.test.tsx`
- `tests/PROJ-5-pdf.spec.ts`

## Deployment
_To be added by /deploy_

## Deployment
_To be added by /deploy_
