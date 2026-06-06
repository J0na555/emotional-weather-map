-- Lightweight abuse guard: one check-in per anonymous client_token per hour
-- Run AFTER schema.sql in Supabase SQL Editor

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
