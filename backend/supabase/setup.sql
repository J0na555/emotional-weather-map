-- Emotional Weather Map — Lideta MVP schema
-- Run this first in Supabase SQL Editor (New query → Run)

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  area text not null default 'lideta' check (
    area in ('lideta', 'bole', 'kazanchis')
  ),
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

-- Upgrade existing projects that created check_ins before area existed
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'check_ins'
      and column_name = 'area'
  ) then
    alter table public.check_ins
      add column area text not null default 'lideta';
    alter table public.check_ins
      add constraint check_ins_area_check
      check (area in ('lideta', 'bole', 'kazanchis'));
  end if;
end $$;

create index if not exists check_ins_created_at_idx
  on public.check_ins (created_at desc);

create index if not exists check_ins_area_created_at_idx
  on public.check_ins (area, created_at desc);

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
-- Aggregation views + RPC for area insights
-- Run AFTER schema.sql in Supabase SQL Editor

create or replace function public.stress_index(p_emotion text, p_stress_level int)
returns numeric
language sql
immutable
as $$
  select p_stress_level::numeric + case
    when p_emotion in ('stressed', 'anxious', 'burned_out', 'lonely') then 2
    else 0
  end;
$$;

create or replace view public.area_stats_24h as
select
  area,
  count(*)::int as check_in_count,
  round(avg(stress_level)::numeric, 2) as avg_stress,
  round(avg(public.stress_index(emotion, stress_level))::numeric, 2) as avg_stress_index,
  round(avg(energy_level)::numeric, 2) as avg_energy,
  round(avg(sleep_quality)::numeric, 2) as avg_sleep
from public.check_ins
where created_at >= now() - interval '24 hours'
group by area;

create or replace view public.area_stats_7d as
select
  area,
  count(*)::int as check_in_count,
  round(avg(stress_level)::numeric, 2) as avg_stress,
  round(avg(public.stress_index(emotion, stress_level))::numeric, 2) as avg_stress_index,
  round(avg(energy_level)::numeric, 2) as avg_energy,
  round(avg(sleep_quality)::numeric, 2) as avg_sleep
from public.check_ins
where created_at >= now() - interval '7 days'
group by area;

create or replace view public.emotion_breakdown_24h as
with counts as (
  select area, emotion, count(*)::int as emotion_count
  from public.check_ins
  where created_at >= now() - interval '24 hours'
  group by area, emotion
),
totals as (
  select area, sum(emotion_count)::int as total_count
  from counts
  group by area
)
select
  c.area,
  c.emotion,
  c.emotion_count,
  t.total_count,
  round((c.emotion_count::numeric / nullif(t.total_count, 0)) * 100, 1) as pct
from counts c
join totals t on t.area = c.area;

create or replace view public.emotion_breakdown_7d as
with counts as (
  select area, emotion, count(*)::int as emotion_count
  from public.check_ins
  where created_at >= now() - interval '7 days'
  group by area, emotion
),
totals as (
  select area, sum(emotion_count)::int as total_count
  from counts
  group by area
)
select
  c.area,
  c.emotion,
  c.emotion_count,
  t.total_count,
  round((c.emotion_count::numeric / nullif(t.total_count, 0)) * 100, 1) as pct
from counts c
join totals t on t.area = c.area;

create or replace function public.get_similar_feeling_count(
  p_area text default 'lideta',
  p_emotion text default 'stressed'
)
returns int
language sql
stable
security invoker
as $$
  select count(*)::int
  from public.check_ins
  where area = p_area
    and emotion = p_emotion
    and created_at >= now() - interval '24 hours';
$$;

create or replace function public.get_area_insights(p_area text default 'lideta')
returns json
language plpgsql
stable
security invoker
as $$
declare
  v_result json;
  v_today_avg numeric;
  v_yesterday_avg numeric;
  v_delta_pct numeric;
