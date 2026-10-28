import { describe, expect, it, vi } from "vitest";
import { buildActivity, parseEsDate, titleFromPath } from "./player-activity";
import { toRecords, validateRaUsername } from "./retroachievements";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/platforms", () => ({ getPlatform: (slug: string) => (slug === "snes" ? { name: "Super Nintendo" } : undefined) }));

describe("player activity", () => {
  it("reads the ES date format", () => {
    expect(parseEsDate("20261028T153045")).toBe("2026-10-28T15:30:45");
    expect(parseEsDate("19700101T000000")).toBeNull();
    expect(parseEsDate("")).toBeNull();
    expect(parseEsDate("not-a-date")).toBeNull();
  });

  it("names games after their file", () => {
    expect(titleFromPath("Super Mario Kart (USA).zip")).toBe("Super Mario Kart (USA)");
    expect(titleFromPath("+japan/Pro Stadium (Japan).chd")).toBe("Pro Stadium (Japan)");
    expect(titleFromPath("Game.extract.zip")).toBe("Game");
  });

  it("groups keys per game, drops cleared games and sorts by last played", () => {
    const activity = buildActivity([
      { system: "snes", path: "A.zip", key: "playcount", value: "3" },
      { system: "snes", path: "A.zip", key: "gametime", value: "600" },
      { system: "snes", path: "A.zip", key: "lastplayed", value: "20261001T100000" },
      { system: "psx", path: "B.chd", key: "playcount", value: "1" },
      { system: "psx", path: "B.chd", key: "lastplayed", value: "20261020T100000" },
      { system: "nes", path: "Reset.zip", key: "playcount", value: "" },
      { system: "nes", path: "Reset.zip", key: "gametime", value: "" },
    ]);
    expect(activity.games.map((g) => g.title)).toEqual(["B", "A"]);
    expect(activity.games[1]).toMatchObject({ systemName: "Super Nintendo", playCount: 3, playTime: 600, lastPlayed: "2026-10-01T10:00:00" });
    expect(activity.games[0].systemName).toBe("PSX");
    expect(activity.totals).toEqual({ games: 2, playTime: 600, playCount: 4, systems: 2 });
  });
});

describe("retroachievements", () => {
  it("accepts only RA-shaped usernames", () => {
    expect(validateRaUsername("  Player_1 ")).toBe("Player_1");
    expect(() => validateRaUsername("a")).toThrow();
    expect(() => validateRaUsername("bad name")).toThrow();
    expect(() => validateRaUsername(42)).toThrow();
  });

  it("keeps only leaderboards with the player's entry", () => {
    const rows = toRecords({ GameID: 7, Title: "Sonic", ConsoleName: "Genesis/Mega Drive", ImageIcon: "/Images/1.png" }, [
      { ID: 1, RankAsc: true, Title: "Green Hill", Description: "Fastest", UserEntry: { Score: 4520, FormattedScore: "0:45.20", Rank: 3, DateUpdated: "2026-10-01T12:00:00+00:00" } },
      { ID: 2, RankAsc: false, Title: "No entry" },
      { ID: 3, RankAsc: false, Title: "Bad date", UserEntry: { Score: 1, DateUpdated: "nope" } },
    ]);
    expect(rows).toEqual([{
      leaderboard_id: 1, game_id: 7, game_title: "Sonic", console_name: "Genesis/Mega Drive",
      game_icon: "https://media.retroachievements.org/Images/1.png", leaderboard_title: "Green Hill", leaderboard_description: "Fastest",
      rank_asc: true, score: 4520, formatted_score: "0:45.20", ra_rank: 3, achieved_at: "2026-10-01T12:00:00.000Z",
    }]);
  });
});
