# PROJ-14: Deployment & Infrastruktur (Hetzner Cloud + Cloudflare)

## Status: Deployed
**Created:** 2026-06-22
**Last Updated:** 2026-06-24

## Dependencies
- Requires: PROJ-1 (Supabase) — externe DB/Auth, bleibt bestehen
- Betrifft alle bisherigen Features (PROJ-1–6, 11) — erste Produktivnahme des MVP

## Kontext / Problem
Die ursprüngliche PRD-Vorgabe „Hetzner Managed Server — Docker oder Node.js direkt" ist **widersprüchlich**: Der Hetzner **Managed** Server läuft auf **FreeBSD ohne Root, ohne systemd, ohne Docker-Daemon und ohne freien Paketmanager** — Docker ist dort **strukturell nicht betreibbar**. PM2 im User-Space existiert zwar (`@reboot pm2 resurrect`), ist für eine produktive App mit serverseitigem PDF-Rendering aber fragil (keine Isolation/Ressourcenlimits, heikles Deployment).

## Entscheidung (Zielarchitektur)
**Hybrid:**
- **Hetzner Cloud Server** (Ubuntu 24.04, min. CX22, Root) betreibt die App per **Docker Compose**: (1) Next.js-App (App Router inkl. API-Routen + react-pdf serverseitig, **eine** Anwendung), (2) **Caddy** als Reverse-Proxy/TLS.
- **DB/Auth bleibt Supabase** (EU, dev+prod aus PROJ-1) — **kein** eigener DB-Container.
- **Managed Server** bleibt für Domain/DNS-Verwaltung und Mail.
- **Public-URL:** `flexcover.eforms.de` hinter **Cloudflare** (Proxy „orange"), SSL-Modus **Full (strict)** mit **Cloudflare Origin Certificate** auf dem Server (Caddy liefert es aus; kein Let's Encrypt nötig).
- **E-Mail (App):** Resend (EU) wie in PROJ-6 — unabhängig vom Mailserver.
- **Deploy:** GitHub Actions → SSH zum Cloud Server → `git pull` + `docker compose up -d --build`.

## User Stories
- Als Betreiber möchte ich die App reproduzierbar und isoliert auf einem eigenen Server betreiben, damit PDF-Rendering und API robust laufen.
- Als Betreiber möchte ich per Git-Push deployen, damit Releases nachvollziehbar und wiederholbar sind.
- Als Antragsteller möchte ich die Anwendung sicher über `https://flexcover.eforms.de` erreichen.

## Out of Scope
- **Supabase ablösen / DB selbst hosten** — bewusst nicht; Supabase bleibt.
- **Mailserver-Migration** — Mail bleibt auf dem Managed Server; App-Mails laufen über Resend.
- **Multi-Server-Skalierung / Load-Balancing / Staging-Server** — später.
- **Self-hosted Monitoring-Stack** — Error-Tracking separat (docs/production/error-tracking.md).

## Acceptance Criteria
- [ ] Angenommen der Cloud Server ist bereitgestellt, wenn `docker compose up -d --build` läuft, dann sind App- und Caddy-Container „healthy" und die App antwortet intern auf Port 3000.
- [ ] Angenommen Cloudflare proxyt `flexcover.eforms.de` mit Full (strict), wenn ein Nutzer die URL aufruft, dann lädt die App über gültiges TLS ohne Zertifikatswarnung und ohne Redirect-Schleife.
- [ ] Angenommen die App läuft im Container, wenn ein eingeloggter Nutzer einreicht, dann wird das **serverseitige PDF korrekt erzeugt** (Fonts + Banner aus `public/` sind im Image vorhanden).
- [ ] Angenommen Supabase Auth ist auf die Produktions-URL konfiguriert, wenn ein Nutzer sich registriert/anmeldet, dann funktionieren Bestätigungs-/Reset-Links auf `https://flexcover.eforms.de`.
- [ ] Angenommen ein Push auf `main` erfolgt, wenn die GitHub-Action läuft, dann deployt sie per SSH und die neue Version ist live.
- [ ] Angenommen die PROD-Migrationen sind angewandt, wenn die App in PROD schreibt, dann existieren `form_drafts` und `submissions` mit aktiver RLS.
- [ ] Angenommen Secrets liegen nur in Server-`.env`/GitHub-Secrets, wenn das Repo geprüft wird, dann sind keine Secrets eingecheckt.

## Edge Cases / Risiken
- **`public/` im Standalone-Build:** Next `output: "standalone"` kopiert `public/` **nicht** automatisch → Dockerfile kopiert es explizit (sonst bricht das serverseitige PDF: Arimo-Fonts + `flexcover-header.png`).
- **NEXT_PUBLIC_* zur Buildzeit:** werden inlined → müssen als **Build-Args** in den Docker-Build (öffentliche Werte: Supabase-URL + Anon-Key).
- **Cloudflare DNS-Umzug:** Proxying erfordert die `eforms.de`-Zone bei Cloudflare → **MX/Mail-Records 1:1 nachtragen**, sonst bricht der Mailempfang.
- **Echte Client-IP** hinter Cloudflare in `CF-Connecting-IP` (relevant für späteres Rate-Limiting, PROJ-6/OBS-2).
- **react-pdf im Standalone:** WASM/Font-Assets müssen mitgetract werden; im Smoke-Test verifizieren (ggf. `outputFileTracingIncludes`).
- **Cron/pg_cron** läuft in Supabase (nicht auf dem Server) — unverändert.

## Technical Requirements
- **DSGVO:** Cloudflare ist zusätzlicher Auftragsverarbeiter im Datenpfad → **AVV mit Cloudflare** + EU-Data-Localization erwägen. Supabase (EU) + Resend (EU) bleiben. Kein PII in Logs.
- **Security-Header** in `next.config.ts` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS).
- **TLS:** Browser↔Cloudflare (Universal SSL), Cloudflare↔Origin (Origin-Cert, Full strict).