begin
  select round(avg(stress_level)::numeric, 2)
  into v_today_avg
  from public.check_ins
  where area = p_area
    and created_at >= date_trunc('day', now())
    and created_at < date_trunc('day', now()) + interval '1 day';

  select round(avg(stress_level)::numeric, 2)
  into v_yesterday_avg
  from public.check_ins
  where area = p_area
    and created_at >= date_trunc('day', now()) - interval '1 day'
    and created_at < date_trunc('day', now());

  v_delta_pct := case
    when v_yesterday_avg is null or v_yesterday_avg = 0 then null
    else round(
      ((coalesce(v_today_avg, 0) - v_yesterday_avg) / v_yesterday_avg) * 100,
      1
    )
  end;

  select json_build_object(
    'area', p_area,
    'last_24h', (
      select json_build_object(
        'check_in_count', check_in_count,
        'avg_stress', avg_stress,
        'avg_stress_index', avg_stress_index,
        'avg_energy', avg_energy,
        'avg_sleep', avg_sleep
      )
      from public.area_stats_24h
      where area = p_area
    ),
    'last_7d', (
      select json_build_object(
        'check_in_count', check_in_count,
        'avg_stress', avg_stress,
        'avg_stress_index', avg_stress_index,
        'avg_energy', avg_energy,
        'avg_sleep', avg_sleep
      )
      from public.area_stats_7d
      where area = p_area
    ),
    'emotion_breakdown_24h', (
      select coalesce(
        json_object_agg(
          emotion,
          json_build_object('count', emotion_count, 'pct', pct)
        ),
        '{}'::json
      )
      from public.emotion_breakdown_24h
      where area = p_area
    ),
    'emotion_breakdown_7d', (
      select coalesce(
        json_object_agg(
          emotion,
          json_build_object('count', emotion_count, 'pct', pct)
        ),
        '{}'::json
      )
      from public.emotion_breakdown_7d
      where area = p_area
    ),
    'trend', json_build_object(
      'today_avg_stress', v_today_avg,
      'yesterday_avg_stress', v_yesterday_avg,
      'delta_pct', v_delta_pct
    )
  )
  into v_result;

  return v_result;
end;
$$;

grant select on public.area_stats_24h to anon, authenticated;
grant select on public.area_stats_7d to anon, authenticated;
grant select on public.emotion_breakdown_24h to anon, authenticated;
grant select on public.emotion_breakdown_7d to anon, authenticated;
grant execute on function public.get_similar_feeling_count(text, text) to anon, authenticated;
grant execute on function public.get_area_insights(text) to anon, authenticated;
-- Seed demo data for Lideta heatmap (~75 rows, stress-skewed, last 7 days)
-- Run AFTER schema.sql and aggregates.sql in Supabase SQL Editor

truncate public.check_ins;

