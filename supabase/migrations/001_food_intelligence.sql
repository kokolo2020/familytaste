-- FamilyTaste Food Intelligence foundation
-- Run this migration in Supabase SQL Editor before enabling the next app features.

-- 1) Extend existing food entries safely.
alter table public.food_entries
  add column if not exists dish_category text,
  add column if not exists cuisine text,
  add column if not exists meal_rating integer check (meal_rating between 1 and 5),
  add column if not exists ai_health_score integer check (ai_health_score between 0 and 100),
  add column if not exists ai_tags text[] default '{}';

-- 2) Restaurant profiles. One restaurant can have many food entries.
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete cascade,
  name text not null,
  location_name text,
  cuisine text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, name, location_name)
);

-- 3) Dish profiles. One dish can be repeated across restaurants and months.
create table if not exists public.dishes (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete cascade,
  name text not null,
  cuisine text,
  dish_category text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, name)
);

-- 4) Optional links from meals to normalized restaurant/dish records.
alter table public.food_entries
  add column if not exists restaurant_id uuid references public.restaurants(id) on delete set null,
  add column if not exists dish_id uuid references public.dishes(id) on delete set null;

-- 5) Repeat-dish statistics view.
create or replace view public.dish_repeat_stats as
select
  family_id,
  lower(trim(food_name)) as dish_key,
  min(food_name) as dish_name,
  count(*) as total_times_eaten,
  count(*) filter (where eaten_at >= date_trunc('week', now())) as times_this_week,
  count(*) filter (where eaten_at >= date_trunc('month', now())) as times_this_month,
  count(*) filter (where eaten_at >= date_trunc('year', now())) as times_this_year,
  round(avg(calories)::numeric, 0) as avg_calories,
  round(avg(meal_rating)::numeric, 2) as avg_rating,
  max(eaten_at) as last_eaten_at
from public.food_entries
where food_name is not null and trim(food_name) <> ''
group by family_id, lower(trim(food_name));

-- 6) Restaurant statistics view.
create or replace view public.restaurant_stats as
select
  family_id,
  lower(trim(restaurant_name)) as restaurant_key,
  min(restaurant_name) as restaurant_name,
  count(*) as total_visits,
  count(*) filter (where eaten_at >= date_trunc('month', now())) as visits_this_month,
  round(avg(price)::numeric, 2) as avg_spend,
  round(avg(meal_rating)::numeric, 2) as avg_rating,
  round(avg(ai_health_score)::numeric, 0) as avg_ai_health_score,
  max(eaten_at) as last_visit_at
from public.food_entries
where restaurant_name is not null and trim(restaurant_name) <> ''
group by family_id, lower(trim(restaurant_name));

-- 7) Helpful indexes for statistics and filters.
create index if not exists food_entries_family_eaten_at_idx on public.food_entries(family_id, eaten_at desc);
create index if not exists food_entries_family_food_name_idx on public.food_entries(family_id, lower(trim(food_name)));
create index if not exists food_entries_family_restaurant_idx on public.food_entries(family_id, lower(trim(restaurant_name)));
