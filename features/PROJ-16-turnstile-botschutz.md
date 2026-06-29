# PROJ-16: Bot-Schutz mit Cloudflare Turnstile

## Status: Deployed
**Created:** 2026-06-28
**Last Updated:** 2026-06-29

## Dependencies
- Requires: PROJ-2 (User Authentication) — Turnstile auf Registrierung/Login/Passwort-Reset
- Requires: PROJ-6 (Einreichung) — Turnstile auf der Einreichungs-API
- Requires: PROJ-14 (Infra) — neue Build-Arg/Env, Deploy

## Ziel
Automatisierte Angriffe/Missbrauch auf den Formularen verhindern: Massen-Registrierungen, Brute-Force-Login, Reset-Mail-Bombing und automatisierte Einreichungen — mit **Cloudflare Turnstile** (datenschutzfreundliche CAPTCHA-Alternative, passt zur bestehenden Cloudflare-Nutzung).

## Geschützte Formulare (alle vier)
1. **Registrierung**
2. **Login**
3. **Passwort vergessen**
4. **Antrag einreichen**

## Architektur (zwei Mechanismen)
- **Auth-Formulare (1–3):** laufen client­seitig über **Supabase Auth**. → **Supabase-eigene Turnstile-Unterstützung** nutzen: in Supabase (Auth → Settings → Bot/Abuse Protection) **CAPTCHA mit Turnstile aktivieren** (Secret Key hinterlegen). Im Client das Turnstile-Widget rendern und den Token als `options.captchaToken` an `signUp` / `signInWithPassword` / `resetPasswordForEmail` mitgeben. Verifizierung übernimmt Supabase serverseitig — **kein eigener Verify-Code**.
- **Antrag einreichen (4):** läuft über unsere **`POST /api/submissions/[formId]`**. → Client sendet den Turnstile-Token mit; die Route verifiziert ihn **serverseitig gegen `https://challenges.cloudflare.com/turnstile/v0/siteverify`** (mit Secret Key + Client-IP via `CF-Connecting-IP`) **vor** der Protokollierung. Bei ungültigem/fehlendem Token → 400, keine Einreichung.

## Komponenten
- Wiederverwendbare Client-Komponente **`<TurnstileWidget onToken={…} />`** (lädt das Turnstile-Script einmal, rendert das Widget, liefert den Token; Reset bei Ablauf/Fehler).
- Einbindung in `register-form`, `login-form`, `forgot-password-form` (Token → Supabase-Auth-Call) und in den Einreichen-Flow (Token → `submitForm`).
- Submit-Buttons bleiben deaktiviert, bis ein Token vorliegt.

## User Stories
- Als Betreiber möchte ich Bots an Registrierung/Login/Reset/Einreichung abwehren, damit kein Missbrauch (Spam-Konten, Mail-Bombing, Brute-Force) entsteht.
- Als legitimer Nutzer möchte ich möglichst unsichtbar verifiziert werden (Turnstile läuft meist ohne Interaktion), damit der Flow nicht stört.

## Acceptance Criteria
- [ ] Angenommen ein Nutzer öffnet Registrierung/Login/Passwort-vergessen, wenn die Seite lädt, dann erscheint das Turnstile-Widget und der Absenden-Button ist erst nach erfolgreicher Verifizierung aktiv.
- [ ] Angenommen ein gültiger Turnstile-Token, wenn der Nutzer ein Auth-Formular absendet, dann akzeptiert Supabase die Aktion (Captcha serverseitig verifiziert).
- [ ] Angenommen ein fehlender/ungültiger Token, wenn ein Auth-Formular abgesendet wird, dann lehnt Supabase mit Captcha-Fehler ab (Fehlermeldung im UI).
- [ ] Angenommen die Einreichungs-API erhält einen gültigen Token, wenn eingereicht wird, dann verifiziert die Route ihn serverseitig und fährt fort.
- [ ] Angenommen die Einreichungs-API erhält keinen/ungültigen Token, wenn eingereicht wird, dann antwortet sie mit 400 und es wird **nicht** eingereicht (kein DB-Eintrag, keine E-Mail).
- [ ] Angenommen Turnstile/Cloudflare ist nicht erreichbar, wenn ein Nutzer absendet, dann erhält er eine klare Fehlermeldung (kein stiller Durchlass).

