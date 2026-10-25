import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const A = "00000000-0000-4000-8000-000000000001";
const B = "00000000-0000-4000-8000-000000000002";
let db: PGlite;

async function merge(user: string, rows: unknown[]) {
  const result = await db.query<{ count: number }>("select public.library_states_merge($1::uuid, $2::jsonb) as count", [user, JSON.stringify(rows)]);
  return result.rows[0].count;
}
async function value(user: string, key = "favorite") {
  const result = await db.query<{ value: string; updated_at: string }>("select value, updated_at from public.library_states where user_id = $1 and key = $2", [user, key]);
  return result.rows[0];
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
    insert into auth.users values ('${A}'), ('${B}');
  `);
  await db.exec(readFileSync(resolve("supabase/migrations/20261025060000_add_library_states.sql"), "utf8"));
}, 30000);

beforeEach(async () => {
  await db.exec("reset role; truncate public.library_states; set role service_role;");
});
afterAll(async () => { if (db) await db.close(); });

const row = (extra: Record<string, unknown> = {}) => ({ system: "snes", path: "Super Mario Kart (USA).zip", key: "favorite", value: "true", updated: 100, ...extra });

describe("library states migration executed in local Postgres", () => {
  it("keeps the newest change of each key", async () => {
    expect(await merge(A, [row()])).toBe(1);
    expect(await merge(A, [row({ value: "false", updated: 50 })])).toBe(0);
    expect((await value(A)).value).toBe("true");
    expect(await merge(A, [row({ value: "", updated: 200 })])).toBe(1);
    const cleared = await value(A);
    expect(cleared.value).toBe("");
    expect(Number(cleared.updated_at)).toBe(200);
  });
  it("keeps each account apart", async () => {
    await merge(A, [row()]);
    await merge(B, [row({ value: "false", updated: 300 })]);
    expect((await value(A)).value).toBe("true");
    expect((await value(B)).value).toBe("false");
  });
  it("moves the pull cursor on every write", async () => {
    await merge(A, [row()]);
    const before = (await db.query<{ received_at: string }>("select received_at::text from public.library_states")).rows[0].received_at;
    await merge(A, [row({ updated: 101 })]);
    const after = (await db.query<{ received_at: string }>("select received_at::text from public.library_states")).rows[0].received_at;
    expect(after > before).toBe(true);
  });
  it("rejects keys and systems the desktop never sends", async () => {
    await expect(merge(A, [row({ key: "desc" })])).rejects.toThrow();
    await expect(merge(A, [row({ system: "SNES" })])).rejects.toThrow();
  });
  it("is closed to the client roles", async () => {
    await db.exec("reset role; set role authenticated;");
    await expect(db.query("select * from public.library_states")).rejects.toThrow();
    await expect(merge(A, [row()])).rejects.toThrow();
  });
});
