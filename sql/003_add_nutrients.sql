-- Adds AI-scanned micronutrient fields to food_entries.
-- Run in Supabase SQL Editor.

alter table food_entries
  add column if not exists fiber_g numeric,
  add column if not exists iron_mg numeric,
  add column if not exists calcium_mg numeric,
  add column if not exists vitamin_d_mcg numeric;
