# Product Requirements Document

## Vision
Kern des Projekts ist ein **wiederverwendbares, definitionsgesteuertes Grundgerüst (Form-Engine)**, mit dem sich dynamische, komplexe Web-Formulare aus einer Definition (JSON) erstellen lassen — ohne jedes Formular neu zu programmieren. Der bestehende **XFA-FlexCover-Förderantrag dient als erstes, anspruchsvolles Beispielformular** und Härtetest der Engine. Antragsteller füllen Formulare DSGVO-konform online aus, speichern Entwürfe (mit Konto) und erhalten am Ende ein PDF. Mittelfristig trägt die Engine mehrere Formulare und Mandanten.

## Target Users
**Ansprechpartner in antragstellenden Unternehmen** — Geschäftsführer, Finanzverantwortliche oder Assistenz, die im Auftrag ihres Unternehmens einen FlexCover-Förderantrag stellen. Sie kennen die Unternehmensdaten, sind aber keine Technikexperten. Sie erwarten ein klares, schrittweises Formular, das Fehler sofort signalisiert und ihre Eingaben sicher speichert.

**Pain Points heute:** Das XFA-Formular erfordert Adobe Acrobat, ist nicht mobiltauglich, verliert ungespeicherte Daten bei Abstürzen und bietet keine benutzerfreundliche Validierung.

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | Supabase Infrastructure Setup | Planned |
| P0 (MVP) | User Authentication (Register, Login, Passwort-Reset) | Planned |
| P0 (MVP) | Dynamic Form Engine (definitionsgesteuert: Feldtypen, Sichtbarkeitslogik, Validierung, Wiederholgruppen, Tabellen) | Planned |
| P0 (MVP) | FlexCover Formulardefinition (Beispielformular auf der Engine) | Planned |
| P0 (MVP) | Formular-Entwurf & Auto-Save | Planned |
| P0 (MVP) | PDF-Generierung & Download | Planned |
| P0 (MVP) | Formular-Einreichung & Bestätigung (inkl. Bestätigungs-E-Mail mit PDF) | Planned |
| P1 | PDF-Versand per E-Mail | Obsolet — in PROJ-6 zusammengeführt |
| P1 | Feld-Erklärungen (Stufe 1: Musterantrag „Vorhaben") — KI-generiert zur Entwurfszeit, keine Laufzeit-KI | Planned |
| P1 | KI-gestützte Formularausfüllung (Laufzeit-KI: Vorbefüllung, Einreichungs-Check) | Roadmap |
| P1 | Admin Dashboard (Antragsübersicht) | Roadmap |
| P1 | Datei-Upload & Unterschrift (Engine-Erweiterung) | Roadmap |
| P1 | Externe Übermittlung / Webhook (Absende-Ziele) | Roadmap |
| P1 | Neutrales Formular-Portal (portal.eforms.de) — herstellerneutrale Demo mit generischem Musterantrag; extraktions-freundlich für späteres Produkt-Repo | Planned |
| P2 | Multi-Form / Multi-Mandanten-Verwaltung (mehrere Definitionen, Kundentrennung) | Roadmap |

## Success Metrics
- Ein Antragsteller kann den vollständigen Antrag in einer oder mehreren Sessions ausfüllen und ein korrektes PDF herunterladen
- Entwurf-Speicherung ist zuverlässig — kein Datenverlust bei Seitenneuladen oder Tab-Schließen
- Alle Pflichtfelder und Plausibilitätsprüfungen werden im Browser validiert, bevor Einreichung möglich ist
- Keine personenbezogenen Daten landen in Logs, Fehlermeldungen oder Monitoring-Tools

## Constraints
- **Deployment:** Hybrid (nicht Vercel). App läuft per **Docker Compose auf einem separaten Hetzner Cloud Server** (Ubuntu, Root) — der Hetzner **Managed Server (FreeBSD, kein Root/Docker)** kann Docker strukturell nicht betreiben und bleibt für Domain/DNS/Mail. DB/Auth = Supabase (extern). Public über `flexcover.eforms.de` hinter **Cloudflare** (Proxy, TLS Full strict + Origin-Cert). Siehe PROJ-14.
- **Team:** Solo-Entwickler mit KI-Unterstützung, kein festes Timeline-Commitment
- **DSGVO:** Pflicht ab Tag 1 — Datenminimierung, kein PII in Logs, Trennung Dev/Test/Prod, DSGVO-Folgenabschätzung vor KI-Integration
- **Design:** Tailwind CSS + shadcn/ui Defaults
- **Kein XFA im Browser:** Formularlogik wird manuell aus XFA übertragen, nicht technisch interpretiert

## Non-Goals (MVP)
- Admin-Backend / Antragsbearbeitung intern
- Mehrere Formulare oder Mandanten
- Automatische XFA-zu-Web-Konvertierung
- KI-Integration (kommt P1, nach DSGVO-Prüfung)
