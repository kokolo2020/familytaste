-- FamilyBites starter Supabase schema
-- Run this later in Supabase SQL Editor.

create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  name text not null,
  avatar text default '👤',
  role text default 'member',
  created_at timestamptz default now()
);

-- Note: the live table also has description (used for notes), currency (default 'THB'),
-- protein_g, carbs_g, fat_g, vegetable_score, fruit_score.
create table if not exists food_entries (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  food_name text not null,
  description text,
  restaurant_name text,
  location_name text,
  price numeric,
  currency text default 'THB',
  calories integer,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  vegetable_score integer default 0,
  fruit_score integer default 0,
  photo_url text,
  eaten_at timestamptz default now(),
  created_at timestamptz default now()
);

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

create table if not exists favorite_restaurants (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  name text not null,
  phone text,
  address text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists family_chat (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  member_name text,
  message text not null,
  created_at timestamptz default now()
);

create table if not exists chef_orders (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  member_id uuid references members(id) on delete set null,
  batch_id text,
  food_name text not null,
  detail text,
  emoji text default '🍽️',
  photo text,
  status text default 'sent',
  created_at timestamptz default now()
);

create table if not exists chef_voice_notes (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  member_id uuid references members(id) on delete set null,
  audio_url text not null,
  created_at timestamptz default now()
);

create table if not exists weekly_reports (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  week_start date not null,
  total_meals integer default 0,
  total_calories integer default 0,
  ai_summary text,
  created_at timestamptz default now()
);
