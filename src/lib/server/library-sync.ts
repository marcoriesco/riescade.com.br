import type { SupabaseClient } from "@supabase/supabase-js";
import { AppApiError } from "@/lib/server/app-errors";

// The `state` keys of the RIESCADE EmulationStation gamelist.db (GameDatabase.cpp, STATE_KEYS)
export const LIBRARY_KEYS = new Set(["favorite", "hidden", "kidgame", "playcount", "lastplayed", "gametime", "emulator", "core"]);
// Keys that add up on every computer: a push may send what that computer added (`delta`) instead of a total.
export const LIBRARY_COUNTERS = new Set(["playcount", "gametime"]);
export const LIBRARY_PUSH_LIMIT = 1000;
export const LIBRARY_PULL_LIMIT = 2000;
const MAX_DELTA = 1_000_000_000;

export type LibraryRow = { system: string; path: string; key: string; value: string; updated: number; delta?: number };

const SYSTEM = /^[a-z0-9_+-]{1,64}$/;

function invalid(): never {
  throw new AppApiError(400, "Dados da biblioteca inválidos.");
}

/** Validates a pushed batch; a key sent twice keeps its newest change. */
export function validateLibraryRows(body: unknown): LibraryRow[] {
  if (!body || typeof body !== "object" || Array.isArray(body)) invalid();
  const rows = (body as Record<string, unknown>).rows;
  if (!Array.isArray(rows)) invalid();
  if (rows.length > LIBRARY_PUSH_LIMIT) throw new AppApiError(413, "Lote da biblioteca muito grande.");
  const unique = new Map<string, LibraryRow>();
  for (const item of rows) {
    if (!item || typeof item !== "object") invalid();
    const { system, path, key, value, updated, delta } = item as Record<string, unknown>;
    if (typeof system !== "string" || !SYSTEM.test(system)) invalid();
    if (typeof path !== "string" || path.length < 1 || path.length > 1024 || path.includes("\0")) invalid();
    if (typeof key !== "string" || !LIBRARY_KEYS.has(key)) invalid();
    if (typeof value !== "string" || value.length > 256) invalid();
    if (typeof updated !== "number" || !Number.isSafeInteger(updated) || updated <= 0) invalid();
    if (delta !== undefined && (!LIBRARY_COUNTERS.has(key) || typeof delta !== "number" || !Number.isSafeInteger(delta) || delta <= 0 || delta > MAX_DELTA)) invalid();
    const id = `${system}\n${path}\n${key}`;
    const previous = unique.get(id);
    if (delta !== undefined && previous?.delta !== undefined) {
      // two additions to one counter both count
      unique.set(id, { ...previous, value, updated: Math.max(previous.updated, updated), delta: previous.delta + (delta as number) });
    } else if (!previous || previous.updated < updated) {
      unique.set(id, { system, path, key, value, updated, ...(delta !== undefined ? { delta: delta as number } : {}) });
    }
  }
  return [...unique.values()];
}

export type ParsedLibraryCursor = {
  receivedAt: string;
  system: string;
  path: string;
  key: string;
};

/** The pull cursor: an ISO time (or composite `<iso>\n<system>\n<path>\n<key>`) the server gave back, or nothing for the first sync. */
export function validateLibraryCursor(since: string | null): string | null {
  if (!since) return null;
  const parsed = parseLibraryCursor(since);
  return formatLibraryCursor(parsed);
}

export function parseLibraryCursor(since: string): ParsedLibraryCursor {
  if (since.length > 1200) invalid();
  const parts = since.split("\n");
  if (parts.length !== 1 && parts.length !== 4) invalid();
  const [rawTime, system = "", path = "", key = ""] = parts;
  if (!rawTime || rawTime.length > 40 || Number.isNaN(Date.parse(rawTime))) invalid();
  if (parts.length === 4) {
    if (!SYSTEM.test(system)) invalid();
    if (path.length < 1 || path.length > 1024 || path.includes("\0")) invalid();
    if (!LIBRARY_KEYS.has(key)) invalid();
  }
  return {
    receivedAt: new Date(rawTime).toISOString(),
    system,
    path,
    key,
  };
}

