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
