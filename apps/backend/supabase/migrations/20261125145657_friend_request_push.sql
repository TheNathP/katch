alter table public.friendships
add column request_id uuid not null unique default gen_random_uuid();

create function public.enqueue_friend_request_push()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  recipient uuid := case when new.requested_by = new.player_a then new.player_b else new.player_a end;
begin
  perform public.enqueue_push_notification(
    'friend-request:' || new.request_id::text,
    array[recipient],
    jsonb_build_object(
      'title', 'Nouvelle demande d’ami',
      'body', 'Un joueur souhaite t’ajouter à ses amis.',
      'destination', '/amis'
    ),
    now() + interval '24 hours'
  );
  return new;
end;
$$;

-- Account deletion can cascade through friendships under a role other than service_role.
create function public.cancel_friend_request_push()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.push_deliveries
  set status = 'failed', error_code = 'request_resolved', next_action_at = null
  where event_key = 'friend-request:' || old.request_id::text and status = 'pending';
  return null;
end;
$$;

revoke all on function public.enqueue_friend_request_push(), public.cancel_friend_request_push()
from public, anon, authenticated;

create trigger enqueue_push_after_friend_request
after insert on public.friendships
for each row
when (new.accepted_at is null)
execute function public.enqueue_friend_request_push();

create trigger cancel_push_after_friend_acceptance
after update of accepted_at on public.friendships
for each row
when (old.accepted_at is null and new.accepted_at is not null)
execute function public.cancel_friend_request_push();

create trigger cancel_push_after_friend_request_removal
after delete on public.friendships
for each row
when (old.accepted_at is null)
execute function public.cancel_friend_request_push();
