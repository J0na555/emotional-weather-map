-- Seed demo data for Lideta heatmap
-- Run AFTER schema.sql in Supabase SQL Editor

truncate public.check_ins;

insert into public.check_ins (emotion, stress_level, energy_level, sleep_quality, created_at) values
  ('stressed',   8, 3, 4, now() - interval '45 minutes'),
  ('stressed',   9, 2, 3, now() - interval '2 hours'),
  ('stressed',   7, 4, 5, now() - interval '5 hours'),
  ('anxious',    7, 4, 5, now() - interval '1 hour'),
  ('anxious',    8, 3, 4, now() - interval '4 hours'),
  ('anxious',    6, 5, 6, now() - interval '9 hours'),
  ('burned_out', 9, 2, 3, now() - interval '3 hours'),
  ('burned_out', 8, 2, 4, now() - interval '11 hours'),
  ('burned_out', 9, 1, 2, now() - interval '1 day'),
  ('lonely',     6, 4, 5, now() - interval '6 hours'),
  ('lonely',     7, 3, 4, now() - interval '14 hours'),
  ('lonely',     6, 4, 6, now() - interval '1 day 8 hours'),
  ('stressed',   8, 3, 4, now() - interval '18 hours'),
  ('anxious',    7, 4, 4, now() - interval '22 hours'),
  ('stressed',   9, 2, 3, now() - interval '2 days'),
  ('burned_out', 8, 2, 3, now() - interval '2 days 6 hours'),
  ('calm',       3, 7, 8, now() - interval '7 hours'),
  ('calm',       2, 8, 9, now() - interval '1 day 2 hours'),
  ('energized',  4, 8, 7, now() - interval '10 hours'),
  ('motivated',  3, 7, 8, now() - interval '12 hours'),
  ('motivated',  4, 6, 7, now() - interval '2 days'),
  ('calm',       3, 6, 8, now() - interval '3 days'),
  ('stressed',   7, 4, 5, now() - interval '1 day 12 hours'),
  ('anxious',    8, 3, 4, now() - interval '1 day 20 hours'),
  ('burned_out', 9, 2, 3, now() - interval '3 days');
