-- Institutional contact / partnership inquiries
-- Run in Supabase SQL Editor after schema.sql (or use setup.sql)

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  intent text not null check (
    intent in ('demo', 'pilot', 'partner', 'data')
  ),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 3 and 320),
  organization text check (organization is null or char_length(organization) <= 200),
  message text check (message is null or char_length(message) <= 4000)
);

create index if not exists contact_inquiries_created_at_idx
  on public.contact_inquiries (created_at desc);

grant insert on public.contact_inquiries to anon, authenticated;

alter table public.contact_inquiries enable row level security;

drop policy if exists "anon insert contact_inquiries" on public.contact_inquiries;
create policy "anon insert contact_inquiries"
  on public.contact_inquiries
  for insert
  to anon
  with check (true);

drop policy if exists "authenticated insert contact_inquiries" on public.contact_inquiries;
create policy "authenticated insert contact_inquiries"
  on public.contact_inquiries
  for insert
  to authenticated
  with check (true);

-- No select/update/delete for public roles — read via Supabase dashboard (service role)
