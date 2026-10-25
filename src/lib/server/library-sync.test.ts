import { describe, expect, it } from "vitest";
import { LIBRARY_PUSH_LIMIT, validateLibraryCursor, validateLibraryRows } from "@/lib/server/library-sync";

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
  it("rejects bodies that are not a batch, and batches over the limit", () => {
    expect(() => validateLibraryRows(null)).toThrow();
    expect(() => validateLibraryRows({ rows: {} })).toThrow();
    expect(() => validateLibraryRows({ rows: Array.from({ length: LIBRARY_PUSH_LIMIT + 1 }, (_, i) => row({ path: `${i}.zip` })) })).toThrow();
  });
  it("normalizes the pull cursor", () => {
    expect(validateLibraryCursor(null)).toBeNull();
    expect(validateLibraryCursor("2026-10-25T05:00:00.123456+00:00")).toBe("2026-10-25T05:00:00.123Z");
    expect(() => validateLibraryCursor("yesterday")).toThrow();
  });
});
