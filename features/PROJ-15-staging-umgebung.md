# PROJ-15: Staging-Umgebung

## Status: Architected
**Created:** 2026-06-24
**Last Updated:** 2026-06-24

## Dependencies
- Requires: PROJ-14 (Deployment & Infrastruktur) — gleicher Server, Traefik, Cloudflare, Origin-Cert
- Requires: PROJ-1 (Supabase) — Staging nutzt das bestehende `flexCover-dev`-Projekt

## Ziel / Nutzen
Eine **gehostete Staging-Umgebung**, um Stände **vor** Produktion zu testen und **Kunden Testversionen** zu zeigen — ohne die Produktion zu berühren. Läuft auf derselben Infrastruktur wie Prod, strikt getrennt.

## Entscheidungen (bestätigt)
- **URL:** `flexcover-staging.eforms.de` (einstufige Subdomain → vom `*.eforms.de`-Origin-Cert abgedeckt)
- **Branch → Staging:** `develop` (Push auf `develop` deployt Staging; `main` bleibt Prod)
- **Datenbank/Auth:** **`flexCover-dev`** wiederverwenden (kostenlos; keine dritte Supabase-Instanz)
- **Zugriffsschutz:** **Basic-Auth** (Traefik-Middleware) + `X-Robots-Tag: noindex`
- **E-Mail:** auf Staging **aus** (`RESEND_API_KEY` leer) → kein versehentlicher Versand an echte Adressen
- **Server:** derselbe CX22 (kein neuer Server)

## Architektur
```
Cloudflare (Proxy, Full strict)
  ├── flexcover.eforms.de         → Traefik → flexcover-app-1:3000          (PROD, /opt/flexcover, main)
  └── flexcover-staging.eforms.de → Traefik → flexcover-staging-app-1:3000  (STAGING, /opt/flexcover-staging, develop)
                                      └── Basic-Auth + noindex (Traefik-Middleware)
```
- **Zweiter App-Container** aus demselben Repo, anderes Verzeichnis `/opt/flexcover-staging`, eigenes `.env` (zeigt auf `flexCover-dev`, E-Mail aus). Compose-Projekt `flexcover-staging` → Container `flexcover-staging-app-1`, am Netz `proxy`.
- **Traefik:** neue Dynamic-Route `flexcover-staging.yml` (Host-Regel → Service `http://flexcover-staging-app-1:3000`, TLS Default-Cert, Basic-Auth- + noindex-Middleware). Wie Prod über den **File-Provider** (Docker-Provider bleibt wegen Docker 29 ungenutzt).
- **TLS:** dasselbe Origin-Cert (`*.eforms.de`) — kein neues Zertifikat nötig.
- **Deploy:** zweiter GitHub-Actions-Workflow `deploy-staging.yml` (Trigger `push: develop`) → SSH → in `/opt/flexcover-staging` `git pull` + `docker compose up -d --build`.

## User Stories
- Als Entwickler möchte ich `develop` automatisch auf eine Staging-URL deployen, um Änderungen vor Prod realitätsnah zu prüfen.
- Als Anbieter möchte ich Kunden eine geschützte Testversion zeigen, ohne dass sie öffentlich auffindbar oder mit Prod-Daten vermischt ist.

## Out of Scope
- **Eigene Staging-Datenbank** — bewusst `flexCover-dev` wiederverwendet (Kosten).
- **E-Mail-Versand auf Staging** — aus.
- **Eigener Staging-Server** — gleiche Maschine.
- **Plattform-Rebranding** („hub") — verworfen.

## Acceptance Criteria
- [ ] Angenommen die Staging-Umgebung läuft, wenn ein Nutzer `https://flexcover-staging.eforms.de` ohne Zugangsdaten aufruft, dann erscheint die **Basic-Auth-Abfrage** (kein Zugriff ohne Login).
- [ ] Angenommen korrekte Basic-Auth-Daten, wenn der Nutzer sich anmeldet, dann lädt die App über gültiges TLS.
- [ ] Angenommen Staging läuft, wenn man die Daten prüft, dann nutzt sie `flexCover-dev` (nicht `flexCover-prod`) und **kein** E-Mail-Versand erfolgt.
- [ ] Angenommen ein Push auf `develop`, wenn die Staging-Action läuft, dann ist der neue Stand unter der Staging-URL live — **ohne** die Produktion zu verändern.
- [ ] Angenommen Prod läuft, wenn Staging deployt/gebaut wird, dann bleibt `flexcover.eforms.de` unverändert erreichbar.
- [ ] Angenommen Suchmaschinen, wenn sie die Staging-URL abrufen, dann wird Indexierung verhindert (`noindex` + Basic-Auth).

## Edge Cases / Risiken
- **Speicher beim Bauen (CX22, 4 GB):** zwei App-Builds + Prod gleichzeitig kann eng werden → Builds nacheinander; falls es klemmt, Upgrade auf CX32 (8 GB).
- **Container-Name stabil** (`flexcover-staging-app-1`) für die Traefik-Route — Compose-Projektname = Verzeichnisname.
- **Basic-Auth-Zugangsdaten** liegen (bcrypt-gehasht) in der Traefik-Dynamic-Config; Klartext-Passwort sicher an Kunden weitergeben.
- **DSGVO:** Staging ist internetöffentlich (hinter Basic-Auth) → nur **Testdaten**, keine echten personenbezogenen Daten; nutzt `flexCover-dev` (von Prod getrennt).

## Artefakte
**Repo (commit):**
- `.github/workflows/deploy-staging.yml` (Trigger `push: develop`)

**Server (nicht im Repo):**
- `/opt/flexcover-staging/` (Repo-Klon, Branch `develop`) + `.env` (dev-Supabase, E-Mail aus)
- `/opt/apps/traefik/dynamic/flexcover-staging.yml` (Route + Basic-Auth- + noindex-Middleware)

**Cloudflare (manuell):**
- DNS-A-Record `flexcover-staging` → Server-IP, Proxy „orange"

## Manuelle Schritte (Betreiber)
1. Cloudflare: A-Record `flexcover-staging` → `89.167.76.178` (Proxy an).
2. GitHub-Secrets ergänzen: `DEPLOY_PATH_STAGING=/opt/flexcover-staging` (Host/User/Key wie Prod).
3. Basic-Auth-Passwort festlegen (ich generiere den Hash).

## Decision Log
### Product/Tech Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Gehostete Staging-Umgebung auf gleicher Infra | Kundendemos + Vorab-Tests ohne Prod-Risiko | 2026-06-24 |
| Staging nutzt `flexCover-dev` | Supabase-Frei-Limit 2 Projekte/Org bereits belegt → kein 3. (Pro) Projekt | 2026-06-24 |
| `develop` deployt Staging, `main` deployt Prod | Klarer Promotion-Fluss develop → main | 2026-06-24 |
| Basic-Auth + noindex | Internetöffentlich, aber nicht für die Allgemeinheit/Suchmaschinen | 2026-06-24 |
| E-Mail auf Staging aus | Kein versehentlicher Versand an echte Empfänger | 2026-06-24 |
| Einstufige Subdomain `flexcover-staging.eforms.de` | Vom vorhandenen `*.eforms.de`-Origin-Cert abgedeckt | 2026-06-24 |

## Open Questions
- [ ] Server-RAM beobachten; ggf. CX32, falls parallele Builds zu eng.

## Deployment
_Wird beim Aufbau ergänzt (analog PROJ-14)._
