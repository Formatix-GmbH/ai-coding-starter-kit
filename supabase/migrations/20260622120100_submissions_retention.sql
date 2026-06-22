-- PROJ-6: 30-Tage-Aufbewahrung der Einreichungen via pg_cron.
-- Belt-and-suspenders: zusätzlich gibt die Lese-Schicht keine abgelaufene
-- Einreichung mehr aus (Lazy-Guard), sodass Korrektheit auch ohne laufenden Job
-- gewährleistet ist.
--
-- Hinweis: pg_cron benötigt entsprechende Rechte. Ist die Extension im Projekt
-- nicht verfügbar, kann dieser Block übersprungen werden — der Lazy-Guard sorgt
-- weiterhin dafür, dass abgelaufene Einreichungen nicht mehr angezeigt werden.

create extension if not exists pg_cron;

-- Täglich um 03:00 UTC alle Einreichungen löschen, die älter als 30 Tage sind.
-- cron.schedule mit benanntem Job ist idempotent (aktualisiert den Job bei
-- erneuter Ausführung der Migration).
select cron.schedule(
  'delete-stale-submissions',
  '0 3 * * *',
  $$ delete from public.submissions where submitted_at < now() - interval '30 days' $$
);
