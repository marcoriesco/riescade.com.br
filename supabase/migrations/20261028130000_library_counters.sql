-- Play count and play time add up on every computer of an account. The RIESCADE native sends, for these
-- keys, what one computer added since the account total it last saw (`delta`); the newest-wins rule stays
-- for every other key, for a counter cleared in ES ('') and for a counter a computer never synced before.
create or replace function public.library_states_merge(p_user uuid, p_rows jsonb)
returns integer language sql security invoker set search_path = '' as $$
  with incoming as (
    select r.system, r.path, r.key, r.value, r.updated, r.delta
    from jsonb_to_recordset(p_rows) as r(system text, path text, key text, value text, updated bigint, delta bigint)
  ), written as (
    insert into public.library_states as s (user_id, system, path, key, value, updated_at, received_at)
    select p_user, i.system, i.path, i.key, i.value, i.updated, clock_timestamp() from incoming i where i.delta is null
    on conflict (user_id, system, path, key) do update
      set value = excluded.value, updated_at = excluded.updated_at, received_at = excluded.received_at
      where s.updated_at < excluded.updated_at
    returning 1
  ), added as (
    insert into public.library_states as s (user_id, system, path, key, value, updated_at, received_at)
    select p_user, i.system, i.path, i.key, i.delta::text, i.updated, clock_timestamp()
    from incoming i where i.delta is not null and i.delta > 0 and i.key in ('playcount', 'gametime')
    on conflict (user_id, system, path, key) do update
      set value = ((case when s.value ~ '^[0-9]{1,18}$' then s.value::bigint else 0 end) + excluded.value::bigint)::text,
        updated_at = greatest(s.updated_at, excluded.updated_at), received_at = excluded.received_at
    returning 1
  )
  select ((select count(*) from written) + (select count(*) from added))::integer;
$$;
revoke all on function public.library_states_merge(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.library_states_merge(uuid, jsonb) to service_role;
