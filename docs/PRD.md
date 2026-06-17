# Product Requirements Document

## Vision
FlexCover Antragsportal ist eine DSGVO-konforme Web-App, die den bestehenden XFA-Förderantrag als modernes, responsives Self-Service-Webformular zugänglich macht. Antragsteller füllen den Antrag online aus, speichern Entwürfe und laden am Ende ein statisches PDF herunter. Mittelfristig wird die Plattform zur generischen Formularlösung für mehrere Kunden ausgebaut.

## Target Users
**Ansprechpartner in antragstellenden Unternehmen** — Geschäftsführer, Finanzverantwortliche oder Assistenz, die im Auftrag ihres Unternehmens einen FlexCover-Förderantrag stellen. Sie kennen die Unternehmensdaten, sind aber keine Technikexperten. Sie erwarten ein klares, schrittweises Formular, das Fehler sofort signalisiert und ihre Eingaben sicher speichert.

**Pain Points heute:** Das XFA-Formular erfordert Adobe Acrobat, ist nicht mobiltauglich, verliert ungespeicherte Daten bei Abstürzen und bietet keine benutzerfreundliche Validierung.

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | Supabase Infrastructure Setup | Planned |
| P0 (MVP) | User Authentication (Register, Login, Passwort-Reset) | Planned |
| P0 (MVP) | FlexCover Webformular (9 Abschnitte, dynamische Feldlogik, Validierung) | Roadmap |
| P0 (MVP) | Formular-Entwurf & Auto-Save | Roadmap |
| P0 (MVP) | PDF-Generierung & Download | Roadmap |
| P0 (MVP) | Formular-Einreichung & Bestätigung | Roadmap |
| P1 | PDF-Versand per E-Mail | Roadmap |
| P1 | KI-gestützte Formularausfüllung | Roadmap |
| P1 | Admin Dashboard (Antragsübersicht) | Roadmap |
| P2 | Generische Formular-Engine (Multi-Form, Multi-Mandant) | Roadmap |

## Success Metrics
- Ein Antragsteller kann den vollständigen Antrag in einer oder mehreren Sessions ausfüllen und ein korrektes PDF herunterladen
- Entwurf-Speicherung ist zuverlässig — kein Datenverlust bei Seitenneuladen oder Tab-Schließen
- Alle Pflichtfelder und Plausibilitätsprüfungen werden im Browser validiert, bevor Einreichung möglich ist
- Keine personenbezogenen Daten landen in Logs, Fehlermeldungen oder Monitoring-Tools

## Constraints
- **Deployment:** Hetzner Managed Server (nicht Vercel) — Docker oder Node.js direkt
- **Team:** Solo-Entwickler mit KI-Unterstützung, kein festes Timeline-Commitment
- **DSGVO:** Pflicht ab Tag 1 — Datenminimierung, kein PII in Logs, Trennung Dev/Test/Prod, DSGVO-Folgenabschätzung vor KI-Integration
- **Design:** Tailwind CSS + shadcn/ui Defaults
- **Kein XFA im Browser:** Formularlogik wird manuell aus XFA übertragen, nicht technisch interpretiert

## Non-Goals (MVP)
- Admin-Backend / Antragsbearbeitung intern
- Mehrere Formulare oder Mandanten
- Automatische XFA-zu-Web-Konvertierung
- KI-Integration (kommt P1, nach DSGVO-Prüfung)
