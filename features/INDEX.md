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
| PROJ-3 | Dynamic Form Engine (definitionsgesteuert) | Roadmap | — | 2026-06-16 |
| PROJ-11 | FlexCover Formulardefinition (Beispielformular auf der Engine) | Roadmap | — | 2026-06-18 |
| PROJ-4 | Formular-Entwurf & Auto-Save | Roadmap | — | 2026-06-16 |
| PROJ-5 | PDF-Generierung & Download | Roadmap | — | 2026-06-16 |
| PROJ-6 | Formular-Einreichung & Bestätigung | Roadmap | — | 2026-06-16 |
| PROJ-7 | PDF-Versand per E-Mail | Roadmap | — | 2026-06-16 |
| PROJ-8 | KI-gestützte Formularausfüllung | Roadmap | — | 2026-06-16 |
| PROJ-9 | Admin Dashboard | Roadmap | — | 2026-06-16 |
| PROJ-10 | Multi-Form / Multi-Mandanten-Verwaltung | Roadmap | — | 2026-06-16 |

<!-- Add features above this line -->

## Next Available ID: PROJ-12

## Empfohlene Build-Reihenfolge
PROJ-1 → PROJ-2 → **PROJ-3 (Engine)** → **PROJ-11 (FlexCover-Definition)** → PROJ-4 → PROJ-5 → PROJ-6 → P1/P2

> Hinweis: IDs sind Identität, nicht Reihenfolge. PROJ-11 wird direkt nach PROJ-3 gebaut (hängt von der Engine ab). PROJ-10 umfasst nur noch die Verwaltung mehrerer Formulare/Mandanten — die generische Engine selbst ist PROJ-3.
