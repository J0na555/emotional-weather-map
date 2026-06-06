-- Fix RLS + grants for check_ins, views, and RPC (paste in Supabase SQL Editor → Run)

grant usage on schema public to anon, authenticated;
grant select, insert on public.check_ins to anon, authenticated;

alter table public.check_ins enable row level security;

drop policy if exists "anon insert check_ins" on public.check_ins;
drop policy if exists "anon select check_ins" on public.check_ins;
drop policy if exists "authenticated insert check_ins" on public.check_ins;
drop policy if exists "authenticated select check_ins" on public.check_ins;

create policy "anon insert check_ins"
  on public.check_ins for insert to anon with check (true);

create policy "anon select check_ins"
  on public.check_ins for select to anon using (true);

create policy "authenticated insert check_ins"
  on public.check_ins for insert to authenticated with check (true);

create policy "authenticated select check_ins"
  on public.check_ins for select to authenticated using (true);

grant select on public.area_stats_24h to anon, authenticated;
grant select on public.area_stats_7d to anon, authenticated;
grant select on public.emotion_breakdown_24h to anon, authenticated;
grant select on public.emotion_breakdown_7d to anon, authenticated;
grant execute on function public.get_similar_feeling_count(text, text) to anon, authenticated;
grant execute on function public.get_area_insights(text) to anon, authenticated;
