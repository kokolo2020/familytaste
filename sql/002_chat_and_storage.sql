-- FamilyBites migration 002 — family chat sync, media storage, profile photos
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

-- 3. Profile photo column on members (synced avatars / uploaded photos)
alter table members add column if not exists photo_url text;

-- 4. Public storage bucket for meal photos and profile avatars
insert into storage.buckets (id, name, public)
values ('family-media', 'family-media', true)
on conflict (id) do nothing;

create policy "anon can upload family media" on storage.objects
  for insert to anon with check (bucket_id = 'family-media');
