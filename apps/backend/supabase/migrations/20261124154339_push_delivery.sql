create table public.push_tokens (
  token text primary key check (length(token) between 1 and 512),
  user_id uuid not null references auth.users (id) on delete cascade,
  registration_id uuid not null default gen_random_uuid()
);

create index push_tokens_user_idx on public.push_tokens (user_id);

create table public.push_deliveries (
  id uuid primary key default gen_random_uuid(),
  event_key text not null check (length(event_key) between 1 and 160),
  user_id uuid not null references auth.users (id) on delete cascade,
  token text not null,
  registration_id uuid,
  content jsonb not null,
  status text not null default 'pending'
    check (status in ('pending', 'sending', 'submitted', 'accepted', 'failed')),
  attempts integer not null default 0,
  next_action_at timestamptz default now(),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  submitted_at timestamptz,
  ticket_id text,
  error_code text,
  unique (event_key, user_id, token)
);

create index push_deliveries_due_idx on public.push_deliveries (status, next_action_at)
  where status in ('pending', 'sending', 'submitted');

alter table public.push_tokens enable row level security;
alter table public.push_deliveries enable row level security;
revoke all on public.push_tokens, public.push_deliveries from public, anon, authenticated;
grant select, insert, update, delete on public.push_tokens, public.push_deliveries to service_role;

create function public.enqueue_push_notification(
  p_event_key text, p_user_ids uuid[], p_content jsonb, p_expires_at timestamptz
) returns integer
language sql set search_path = ''
as $$
  with inserted as (
    insert into public.push_deliveries (event_key, user_id, token, content, expires_at)
    select p_event_key, t.user_id, t.token, p_content, p_expires_at
    from public.push_tokens t
    where t.user_id = any(p_user_ids) and p_expires_at > now()
    on conflict (event_key, user_id, token) do nothing
    returning id
  )
  select count(*)::integer from inserted;
$$;

create function public.claim_push_deliveries()
returns table (id uuid, token text, content jsonb, attempts integer, expires_at timestamptz)
language plpgsql set search_path = ''
as $$
begin
  delete from public.push_deliveries d
  where d.status in ('accepted', 'failed') and d.created_at < now() - interval '30 days';

  -- If a worker stopped during a send, Expo may already have accepted the request.
  update public.push_deliveries d
  set status = 'failed', next_action_at = null, error_code = 'delivery_unknown'
  where d.status = 'sending' and d.next_action_at <= now();

  update public.push_deliveries d
  set status = 'failed', next_action_at = null,
      error_code = case when d.expires_at <= now() then 'expired' else 'unregistered' end
  where d.status = 'pending' and (
    d.expires_at <= now() or not exists (
      select 1 from public.push_tokens t where t.token = d.token and t.user_id = d.user_id
    )
  );

  return query
  with due as (
    select d.id, t.registration_id
    from public.push_deliveries d
    join public.push_tokens t on t.token = d.token and t.user_id = d.user_id
    where d.status = 'pending' and d.next_action_at <= now() and d.expires_at > now()
    order by d.next_action_at, d.id
    limit 100
    for update of d skip locked
  )
  update public.push_deliveries d
  set status = 'sending', attempts = d.attempts + 1, registration_id = due.registration_id,
      next_action_at = now() + interval '2 minutes'
  from due where d.id = due.id
  returning d.id, d.token, d.content, d.attempts, d.expires_at;
end;
$$;

create function public.apply_push_results(p_results jsonb) returns void
language sql set search_path = ''
as $$
  with applied as (
    update public.push_deliveries d
    set status = r.status, next_action_at = r.next_action_at, error_code = r.error_code,
        ticket_id = coalesce(r.ticket_id, d.ticket_id),
        submitted_at = case when r.ticket_id is not null then now() else d.submitted_at end
    from jsonb_to_recordset(p_results) as r(
      id uuid, previous_status text, attempts integer, status text, next_action_at timestamptz,
      ticket_id text, error_code text
    )
    where d.id = r.id and d.status = r.previous_status and d.attempts = r.attempts
    returning d.token, d.registration_id, d.error_code
  )
  delete from public.push_tokens t
  using applied a
  where a.error_code = 'DeviceNotRegistered'
    and t.token = a.token and t.registration_id = a.registration_id;
$$;

revoke all on function public.enqueue_push_notification(text, uuid[], jsonb, timestamptz),
  public.claim_push_deliveries(), public.apply_push_results(jsonb) from public, anon, authenticated;
grant execute on function public.enqueue_push_notification(text, uuid[], jsonb, timestamptz),
  public.claim_push_deliveries(), public.apply_push_results(jsonb) to service_role;
