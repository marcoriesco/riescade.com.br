import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { parseRetroBatUpdateManifest, pickRetroBatUpdateManifests } from "./retrobat-update-service";

function driveFile(name: string, overrides: Record<string, unknown> = {}) {
  return {
    id: name,
    name,
    mimeType: "application/json",
    size: "900",
    modifiedTime: "2026-10-17T01:00:00.000Z",
    ...overrides,
  };
}

describe("pickRetroBatUpdateManifests", () => {
  it("returns the release manifests in release order and ignores packages", () => {
    const picked = pickRetroBatUpdateManifests([
      driveFile("RIESCADE-update-r10.json"),
      driveFile("RIESCADE-update-r2.json"),
      driveFile("RIESCADE-update-r10.zip"),
      driveFile("RIESCADE-RetroBat-8.3.1.7z"),
      driveFile("riescade-native-v0.3.22.zip"),
      driveFile("RIESCADE-update-r3.json", { capabilities: { canDownload: false } }),
    ]);

    expect(picked.map((item) => item.release)).toEqual([2, 10]);
  });

  it("keeps only the newest copy of a duplicated release", () => {
    const picked = pickRetroBatUpdateManifests([
      driveFile("RIESCADE-update-r4.json", { id: "old", modifiedTime: "2026-10-01T00:00:00.000Z" }),
      driveFile("RIESCADE-update-r4.json", { id: "new", modifiedTime: "2026-10-02T00:00:00.000Z" }),
    ]);

    expect(picked).toHaveLength(1);
    expect(picked[0].file.id).toBe("new");
  });
});

describe("parseRetroBatUpdateManifest", () => {
  const manifest = { product: "riescade-retrobat", release: 5, version: "8.3.1-riescade-r5", signature: "c2ln" };

  it("accepts a manifest of the expected release", () => {
    expect(parseRetroBatUpdateManifest(JSON.stringify(manifest), 5)).toEqual(manifest);
  });

  it("rejects other products, mismatched releases and invalid JSON", () => {
    expect(parseRetroBatUpdateManifest(JSON.stringify({ ...manifest, product: "riescade-native" }), 5)).toBeNull();
    expect(parseRetroBatUpdateManifest(JSON.stringify(manifest), 6)).toBeNull();
    expect(parseRetroBatUpdateManifest("{", 5)).toBeNull();
  });
});
