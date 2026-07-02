# PROJ-19: Feld-Erklärungen (Stufe 1: Musterantrag, Abschnitt „Vorhaben")

## Status: Planned
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
- [ ] **Disclaimer-Platzierung:** dezent im Fuß jedes Aufklappers vs. einmalig am Abschnittsanfang — Feinentscheidung in `/frontend`.
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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
