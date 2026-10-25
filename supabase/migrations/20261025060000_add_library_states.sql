-- What the player does with each game in the RIESCADE EmulationStation (favorite, play count, play time...),
-- the `state` table of its gamelist.db, kept in step between the computers of one account.
-- Desktop clients reach it only through /api/app/library (server role); the user comes from the login.
create table public.library_states (
  user_id uuid not null references auth.users(id) on delete cascade,
  system text not null,
  path text not null,
  key text not null,
  value text not null,
  -- client time of the change (ms since 1970): the newest change of a key wins
  updated_at bigint not null,
  -- server time the row was written: the pull cursor, so client clocks never hide a change
  received_at timestamptz not null default clock_timestamp(),
  primary key (user_id, system, path, key),
  constraint library_states_system check (system ~ '^[a-z0-9_+-]{1,64}$'),
  constraint library_states_path check (char_length(path) between 1 and 1024),
  constraint library_states_key check (key in ('favorite', 'hidden', 'kidgame', 'playcount', 'lastplayed', 'gametime', 'emulator', 'core')),
  constraint library_states_value check (char_length(value) <= 256),
  constraint library_states_updated check (updated_at > 0)
);
create index library_states_received_idx on public.library_states (user_id, received_at);

alter table public.library_states enable row level security;
revoke all on public.library_states from public, anon, authenticated;
grant select, insert, update, delete on public.library_states to service_role;

-- Writes a batch (deduplicated by the API), keeping for each key the change with the newest client time.
-- Returns how many rows changed.
create function public.library_states_merge(p_user uuid, p_rows jsonb)
returns integer language sql security invoker set search_path = '' as $$
  with incoming as (
    select r.system, r.path, r.key, r.value, r.updated
    from jsonb_to_recordset(p_rows) as r(system text, path text, key text, value text, updated bigint)
  ), written as (
    insert into public.library_states as s (user_id, system, path, key, value, updated_at, received_at)
    select p_user, i.system, i.path, i.key, i.value, i.updated, clock_timestamp() from incoming i
    on conflict (user_id, system, path, key) do update
      set value = excluded.value, updated_at = excluded.updated_at, received_at = excluded.received_at
      where s.updated_at < excluded.updated_at
    returning 1
  )
  select count(*)::integer from written;
$$;
revoke all on function public.library_states_merge(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.library_states_merge(uuid, jsonb) to service_role;
