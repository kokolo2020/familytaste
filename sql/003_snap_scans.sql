-- FamilyBites migration 003 — synced snap scan album across devices
-- Paste this whole file into the Supabase SQL Editor and click Run.

create table if not exists snap_scans (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  food_name text,
  calories integer,
  notes text,
  photo_url text,
  ingredients jsonb default '[]'::jsonb,
  tags jsonb default '[]'::jsonb,
  confidence text,
  ai_note text,
  foods jsonb default '[]'::jsonb,
  linked_meal_id uuid references food_entries(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists snap_scans_family_created_at_idx
  on snap_scans (family_id, created_at desc);

alter table snap_scans enable row level security;

drop policy if exists "family can read snap scans" on snap_scans;
create policy "family can read snap scans" on snap_scans
  for select to anon using (true);

drop policy if exists "family can save snap scans" on snap_scans;
create policy "family can save snap scans" on snap_scans
  for insert to anon with check (true);

drop policy if exists "family can update snap scans" on snap_scans;
create policy "family can update snap scans" on snap_scans
  for update to anon using (true) with check (true);

drop policy if exists "family can delete snap scans" on snap_scans;
create policy "family can delete snap scans" on snap_scans
  for delete to anon using (true);
