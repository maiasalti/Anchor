alter table public.profiles add column if not exists support_preferences jsonb default '[]';
alter table public.profiles add column if not exists initial_mood integer;