## Edge Cases / Risiken
- **Token-Ablauf** (~300 s): Widget zurücksetzen / neu anfordern; Button wieder sperren.
- **JS deaktiviert / Widget lädt nicht:** Absenden bleibt gesperrt — bewusst (Schutz vor Umgehung).
- **Echte Client-IP:** hinter Cloudflare/Traefik in `CF-Connecting-IP` (für siteverify optional, erhöht Genauigkeit).
- **Doppelnutzung des Secret Keys:** derselbe Secret Key wird in Supabase (Auth-Captcha) **und** in unserer Server-`.env` (Einreichungs-Verify) hinterlegt — beides serverseitig, nie im Browser.
- **DSGVO:** Turnstile ist Cloudflare (bereits im Datenpfad, AVV ohnehin nötig).

## Technische Anforderungen
- **Env:** `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (öffentlich, Build-Arg wie die Supabase-Keys) + `TURNSTILE_SECRET_KEY` (Server, für die Einreichungs-Verify). In `.env.local.example` dokumentieren.
- **Supabase:** CAPTCHA-Schutz (Turnstile) im Dashboard aktivieren + Secret Key hinterlegen (DEV + PROD).
- **Build/Deploy:** Dockerfile/Compose um das neue Build-Arg ergänzen; Server-`.env` (Prod + Staging) um beide Werte ergänzen.

## Out of Scope
- Eigene Rate-Limiting-Logik (OBS-2) — separat.
- Turnstile auf rein internen/eingeloggten Nebenflüssen außer der Einreichung.

## Decision Log
### Product/Tech Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Turnstile auf allen vier Formularen | Nutzerwunsch; deckt alle missbrauchsanfälligen Flows ab | 2026-06-28 |
| Auth-Captcha über Supabase-Bordmittel, nicht eigener Verify | Supabase macht die Auth-Calls; native Turnstile-Unterstützung = weniger Code, korrekt serverseitig | 2026-06-28 |
| Einreichung: eigener siteverify in der Route | Eigene API → eigener serverseitiger Check vor Protokollierung | 2026-06-28 |

## Open Questions
- [ ] Site Key + Secret Key vom erstellten Turnstile-Widget (Betreiber liefert).
- [ ] Turnstile-Domains: `flexcover.eforms.de` + `flexcover-staging.eforms.de` (+ `localhost` für Dev) im Widget hinterlegt?

## Tech Design (Solution Architect)
_Siehe „Architektur" oben (kompakt) — bei Bedarf via /architecture vertiefen._

## QA Test Results
_To be added by /qa_

## Deployment

**Live seit 2026-06-29** auf Prod + Staging.

**Umgesetzt:**
- `<TurnstileWidget>` (`src/components/turnstile/`) auf Registrierung, Login, Passwort-vergessen und Antrag-Einreichung; Submit erst nach Token, Token-Reset nach jedem Versuch.
- **Auth-Formulare:** Token wird an `supabase.auth.*` als `options.captchaToken` durchgereicht → **Supabase verifiziert** (natives Turnstile-Captcha, schützt die Auth-Endpoints direkt, auch gegen Direktaufrufe der anon-API). `auth.ts` prüft den Token NICHT selbst (Einmal-Token).
- **Einreichung:** eigener `siteverify` in `POST /api/submissions/[formId]` (`src/lib/turnstile/verify.ts`) vor der Protokollierung.
- Env: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (Build-Arg, beide .env) + `TURNSTILE_SECRET_KEY` (Server-Runtime, für die Einreichungs-Verify). Beide auf Prod + Staging gesetzt.

**Konfig-Voraussetzungen (gelernt beim Rollout):**
- **Supabase-Captcha** in **beiden** Projekten (DEV + PROD) aktiviert, Provider **Turnstile**, **Secret Key = genau der des Widgets** (Site Key `0x4AAAAAADsTIdQ…`). Ein falscher Secret → `invalid-input-secret`.
- **Turnstile-Hostnames:** `eforms.de` reicht — deckt automatisch alle Subdomains (Prod **und** Staging) ab.
- **Supabase-Auth-SMTP-Absender** muss auf der in Resend verifizierten Domain liegen (`@eforms.de`); ein alter `@formatix.de`-Absender → `500: Error sending confirmation email`.
- **Turnstile-Verify ist „rollout-sicher":** ohne gesetztes Secret deaktiviert (App bleibt nutzbar).

**Offen / Hinweis:** `.env.local.example` noch um beide Variablen ergänzen (Deny-Regel verhindert automatische Bearbeitung). AVV mit Cloudflare (Turnstile) ist Teil des bestehenden Cloudflare-AVV.