insert into public.check_ins (area, emotion, stress_level, energy_level, sleep_quality, created_at) values
  ('lideta', 'stressed', 6, 2, 6, now() - interval '0 days 3 hours 9 minutes'),
  ('lideta', 'stressed', 6, 1, 5, now() - interval '0 days 6 hours 14 minutes'),
  ('lideta', 'stressed', 6, 5, 3, now() - interval '0 days 6 hours 58 minutes'),
  ('lideta', 'stressed', 7, 4, 6, now() - interval '0 days 12 hours 17 minutes'),
  ('lideta', 'stressed', 7, 3, 6, now() - interval '0 days 12 hours 24 minutes'),
  ('lideta', 'stressed', 10, 4, 3, now() - interval '0 days 19 hours 20 minutes'),
  ('lideta', 'stressed', 10, 2, 4, now() - interval '0 days 20 hours 19 minutes'),
  ('lideta', 'stressed', 9, 3, 5, now() - interval '0 days 21 hours 14 minutes'),
  ('lideta', 'stressed', 10, 4, 2, now() - interval '0 days 21 hours 46 minutes'),
  ('lideta', 'stressed', 7, 2, 2, now() - interval '0 days 21 hours 47 minutes'),
  ('bole', 'stressed', 8, 1, 6, now() - interval '0 days 21 hours 56 minutes'),
  ('lideta', 'stressed', 10, 2, 6, now() - interval '1 days 4 hours 32 minutes'),
  ('lideta', 'stressed', 7, 1, 2, now() - interval '1 days 4 hours 47 minutes'),
  ('lideta', 'stressed', 6, 2, 2, now() - interval '1 days 6 hours 48 minutes'),
  ('lideta', 'stressed', 6, 3, 2, now() - interval '1 days 8 hours 8 minutes'),
  ('lideta', 'stressed', 10, 2, 4, now() - interval '1 days 14 hours 24 minutes'),
  ('lideta', 'stressed', 9, 2, 6, now() - interval '1 days 20 hours 31 minutes'),
  ('lideta', 'stressed', 7, 5, 6, now() - interval '1 days 22 hours 4 minutes'),
  ('lideta', 'stressed', 9, 2, 5, now() - interval '1 days 23 hours 35 minutes'),
  ('lideta', 'stressed', 9, 2, 2, now() - interval '2 days 1 hours 14 minutes'),
  ('lideta', 'anxious', 6, 4, 4, now() - interval '2 days 1 hours 46 minutes'),
  ('lideta', 'anxious', 9, 4, 5, now() - interval '2 days 3 hours 5 minutes'),
  ('lideta', 'anxious', 6, 1, 2, now() - interval '2 days 5 hours 23 minutes'),
  ('lideta', 'anxious', 9, 3, 2, now() - interval '2 days 5 hours 34 minutes'),
  ('lideta', 'anxious', 7, 2, 3, now() - interval '2 days 6 hours 42 minutes'),
  ('lideta', 'anxious', 10, 4, 3, now() - interval '2 days 9 hours 15 minutes'),
  ('lideta', 'anxious', 9, 2, 4, now() - interval '2 days 12 hours 17 minutes'),
  ('lideta', 'anxious', 9, 2, 2, now() - interval '2 days 13 hours 10 minutes'),
  ('lideta', 'anxious', 9, 5, 2, now() - interval '2 days 17 hours 55 minutes'),
  ('lideta', 'anxious', 6, 5, 2, now() - interval '2 days 20 hours 39 minutes'),
  ('kazanchis', 'anxious', 6, 2, 3, now() - interval '2 days 20 hours 44 minutes'),
  ('lideta', 'anxious', 9, 4, 5, now() - interval '2 days 22 hours 59 minutes'),
  ('lideta', 'anxious', 7, 4, 2, now() - interval '3 days 0 hours 7 minutes'),
  ('lideta', 'anxious', 7, 4, 2, now() - interval '3 days 0 hours 46 minutes'),
  ('lideta', 'anxious', 9, 3, 5, now() - interval '3 days 1 hours 1 minutes'),
  ('lideta', 'burned_out', 8, 4, 6, now() - interval '3 days 2 hours 35 minutes'),
  ('lideta', 'burned_out', 9, 2, 3, now() - interval '3 days 2 hours 48 minutes'),
  ('lideta', 'burned_out', 8, 2, 2, now() - interval '3 days 3 hours 22 minutes'),
  ('lideta', 'burned_out', 10, 5, 2, now() - interval '3 days 7 hours 28 minutes'),
  ('lideta', 'burned_out', 8, 1, 2, now() - interval '3 days 10 hours 17 minutes'),
  ('lideta', 'burned_out', 10, 4, 6, now() - interval '3 days 17 hours 7 minutes'),
  ('lideta', 'burned_out', 10, 2, 2, now() - interval '3 days 20 hours 29 minutes'),
  ('lideta', 'burned_out', 10, 1, 3, now() - interval '3 days 20 hours 53 minutes'),
  ('lideta', 'burned_out', 6, 5, 2, now() - interval '4 days 2 hours 37 minutes'),
  ('lideta', 'burned_out', 7, 4, 2, now() - interval '4 days 6 hours 9 minutes'),
  ('lideta', 'burned_out', 10, 2, 6, now() - interval '4 days 6 hours 45 minutes'),
  ('lideta', 'burned_out', 10, 1, 6, now() - interval '4 days 7 hours 43 minutes'),
  ('lideta', 'lonely', 6, 4, 6, now() - interval '4 days 8 hours 47 minutes'),
  ('lideta', 'lonely', 10, 5, 4, now() - interval '4 days 8 hours 49 minutes'),
  ('lideta', 'lonely', 8, 2, 4, now() - interval '4 days 8 hours 51 minutes'),
  ('bole', 'lonely', 7, 3, 5, now() - interval '4 days 12 hours 23 minutes'),
  ('lideta', 'lonely', 7, 3, 5, now() - interval '4 days 13 hours 57 minutes'),
  ('lideta', 'lonely', 8, 1, 2, now() - interval '4 days 14 hours 33 minutes'),
  ('lideta', 'lonely', 9, 5, 6, now() - interval '4 days 19 hours 1 minutes'),
  ('lideta', 'lonely', 6, 1, 6, now() - interval '4 days 20 hours 10 minutes'),
  ('lideta', 'calm', 2, 9, 8, now() - interval '4 days 22 hours 20 minutes'),
  ('lideta', 'calm', 2, 7, 6, now() - interval '4 days 23 hours 15 minutes'),
  ('lideta', 'calm', 2, 7, 8, now() - interval '5 days 3 hours 1 minutes'),
  ('lideta', 'calm', 2, 8, 10, now() - interval '5 days 5 hours 50 minutes'),
  ('lideta', 'calm', 3, 9, 10, now() - interval '5 days 8 hours 15 minutes'),
  ('lideta', 'energized', 1, 9, 8, now() - interval '5 days 8 hours 32 minutes'),
  ('lideta', 'energized', 1, 6, 8, now() - interval '5 days 10 hours 7 minutes'),
  ('lideta', 'energized', 1, 5, 10, now() - interval '5 days 13 hours 38 minutes'),
  ('lideta', 'energized', 2, 7, 8, now() - interval '5 days 20 hours 4 minutes'),
  ('lideta', 'energized', 5, 6, 8, now() - interval '5 days 22 hours 34 minutes'),
  ('lideta', 'motivated', 2, 7, 10, now() - interval '6 days 0 hours 48 minutes'),
  ('lideta', 'motivated', 4, 7, 6, now() - interval '6 days 1 hours 51 minutes'),
  ('lideta', 'motivated', 1, 8, 8, now() - interval '6 days 5 hours 32 minutes'),
  ('lideta', 'motivated', 1, 5, 8, now() - interval '6 days 5 hours 44 minutes'),
  ('lideta', 'motivated', 2, 7, 7, now() - interval '6 days 7 hours 55 minutes'),
  ('lideta', 'stressed', 9, 5, 5, now() - interval '6 days 9 hours 5 minutes'),
  ('lideta', 'stressed', 10, 1, 2, now() - interval '6 days 11 hours 36 minutes'),
  ('lideta', 'stressed', 6, 2, 6, now() - interval '6 days 11 hours 38 minutes'),
  ('lideta', 'anxious', 6, 3, 6, now() - interval '6 days 16 hours 58 minutes'),
  ('lideta', 'anxious', 10, 2, 5, now() - interval '6 days 20 hours 32 minutes');
