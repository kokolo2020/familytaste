-- FamilyBites migration 002 — family chat sync + meal photo storage
-- Paste this whole file into the Supabase SQL Editor and click Run.

-- 1. Family chat table (the app also stores member_name for display)
create table if not exists family_chat (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  member_name text,
  message text not null,
  created_at timestamptz default now()
);

-- 2. Enable realtime so new messages appear instantly on other devices
do $$ begin
  alter publication supabase_realtime add table family_chat;
exception when duplicate_object then null; end $$;

-- 3. Public storage bucket for meal photos
insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', true)
on conflict (id) do nothing;

create policy "anon can upload meal photos" on storage.objects
  for insert to anon with check (bucket_id = 'meal-photos');
