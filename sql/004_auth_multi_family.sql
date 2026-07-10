-- FamilyBites migration 004 — email login + multi-family access
-- Run this in the Supabase SQL Editor before using the new login flow.

create table if not exists family_memberships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  role text not null default 'owner',
  status text not null default 'invited',
  created_at timestamptz not null default now()
);

create unique index if not exists family_memberships_family_email_idx
  on family_memberships (family_id, lower(email));

create unique index if not exists family_memberships_family_user_idx
  on family_memberships (family_id, user_id)
  where user_id is not null;

create index if not exists family_memberships_user_id_idx
  on family_memberships (user_id);

create or replace function public.is_family_member(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_memberships fm
    where fm.family_id = target_family_id
      and fm.user_id = auth.uid()
      and fm.status = 'active'
  );
$$;

grant execute on function public.is_family_member(uuid) to authenticated;

alter table family_memberships enable row level security;
alter table families enable row level security;
alter table members enable row level security;
alter table food_entries enable row level security;
alter table snap_scans enable row level security;
alter table favorite_restaurants enable row level security;
alter table family_chat enable row level security;
alter table bio_logs enable row level security;
alter table chef_orders enable row level security;
alter table chef_voice_notes enable row level security;
alter table weekly_reports enable row level security;

drop policy if exists "family memberships select own" on family_memberships;
create policy "family memberships select own" on family_memberships
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "family memberships create self" on family_memberships;
create policy "family memberships create self" on family_memberships
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "family memberships claim invite" on family_memberships;
create policy "family memberships claim invite" on family_memberships
  for update to authenticated
  using (
    lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and (user_id is null or user_id = auth.uid())
  )
  with check (
    user_id = auth.uid()
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "families select own" on families;
create policy "families select own" on families
  for select to authenticated
  using (public.is_family_member(id));

drop policy if exists "families create own" on families;
create policy "families create own" on families
  for insert to authenticated
  with check (true);

drop policy if exists "families update own" on families;
create policy "families update own" on families
  for update to authenticated
  using (public.is_family_member(id))
  with check (public.is_family_member(id));

drop policy if exists "members select own family" on members;
create policy "members select own family" on members
  for select to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "members insert own family" on members;
create policy "members insert own family" on members
  for insert to authenticated
  with check (public.is_family_member(family_id));

drop policy if exists "members update own family" on members;
create policy "members update own family" on members
  for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

drop policy if exists "members delete own family" on members;
create policy "members delete own family" on members
  for delete to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "food entries select own family" on food_entries;
create policy "food entries select own family" on food_entries
  for select to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "food entries insert own family" on food_entries;
create policy "food entries insert own family" on food_entries
  for insert to authenticated
  with check (public.is_family_member(family_id));

drop policy if exists "food entries update own family" on food_entries;
create policy "food entries update own family" on food_entries
  for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

drop policy if exists "food entries delete own family" on food_entries;
create policy "food entries delete own family" on food_entries
  for delete to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "family can read snap scans" on snap_scans;
drop policy if exists "family can save snap scans" on snap_scans;
drop policy if exists "family can update snap scans" on snap_scans;
drop policy if exists "family can delete snap scans" on snap_scans;
drop policy if exists "snap scans select own family" on snap_scans;
create policy "snap scans select own family" on snap_scans
  for select to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "snap scans insert own family" on snap_scans;
create policy "snap scans insert own family" on snap_scans
  for insert to authenticated
  with check (public.is_family_member(family_id));

drop policy if exists "snap scans update own family" on snap_scans;
create policy "snap scans update own family" on snap_scans
  for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

drop policy if exists "snap scans delete own family" on snap_scans;
create policy "snap scans delete own family" on snap_scans
  for delete to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "favorite restaurants select own family" on favorite_restaurants;
create policy "favorite restaurants select own family" on favorite_restaurants
  for select to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "favorite restaurants insert own family" on favorite_restaurants;
create policy "favorite restaurants insert own family" on favorite_restaurants
  for insert to authenticated
  with check (public.is_family_member(family_id));

drop policy if exists "favorite restaurants update own family" on favorite_restaurants;
create policy "favorite restaurants update own family" on favorite_restaurants
  for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

drop policy if exists "favorite restaurants delete own family" on favorite_restaurants;
create policy "favorite restaurants delete own family" on favorite_restaurants
  for delete to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "family can read chat" on family_chat;
drop policy if exists "family can send chat" on family_chat;
drop policy if exists "family chat select own family" on family_chat;
create policy "family chat select own family" on family_chat
  for select to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "family chat insert own family" on family_chat;
create policy "family chat insert own family" on family_chat
  for insert to authenticated
  with check (public.is_family_member(family_id));

drop policy if exists "bio logs select own family" on bio_logs;
create policy "bio logs select own family" on bio_logs
  for select to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "bio logs insert own family" on bio_logs;
create policy "bio logs insert own family" on bio_logs
  for insert to authenticated
  with check (public.is_family_member(family_id));

drop policy if exists "bio logs update own family" on bio_logs;
create policy "bio logs update own family" on bio_logs
  for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

drop policy if exists "chef orders select own family" on chef_orders;
create policy "chef orders select own family" on chef_orders
  for select to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "chef orders insert own family" on chef_orders;
create policy "chef orders insert own family" on chef_orders
  for insert to authenticated
  with check (public.is_family_member(family_id));

drop policy if exists "chef orders update own family" on chef_orders;
create policy "chef orders update own family" on chef_orders
  for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

drop policy if exists "voice notes select own family" on chef_voice_notes;
create policy "voice notes select own family" on chef_voice_notes
  for select to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "voice notes insert own family" on chef_voice_notes;
create policy "voice notes insert own family" on chef_voice_notes
  for insert to authenticated
  with check (public.is_family_member(family_id));

drop policy if exists "weekly reports select own family" on weekly_reports;
create policy "weekly reports select own family" on weekly_reports
  for select to authenticated
  using (public.is_family_member(family_id));

drop policy if exists "weekly reports insert own family" on weekly_reports;
create policy "weekly reports insert own family" on weekly_reports
  for insert to authenticated
  with check (public.is_family_member(family_id));

drop policy if exists "weekly reports update own family" on weekly_reports;
create policy "weekly reports update own family" on weekly_reports
  for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

drop policy if exists "anon can upload family media" on storage.objects;
drop policy if exists "authenticated can upload family media" on storage.objects;
create policy "authenticated can upload family media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'family-media');

drop policy if exists "authenticated can update family media" on storage.objects;
create policy "authenticated can update family media" on storage.objects
  for update to authenticated
  using (bucket_id = 'family-media')
  with check (bucket_id = 'family-media');

drop policy if exists "authenticated can delete family media" on storage.objects;
create policy "authenticated can delete family media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'family-media');

-- One-time bootstrap for your current family data:
-- Replace owner@example.com with the email that will own the existing family.
-- If your current family row still uses the old app default, the family name is likely 'FamilyBites Demo Family'.
--
-- insert into family_memberships (family_id, email, role, status)
-- select f.id, lower('owner@example.com'), 'owner', 'active'
-- from families f
-- where f.name = 'FamilyBites Demo Family'
--   and not exists (
--     select 1
--     from family_memberships fm
--     where fm.family_id = f.id
--       and lower(fm.email) = lower('owner@example.com')
--   );