-- Lightweight abuse guard: one check-in per anonymous client_token per hour

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'check_ins'
      and column_name = 'client_token'
  ) then
    alter table public.check_ins
      add column client_token uuid;
  end if;
end $$;

create index if not exists check_ins_client_token_created_at_idx
  on public.check_ins (client_token, created_at desc)
  where client_token is not null;

create or replace function public.enforce_check_in_cooldown()
returns trigger
language plpgsql
as $$
begin
  if new.client_token is not null then
    if exists (
      select 1
      from public.check_ins
      where client_token = new.client_token
        and created_at > now() - interval '1 hour'
    ) then
      raise exception 'CHECK_IN_COOLDOWN'
        using hint = 'You can check in again in one hour.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists check_in_cooldown on public.check_ins;
create trigger check_in_cooldown
  before insert on public.check_ins
  for each row
  execute function public.enforce_check_in_cooldown();

create or replace function public.get_check_in_cooldown(
  p_client_token uuid
)
returns int
language plpgsql
stable
security invoker
as $$
declare
  v_next_allowed timestamptz;
begin
  select max(created_at) + interval '1 hour'
  into v_next_allowed
  from public.check_ins
  where client_token = p_client_token
    and created_at > now() - interval '1 hour';

  if v_next_allowed is null then
    return 0;
  end if;

  return greatest(0, ceil(extract(epoch from (v_next_allowed - now()))))::int;
end;
$$;

grant execute on function public.get_check_in_cooldown(uuid) to anon, authenticated;
