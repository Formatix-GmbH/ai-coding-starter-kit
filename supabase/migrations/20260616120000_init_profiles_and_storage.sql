-- PROJ-1: Supabase Infrastructure Setup
-- Legt das app-unabhängige Fundament: profiles-Tabelle, Auto-Profil-Trigger,
-- RLS-Baseline (default deny) und privaten Storage-Bucket für PDFs.

-- ============================================================
-- 1) profiles-Tabelle (1:1 zum Auth-Konto, Datenminimierung)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is
  'Nutzerprofil, 1:1 zum Auth-Konto. Bewusst minimal (Datenminimierung).';

-- ============================================================
-- 2) Row Level Security: default deny, dann nur Eigenzugriff
-- ============================================================
alter table public.profiles enable row level security;

-- Jeder darf ausschließlich sein eigenes Profil lesen.
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Jeder darf ausschließlich sein eigenes Profil ändern.
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Bewusst KEINE INSERT-/DELETE-Policy für Nutzer:
-- Anlage erfolgt automatisch per Trigger (SECURITY DEFINER),
-- Löschung kaskadiert über das Auth-Konto.

-- ============================================================
-- 3) updated_at automatisch pflegen
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ============================================================
-- 4) Auto-Profil bei Registrierung (kein Konto ohne Profil)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================
-- 5) Privater Storage-Bucket für erzeugte PDFs
-- ============================================================
insert into storage.buckets (id, name, public)
values ('application-pdfs', 'application-pdfs', false)
on conflict (id) do nothing;

-- Storage-RLS: Nutzer dürfen nur Dateien im eigenen Ordner
-- (Pfad-Präfix = auth.uid()) verwalten. Kein öffentlicher Zugriff.
create policy "application_pdfs_select_own"
  on storage.objects
  for select
  using (
    bucket_id = 'application-pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "application_pdfs_insert_own"
  on storage.objects
  for insert
  with check (
    bucket_id = 'application-pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "application_pdfs_update_own"
  on storage.objects
  for update
  using (
    bucket_id = 'application-pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "application_pdfs_delete_own"
  on storage.objects
  for delete
  using (
    bucket_id = 'application-pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
