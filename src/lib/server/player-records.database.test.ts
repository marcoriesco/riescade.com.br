import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const A = "00000000-0000-4000-8000-000000000001";
const B = "00000000-0000-4000-8000-000000000002";
const C = "00000000-0000-4000-8000-000000000003";
let db: PGlite;

const record = (extra: Record<string, unknown> = {}) => ({
  leaderboard_id: 10, game_id: 1, game_title: "Sonic", console_name: "Genesis", game_icon: null,
  leaderboard_title: "Score", leaderboard_description: "", rank_asc: false, score: 100, formatted_score: "100",
  ra_rank: 5, achieved_at: "2026-10-01T00:00:00Z", ...extra,
});

async function replace(user: string, games: number[], rows: unknown[]) {
  const result = await db.query<{ count: number }>("select public.game_records_replace($1::uuid, $2::integer[], $3::jsonb) as count", [user, games, JSON.stringify(rows)]);
  return result.rows[0].count;
}
async function best() {
  return (await db.query<{ leaderboard_id: number; ra_user: string; formatted_score: string; players: string }>(
    "select leaderboard_id, ra_user, formatted_score, players from public.public_game_records(100) order by leaderboard_id")).rows;
}

beforeAll(async () => {
  db = await PGlite.create();
  // Only emulate Supabase's roles and FK target. Apply production SQL unchanged.
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key);
    insert into auth.users values ('${A}'), ('${B}'), ('${C}');
  `);
  await db.exec(readFileSync(resolve("supabase/migrations/20261028120000_add_player_records.sql"), "utf8"));
}, 30000);

beforeEach(async () => {
  await db.exec(`reset role; truncate public.game_records, public.retroachievements_links; set role service_role;
    insert into public.retroachievements_links (user_id, ra_user, ra_ulid, public) values
      ('${A}', 'Alpha', '00000000000000000000000001', true),
      ('${B}', 'Bravo', '00000000000000000000000002', true),
      ('${C}', 'Hidden', '00000000000000000000000003', false);`);
});
afterAll(async () => { if (db) await db.close(); });

describe("player records migration executed in local Postgres", () => {
  it("replaces only the games that were read", async () => {
    await replace(A, [1, 2], [record(), record({ leaderboard_id: 20, game_id: 2 })]);
    // Game 1 read again without leaderboard 10; game 2 not read this time.
    expect(await replace(A, [1], [record({ leaderboard_id: 11, score: 5 })])).toBe(1);
    const ids = (await db.query<{ leaderboard_id: number }>("select leaderboard_id from public.game_records order by 1")).rows.map((r) => r.leaderboard_id);
    expect(ids).toEqual([11, 20]);
  });

  it("picks the best public score, honouring lower-is-better boards", async () => {
    await replace(A, [1], [record({ score: 100, formatted_score: "100" }), record({ leaderboard_id: 30, rank_asc: true, score: 900, formatted_score: "0:09.00" })]);
    await replace(B, [1], [record({ score: 250, formatted_score: "250" }), record({ leaderboard_id: 30, rank_asc: true, score: 700, formatted_score: "0:07.00" })]);
    await replace(C, [1], [record({ score: 9999, formatted_score: "9999" })]);
    expect(await best()).toEqual([
      { leaderboard_id: 10, ra_user: "Bravo", formatted_score: "250", players: 2 },
      { leaderboard_id: 30, ra_user: "Bravo", formatted_score: "0:07.00", players: 2 },
    ]);
  });

  it("gives a tie to whoever got there first", async () => {
    await replace(A, [1], [record({ achieved_at: "2026-10-05T00:00:00Z" })]);
    await replace(B, [1], [record({ achieved_at: "2026-10-02T00:00:00Z" })]);
    expect((await best())[0].ra_user).toBe("Bravo");
  });

  it("drops the records with the link and keeps one RA account per player", async () => {
    await replace(A, [1], [record()]);
    await db.query("delete from public.retroachievements_links where user_id = $1", [A]);
    expect((await db.query("select 1 from public.game_records")).rows).toHaveLength(0);
    await expect(db.query("insert into public.retroachievements_links (user_id, ra_user, ra_ulid) values ($1, 'Copy', '00000000000000000000000002')", [A])).rejects.toThrow();
  });

  it("is closed to the public roles", async () => {
    await db.exec("reset role; set role anon;");
    await expect(db.query("select * from public.game_records")).rejects.toThrow();
    await expect(db.query("select * from public.public_game_records(10)")).rejects.toThrow();
    await db.exec("reset role; set role service_role;");
  });
});
