-- PROJ-1: Härtung der Funktionen (Security-Advisor-Findings)

-- set_updated_at: festen, leeren search_path setzen (greift auf keine Tabellen zu).
alter function public.set_updated_at() set search_path = '';

-- handle_new_user darf ausschließlich vom Trigger aufgerufen werden,
-- nicht als REST-RPC durch anon/authenticated. EXECUTE entziehen.
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
