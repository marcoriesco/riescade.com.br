-- Additive change: preserve history, tokens and existing access rules.
alter table public.instagram_posts
  add column media_type text not null default 'IMAGE'
  check (media_type in ('IMAGE','REELS','STORIES'));
update public.instagram_posts set media_type='REELS' where media_path like '%.mp4';
-- Original video uploads; image form remains limited to 3 MB by the server.
update storage.buckets
set file_size_limit=52428800, allowed_mime_types=array['image/jpeg','video/mp4']
where id='instagram-media';
