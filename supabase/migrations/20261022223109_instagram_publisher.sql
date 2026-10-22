-- Server-only tables: no direct browser access, even for logged-in users.
create table public.instagram_account (
  id text primary key check (id = 'primary'),
  instagram_user_id text not null,
  username text not null,
  encrypted_token text not null,
  expires_at timestamptz not null,
  refreshed_at timestamptz not null default now()
);
create table public.instagram_posts (
  id uuid primary key default gen_random_uuid(),
  account_id text not null,
  caption text not null check (char_length(caption) between 1 and 2200),
  media_path text not null,
  scheduled_at timestamptz,
  status text not null default 'draft' check (status in ('draft','scheduled','processing','published','failed','uncertain','cancelled')),
  container_id text,
  instagram_media_id text,
  error text,
  attempts integer not null default 0,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'scheduled' or scheduled_at is not null)
);
create index instagram_posts_due on public.instagram_posts(scheduled_at) where status = 'scheduled';
alter table public.instagram_account enable row level security;
alter table public.instagram_posts enable row level security;
revoke all on public.instagram_account, public.instagram_posts from public, anon, authenticated;
grant select, insert, update, delete on public.instagram_account, public.instagram_posts to service_role;

-- Public image URLs are needed by Meta; only the server can upload/change assets.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('instagram-media','instagram-media',true,8388608,array['image/jpeg'])
on conflict (id) do nothing;
