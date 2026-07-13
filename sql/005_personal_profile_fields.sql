-- MyMealMap migration 005 — persist personal profile + goal setup on members
-- Run this in the Supabase SQL Editor after the earlier schema/auth migrations.

alter table members add column if not exists first_name text;
alter table members add column if not exists last_name text;
alter table members add column if not exists height_cm numeric;
alter table members add column if not exists weight_kg numeric;
alter table members add column if not exists age integer;
alter table members add column if not exists sex text;
alter table members add column if not exists activity numeric;
alter table members add column if not exists goal text;
alter table members add column if not exists health_focus text;
alter table members add column if not exists food_alerts text;
alter table members add column if not exists target_calories integer;
alter table members add column if not exists protein_grams integer;
alter table members add column if not exists water_liters numeric;
