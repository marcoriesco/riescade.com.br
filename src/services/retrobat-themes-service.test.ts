import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { retroBatThemesFromFiles } from "./retrobat-themes-service";

function driveFile(name: string, overrides: Record<string, unknown> = {}) {
  return {
    id: name,
    name,
    mimeType: "application/zip",
    size: "1000",
    modifiedTime: "2026-10-14T10:00:00.000Z",
    ...overrides,
  };
}

describe("retroBatThemesFromFiles", () => {
  it("lists every exclusive theme in order and links only the tagged zips", () => {
    const themes = retroBatThemesFromFiles([
      driveFile("RIESCADE_PS5.retrobat.zip", { size: "2048", appProperties: { themeVersion: "1.2.0" } }),
      driveFile("RIESCADE_SWITCH2.zip"),
      driveFile("RIESCADE_ORIGINS.retrobat.zip"),
      driveFile("RIESCADE_COINOPS.retrobat.zip", { modifiedTime: "2026-10-13T10:00:00.000Z" }),
      driveFile("RIESCADE_COINOPS.retrobat.zip", { id: "newer" }),
      driveFile("RIESCADE_EDITION.retrobat.zip", { capabilities: { canDownload: false } }),
    ]);

    expect(themes.map((theme) => theme.id)).toEqual([
      "RIESCADE_PS5",
      "RIESCADE_SWITCH2",
      "RIESCADE_EDITION",
      "RIESCADE_HYPERSPIN",
      "RIESCADE_COINOPS",
      "RIESCADE_XBOXS",
    ]);
    expect(themes[0]).toMatchObject({ fileName: "RIESCADE_PS5.retrobat.zip", size: 2048, version: "1.2.0" });
    expect(themes[4].version).toBeNull();
    expect(themes[1].fileName).toBeNull();
    expect(themes[2].fileName).toBeNull();
    expect(themes[4].updatedAt).toBe("2026-10-14T10:00:00.000Z");
    expect(JSON.stringify(themes)).not.toContain("newer");
  });
});
