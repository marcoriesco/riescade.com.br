-- The RetroAchievements account each player links in the dashboard. RA is where the RIESCADE EmulationStation
-- sends scores, so it is the only source of per-game records; the site only reads it.
create table public.retroachievements_links (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ra_user text not null,
  -- RA usernames can change; the ULID does not, so lookups use it
  ra_ulid text not null,
  ra_avatar text,
  -- the player chose to show their records on the public /recordes page
  public boolean not null default true,
  refreshed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint retroachievements_links_user check (char_length(ra_user) between 1 and 64),
  constraint retroachievements_links_ulid check (ra_ulid ~ '^[0-9A-Z]{26}$'),
  constraint retroachievements_links_avatar check (ra_avatar is null or (char_length(ra_avatar) <= 512 and ra_avatar like 'https://%'))
);
create unique index retroachievements_links_ulid_idx on public.retroachievements_links (ra_ulid);

-- The player's own entry on each RA leaderboard, copied on refresh.
create table public.game_records (
  user_id uuid not null references public.retroachievements_links(user_id) on delete cascade,
  leaderboard_id integer not null,
  game_id integer not null,
  game_title text not null,
  console_name text not null,
  game_icon text,
  leaderboard_title text not null,
  leaderboard_description text not null default '',
  -- true when a lower score is better (times)
  rank_asc boolean not null,
  score bigint not null,
  formatted_score text not null,
  ra_rank integer,
  achieved_at timestamptz not null,
  primary key (user_id, leaderboard_id),
  constraint game_records_text check (char_length(game_title) <= 256 and char_length(console_name) <= 128
    and char_length(leaderboard_title) <= 256 and char_length(leaderboard_description) <= 512 and char_length(formatted_score) <= 64),
  constraint game_records_icon check (game_icon is null or (char_length(game_icon) <= 512 and game_icon like 'https://%'))
);
create index game_records_leaderboard_idx on public.game_records (leaderboard_id);
create index game_records_user_achieved_idx on public.game_records (user_id, achieved_at desc);

alter table public.retroachievements_links enable row level security;
alter table public.game_records enable row level security;
revoke all on public.retroachievements_links from public, anon, authenticated;
revoke all on public.game_records from public, anon, authenticated;
grant select, insert, update, delete on public.retroachievements_links to service_role;
grant select, insert, update, delete on public.game_records to service_role;

-- Replaces one player's records with a fresh copy for the games just read from RA.
create function public.game_records_replace(p_user uuid, p_games integer[], p_rows jsonb)
returns integer language sql security invoker set search_path = '' as $$
  with dropped as (
    delete from public.game_records g
    where g.user_id = p_user and g.game_id = any(p_games)
      and not exists (select 1 from jsonb_to_recordset(p_rows) as r(leaderboard_id integer) where r.leaderboard_id = g.leaderboard_id)
  ), written as (
    insert into public.game_records as g (user_id, leaderboard_id, game_id, game_title, console_name, game_icon, leaderboard_title,
      leaderboard_description, rank_asc, score, formatted_score, ra_rank, achieved_at)
    select p_user, r.leaderboard_id, r.game_id, r.game_title, r.console_name, r.game_icon, r.leaderboard_title,
      r.leaderboard_description, r.rank_asc, r.score, r.formatted_score, r.ra_rank, r.achieved_at
    from jsonb_to_recordset(p_rows) as r(leaderboard_id integer, game_id integer, game_title text, console_name text, game_icon text,
      leaderboard_title text, leaderboard_description text, rank_asc boolean, score bigint, formatted_score text, ra_rank integer, achieved_at timestamptz)
    on conflict (user_id, leaderboard_id) do update set
      game_id = excluded.game_id, game_title = excluded.game_title, console_name = excluded.console_name, game_icon = excluded.game_icon,
      leaderboard_title = excluded.leaderboard_title, leaderboard_description = excluded.leaderboard_description, rank_asc = excluded.rank_asc,
      score = excluded.score, formatted_score = excluded.formatted_score, ra_rank = excluded.ra_rank, achieved_at = excluded.achieved_at
    returning 1
  )
  select count(*)::integer from written;
$$;

-- The best RIESCADE player on each leaderboard, among players who chose to be public. A tie goes to whoever got there first.
create function public.public_game_records(p_limit integer default 500)
returns table (leaderboard_id integer, game_id integer, game_title text, console_name text, game_icon text, leaderboard_title text,
  leaderboard_description text, formatted_score text, achieved_at timestamptz, ra_user text, ra_avatar text, players bigint)
language sql stable security invoker set search_path = '' as $$
  with visible as (
    select g.*, l.ra_user, l.ra_avatar
    from public.game_records g join public.retroachievements_links l on l.user_id = g.user_id
    where l.public
  ), best as (
    select distinct on (v.leaderboard_id) v.*, count(*) over (partition by v.leaderboard_id) as players
    from visible v
    order by v.leaderboard_id,
      case when v.rank_asc then v.score end asc,
      case when not v.rank_asc then v.score end desc,
      v.achieved_at asc
  )
  select b.leaderboard_id, b.game_id, b.game_title, b.console_name, b.game_icon, b.leaderboard_title, b.leaderboard_description,
    b.formatted_score, b.achieved_at, b.ra_user, b.ra_avatar, b.players
  from best b
  order by b.players desc, b.achieved_at desc
  limit least(greatest(p_limit, 1), 2000);
$$;

revoke all on function public.game_records_replace(uuid, integer[], jsonb) from public, anon, authenticated;
revoke all on function public.public_game_records(integer) from public, anon, authenticated;
grant execute on function public.game_records_replace(uuid, integer[], jsonb) to service_role;
grant execute on function public.public_game_records(integer) to service_role;
