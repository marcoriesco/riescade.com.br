import crypto from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mockListGoogleDriveFolder = vi.fn();
const mockReadGoogleDriveFileText = vi.fn();

vi.mock("@/services/google-drive-service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/google-drive-service")>();
  return {
    ...actual,
    listGoogleDriveFolder: (...args: unknown[]) => mockListGoogleDriveFolder(...args),
    readGoogleDriveFileText: (...args: unknown[]) => mockReadGoogleDriveFileText(...args),
  };
});

import {
  buildRetroBatSignedPayload,
  clearRetroBatUpdateManifestCache,
  listRetroBatUpdates,
  parseRetroBatUpdateManifest,
  pickRetroBatUpdateManifests,
} from "./retrobat-update-service";

function driveFile(name: string, overrides: Record<string, unknown> = {}) {
  return {
    id: name,
    name,
    mimeType: "application/json",
    size: "900",
    md5Checksum: "abc123",
    modifiedTime: "2026-10-17T01:00:00.000Z",
    ...overrides,
  };
}

const testKeyPair = crypto.generateKeyPairSync("ed25519");
const testPublicKeySpki = (testKeyPair.publicKey.export({ format: "der", type: "spki" }) as Buffer).toString("base64");

function createSignedManifest(overrides: Record<string, unknown> = {}) {
  const base: Record<string, unknown> = {
    product: "riescade-retrobat",
    release: 5,
    retrobat: "8.3.1",
    version: "1.0.5",
    notes: "Release 5",
    from: 4,
    delta: {
      name: "RIESCADE-update-r5.zip",
      url: "https://drive.usercontent.google.com/download?id=delta5&export=download&confirm=t",
      size: 1024,
      sha256: "a".repeat(64),
    },
    full: {
      name: "RIESCADE-v1.0.5.7z",
      url: "https://drive.usercontent.google.com/download?id=full5&export=download&confirm=t",
      size: 2048,
      sha256: "b".repeat(64),
    },
    removed: ["system/old.txt"],
    ...overrides,
  };
  const payload = buildRetroBatSignedPayload(base);
  const signature = payload
    ? crypto.sign(null, Buffer.from(payload, "utf8"), testKeyPair.privateKey).toString("base64")
    : "c2ln";
  return { ...base, signature };
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
  it("accepts a validly signed manifest of the expected release", () => {
    const manifest = createSignedManifest();
    expect(parseRetroBatUpdateManifest(JSON.stringify(manifest), 5, testPublicKeySpki)).toEqual(manifest);
  });

  it("rejects tampered signatures, other products, mismatched releases and invalid JSON", () => {
    const manifest = createSignedManifest();
    expect(parseRetroBatUpdateManifest(JSON.stringify({ ...manifest, notes: "Tampered" }), 5, testPublicKeySpki)).toBeNull();
    expect(parseRetroBatUpdateManifest(JSON.stringify({ ...manifest, signature: Buffer.alloc(64).toString("base64") }), 5, testPublicKeySpki)).toBeNull();
    expect(parseRetroBatUpdateManifest(JSON.stringify({ ...manifest, product: "riescade-native" }), 5, testPublicKeySpki)).toBeNull();
    expect(parseRetroBatUpdateManifest(JSON.stringify(manifest), 6, testPublicKeySpki)).toBeNull();
    expect(parseRetroBatUpdateManifest("{", 5, testPublicKeySpki)).toBeNull();
  });
});

describe("listRetroBatUpdates", () => {
  beforeEach(() => {
    clearRetroBatUpdateManifestCache();
    mockListGoogleDriveFolder.mockReset();
    mockReadGoogleDriveFileText.mockReset();
    process.env.GOOGLE_RELEASES_FOLDER_ID = "releases-folder";
  });

  it("caches downloaded manifests by file id and checksum/modifiedTime", async () => {
    const manifest5 = createSignedManifest({ release: 5, version: "1.0.5" });
    mockListGoogleDriveFolder.mockResolvedValue([
      driveFile("RIESCADE-update-r5.json", { id: "file-5", md5Checksum: "hash-v1" }),
    ]);
    mockReadGoogleDriveFileText.mockResolvedValue(JSON.stringify(manifest5));

    const first = await listRetroBatUpdates(testPublicKeySpki);
    const second = await listRetroBatUpdates(testPublicKeySpki);

    expect(first).toEqual([manifest5]);
    expect(second).toEqual([manifest5]);
    expect(mockReadGoogleDriveFileText).toHaveBeenCalledTimes(1);

    // Changing checksum triggers a fresh download
    const updated5 = createSignedManifest({ release: 5, version: "1.0.5", notes: "Updated notes" });
    mockListGoogleDriveFolder.mockResolvedValue([
      driveFile("RIESCADE-update-r5.json", { id: "file-5", md5Checksum: "hash-v2" }),
    ]);
    mockReadGoogleDriveFileText.mockResolvedValue(JSON.stringify(updated5));

    const third = await listRetroBatUpdates(testPublicKeySpki);
    expect(third).toEqual([updated5]);
    expect(mockReadGoogleDriveFileText).toHaveBeenCalledTimes(2);
  });
});
