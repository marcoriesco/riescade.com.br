import type { SupabaseClient } from "@supabase/supabase-js";
import { getPlatform } from "@/lib/platforms";

// Play stats the RIESCADE EmulationStation writes when a game closes (FileData.cpp) and syncs to library_states.
const ACTIVITY_KEYS = ["playcount", "lastplayed", "gametime"];
const PAGE = 1000;
const MAX_ROWS = 30000;

export type PlayedGame = {
  system: string;
  systemName: string;
  path: string;
  title: string;
  playCount: number;
  /** Seconds. */
  playTime: number;
  /** Local time of the player's PC, ISO without zone ("2026-10-28T15:30:00"), or null. */
  lastPlayed: string | null;
};

export type PlayerActivity = {
  games: PlayedGame[];
  totals: { games: number; playTime: number; playCount: number; systems: number };
};

/** ES writes dates as "20261028T153000" in the PC's local time. */
export function parseEsDate(value: string): string | null {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/);
  if (!match || match[1] === "1970" || match[1] === "0000") return null;
  const [, y, mo, d, h, mi, s] = match;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

/** "+japan/Pro Stadium (Japan).chd" -> "Pro Stadium (Japan)": catalog files are named after the game. */
export function titleFromPath(path: string): string {
  const file = path.split(/[\\/]/).filter(Boolean).pop() ?? path;
  const stem = file.replace(/\.[^.]+$/, "").replace(/\.extract$/i, "");
  return stem || file;
}

const number = (value: string | undefined) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export function buildActivity(rows: { system: string; path: string; key: string; value: string }[]): PlayerActivity {
  const byGame = new Map<string, { system: string; path: string; values: Record<string, string> }>();
  for (const row of rows) {
    const id = `${row.system}\n${row.path}`;
    const game = byGame.get(id) ?? { system: row.system, path: row.path, values: {} };
    game.values[row.key] = row.value;
    byGame.set(id, game);
  }

  const games: PlayedGame[] = [];
  for (const { system, path, values } of byGame.values()) {
    const game = {
      system,
      systemName: getPlatform(system)?.name ?? system.toUpperCase(),
      path,
      title: titleFromPath(path),
      playCount: number(values.playcount),
      playTime: number(values.gametime),
      lastPlayed: values.lastplayed ? parseEsDate(values.lastplayed) : null,
    };
    // A cleared value ("") means the player reset the stats in the ES.
    if (game.playCount || game.playTime || game.lastPlayed) games.push(game);
  }
  games.sort((a, b) => (b.lastPlayed ?? "").localeCompare(a.lastPlayed ?? "") || b.playTime - a.playTime);

  return {
    games,
    totals: {
      games: games.length,
      playTime: games.reduce((sum, g) => sum + g.playTime, 0),
      playCount: games.reduce((sum, g) => sum + g.playCount, 0),
      systems: new Set(games.map((g) => g.system)).size,
    },
  };
}

export async function getPlayerActivity(db: SupabaseClient, userId: string): Promise<PlayerActivity> {
  const rows: { system: string; path: string; key: string; value: string }[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const { data, error } = await db
      .from("library_states")
      .select("system, path, key, value")
      .eq("user_id", userId)
      .in("key", ACTIVITY_KEYS)
      .order("system")
      .order("path")
      .order("key")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return buildActivity(rows);
}
