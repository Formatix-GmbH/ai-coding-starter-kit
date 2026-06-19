-- PROJ-4: 14-Tage-Aufbewahrung der Server-Entwürfe via pg_cron.
-- Belt-and-suspenders: zusätzlich gibt die Lade-API nie einen abgelaufenen
-- Entwurf zurück (Lazy-Guard), sodass Korrektheit auch ohne laufenden Job
-- gewährleistet ist.
--
-- Hinweis: pg_cron benötigt entsprechende Rechte. Falls die Extension im
-- Projekt nicht verfügbar ist, kann dieser Block übersprungen werden — der
-- Lazy-Guard in der API sorgt weiterhin dafür, dass abgelaufene Entwürfe nicht
-- mehr ausgeliefert und beim Zugriff gelöscht werden.

create extension if not exists pg_cron;

-- Täglich um 03:00 UTC alle Entwürfe löschen, die 14 Tage nicht bearbeitet
-- wurden. cron.schedule mit benanntem Job ist idempotent (aktualisiert den Job
-- bei erneuter Ausführung der Migration).
select cron.schedule(
  'delete-stale-form-drafts',
  '0 3 * * *',
  $$ delete from public.form_drafts where updated_at < now() - interval '14 days' $$
);
