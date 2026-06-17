-- PROJ-2: DSGVO-Einwilligung in profiles dokumentieren.
-- Zwei zusätzliche Felder + Erweiterung des handle_new_user-Triggers,
-- der die Werte aus den Registrierungs-Metadaten übernimmt.

alter table public.profiles
  add column if not exists consent_accepted_at timestamptz,
  add column if not exists privacy_version text;

comment on column public.profiles.consent_accepted_at is
  'Zeitpunkt der DSGVO-Einwilligung bei Registrierung.';
comment on column public.profiles.privacy_version is
  'Version der Datenschutzerklärung, der zugestimmt wurde.';

-- Trigger-Funktion erweitern: full_name + privacy_version aus Metadaten,
-- consent_accepted_at = now(), sobald eine Version vorliegt.
-- Hinweis: CREATE OR REPLACE behält bestehende Grants/Revokes (search_path bleibt gesetzt).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, privacy_version, consent_accepted_at)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'privacy_version',
    case
      when (new.raw_user_meta_data ->> 'privacy_version') is not null then now()
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
