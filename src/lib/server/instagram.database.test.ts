import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
let db:PGlite;
beforeAll(async()=>{
  db=await PGlite.create();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    insert into auth.users values ('00000000-0000-4000-8000-000000000001');
    create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
  await db.exec(readFileSync('supabase/migrations/20261022223109_instagram_publisher.sql','utf8'));
  await db.exec(readFileSync('supabase/migrations/20261023141119_instagram_story_publications.sql','utf8'));
},30000);
afterAll(async()=>{if(db)await db.close();});
describe('Instagram database isolation and claims',()=>{
  it('denies every browser operation including authenticated users',async()=>{
    for(const role of ['anon','authenticated']) {
      await db.exec(`set role ${role}`);
      for(const table of ['instagram_account','instagram_posts']) {
        for(const sql of [`select * from ${table}`,`delete from ${table}`,`update ${table} set id=id`,`insert into ${table}(id) values ('x')`]) {
          await expect(db.exec(sql)).rejects.toThrow();
        }
      }
      await db.exec('reset role');
    }
  });
  it('allows a single worker to claim an approved post',async()=>{
    await db.exec(`set role service_role;
      insert into instagram_posts(account_id,caption,media_path,created_by,status,scheduled_at)
      values ('account','Approved post','asset.jpg','00000000-0000-4000-8000-000000000001','scheduled',now());`);
    const sql=`update instagram_posts set status='processing',attempts=1 where status='scheduled' and attempts=0 returning id`;
    expect((await db.query(sql)).rows).toHaveLength(1);
    expect((await db.query(sql)).rows).toHaveLength(0);
    await db.exec('reset role');
    expect((await db.query<{relrowsecurity:boolean}>(`select relrowsecurity from pg_class where relname in ('instagram_account','instagram_posts')`)).rows.every(r=>r.relrowsecurity)).toBe(true);
  });
});
