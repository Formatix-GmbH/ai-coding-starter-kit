# PROJ-19: Feld-Erklärungen (Stufe 1: Musterantrag, Abschnitt „Vorhaben")

## Status: Approved
**Created:** 2026-07-02
**Last Updated:** 2026-07-02

## Dependencies
- Requires: PROJ-3 (Dynamic Form Engine) — das Erklärungs-Feld wird Teil des Definitions-Schemas, die Anzeige Teil der Feld-Hülle
- Requires: PROJ-18 (Neutrales Formular-Portal / Musterantrag) — Stufe 1 betrifft ausschließlich den Musterantrag
- Requires: PROJ-17 (Barrierefreiheit) — die Aufklapp-Komponente muss WCAG 2.1 AA erfüllen
- Kontext: erste Ausbaustufe der KI-Roadmap (PROJ-8); hier bewusst **ohne Laufzeit-KI**

## Kontext & Ziel
Antragsteller sind Fachfremde — Begriffe wie „Eigenmittel" oder „Meilenstein" sind nicht selbsterklärend. Jedes erklärungsbedürftige Feld erhält eine aufklappbare **Erklärung in einfacher Sprache mit Beispiel** („Was ist hier gemeint?"). Die Texte werden **einmalig zur Entwicklungszeit KI-generiert und fachlich reviewt**; zur Laufzeit läuft **keine KI** — die Erklärungen sind statischer Teil der Formulardefinition.

**Stufe 1 (dieses Feature):** nur der **Musterantrag**, nur Abschnitt **„Vorhaben"**, nur Felder mit echtem Erklärungsbedarf. Die Engine-Funktion ist danach für alle Formulare nutzbar; FlexCover zieht ggf. später nach (rein additiv: Texte ergänzen).

**Kosten:** 0 € laufend (keine API-Aufrufe, kein neuer Dienst, kein neuer DSGVO-Verarbeitungsvorgang — es fließen keinerlei Nutzerdaten durch ein Modell).

## User Stories
- Als **Antragsteller ohne Förder-Erfahrung** möchte ich bei unklaren Feldern eine verständliche Erklärung mit Beispiel aufklappen, damit ich das Feld korrekt ausfülle, ohne extern recherchieren zu müssen.
- Als **Antragsteller mit Screenreader/Tastatur** möchte ich die Erklärungen genauso bedienen können wie jedes andere Element (PROJ-17-Standard), damit die Hilfe nicht nur Sehenden nützt.
- Als **Antragsteller** möchte ich, dass Erklärungen mich nicht ablenken (eingeklappt, dezent), damit das Formular übersichtlich bleibt.
- Als **Formatix (Betreiber)** möchte ich Erklärungen als Teil der Formulardefinition pflegen, damit jedes künftige Formular die Funktion ohne Neuentwicklung erhält.
- Als **Formatix-Vertrieb** möchte ich die Funktion in der Portal-Demo zeigen („KI-generierte Ausfüllhilfen"), ohne dass Laufzeit-Kosten oder DSGVO-Hürden entstehen.

## Umfang Stufe 1: Felder mit Erklärung (Vorschlag, im Review bestätigt)
Abschnitt **„Vorhaben"** des Musterantrags — Felder mit echtem Erklärungsbedarf:
1. **Kurzbeschreibung des Vorhabens** — was hinein gehört (Ziel, Vorgehen, erwartetes Ergebnis)
2. **Förderbereich** — was die Kategorien bedeuten, Wahl bei Überschneidung
3. **Personalkosten** — was dazu zählt (Gehälter inkl. Nebenkosten, anteilige Stellen)
4. **Sachmittel** — Abgrenzung (Geräte, Material, Fremdleistungen)
5. **Gesamtkosten** — Hinweis: wird automatisch berechnet
6. **Eingesetzte Eigenmittel** — was Eigenmittel sind und warum sie relevant sind
7. **Internationale Projektpartner?** — was als internationaler Partner zählt
8. **Beschreibung der internationalen Zusammenarbeit** — was beschrieben werden soll (Rolle, Beitrag, Land)
9. **Meilensteine** (Tabelle) — was ein Meilenstein ist, sinnvolle Granularität
10. **Mittelverwendung nach Jahr** (Tabelle) — wie auf Jahre verteilt wird

Bewusst **ohne** Erklärung (selbsterklärend): Titel des Vorhabens, geplanter Beginn, Partner-Name/-Land.

## Out of Scope
- **FlexCover-Erklärungen** — spätere Stufe (rein additiv: Texte in die FlexCover-Definition; Abstimmung der Fachbegriffe idealerweise mit Euler Hermes). FlexCover bleibt in Stufe 1 **unverändert** (kein Aufklapper erscheint, da keine Texte hinterlegt).
- **Übrige Musterantrag-Abschnitte** (Ansprechpartner, Organisation, Abschluss) — Folgestufe nach Bewährung.
- **Laufzeit-KI** (Chat, Dokument-Vorbefüllung, Einreichungs-Check) — spätere Ausbaustufen von PROJ-8; erfordern DSGVO-Folgenabschätzung.
- **Erklärungen im PDF** — die Erklärungen sind reine Ausfüllhilfe der Web-Oberfläche.
- **Mehrsprachigkeit / Leichte Sprache** als formaler Standard — Texte sind „einfache Sprache", keine zertifizierte Leichte Sprache.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

**Anzeige & Verhalten**
- [ ] Angenommen ein Feld hat eine hinterlegte Erklärung, wenn die Antragsseite lädt, dann ist am Feld ein dezenter Auslöser („Was ist hier gemeint?"/Info-Symbol) sichtbar und die Erklärung eingeklappt.
- [ ] Angenommen der Auslöser wird aktiviert, wenn die Erklärung aufklappt, dann zeigt sie verständlichen Text (einfache Sprache, mit Beispiel) und lässt sich auf demselben Weg wieder schließen.
- [ ] Angenommen ein Feld hat **keine** hinterlegte Erklärung, wenn die Antragsseite lädt, dann erscheint dort kein Auslöser (unverändertes Erscheinungsbild).
- [ ] Angenommen der Nutzer klappt eine Erklärung auf, wenn er weitertippt oder das Feld verlässt, dann bleiben Eingaben, Validierung und Auto-Save unbeeinflusst.

**Barrierefreiheit (PROJ-17-Standard)**
- [ ] Angenommen ein Nutzer bedient nur die Tastatur, wenn er den Auslöser fokussiert und aktiviert, dann öffnet/schließt die Erklärung; der Zustand ist programmatisch erkennbar (auf-/zugeklappt) und der Fokus geht nicht verloren.
- [ ] Angenommen ein Screenreader-Nutzer erreicht den Auslöser, wenn er ihn vorliest, dann hat er einen aussagekräftigen Namen mit Feldbezug (z. B. „Erklärung zu Eingesetzte Eigenmittel").
- [ ] Angenommen die axe-Prüfung läuft (wcag2a/aa/21a/21aa), wenn Erklärungen auf- und zugeklappt sind, dann werden 0 kritische/schwere Verstöße gemeldet.

**Umfang & Abgrenzung**
- [ ] Angenommen der Musterantrag ist geöffnet, wenn Abschnitt „Vorhaben" angezeigt wird, dann haben genau die im Umfang bestätigten Felder eine Erklärung.
- [ ] Angenommen das FlexCover-Formular wird (Prod/Staging) geöffnet, wenn irgendein Abschnitt angezeigt wird, dann erscheint **nirgends** ein Erklärungs-Auslöser und Layout/Verhalten sind unverändert (Status quo, per Regression nachweisbar).
- [ ] Angenommen eine Erklärung ist sichtbar, wenn der Nutzer sie liest, dann ist erkennbar, dass es sich um eine **unverbindliche Ausfüllhilfe** handelt (Disclaimer, dezent).

**Qualität der Texte (Abnahme)**
- [ ] Angenommen die Texte sind generiert, wenn der Betreiber sie reviewt, dann sind alle Erklärungen fachlich korrekt, herstellerneutral und ohne Rechtsberatungs-Charakter freigegeben, bevor sie live gehen.

## Edge Cases
- **Sehr langer Erklärtext auf Mobil (375 px):** Aufklapper darf das Layout nicht sprengen (kein horizontales Scrollen, Feld bleibt sichtbar).
- **Erklärung an einem bedingt sichtbaren Feld** (z. B. „Beschreibung der internationalen Zusammenarbeit"): Aufklapper erscheint/verschwindet mit dem Feld, ohne Fokusverlust.
- **Erklärung an Tabellen/Wiederholgruppen:** Auslöser sitzt an der Tabellen-/Gruppenüberschrift (nicht in jeder Zelle/jedem Eintrag wiederholt).
- **Erklärung + Fehlermeldung gleichzeitig:** beide bleiben unterscheidbar; die Fehlerverknüpfung (aria) aus PROJ-17 bleibt intakt.
- **Mehrere Erklärungen gleichzeitig offen:** zulässig — kein Zwangs-Schließen (weniger Überraschung, einfacherer Zustand).
- **Feld mit `help`-Kurzhinweis UND Erklärung:** beide koexistieren (help = einzeiliger Hinweis, Erklärung = aufklappbarer Langtext); keine Dopplung im Inhalt.

## Technical Requirements (optional)
- **Keine Laufzeit-KI, keine neuen externen Dienste, keine neuen Env-Variablen.** Erklärungen sind statischer Inhalt der Formulardefinition.
- Barrierefreiheit: WCAG 2.1 AA (PROJ-17-Standard), axe-Regression in der E2E-Suite.
- Kein Einfluss auf PDF-Erzeugung, Entwürfe, Einreichung (rein darstellend).
- FlexCover-Definition und -Komponenten werden nicht angefasst (Status quo; Zwei-Wege-Trennbarkeit aus PROJ-18 bleibt gewahrt).

## Open Questions
- [ ] **Feldauswahl bestätigen:** Deckt die vorgeschlagene 10er-Liste den Bedarf, oder sollen Felder ergänzt/gestrichen werden? (Im Spec-Review zu bestätigen.)
- [x] **Disclaimer-Platzierung:** entschieden in `/architecture` — dezent im Fuß jedes Aufklapp-Panels („Unverbindliche Ausfüllhilfe").
- [ ] **FlexCover-Nachzug (spätere Stufe):** Zeitpunkt und ob die Fachtexte vorab mit Euler Hermes abgestimmt werden.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Entwurfszeit-Generierung statt Laufzeit-KI | 0 € laufende Kosten, keine DSGVO-Folgenabschätzung nötig, „Daten bleiben im Browser" bleibt uneingeschränkt wahr | 2026-07-02 |
| Stufe 1 = nur Musterantrag, nur Abschnitt „Vorhaben", nur sinnvolle Felder | klein starten, Muster etablieren, Review-Aufwand begrenzen; Nutzer-Vorgabe | 2026-07-02 |
| FlexCover explizit außen vor (kein Env-Flag nötig) | Erklärung ist optional je Feld — ohne Texte erscheint nichts; EH-Test-Status-quo bleibt ohne Zusatzmechanik gewahrt | 2026-07-02 |
| Erklärungen als Teil der Formulardefinition (Engine-Feature) | jedes künftige Formular erbt die Funktion; passt zum definitionsgesteuerten Produktkern | 2026-07-02 |
| Texte durch Betreiber fachlich freigegeben + Disclaimer „unverbindliche Ausfüllhilfe" | KI-generierte Texte ohne Review sind ein Qualitäts-/Haftungsrisiko | 2026-07-02 |
| Eingeklappt als Standard, dezenter Auslöser | Übersichtlichkeit; Hilfe nur bei Bedarf | 2026-07-02 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| `explanation` als optionales Attribut an Feld + Tabelle im Definitions-Schema | gehört fachlich zum Feld; jedes Formular erbt die Funktion; Gruppen/Abschnitte erst bei Bedarf | 2026-07-02 |
| shadcn/Radix **Collapsible** (bereits installiert) statt Popover/Eigenbau | A11y-Mechanik (auf/zu-Zustand) inklusive; Inhalt bleibt im Lesefluss statt Overlay; keine neue Abhängigkeit | 2026-07-02 |
| Anzeige in der Feld-Hülle (unter Label) bzw. am Tabellen-Kopf, einmal je Tabelle | ein zentraler Einbaupunkt in der Engine; keine Wiederholung je Zelle/Eintrag | 2026-07-02 |
| Kein Env-Flag/Schalter — „ohne Text erscheint nichts" ist das Gating | FlexCover bleibt ohne Zusatzmechanik pixelgleich (Regression als Nachweis) | 2026-07-02 |
| Disclaimer „Unverbindliche Ausfüllhilfe" im Panel-Fuß | sichtbar genau beim Lesen; kein zusätzlicher Zustand | 2026-07-02 |
| Kein Backend/keine Speicherung; Aufklapp-Zustand flüchtig | rein darstellendes Feature; 0 € laufend | 2026-07-02 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Grundsatz
Reines **Frontend-Feature in der Engine** — kein Backend, keine Datenbank, keine neuen Pakete, keine neuen Env-Variablen, keine Laufzeit-KI. Die Erklärung wird ein **optionales Attribut in der Formulardefinition**; die Anzeige ein wiederverwendbarer Baustein der Feld-Hülle. Formulare ohne Erklärungstexte (FlexCover!) rendern exakt wie heute.

### A) Was wird angefasst (Änderungs-Landkarte)
```
Definitions-Schema (Engine-Typen)
└── neues optionales Attribut „explanation" (Langtext) an:
    ├── Feldern            (z. B. Eigenmittel, Förderbereich)
    └── Tabellen           (z. B. Meilensteine, Mittelverwendung)
    → Gruppen/Abschnitte erst bei Bedarf in einer Folgestufe

Engine-Anzeige (Feld-Hülle + Tabellen-Kopf)
└── „Was ist hier gemeint?"-Auslöser (dezent, mit Info-Symbol)
    ├── eingeklappt als Standard; öffnet einen Aufklapp-Bereich (Collapsible)
    ├── Panel: Erklärtext + dezenter Fuß „Unverbindliche Ausfüllhilfe"
    ├── barrierefrei: Zustand programmatisch erkennbar (auf/zu),
    │   Name mit Feldbezug („Erklärung zu: Eingesetzte Eigenmittel")
    └── bei Feldern: unter dem Label; bei Tabellen: an der Überschrift
        (einmal je Tabelle, nicht je Zelle)

Inhalte (nur Musterantrag, Abschnitt „Vorhaben")
└── 10 bestätigte Erklärtexte direkt in der Musterantrag-Definition
    (KI-generiert zur Entwicklungszeit → fachliches Review durch Betreiber)

Tests
└── E2E: Auslöser sichtbar/bedienbar, axe (auf- und zugeklappt) 0 krit./schwere,
    FlexCover-Regression (kein Auslöser, Status quo)
```

### B) Datenmodell (unverändert)
Keine neuen Daten, keine Speicherung: Die Erklärung ist **statischer Text in der Formulardefinition** — wie ein Label. Aufklapp-Zustand ist flüchtiger UI-Zustand (wird nicht gespeichert).

### C) Tech-Entscheidungen (für PM begründet)
- **Attribut in der Definition statt separater Inhalts-Datei:** Erklärung gehört fachlich zum Feld (wie Label/Hilfetext); jedes künftige Formular erbt die Funktion, Pflege an einem Ort.
- **Vorhandener Aufklapp-Baustein (shadcn/Radix Collapsible):** bereits installiert, bringt die Barrierefreiheits-Mechanik (Zustand auf/zu) von Haus aus mit — kein Eigenbau, **keine neue Abhängigkeit**.
- **Eingeklappt + „nichts ohne Text":** Felder ohne Erklärung sehen pixelgleich aus wie heute → FlexCover bleibt nachweislich unverändert (Regression), ganz ohne Schalter/Env-Flag.
- **Disclaimer im Panel-Fuß:** immer genau dort sichtbar, wo der Text gelesen wird; kein zusätzlicher Zustand, keine Dopplung am Abschnittsanfang.
- **Koexistenz mit `help`:** Kurzhinweis (help, eine Zeile) und Erklärung (Langtext, aufklappbar) bleiben getrennte Ebenen — Inhalte werden beim Texten entdoppelt.
- **Mehrere Panels gleichzeitig offen erlaubt:** einfachster Zustand, keine Überraschungen (Spec-Edge-Case).

### D) Abhängigkeiten (zu installieren)
**Keine.** Collapsible-Baustein und Icon-Bibliothek sind vorhanden; Texte sind statischer Inhalt.

## Implementierungsnotizen (Frontend)
**Stand:** 2026-07-02 — umgesetzt; **alle 10 Texte am 2026-07-02 vom Betreiber fachlich freigegeben** (Abnahmekriterium „Qualität der Texte" erfüllt).

- **Schema:** `explanation?` an `FieldNode` + `TableNode` (`src/lib/form-engine/types.ts`) — optional, ohne Text erscheint nichts.
- **Komponente:** `src/components/form-engine/Explanation.tsx` — shadcn/Radix Collapsible; Auslöser „Was ist hier gemeint?" (Info-Symbol, dezent), zugänglicher Name inkl. Feldbezug als sr-only-Zusatz (WCAG 2.5.3 gewahrt); Panel mit Erklärtext + Fuß „Unverbindliche Ausfüllhilfe".
- **Einbau:** `FieldShell` (alle Feldtypen inkl. berechneter; Checkbox-Sonderpfad bewusst ohne — kein Stufe-1-Feld betroffen) + Tabellen-Kopf in `nodes.tsx` (einmal je Tabelle).
- **Inhalte:** 10 Erklärtexte in der Musterantrag-Definition (Abschnitt „Vorhaben"), einfache Sprache mit Beispielen, herstellerneutral.
- **Tests:** Unit `definition.test.ts` schreibt den 10er-Umfang fest (schlägt bei unabgestimmten Änderungen an). E2E `tests/PROJ-19-erklaerungen.spec.ts` (selbst-guardend): Auslöser-Anzahl 9→10 (bedingtes Feld), Auf-/Zuklappen + `aria-expanded`, Feld ohne Erklärung ohne Auslöser, Tabellen-Kopf einmalig, Eingaben unbeeinflusst, axe (aufgeklappt) 0 krit./schwere, FlexCover-Regression 0 Auslöser.
- **Verifikation:** tsc/Lint sauber; Portal-Modus 6/6 grün; Default-Modus volle Suite **58 passed / 12 skipped** (FlexCover-Status-quo bestätigt).

## QA Test Results
**Getestet:** 2026-07-02 · **Umgebung:** lokal (Dev-Server, Default- und Portal-Modus), Chromium + Mobile Safari (375 px).

### Zusammenfassung
- **Akzeptanzkriterien: alle bestanden.** **Bugs: 0** (kritisch/hoch/mittel/niedrig). **Empfehlung: produktionsreif.**
- **Unit:** 125/125 grün (inkl. Umfangs-Pinning: genau die 10 bestätigten Knoten tragen Erklärungen, Mindestlänge geprüft).
- **Portal-Modus:** PROJ-19 + PROJ-18-Suiten **21 passed** über beide Projekte (Chromium + Mobile Safari) — inkl. neuem Edge-Case-Test.
- **Default-Modus (FlexCover-Status-quo):** volle Suite **58 passed / 13 skipped** — FlexCover zeigt **0 Erklärungs-Auslöser**, Verhalten unverändert.
- Fehlversuche in Sammel-Läufen waren ausnahmslos der bekannte Dropbox-`.next`-Dev-Server-Flake (isoliert jeweils grün) — kein Produktbefund.

### Akzeptanzkriterien (Nachweise)
| Kriterium | Status | Nachweis |
|---|---|---|
| Auslöser sichtbar, eingeklappt als Standard | ✅ | E2E „Auslöser erscheinen … (eingeklappt)": 9 Trigger initial, kein Disclaimer sichtbar |
| Aufklappen zeigt Text, Schließen möglich | ✅ | E2E „Aufklappen zeigt Text + Disclaimer … Schließen geht" |
| Feld ohne Erklärung → kein Auslöser | ✅ | E2E „Titel des Vorhabens"-Test + Umfangs-Pinning (Unit) |
| Eingaben/Validierung/Auto-Save unbeeinflusst | ✅ | E2E Tabellen-Test (Eingabe bei offenem Panel) + Edge-Case-Test |
| Tastatur: öffnen/schließen, Zustand programmatisch | ✅ | `aria-expanded` false→true→false per E2E; Radix-Collapsible-Mechanik |
| Screenreader-Name mit Feldbezug | ✅ | zugänglicher Name „Was ist hier gemeint? — Erklärung zu: <Feld>" (sichtbarer Text bleibt Teil des Namens, WCAG 2.5.3) |
| axe 0 kritisch/schwer (auf- und zugeklappt) | ✅ | E2E-axe mit offenem Panel; zugeklappt durch PROJ-18-axe-Test abgedeckt |
| Genau die bestätigten Felder im Umfang | ✅ | Unit-Test pinnt die 10 Pfade (schlägt bei Abweichung an) |
| FlexCover ohne Auslöser, Status quo | ✅ | E2E-Regression (0 Trigger) + volle Default-Suite grün |
| Disclaimer erkennbar | ✅ | „Unverbindliche Ausfüllhilfe" im Panel-Fuß (E2E-geprüft) |
| Texte fachlich freigegeben | ✅ | Betreiber-Review 2026-07-02 (alle 10 Texte) |

### Edge Cases
- **Bedingtes Feld:** Erklärung erscheint/verschwindet mit dem Feld (E2E: 9→10 Trigger). ✅
- **Erklärung + Fehlermeldung gleichzeitig:** neuer QA-Test — `aria-invalid` + Fehlerverknüpfung (PROJ-17) intakt, Erklärtext bleibt sichtbar, beides unterscheidbar. ✅
- **Tabellen:** Auslöser genau einmal am Kopf (E2E `toHaveCount(1)`). ✅
- **Mobil 375 px:** komplette PROJ-19-Suite auf Mobile Safari grün (Panel im Lesefluss, kein Overlay → kein 2D-Scroll-Risiko). ✅
- **Mehrere Panels offen:** per Design erlaubt (unabhängige Collapsibles). ✅
- **`help` + `explanation` koexistieren:** bei „Kurzbeschreibung" (hat beides) — getrennte Ebenen, keine Kollision. ✅

### Sicherheits-Audit (Red Team)
Statische Texte aus der (vertrauenswürdigen) Formulardefinition, von React escaped gerendert (kein `dangerouslySetInnerHTML`); keine Nutzereingaben im Erklärungspfad, keine neuen Endpunkte/Daten/Abhängigkeiten. Trigger ist `type="button"` (Radix) — löst kein Formular-Submit aus (empirisch durch E2E bestätigt: kein Validierungslauf beim Öffnen). **Kein Befund.**

### Anmerkungen
- Checkbox-Felder rendern derzeit keine Erklärung (eigener Render-Pfad ohne FieldShell) — kein Stufe-1-Feld betroffen; bei Bedarf in einer Folgestufe ergänzen (in Implementierungsnotizen dokumentiert).

## Deployment
**Deployed:** 2026-07-02 · **Tag:** `v1.3.0-PROJ-19`

- **Portal:** https://portal.eforms.de — live. Verifiziert: neue Startseiten-Überschrift („Barrierefreie und DSGVO-konforme Formulare …"), Musterantrag 200, Erklärtexte in der ausgelieferten Seite nachweisbar.
- **Prod (Status quo):** https://flexcover.eforms.de nach Rebuild verifiziert unverändert — Antrag 200, **0 Erklärungs-Auslöser**, Startseite unverändert.
- **Pipeline:** develop→Staging, main→Prod+Portal (Auto-Deploy). Keine Env-/DB-/Infra-Änderungen — reines Frontend, 0 € laufende Kosten.
- **Nachzug FlexCover** (spätere Stufe): Texte in die FlexCover-Definition ergänzen + Review (idealerweise mit EH abgestimmt); Engine-Funktion liegt bereit.
