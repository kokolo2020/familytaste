-- MyMealMap nutrition insights schema
-- Additive only: existing meal and profile data remain unchanged.

create table if not exists public.meal_nutrition_estimates (
  id uuid primary key default gen_random_uuid(),
  family_id uuid,
  member_id uuid,
  meal_id uuid,
  source_text text,
  nutrients jsonb not null default '{}'::jsonb,
  matched_foods jsonb not null default '[]'::jsonb,
  confidence text not null default 'needs-confirmation'
    check (confidence in ('high', 'medium', 'low', 'needs-confirmation')),
  estimation_version text not null default 'v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meal_nutrition_estimates_member_idx
  on public.meal_nutrition_estimates (member_id, created_at desc);

create table if not exists public.weekly_nutrition_reports (
  id uuid primary key default gen_random_uuid(),
  family_id uuid,
  member_id uuid,
  week_start date not null,
  week_end date not null,
  meals_analyzed integer not null default 0,
  nutrient_totals jsonb not null default '{}'::jsonb,
  nutrient_targets jsonb not null default '{}'::jsonb,
  nutrient_coverage jsonb not null default '{}'::jsonb,
  missing_nutrients jsonb not null default '[]'::jsonb,
  next_week_foods jsonb not null default '[]'::jsonb,
  supplement_review jsonb not null default '[]'::jsonb,
  confidence_summary jsonb not null default '{}'::jsonb,
  disclaimer text not null default 'Estimated from logged foods and profile information. Not medical advice.',
  created_at timestamptz not null default now(),
  unique (member_id, week_start)
);

create index if not exists weekly_nutrition_reports_member_idx
  on public.weekly_nutrition_reports (member_id, week_start desc);

-- Optional profile fields. Run only if the profiles table exists in this project.
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles'
  ) then
    alter table public.profiles add column if not exists birth_date date;
    alter table public.profiles add column if not exists sex text;
    alter table public.profiles add column if not exists height_cm numeric;
    alter table public.profiles add column if not exists weight_kg numeric;
    alter table public.profiles add column if not exists activity_level text default 'moderate';
  end if;
end $$;

comment on table public.meal_nutrition_estimates is
  'Estimated nutrients calculated from logged meal text or confirmed ingredients.';

comment on table public.weekly_nutrition_reports is
  'Weekly estimated nutrition coverage, gaps, and next-week food suggestions.';
