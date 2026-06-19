-- PROJ-4: Formular-Entwurf & Auto-Save — Server-Entwürfe.
-- Ein Entwurf pro (Nutzer, Formular). Verlustfreier Formularstand als JSON,
-- inkl. aktuell ausgeblendeter Felder. RLS owner-only (Muster aus PROJ-1).

-- ============================================================
-- 1) Tabelle form_drafts
-- ============================================================
create table if not exists public.form_drafts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  form_id        text not null,
  data           jsonb not null default '{}'::jsonb,
  active_section  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- Genau ein laufender Entwurf je Nutzer und Formular.
  constraint form_drafts_user_form_unique unique (user_id, form_id)
);

comment on table public.form_drafts is
  'Zwischengespeicherte Formular-Entwürfe (PROJ-4). Ein Datensatz pro (user_id, form_id). 14 Tage Aufbewahrung.';
comment on column public.form_drafts.data is
  'Kompletter Formularstand als JSON, inkl. ausgeblendeter Felder (verlustfrei).';
comment on column public.form_drafts.updated_at is
  'Zeitstempel + Versionsmarke für optimistische Konflikterkennung.';

-- ============================================================
-- 2) Row Level Security: default deny, dann nur Eigenzugriff
-- ============================================================
alter table public.form_drafts enable row level security;

create policy "form_drafts_select_own"
  on public.form_drafts
  for select
  using (auth.uid() = user_id);

create policy "form_drafts_insert_own"
  on public.form_drafts
  for insert
  with check (auth.uid() = user_id);

create policy "form_drafts_update_own"
  on public.form_drafts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "form_drafts_delete_own"
  on public.form_drafts
  for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 3) Tabellen-Rechte (per SQL erstellte Tabellen erhalten keine
--    automatischen GRANTs — vgl. PROJ-1/BUG-1). Nur 'authenticated';
--    'anon' bekommt bewusst keinen Zugriff (Entwürfe nur mit Konto).
-- ============================================================
grant select, insert, update, delete on public.form_drafts to authenticated;

-- ============================================================
-- 4) updated_at automatisch pflegen (Funktion aus PROJ-1 wiederverwenden)
-- ============================================================
create trigger form_drafts_set_updated_at
  before update on public.form_drafts
  for each row
  execute function public.set_updated_at();

-- ============================================================
-- 5) Indizes
-- ============================================================
-- Eigenzugriff/Filter nach Nutzer (unique deckt user_id bereits links ab,
-- ein separater Index auf updated_at hilft dem Aufräum-Job).
create index if not exists idx_form_drafts_updated_at on public.form_drafts (updated_at);
