-- PROJ-6: Formular-Einreichung & Bestätigung — Einreichungen.
-- Eine Zeile je Einreichung; mehrere pro (Nutzer, Formular) sind erlaubt
-- (Wiedereinreichung nach Korrektur = eigener neuer Eintrag). Daten-Snapshot als
-- JSON, KEIN PDF gespeichert (aus dem Snapshot identisch reproduzierbar →
-- Datenminimierung). RLS owner-only (Muster aus PROJ-1/PROJ-4). 30 Tage Aufbewahrung.

-- ============================================================
-- 1) Tabelle submissions
-- ============================================================
create table if not exists public.submissions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  form_id       text not null,
  reference     text not null unique,
  data          jsonb not null default '{}'::jsonb,
  submitted_at  timestamptz not null default now()
);

comment on table public.submissions is
  'Eingereichte Anträge (PROJ-6). Mehrere je (user_id, form_id) möglich. 30 Tage Aufbewahrung. Kein PDF gespeichert.';
comment on column public.submissions.reference is
  'Menschenlesbare, eindeutige Referenznummer (z. B. FC-2026-A1B2C3).';
comment on column public.submissions.data is
  'Snapshot der eingereichten, bereinigten Formularwerte (identisch zur PDF-Quelle).';

-- ============================================================
-- 2) Row Level Security: default deny, dann nur Eigenzugriff
-- ============================================================
alter table public.submissions enable row level security;

create policy "submissions_select_own"
  on public.submissions
  for select
  using (auth.uid() = user_id);

create policy "submissions_insert_own"
  on public.submissions
  for insert
  with check (auth.uid() = user_id);

-- Bewusst KEINE update-/delete-Policy: Einreichungen sind unveränderlich; das
-- Löschen übernimmt ausschließlich der Aufbewahrungs-Job (läuft mit erhöhten
-- Rechten und unterliegt nicht der RLS). Manuelles Löschen ist im MVP nicht
-- vorgesehen (Datenminimierung greift über die 30-Tage-Frist).

-- ============================================================
-- 3) Tabellen-Rechte (per SQL erstellte Tabellen erhalten keine automatischen
--    GRANTs — vgl. PROJ-1/BUG-1). Nur 'authenticated'; 'anon' bewusst nicht
--    (Einreichen erfordert ein Konto).
-- ============================================================
grant select, insert on public.submissions to authenticated;

-- ============================================================
-- 4) Indizes
-- ============================================================
-- Liste „eigene Einreichungen, neueste zuerst".
create index if not exists idx_submissions_user_submitted
  on public.submissions (user_id, submitted_at desc);
-- Hilft dem Aufräum-Job.
create index if not exists idx_submissions_submitted_at
  on public.submissions (submitted_at);
