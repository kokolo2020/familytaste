-- FamilyTaste v2 auth and role foundation
-- Purpose: Google/Gmail login with Dad/Admin and member-only access.

-- Families are shared groups. Pich Family is the default seed.
create table if not exists public.v2_families (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Family members connect Supabase auth.users to one family profile.
create table if not exists public.v2_family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.v2_families(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  display_name text not null,
  avatar_url text,
  role text not null default 'member' check (role in ('admin','member')),
  status text not null default 'pending' check (status in ('pending','active','disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, email),
  unique (user_id)
);

-- Invites let Dad/Admin approve Gmail accounts before access.
create table if not exists public.v2_family_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.v2_families(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin','member')),
  invited_by uuid references public.v2_family_members(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (family_id, email)
);

insert into public.v2_families(name)
values ('Pich Family')
on conflict (name) do nothing;

alter table public.v2_families enable row level security;
alter table public.v2_family_members enable row level security;
alter table public.v2_family_invites enable row level security;

-- Helper: current user's active membership.
create or replace function public.v2_current_member_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id
  from public.v2_family_members
  where user_id = auth.uid()
    and status = 'active'
  limit 1;
$$;

create or replace function public.v2_is_admin(target_family_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.v2_family_members
    where user_id = auth.uid()
      and family_id = target_family_id
      and role = 'admin'
      and status = 'active'
  );
$$;

-- Families: users see their own family only.
create policy if not exists "v2 families visible to members"
on public.v2_families
for select
using (
  exists (
    select 1 from public.v2_family_members m
    where m.family_id = id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
);

-- Members: admins see all family members; members see only themselves.
create policy if not exists "v2 members read by role"
on public.v2_family_members
for select
using (
  user_id = auth.uid()
  or public.v2_is_admin(family_id)
);

create policy if not exists "v2 members admin update"
on public.v2_family_members
for update
using (public.v2_is_admin(family_id))
with check (public.v2_is_admin(family_id));

-- Invites: admins manage invites.
create policy if not exists "v2 invites admin read"
on public.v2_family_invites
for select
using (public.v2_is_admin(family_id));

create policy if not exists "v2 invites admin insert"
on public.v2_family_invites
for insert
with check (public.v2_is_admin(family_id));

create policy if not exists "v2 invites admin update"
on public.v2_family_invites
for update
using (public.v2_is_admin(family_id))
with check (public.v2_is_admin(family_id));
