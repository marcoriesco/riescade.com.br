import { describe, expect, it } from "vitest";
import {
  LIBRARY_PULL_LIMIT,
  LIBRARY_PUSH_LIMIT,
  listLibraryRows,
  validateLibraryCursor,
  validateLibraryRows,
} from "@/lib/server/library-sync";

const row = (extra: Record<string, unknown> = {}) => ({ system: "snes", path: "Super Mario Kart (USA).zip", key: "favorite", value: "true", updated: 1792907507774, ...extra });

describe("library rows", () => {
  it("accepts the state keys of gamelist.db", () => {
    expect(validateLibraryRows({ rows: [row(), row({ key: "playcount", value: "5" }), row({ key: "favorite", value: "", system: "nes" })] })).toHaveLength(3);
  });
  it("keeps the newest change of a key sent twice", () => {
    const rows = validateLibraryRows({ rows: [row({ value: "false", updated: 5 }), row({ value: "true", updated: 9 }), row({ value: "x", updated: 7 })] });
    expect(rows).toEqual([row({ value: "true", updated: 9 })]);
  });
  it.each([
    [{ system: "SNES" }], [{ system: "../snes" }], [{ path: "" }], [{ path: "a\0b" }], [{ path: "x".repeat(1025) }],
    [{ key: "desc" }], [{ value: 1 }], [{ value: "x".repeat(257) }], [{ updated: 0 }], [{ updated: 1.5 }], [{ updated: "1" }],
  ])("rejects %j", extra => {
    expect(() => validateLibraryRows({ rows: [row(extra)] })).toThrow();
  });
  it("accepts additions only to the counters", () => {
    const time = row({ key: "gametime", value: "190", delta: 60 });
    expect(validateLibraryRows({ rows: [time] })).toEqual([time]);
    for (const delta of [0, -5, 1.5, "60", 2_000_000_000]) expect(() => validateLibraryRows({ rows: [row({ key: "gametime", delta })] })).toThrow();
    expect(() => validateLibraryRows({ rows: [row({ key: "favorite", delta: 1 })] })).toThrow();
  });
  it("adds up two additions to one counter", () => {
    const rows = validateLibraryRows({ rows: [row({ key: "gametime", value: "130", delta: 30, updated: 5 }), row({ key: "gametime", value: "160", delta: 60, updated: 9 })] });
    expect(rows).toEqual([row({ key: "gametime", value: "160", delta: 90, updated: 9 })]);
  });
  it("rejects bodies that are not a batch, and batches over the limit", () => {
    expect(() => validateLibraryRows(null)).toThrow();
    expect(() => validateLibraryRows({ rows: {} })).toThrow();
    expect(() => validateLibraryRows({ rows: Array.from({ length: LIBRARY_PUSH_LIMIT + 1 }, (_, i) => row({ path: `${i}.zip` })) })).toThrow();
  });
  it("normalizes the pull cursor", () => {
    expect(validateLibraryCursor(null)).toBeNull();
    expect(validateLibraryCursor("2026-10-25T05:00:00.123456+00:00")).toBe("2026-10-25T05:00:00.123Z");
    expect(validateLibraryCursor("2026-10-25T05:00:00.123Z\nsnes\nMario.zip\nfavorite")).toBe("2026-10-25T05:00:00.123Z\nsnes\nMario.zip\nfavorite");
    expect(() => validateLibraryCursor("yesterday")).toThrow();
    expect(() => validateLibraryCursor("2026-10-25T05:00:00.123Z\nINVALID\nMario.zip\nfavorite")).toThrow();
  });
  it("paginates rows sharing the same received_at timestamp without losing records", async () => {
    const sameReceivedAt = "2026-10-25T05:00:00.500Z";
    const total = LIBRARY_PULL_LIMIT + 150;
    const allDbRows = Array.from({ length: total }, (_, i) => ({
      system: "snes",
      path: `Game-${String(i).padStart(4, "0")}.zip`,
      key: "favorite",
      value: "true",
      updated_at: 1000 + i,
      received_at: sameReceivedAt,
    }));

    function makeMockDb() {
      let minReceivedAt: string | null = null;
      const builder = {
        select: () => builder,
        eq: () => builder,
        order: () => builder,
        gte: (_col: string, val: string) => {
          minReceivedAt = val;
          return builder;
        },
        limit: async (n: number) => {
          const filtered = minReceivedAt
            ? allDbRows.filter(r => Date.parse(r.received_at) >= Date.parse(minReceivedAt!))
            : allDbRows;
          return { data: filtered.slice(0, n), error: null };
        },
      };
      return { from: () => builder } as unknown as Parameters<typeof listLibraryRows>[0];
    }

    const page1 = await listLibraryRows(makeMockDb(), "user-1", null);
    expect(page1.rows).toHaveLength(LIBRARY_PULL_LIMIT);
    expect(page1.more).toBe(true);
    expect(page1.cursor).toContain(sameReceivedAt);

    const page2 = await listLibraryRows(makeMockDb(), "user-1", validateLibraryCursor(page1.cursor));
    expect(page2.rows).toHaveLength(150);
    expect(page2.more).toBe(false);
    expect(page2.cursor).toBe(sameReceivedAt);

    const combinedPaths = [...page1.rows, ...page2.rows].map(r => r.path);
    expect(new Set(combinedPaths).size).toBe(total);
    expect(combinedPaths[0]).toBe("Game-0000.zip");
    expect(combinedPaths[total - 1]).toBe(`Game-${String(total - 1).padStart(4, "0")}.zip`);
  });
});
