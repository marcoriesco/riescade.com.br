import type { SupabaseClient } from "@supabase/supabase-js";
import { AppApiError } from "@/lib/server/app-errors";

// Records come from RetroAchievements: the RIESCADE EmulationStation submits leaderboard scores there
// when RA is on, and the site reads them back with its web API key (RA_WEB_API_KEY).
const API = "https://retroachievements.org/API";
const MEDIA = "https://media.retroachievements.org";
const USERNAME = /^[A-Za-z0-9_]{2,32}$/;
const RECENT_GAMES = 50;
// One refresh reads one RA request per game; keep players from hammering RA through us.
export const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

export type RaLink = { ra_user: string; ra_ulid: string; ra_avatar: string | null; public: boolean; refreshed_at: string | null };

export type GameRecord = {
  leaderboard_id: number;
  game_id: number;
  game_title: string;
  console_name: string;
  game_icon: string | null;
  leaderboard_title: string;
  leaderboard_description: string;
  rank_asc: boolean;
  score: number;
  formatted_score: string;
  ra_rank: number | null;
  achieved_at: string;
};

export function raConfigured(): boolean {
  return !!process.env.RA_WEB_API_KEY;
}

function apiKey(): string {
  // trimmed: a key pasted in the dashboard with a trailing newline is refused by RA (401)
  const key = process.env.RA_WEB_API_KEY?.trim();
  if (!key) throw new AppApiError(503, "Os recordes ainda não foram ativados no site.");
  return key;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
// RA answers 429 after ~14 calls in a burst and sends no Retry-After; ~0.4 s between calls stays under it.
const CALL_GAP_MS = 400;
const RETRY_DELAYS_MS = [1500, 3000, 6000];

async function ra<T>(method: string, params: Record<string, string | number>): Promise<T | null> {
  const query = new URLSearchParams({ y: apiKey(), ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
  const call = () => fetch(`${API}/${method}.php?${query}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
    headers: { "User-Agent": "RIESCADE/1.0 (+https://riescade.com.br)" },
  });
  let response = await call();
  for (const delay of RETRY_DELAYS_MS) {
    if (response.status !== 429) break;
    await sleep(delay);
    response = await call();
  }
  // RA answers 404/422 for unknown users and games without the player's scores.
  if (response.status === 404 || response.status === 422) return null;
  if (!response.ok) {
    console.error(`[retroachievements] ${method} -> ${response.status}: ${(await response.text().catch(() => "")).slice(0, 300)}`);
    if (response.status === 401) throw new AppApiError(502, "O RetroAchievements recusou a chave do site (RA_WEB_API_KEY).");
    if (response.status === 403) throw new AppApiError(502, "O RetroAchievements bloqueou o acesso do servidor do site.");
    if (response.status === 429) throw new AppApiError(503, "O RetroAchievements está limitando as consultas. Tente de novo em alguns minutos.");
    throw new AppApiError(502, "O RetroAchievements não respondeu. Tente de novo em alguns minutos.");
  }
  return (await response.json()) as T;
}

const media = (path: unknown) => (typeof path === "string" && path.startsWith("/") ? `${MEDIA}${path}` : null);
const text = (value: unknown, max: number) => (typeof value === "string" ? value.slice(0, max) : "");

export function validateRaUsername(value: unknown): string {
  const name = typeof value === "string" ? value.trim() : "";
  if (!USERNAME.test(name)) throw new AppApiError(400, "Nome de usuário do RetroAchievements inválido.");
  return name;
}

/** Checks the account exists on RA and returns how to store it. */
export async function lookupRaUser(username: string) {
  const profile = await ra<{ User?: string; ULID?: string; UserPic?: string }>("API_GetUserProfile", { u: username });
  if (!profile?.User || !profile.ULID) throw new AppApiError(404, "Não encontramos essa conta no RetroAchievements.");
  return { ra_user: profile.User, ra_ulid: profile.ULID, ra_avatar: media(profile.UserPic) };
}

type RaGame = { GameID: number; ConsoleName?: string; Title?: string; ImageIcon?: string };
type RaLeaderboard = {
  ID: number; RankAsc: boolean; Title?: string; Description?: string;
  UserEntry?: { Score?: number; FormattedScore?: string; Rank?: number; DateUpdated?: string };
};

export function toRecords(game: RaGame, leaderboards: RaLeaderboard[]): GameRecord[] {
  return leaderboards.flatMap((board) => {
    const entry = board.UserEntry;
    if (!entry || typeof entry.Score !== "number" || !entry.DateUpdated || Number.isNaN(Date.parse(entry.DateUpdated))) return [];
    return [{
      leaderboard_id: board.ID,
      game_id: game.GameID,
      game_title: text(game.Title, 256) || `Jogo ${game.GameID}`,
      console_name: text(game.ConsoleName, 128),
      game_icon: media(game.ImageIcon),
      leaderboard_title: text(board.Title, 256),
      leaderboard_description: text(board.Description, 512),
      rank_asc: !!board.RankAsc,
      score: Math.trunc(entry.Score),
      formatted_score: text(entry.FormattedScore, 64) || String(entry.Score),
      ra_rank: typeof entry.Rank === "number" ? entry.Rank : null,
      achieved_at: new Date(entry.DateUpdated).toISOString(),
    }];
  });
}

/** Reads the player's entries on the leaderboards of their latest RA games and stores them. */
export async function refreshRecords(db: SupabaseClient, userId: string, link: RaLink) {
  if (link.refreshed_at && Date.now() - Date.parse(link.refreshed_at) < REFRESH_INTERVAL_MS) {
    throw new AppApiError(429, "Os recordes foram atualizados há pouco. Tente de novo em alguns minutos.");
  }
  // Mark first so two clicks never run two refreshes.
  const { error: markError } = await db.from("retroachievements_links").update({ refreshed_at: new Date().toISOString() }).eq("user_id", userId);
  if (markError) throw markError;

  try {
    const games = (await ra<RaGame[]>("API_GetUserRecentlyPlayedGames", { u: link.ra_ulid, c: RECENT_GAMES })) ?? [];
    const rows: GameRecord[] = [];
    const read: number[] = [];
    for (const game of games) {
      if (!Number.isSafeInteger(game.GameID)) continue;
      await sleep(CALL_GAP_MS);
      const boards = await ra<{ Results?: RaLeaderboard[] }>("API_GetUserGameLeaderboards", { i: game.GameID, u: link.ra_ulid, c: 500 });
      read.push(game.GameID);
      rows.push(...toRecords(game, boards?.Results ?? []));
    }
    const { data, error } = await db.rpc("game_records_replace", { p_user: userId, p_games: read, p_rows: rows });
    if (error) throw error;
    return { games: read.length, records: typeof data === "number" ? data : rows.length };
  } catch (error) {
    // A failed refresh must not lock the player out for the whole interval.
    await db.from("retroachievements_links").update({ refreshed_at: link.refreshed_at }).eq("user_id", userId);
    throw error;
  }
}

export async function getRaLink(db: SupabaseClient, userId: string): Promise<RaLink | null> {
  const { data, error } = await db.from("retroachievements_links").select("ra_user, ra_ulid, ra_avatar, public, refreshed_at").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function listRecords(db: SupabaseClient, userId: string): Promise<GameRecord[]> {
  const { data, error } = await db
    .from("game_records")
    .select("leaderboard_id, game_id, game_title, console_name, game_icon, leaderboard_title, leaderboard_description, rank_asc, score, formatted_score, ra_rank, achieved_at")
    .eq("user_id", userId)
    .order("achieved_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return data ?? [];
}

export type PublicRecord = {
  leaderboard_id: number; game_id: number; game_title: string; console_name: string; game_icon: string | null;
  leaderboard_title: string; leaderboard_description: string; formatted_score: string; achieved_at: string;
  ra_user: string; ra_avatar: string | null; players: number;
};

export async function listPublicRecords(db: SupabaseClient, limit = 500): Promise<PublicRecord[]> {
  const { data, error } = await db.rpc("public_game_records", { p_limit: limit });
  if (error) throw error;
  return ((data ?? []) as PublicRecord[]).map((r) => ({ ...r, players: Number(r.players) }));
}
