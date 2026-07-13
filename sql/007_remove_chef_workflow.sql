-- Retire the family Chef workflow without deleting historical rows.

do $$
begin
  if to_regclass('public.chef_orders') is not null then
    alter table public.chef_orders enable row level security;
    revoke all on table public.chef_orders from anon;
    revoke all on table public.chef_orders from authenticated;
  end if;

  if to_regclass('public.chef_voice_notes') is not null then
    alter table public.chef_voice_notes enable row level security;
    revoke all on table public.chef_voice_notes from anon;
    revoke all on table public.chef_voice_notes from authenticated;
  end if;
end $$;
