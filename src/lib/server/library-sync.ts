import type { SupabaseClient } from "@supabase/supabase-js";
import { AppApiError } from "@/lib/server/app-errors";

// The `state` keys of the RIESCADE EmulationStation gamelist.db (GameDatabase.cpp, STATE_KEYS)
export const LIBRARY_KEYS = new Set(["favorite", "hidden", "kidgame", "playcount", "lastplayed", "gametime", "emulator", "core"]);
export const LIBRARY_PUSH_LIMIT = 1000;
export const LIBRARY_PULL_LIMIT = 2000;

export type LibraryRow = { system: string; path: string; key: string; value: string; updated: number };

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
    const { system, path, key, value, updated } = item as Record<string, unknown>;
    if (typeof system !== "string" || !SYSTEM.test(system)) invalid();
    if (typeof path !== "string" || path.length < 1 || path.length > 1024 || path.includes("\0")) invalid();
    if (typeof key !== "string" || !LIBRARY_KEYS.has(key)) invalid();
    if (typeof value !== "string" || value.length > 256) invalid();
    if (typeof updated !== "number" || !Number.isSafeInteger(updated) || updated <= 0) invalid();
    const id = `${system}\n${path}\n${key}`;
    const previous = unique.get(id);
    if (!previous || previous.updated < updated) unique.set(id, { system, path, key, value, updated });
  }
  return [...unique.values()];
}

/** The pull cursor: an ISO time the server gave back, or nothing for the first sync. */
export function validateLibraryCursor(since: string | null): string | null {
  if (!since) return null;
  if (since.length > 40 || Number.isNaN(Date.parse(since))) invalid();
  return new Date(since).toISOString();
}

export async function mergeLibraryRows(db: SupabaseClient, userId: string, rows: LibraryRow[]): Promise<number> {
  if (rows.length === 0) return 0;
  const { data, error } = await db.rpc("library_states_merge", { p_user: userId, p_rows: rows });
  if (error) throw error;
  return typeof data === "number" ? data : 0;
}

/** Rows written after the cursor, oldest first; `cursor` is where the next page starts. */
export async function listLibraryRows(db: SupabaseClient, userId: string, since: string | null) {
  let query = db
    .from("library_states")
    .select("system, path, key, value, updated_at, received_at")
    .eq("user_id", userId)
    .order("received_at", { ascending: true })
    .limit(LIBRARY_PULL_LIMIT);
  if (since) query = query.gt("received_at", since);
  const { data, error } = await query;
  if (error) throw error;
  const list = data ?? [];
  const rows: LibraryRow[] = list.map(r => ({ system: r.system, path: r.path, key: r.key, value: r.value, updated: Number(r.updated_at) }));
  const cursor = list.length > 0 ? new Date(list[list.length - 1].received_at).toISOString() : since;
  return { rows, cursor, more: list.length === LIBRARY_PULL_LIMIT };
}
