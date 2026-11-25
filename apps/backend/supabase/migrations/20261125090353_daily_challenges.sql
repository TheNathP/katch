create table public.daily_challenges (
  challenge_date date primary key,
  color_hex text not null check (color_hex ~ '^#[0-9A-F]{6}$')
);

alter table public.daily_challenges enable row level security;
revoke all on public.daily_challenges from public, anon, authenticated;
grant select, insert on public.daily_challenges to service_role;

create function public.get_or_create_daily_challenge()
returns table (
  challenge_date date,
  color_hex text,
  ends_at timestamptz,
  server_time timestamptz
)
language plpgsql
set search_path = ''
as $$
declare
  challenge_day date;
  read_at timestamptz := clock_timestamp();
  target_hex text;
begin
  challenge_day := (read_at at time zone 'UTC')::date;

  select d.color_hex into target_hex
  from public.daily_challenges d
  where d.challenge_date = challenge_day;

  if not found then
    -- Serialize creation and recheck the date after waiting across midnight.
    perform pg_advisory_xact_lock(hashtextextended('public.daily_challenges', 0));
    read_at := clock_timestamp();
    challenge_day := (read_at at time zone 'UTC')::date;

    select d.color_hex into target_hex
    from public.daily_challenges d
    where d.challenge_date = challenge_day;

    if not found then
      select palette.hex into target_hex
      from (values
        ('#E43C52'), ('#F06292'), ('#C2185B'), ('#A62E48'), ('#FF7A1A'), ('#D35400'),
        ('#FDBA27'), ('#E2C331'), ('#FFDD77'), ('#AFCD32'), ('#729C2D'), ('#347D45'),
        ('#23AD72'), ('#149F9C'), ('#48C8D8'), ('#1982C4'), ('#3466D9'), ('#253B80'),
        ('#8A3FFC'), ('#724BB4'), ('#B083DB'), ('#BF599B'), ('#BC7049'), ('#684834'),
        ('#9A5E49'), ('#D9AB84'), ('#657479'), ('#946C7B'), ('#556B65'), ('#BFB9AC')
      ) as palette(hex)
      where palette.hex is distinct from (
        select d.color_hex
        from public.daily_challenges d
        where d.challenge_date < challenge_day
        order by d.challenge_date desc
        limit 1
      )
      order by random()
      limit 1;

      insert into public.daily_challenges (challenge_date, color_hex)
      values (challenge_day, target_hex);
    end if;
  end if;

  return query
    select challenge_day, target_hex, (challenge_day + 1)::timestamp at time zone 'UTC', read_at;
end;
$$;

revoke all on function public.get_or_create_daily_challenge() from public, anon, authenticated;
grant execute on function public.get_or_create_daily_challenge() to service_role;
