-- PROJ-1 / BUG-1: Tabellen-Rechte für die Rolle 'authenticated' auf profiles.
-- Per SQL-Migration erstellte Tabellen erhalten keine automatischen GRANTs
-- (anders als per Dashboard erstellte). Ohne diese Rechte scheitert jeder
-- App-Zugriff mit "permission denied", noch bevor RLS ausgewertet wird.
--
-- Nur SELECT + UPDATE (passend zu den RLS-Policies profiles_select_own /
-- profiles_update_own). Kein INSERT (Anlage erfolgt per SECURITY-DEFINER-Trigger),
-- kein DELETE (Kaskade über das Auth-Konto), kein Zugriff für 'anon'.
grant select, update on public.profiles to authenticated;
