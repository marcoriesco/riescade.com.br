import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { pickLatestRetroBatPackage } from "./retrobat-package-service";

function driveFile(name: string, overrides: Record<string, unknown> = {}) {
  return {
    id: name,
    name,
    mimeType: "application/x-7z-compressed",
    size: "1000",
    modifiedTime: "2026-10-05T21:02:42.135Z",
    ...overrides,
  };
}

describe("pickLatestRetroBatPackage", () => {
  it("picks the highest RetroBat version and ignores other releases", () => {
    const latest = pickLatestRetroBatPackage([
      driveFile("RIESCADE-RetroBat-8.2.1.7z"),
      driveFile("RIESCADE-RetroBat-8.10.0.7z", { size: "2048" }),
      driveFile("RIESCADE-RetroBat-8.9.9.7z"),
      driveFile("RIESCADE_OS_v9.9.9.7z"),
      driveFile("riescade-native-v9.9.9.zip"),
    ]);

    expect(latest).toEqual({
      version: "8.10.0",
      fileName: "RIESCADE-RetroBat-8.10.0.7z",
      size: 2048,
      updatedAt: "2026-10-05T21:02:42.135Z",
      downloadUrl:
        "https://drive.usercontent.google.com/download?id=RIESCADE-RetroBat-8.10.0.7z&export=download&confirm=t",
    });
  });

  it("prefers the RIESCADE version packages over the older RetroBat-named ones", () => {
    const latest = pickLatestRetroBatPackage([
      driveFile("RIESCADE-RetroBat-8.3.1.7z"),
      driveFile("RIESCADE-v1.0.1.7z"),
      driveFile("RIESCADE-v1.0.10.7z"),
      driveFile("RIESCADE-v1.0.2.7z"),
    ]);

    expect(latest?.fileName).toBe("RIESCADE-v1.0.10.7z");
    expect(latest?.version).toBe("1.0.10");
  });

  it("skips files that cannot be downloaded", () => {
    expect(
      pickLatestRetroBatPackage([
        driveFile("RIESCADE-RetroBat-8.3.0.7z", { capabilities: { canDownload: false } }),
      ])
    ).toBeNull();
  });
});
