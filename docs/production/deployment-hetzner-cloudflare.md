# Deployment-Runbook — Hetzner Cloud + Cloudflare (PROJ-14)

> **Update 2026-06-24 — Reverse-Proxy:** Auf dem Cloud Server läuft bereits ein zentraler **Traefik** (`/opt/apps/traefik`, v3.4, Docker-Provider, externes Netz `proxy`). Die App wird **dort eingehängt** (Traefik-Labels in `docker-compose.yml`), **kein eigenes Caddy**. TLS macht Traefik mit dem **Cloudflare-Origin-Zertifikat** über einen File-Provider (`/opt/apps/traefik/dynamic/tls.yml`, Certs unter `/opt/apps/traefik/certs/`). Die Caddy-Abschnitte unten sind damit hinfällig; sonst gilt das Runbook unverändert.

Zielarchitektur (Hybrid):
- **Hetzner Cloud Server** (Ubuntu 24.04, ≥ CX22, Root) → Docker Compose: **Next.js-App + Caddy**.
- **DB/Auth:** Supabase (extern, EU) — kein DB-Container.
- **Managed Server:** bleibt für Mail; DNS zieht zu Cloudflare.
- **Public:** `https://flexcover.eforms.de` hinter **Cloudflare** (Proxy, SSL **Full (strict)** + Origin-Cert).

> Die App ist **eine** Next.js-Anwendung: Frontend + API-Routen + serverseitiges PDF (react-pdf) laufen im selben Prozess. Kein separater Backend-/PDF-/DB-Dienst.

---

## 1. Cloud Server vorbereiten
```bash
# als root auf dem frischen Ubuntu-Server
apt update && apt -y upgrade
apt -y install docker.io docker-compose-plugin git
systemctl enable --now docker

# Deploy-Benutzer + SSH-Key
adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy
mkdir -p /home/deploy/.ssh && chmod 700 /home/deploy/.ssh
# öffentlichen Deploy-Key in /home/deploy/.ssh/authorized_keys eintragen
chown -R deploy:deploy /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
```

## 2. Cloudflare + DNS
1. `eforms.de`-Zone bei Cloudflare anlegen, Nameserver beim Registrar auf Cloudflare umstellen.
2. **Bestehende Records 1:1 übernehmen — insbesondere MX/SPF/DKIM/DMARC**, sonst bricht der Mailempfang des Managed Servers.
3. A-Record **`flexcover` → öffentliche IP des Cloud Servers**, Proxy **aktiv („orange")**.
4. SSL/TLS-Modus auf **Full (strict)** setzen.
5. **Origin Certificate** erzeugen (SSL/TLS → Origin Server → Create Certificate).

## 3. Origin-Zertifikat auf den Server
```bash
sudo -u deploy mkdir -p /opt/flexcover/caddy/certs
# Inhalt aus Cloudflare einfügen:
#   /opt/flexcover/caddy/certs/origin.pem      (Zertifikat)
#   /opt/flexcover/caddy/certs/origin-key.pem  (privater Schlüssel)
chmod 600 /opt/flexcover/caddy/certs/origin-key.pem
```

## 4. Repo + Server-`.env`
```bash
sudo -u deploy git clone https://github.com/Formatix-GmbH/ai-coding-starter-kit /opt/flexcover
cd /opt/flexcover
# .env anlegen (NICHT ins Repo!):
```
**`/opt/flexcover/.env`:**
```dotenv
# Öffentlich (Build + Runtime) — Anon-Key ist publishable, kein Secret
NEXT_PUBLIC_SUPABASE_URL=https://<PROD-PROJEKT>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod-anon-key>

# Secrets (nur Runtime, nur Server)
RESEND_API_KEY=<resend-api-key>
SUBMISSION_EMAIL_FROM=antrag@eforms.de   # verifizierte Resend-Absenderdomain
```

> **`.env.local.example` im Repo** noch um `RESEND_API_KEY` und `SUBMISSION_EMAIL_FROM` ergänzen (Doku-Pflicht; konnte vom Agent wegen Deny-Regel auf `.env*` nicht automatisch geschrieben werden).

## 5. GitHub-Secrets (Settings → Secrets and variables → Actions)
- `DEPLOY_HOST` = Server-IP
- `DEPLOY_USER` = `deploy`
- `DEPLOY_SSH_KEY` = privater Deploy-Key (PEM)
- `DEPLOY_PATH` = `/opt/flexcover`

## 6. Supabase (PROD) konfigurieren
1. **Auth → URL Configuration:** Site-URL `https://flexcover.eforms.de`, Redirect-URLs `https://flexcover.eforms.de/**`.
2. **Migrationen anwenden** (per Supabase-MCP/CLI auf das PROD-Projekt):
   `form_drafts`, `form_drafts_retention`, `submissions`, `submissions_retention`.
3. Danach **Security-Advisor** prüfen (RLS).

## 7. Erstes Deploy
```bash
cd /opt/flexcover
docker compose up -d --build
docker compose ps          # app + caddy „healthy/Up"
docker compose logs -f app # auf Fehler prüfen
```
Ab dann deployt jeder Push auf `main` automatisch via GitHub Actions (`.github/workflows/deploy.yml`).

## 8. Smoke-Test (Produktion)
- `https://flexcover.eforms.de` lädt mit gültigem TLS (kein Zertwarnung, keine Redirect-Schleife).
- Registrieren/Anmelden inkl. E-Mail-Link.
- Antrag ausfüllen → **Einreichen** → Bestätigungsseite + Referenz; **PDF-Download** (Fonts/Banner korrekt → bestätigt, dass `public/` im Image liegt).
- E-Mail mit PDF kommt an (Resend).
- „Meine Einreichungen" zeigt den Eintrag.

## Rollback
```bash
cd /opt/flexcover
git log --oneline -5
git checkout <letzter-guter-commit>
docker compose up -d --build
```

## DSGVO-Hinweise
- **AVV** mit **Cloudflare** (zusätzlicher Auftragsverarbeiter im Datenpfad) und **Resend** abschließen; bei Cloudflare EU-Data-Localization prüfen.
- Supabase (eu-central) + Resend (EU) bleiben EU. Kein PII in Logs.

## Bekannte Stolpersteine
- **Fehlendes `public/` im Image** → serverseitiges PDF schlägt fehl (Arimo/Banner). Das Dockerfile kopiert `public/` explizit — nicht entfernen.
- **NEXT_PUBLIC_* fehlen beim Build** → Build bricht (env-Validierung). Müssen als Build-Args/`.env` vorhanden sein.
- **Cloudflare „Flexible"** statt „Full (strict)" → Redirect-Schleifen. Immer Full (strict).
- **MX-Records nach DNS-Umzug vergessen** → Mailausfall.
