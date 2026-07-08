-- FamilyTaste migration 002 — Google auth roles and family access control
-- Apply this in the Supabase project used by the app.

create table if not exists public.family_users (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  email text,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now(),
  unique (family_id, user_id),
  unique (member_id)
);

create or replace function public.is_family_admin(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_users fu
    where fu.family_id = target_family_id
      and fu.user_id = auth.uid()
      and fu.role = 'admin'
  );
$$;

create or replace function public.can_access_family_member(target_family_id uuid, target_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_users fu
    where fu.family_id = target_family_id
      and fu.user_id = auth.uid()
      and (
        fu.role = 'admin'
        or fu.member_id = target_member_id
      )
  );
$$;

alter table public.families enable row level security;
alter table public.family_users enable row level security;
alter table public.members enable row level security;
alter table public.food_entries enable row level security;
alter table public.favorite_restaurants enable row level security;
alter table public.family_chat enable row level security;
alter table public.bio_logs enable row level security;

drop policy if exists "families read by linked user" on public.families;
create policy "families read by linked user" on public.families
  for select to authenticated
  using (
    exists (
      select 1
      from public.family_users fu
      where fu.family_id = families.id
        and fu.user_id = auth.uid()
    )
  );

drop policy if exists "families insert by authenticated user" on public.families;
create policy "families insert by authenticated user" on public.families
  for insert to authenticated
  with check (true);

drop policy if exists "family_users self read" on public.family_users;
create policy "family_users self read" on public.family_users
  for select to authenticated
  using (user_id = auth.uid() or public.is_family_admin(family_id));

drop policy if exists "family_users self insert" on public.family_users;
create policy "family_users self insert" on public.family_users
  for insert to authenticated
  with check (user_id = auth.uid() or public.is_family_admin(family_id));

drop policy if exists "family_users admin update" on public.family_users;
create policy "family_users admin update" on public.family_users
  for update to authenticated
  using (public.is_family_admin(family_id))
  with check (public.is_family_admin(family_id));

drop policy if exists "members read by role" on public.members;
create policy "members read by role" on public.members
  for select to authenticated
  using (public.can_access_family_member(family_id, id));

drop policy if exists "members admin insert" on public.members;
create policy "members admin insert" on public.members
  for insert to authenticated
  with check (public.is_family_admin(family_id));

drop policy if exists "members update own or admin" on public.members;
create policy "members update own or admin" on public.members
  for update to authenticated
  using (public.can_access_family_member(family_id, id))
  with check (public.can_access_family_member(family_id, id));

drop policy if exists "members admin delete" on public.members;
create policy "members admin delete" on public.members
  for delete to authenticated
  using (public.is_family_admin(family_id));

drop policy if exists "food_entries read by role" on public.food_entries;
create policy "food_entries read by role" on public.food_entries
  for select to authenticated
  using (public.can_access_family_member(family_id, member_id));

drop policy if exists "food_entries insert by role" on public.food_entries;
create policy "food_entries insert by role" on public.food_entries
  for insert to authenticated
  with check (public.can_access_family_member(family_id, member_id));

drop policy if exists "food_entries update by role" on public.food_entries;
create policy "food_entries update by role" on public.food_entries
  for update to authenticated
  using (public.can_access_family_member(family_id, member_id))
  with check (public.can_access_family_member(family_id, member_id));

drop policy if exists "food_entries delete by role" on public.food_entries;
create policy "food_entries delete by role" on public.food_entries
  for delete to authenticated
  using (public.can_access_family_member(family_id, member_id));

drop policy if exists "favorites read by role" on public.favorite_restaurants;
create policy "favorites read by role" on public.favorite_restaurants
  for select to authenticated
  using (public.can_access_family_member(family_id, member_id));

drop policy if exists "favorites write by role" on public.favorite_restaurants;
create policy "favorites write by role" on public.favorite_restaurants
  for all to authenticated
  using (public.can_access_family_member(family_id, member_id))
  with check (public.can_access_family_member(family_id, member_id));

drop policy if exists "chat read by family user" on public.family_chat;
create policy "chat read by family user" on public.family_chat
  for select to authenticated
  using (
    exists (
      select 1 from public.family_users fu
      where fu.family_id = family_chat.family_id
        and fu.user_id = auth.uid()
    )
  );

drop policy if exists "chat insert by family user" on public.family_chat;
create policy "chat insert by family user" on public.family_chat
  for insert to authenticated
  with check (
    exists (
      select 1 from public.family_users fu
      where fu.family_id = family_chat.family_id
        and fu.user_id = auth.uid()
        and (fu.role = 'admin' or fu.member_id = family_chat.member_id)
    )
  );

drop policy if exists "bio logs read by role" on public.bio_logs;
create policy "bio logs read by role" on public.bio_logs
  for select to authenticated
  using (public.can_access_family_member(family_id, member_id));

drop policy if exists "bio logs write by role" on public.bio_logs;
create policy "bio logs write by role" on public.bio_logs
  for all to authenticated
  using (public.can_access_family_member(family_id, member_id))
  with check (public.can_access_family_member(family_id, member_id));

drop policy if exists "anon can upload family media" on storage.objects;
drop policy if exists "authenticated can upload family media" on storage.objects;
create policy "authenticated can upload family media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'family-media');