## Artefakte (in diesem Repo)
- `next.config.ts` → `output: "standalone"` + Security-Header
- `Dockerfile` (multi-stage, kopiert `public/` + `.next/static`)
- `.dockerignore`
- `docker-compose.yml` (App-Service mit **Traefik-Labels**, externes Netz `proxy`)
- `.github/workflows/deploy.yml` (SSH-Deploy auf push:main + manuell)
- `docs/production/deployment-hetzner-cloudflare.md` (Runbook + benötigte Env/Secrets)

## Manuelle Schritte (außerhalb des Repos — durch Betreiber)
1. Hetzner Cloud Server (CX22, Ubuntu 24.04) anlegen, Docker + Compose installieren, SSH-Key hinterlegen.
2. `eforms.de`-Zone zu Cloudflare umziehen (Nameserver), **MX/Mail-Records nachtragen**; A-Record `flexcover.eforms.de` → Cloud-Server-IP (Proxy „orange"), SSL-Modus **Full (strict)**.
3. Cloudflare **Origin Certificate** erzeugen, als `caddy/certs/origin.pem` + `origin-key.pem` auf den Server legen.
4. Repo auf den Server klonen; Server-`.env` mit Supabase- (URL/Anon-Key) + Resend-Werten anlegen.
5. **GitHub-Secrets:** `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PATH`.
6. **`.env.local.example`** um `RESEND_API_KEY` + `SUBMISSION_EMAIL_FROM` ergänzen (Deny-Regel verhindert automatische Bearbeitung).
7. **Supabase → Auth:** Site-URL + Redirect-URLs auf `https://flexcover.eforms.de`.
8. **PROD-Migrationen** anwenden (`form_drafts`, `form_drafts_retention`, `submissions`, `submissions_retention`) — per MCP, mit Advisor-Check.
9. `develop` → `main` mergen + pushen → Action deployt → **Smoke-Test** (Login, Einreichen, PDF, E-Mail).
10. **AVV** mit Cloudflare (und Resend) abschließen.

## Decision Log

### Product/Tech Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Hybrid: App auf separatem Hetzner **Cloud** Server, nicht Managed | Managed = FreeBSD/kein Root/kein Docker → strukturell unmöglich | 2026-06-22 |
| Docker Compose mit nur App + Caddy (kein DB-/PDF-Container) | App ist eine Next.js-App; PDF in-process; DB/Auth = Supabase | 2026-06-22 |
| Supabase behalten (DB/Auth extern) | Bereits gebaut (RLS, Migrations, Auth); Self-Hosting wäre große Re-Architektur | 2026-06-22 |
| `flexcover.eforms.de` hinter Cloudflare, Full (strict) + Origin-Cert | Edge-TLS/DDoS/WAF; Origin-Cert vermeidet ACME-Fummelei hinter Proxy | 2026-06-22 |
| Deploy via GitHub Actions → SSH → compose up --build | Einfach, nachvollziehbar; kein Registry nötig | 2026-06-22 |
| `output: "standalone"` + `public/` explizit ins Image | Schlankes Image; serverseitiges PDF braucht Fonts/Banner aus public/ | 2026-06-22 |
| **Bundled Caddy verworfen → vorhandenen Traefik nutzen** | Auf dem Cloud Server lief bereits ein zentraler Traefik (v3.4, Docker-Provider, LE) auf 80/443. App wird per Traefik-Labels am externen Netz `proxy` eingehängt; TLS via Cloudflare-**Origin-Cert** in Traefiks File-Provider (kein ACME hinter Cloudflare nötig). | 2026-06-24 |

## Open Questions
- [ ] AVV mit Cloudflare + EU-Data-Localization final klären (DSGVO).
- [ ] Image in CI bauen + GHCR (statt Build auf dem Server)? — vorerst Build auf dem Server, später optional.
- [ ] Rate-Limiting an der Cloudflare-Edge für die Einreichungs-Routen (PROJ-6/OBS-2)?

## Deployment

**Live seit 2026-06-24:** `https://flexcover.eforms.de` (HTTP 200, TLS Full strict via Cloudflare Origin-Cert, Security-Header aktiv). Pfad: Browser → Cloudflare → Traefik → Next.js-App → Supabase (EU).

**Was final umgesetzt wurde:**
- Hetzner Cloud Server `89.167.76.178` (Ubuntu 24.04, Docker 29.6.0), App `/opt/flexcover` (deploy-User), Stack via `docker compose`.
- Traefik (`/opt/apps/traefik`) terminiert TLS mit dem Cloudflare-Origin-Cert (`*.eforms.de`) über den **File-Provider**.
- **Routing über den File-Provider statt Docker-Labels** (`/opt/apps/traefik/dynamic/flexcover.yml`): Route `Host(flexcover.eforms.de)` → `http://flexcover-app-1:3000` im Netz `proxy`.
- PROD-Supabase: `form_drafts` + `submissions` (RLS, Retention) angewandt.

**Bekannte offene Punkte / Risiken:**
- ⚠️ **Traefik Docker-Provider defekt:** Docker 29 (min API 1.40) lehnt Traefiks Client-Version (1.24) ab; `DOCKER_API_VERSION`-Env half nicht. Deshalb File-Provider-Workaround. Folge: label-basierte Auto-Discovery funktioniert (noch) nicht; Docker-Provider spammt Fehler ins Log. Optionen: Docker downgraden, Traefik-Update abwarten, oder dauerhaft File-Provider nutzen.
- ✅ **Resend-Key rotiert** (war via `resendApi.txt` kurz im Repo). Aus Repo-Tip + Server entfernt; bleibt in der Git-History.
- ✅ **GitHub-Actions-Secrets gesetzt** (`DEPLOY_HOST/USER/SSH_KEY`) → Auto-Deploy aktiv (main→Prod, develop→Staging), end-to-end getestet.
- ✅ **Resend konfiguriert + getestet:** Absender `antrag@eforms.de`, Domain `eforms.de` in Resend verifiziert; Versand-Test HTTP 200. E-Mail-Versand produktiv.
- ⚠️ **Traefik Docker-Provider** weiterhin via File-Provider umgangen (Docker 29 API-Inkompatibilität) — siehe oben.

_Runbook in `docs/production/deployment-hetzner-cloudflare.md`._

### Nachtrag (PROJ-20, 2026-07-02)
FlexCover-Prod (`flexcover.eforms.de`) wurde stillgelegt (EH-Absage): Container/Route/DNS/Workflow entfernt. **Produkt-Prod ist jetzt das Portal** (`portal.eforms.de`, Branch `main`, Supabase `portal-prod`); Staging bleibt `flexcover-staging.eforms.de` (Branch `develop`, Supabase `portal-dev`). Details: PROJ-20.
