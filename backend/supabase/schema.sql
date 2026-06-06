-- Emotional Weather Map — Lideta MVP schema
-- Run this first in Supabase SQL Editor (New query → Run)

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  emotion text not null check (
    emotion in (
      'stressed',
      'calm',
      'anxious',
      'energized',
      'lonely',
      'burned_out',
      'motivated'
    )
  ),
  stress_level int not null check (stress_level between 1 and 10),
  energy_level int not null check (energy_level between 1 and 10),
  sleep_quality int not null check (sleep_quality between 1 and 10)
);

create index if not exists check_ins_created_at_idx
  on public.check_ins (created_at desc);

-- Data API access (required for supabase-js from frontend)
grant usage on schema public to anon, authenticated;
grant select, insert on public.check_ins to anon, authenticated;

-- RLS: anonymous check-in + read for demo heatmap
alter table public.check_ins enable row level security;

drop policy if exists "anon insert check_ins" on public.check_ins;
create policy "anon insert check_ins"
  on public.check_ins
  for insert
  to anon
  with check (true);

drop policy if exists "anon select check_ins" on public.check_ins;
create policy "anon select check_ins"
  on public.check_ins
  for select
  to anon
  using (true);

drop policy if exists "authenticated insert check_ins" on public.check_ins;
create policy "authenticated insert check_ins"
  on public.check_ins
  for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated select check_ins" on public.check_ins;
create policy "authenticated select check_ins"
  on public.check_ins
  for select
  to authenticated
  using (true);
