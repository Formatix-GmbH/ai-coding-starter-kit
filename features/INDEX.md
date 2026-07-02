# Feature Index

> Central tracking for all features. Updated by skills automatically.

## Status Legend
- **Roadmap** - `/init` done, feature identified in feature map, no spec file yet
- **Planned** - `/write-spec` done, full spec written, architecture not yet designed
- **Architected** - `/architecture` done, tech design approved, ready to build
- **In Progress** - `/frontend` or `/backend` active or completed, not yet in QA
- **In Review** - `/qa` active, testing in progress
- **Approved** - `/qa` passed, no critical/high bugs, ready to deploy
- **Deployed** - `/deploy` done, live in production

## Features

| ID | Feature | Status | Spec | Created |
|----|---------|--------|------|---------|
| PROJ-1 | Supabase Infrastructure Setup | Approved | [PROJ-1](PROJ-1-supabase-infrastructure-setup.md) | 2026-06-16 |
| PROJ-2 | User Authentication | Approved | [PROJ-2](PROJ-2-user-authentication.md) | 2026-06-16 |
| PROJ-3 | Dynamic Form Engine (definitionsgesteuert) | Approved | [PROJ-3](PROJ-3-dynamic-form-engine.md) | 2026-06-16 |
| PROJ-11 | FlexCover Formulardefinition (Beispielformular auf der Engine) | Approved | [PROJ-11](PROJ-11-flexcover-form-definition.md) | 2026-06-18 |
| PROJ-4 | Formular-Entwurf & Auto-Save | Approved | [PROJ-4](PROJ-4-formular-entwurf-auto-save.md) | 2026-06-16 |
| PROJ-5 | PDF-Generierung & Download | Approved | [PROJ-5](PROJ-5-pdf-generierung-download.md) | 2026-06-16 |
| PROJ-6 | Formular-Einreichung & Bestätigung | Deployed | [PROJ-6](PROJ-6-formular-einreichung-bestaetigung.md) | 2026-06-22 |
| PROJ-7 | PDF-Versand per E-Mail | Obsolet (→ PROJ-6) | — | 2026-06-16 |
| PROJ-8 | KI-gestützte Formularausfüllung | Roadmap | — | 2026-06-16 |
| PROJ-9 | Admin Dashboard | Roadmap | — | 2026-06-16 |
| PROJ-10 | Multi-Form / Multi-Mandanten-Verwaltung | Roadmap | — | 2026-06-16 |
| PROJ-12 | Datei-Upload & Unterschrift (Engine-Erweiterung) | Roadmap | — | 2026-06-18 |
| PROJ-13 | Externe Übermittlung / Webhook (Absende-Ziele) | Roadmap | — | 2026-06-18 |
| PROJ-14 | Deployment & Infrastruktur (Hetzner Cloud + Cloudflare) | Deployed | [PROJ-14](PROJ-14-deployment-infrastruktur.md) | 2026-06-22 |
| PROJ-15 | Staging-Umgebung | Deployed | [PROJ-15](PROJ-15-staging-umgebung.md) | 2026-06-24 |
| PROJ-16 | Bot-Schutz mit Cloudflare Turnstile | Deployed | [PROJ-16](PROJ-16-turnstile-botschutz.md) | 2026-06-28 |
| PROJ-17 | Barrierefreiheit (WCAG 2.1 AA) | Deployed | [PROJ-17](PROJ-17-barrierefreiheit-wcag.md) | 2026-06-29 |
| PROJ-18 | Neutrales Formular-Portal (portal.eforms.de) | Deployed | [PROJ-18](PROJ-18-neutrales-formular-portal.md) | 2026-07-01 |
| PROJ-19 | Feld-Erklärungen (Stufe 1: Musterantrag, Abschnitt „Vorhaben") | Architected | [PROJ-19](PROJ-19-feld-erklaerungen.md) | 2026-07-02 |

<!-- Add features above this line -->

## Next Available ID: PROJ-20

## Empfohlene Build-Reihenfolge
PROJ-1 → PROJ-2 → **PROJ-3 (Engine)** → **PROJ-11 (FlexCover-Definition)** → PROJ-4 → PROJ-5 → PROJ-6 → P1/P2

> Hinweis: IDs sind Identität, nicht Reihenfolge. PROJ-11 wird direkt nach PROJ-3 gebaut (hängt von der Engine ab). PROJ-10 umfasst nur noch die Verwaltung mehrerer Formulare/Mandanten — die generische Engine selbst ist PROJ-3.