export function formatLibraryCursor(cursor: ParsedLibraryCursor): string {
  if (!cursor.system && !cursor.path && !cursor.key) return cursor.receivedAt;
  return `${cursor.receivedAt}\n${cursor.system}\n${cursor.path}\n${cursor.key}`;
}

export async function mergeLibraryRows(db: SupabaseClient, userId: string, rows: LibraryRow[]): Promise<number> {
  if (rows.length === 0) return 0;
  const { data, error } = await db.rpc("library_states_merge", { p_user: userId, p_rows: rows });
  if (error) throw error;
  return typeof data === "number" ? data : 0;
}

function compareRowTuple(
  a: { receivedAt: string; system: string; path: string; key: string },
  b: { receivedAt: string; system: string; path: string; key: string }
): number {
  const tDiff = Date.parse(a.receivedAt) - Date.parse(b.receivedAt);
  if (tDiff !== 0) return tDiff;
  if (a.system !== b.system) return a.system < b.system ? -1 : 1;
  if (a.path !== b.path) return a.path < b.path ? -1 : 1;
  if (a.key !== b.key) return a.key < b.key ? -1 : 1;
  return 0;
}

/** Rows written after the cursor, oldest first; `cursor` is where the next page starts. */
export async function listLibraryRows(db: SupabaseClient, userId: string, since: string | null) {
  const parsedCursor = since ? parseLibraryCursor(since) : null;
  let query = db
    .from("library_states")
    .select("system, path, key, value, updated_at, received_at")
    .eq("user_id", userId)
    .order("received_at", { ascending: true })
    .order("system", { ascending: true })
    .order("path", { ascending: true })
    .order("key", { ascending: true });
  if (parsedCursor) {
    query = query.gte("received_at", parsedCursor.receivedAt);
  }
  // Fetch enough rows to filter out any already-seen prefix at the same `received_at` transaction timestamp
  const fetchLimit = parsedCursor ? LIBRARY_PULL_LIMIT + LIBRARY_PUSH_LIMIT : LIBRARY_PULL_LIMIT;
  const { data, error } = await query.limit(fetchLimit);
  if (error) throw error;
  const rawList = (data ?? []).map(r => ({
    system: String(r.system),
    path: String(r.path),
    key: String(r.key),
    value: String(r.value),
    updated_at: Number(r.updated_at),
    received_at: new Date(String(r.received_at)).toISOString(),
  }));
  rawList.sort((a, b) =>
    compareRowTuple(
      { receivedAt: a.received_at, system: a.system, path: a.path, key: a.key },
      { receivedAt: b.received_at, system: b.system, path: b.path, key: b.key }
    )
  );
  const filtered = parsedCursor
    ? rawList.filter(
        r =>
          compareRowTuple(
            { receivedAt: r.received_at, system: r.system, path: r.path, key: r.key },
            parsedCursor
          ) > 0
      )
    : rawList;
  const more = filtered.length > LIBRARY_PULL_LIMIT || (data ?? []).length === fetchLimit;
  const page = filtered.slice(0, LIBRARY_PULL_LIMIT);
  const rows: LibraryRow[] = page.map(r => ({
    system: r.system,
    path: r.path,
    key: r.key,
    value: r.value,
    updated: r.updated_at,
  }));
  const last = page[page.length - 1];
  const cursor = last
    ? more
      ? formatLibraryCursor({
          receivedAt: last.received_at,
          system: last.system,
          path: last.path,
          key: last.key,
        })
      : last.received_at
    : since;
  return { rows, cursor, more: page.length === LIBRARY_PULL_LIMIT && more };
}

export const pullLibraryStates = listLibraryRows;
