-- Persist AI food scan detail fields directly on food_entries.
alter table public.food_entries
  add column if not exists fiber_g numeric,
  add column if not exists sugar_g numeric,
  add column if not exists likely_ingredients text[] default '{}',
  add column if not exists ai_insight jsonb;

-- Keep defaults aligned for scan tag storage.
alter table public.food_entries
  alter column ai_tags set default '{}';
