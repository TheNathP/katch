create function public.enqueue_daily_challenge_push()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.challenge_date = (clock_timestamp() at time zone 'UTC')::date then
    perform public.enqueue_push_notification(
      'daily-challenge:' || to_char(new.challenge_date, 'YYYY-MM-DD'),
      array(select distinct t.user_id from public.push_tokens t),
      jsonb_build_object(
        'title', 'Nouveau défi Katch',
        'body', 'La couleur du jour est prête à être dévoilée !',
        'destination', '/'
      ),
      (new.challenge_date + 1)::timestamp at time zone 'UTC'
    );
  end if;

  return new;
end;
$$;

revoke all on function public.enqueue_daily_challenge_push() from public, anon, authenticated;

create trigger enqueue_push_after_daily_challenge_insert
after insert on public.daily_challenges
for each row execute function public.enqueue_daily_challenge_push();
