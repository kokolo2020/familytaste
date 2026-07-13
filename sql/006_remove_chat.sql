-- Remove Family Chat from the public product without deleting historical rows.

alter table if exists public.family_chat enable row level security;

drop policy if exists "family can read chat" on public.family_chat;
drop policy if exists "family can send chat" on public.family_chat;
drop policy if exists "family chat select own family" on public.family_chat;
drop policy if exists "family chat insert own family" on public.family_chat;

revoke all on table public.family_chat from anon;
revoke all on table public.family_chat from authenticated;

do $$
begin
  alter publication supabase_realtime drop table public.family_chat;
exception
  when undefined_object then null;
  when object_not_in_prerequisite_state then null;
end $$;
