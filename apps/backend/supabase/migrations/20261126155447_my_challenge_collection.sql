-- Hue from red through violet and magenta, then greys ordered by lightness.
create function public.challenge_color_order(p_hex text)
returns numeric
language sql immutable
set search_path = ''
as $$
  with bytes as (
    select decode(substr(p_hex, 2), 'hex') as rgb
  ), channels as (
    select get_byte(rgb, 0)::numeric as r,
      get_byte(rgb, 1)::numeric as g, get_byte(rgb, 2)::numeric as b
    from bytes
  ), bounds as (
    select *, greatest(r, g, b) as high,
      greatest(r, g, b) - least(r, g, b) as chroma
    from channels
  )
  select case
    when p_hex is null then 361
    when chroma < 12 then 360 + high / 256
    else mod(360 + 60 * case
      when high = r then (g - b) / chroma
      when high = g then (b - r) / chroma + 2
      else (r - g) / chroma + 4
    end, 360)
  end
  from bounds;
$$;

create function public.get_my_challenge_palette(
  p_player uuid,
  p_before date,
  p_today date,
  p_min_score numeric,
  p_gallery boolean
)
returns jsonb
language sql stable
security definer
set search_path = ''
as $$
  with candidate as (
    select r.challenge_date, d.color_hex, r.score, r.photo_object_path,
      public.challenge_color_order(d.color_hex) as color_order
    from public.social_results r
    left join public.daily_challenges d using (challenge_date)
    where r.player_id = p_player
      and r.challenge_date <= p_today
      and case when p_gallery then r.photo_object_path is not null
        else d.color_hex is not null and r.score >= p_min_score end
  ), cursor_order as (
    select public.challenge_color_order((
      select d.color_hex from public.daily_challenges d where d.challenge_date = p_before
    )) as value
  ), page as (
    select c.*
    from candidate c cross join cursor_order cursor
    where p_before is null or c.color_order > cursor.value
      or (c.color_order = cursor.value and c.challenge_date < p_before)
    order by c.color_order, c.challenge_date desc
    limit 25
  ), visible as (
    select * from page order by color_order, challenge_date desc limit 24
  )
  select jsonb_build_object(
    'offeredCount', case when not p_gallery then (
      select count(*)
      from public.daily_challenges d
      join auth.users u on u.id = p_player
      where d.challenge_date between (u.created_at at time zone 'UTC')::date and p_today
    ) end,
    'validatedCount', case when not p_gallery then (select count(*) from candidate) end,
    'entries', coalesce((
      select jsonb_agg(jsonb_build_object(
        'date', challenge_date,
        'hex', color_hex,
        'score', score,
        'photoPath', case when p_gallery then photo_object_path end
      ) order by color_order, challenge_date desc) from visible
    ), '[]'::jsonb),
    'nextCursor', case when (select count(*) from page) > 24
      then (select challenge_date from visible order by color_order desc, challenge_date limit 1)
    end
  );
$$;

revoke all on function public.challenge_color_order(text) from public, anon, authenticated;
revoke all on function public.get_my_challenge_palette(uuid, date, date, numeric, boolean)
  from public, anon, authenticated;
grant execute on function public.get_my_challenge_palette(uuid, date, date, numeric, boolean)
  to service_role;
