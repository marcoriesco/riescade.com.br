import "server-only";

import {
  listGoogleDriveFolder,
  type GoogleDriveFile,
} from "@/services/google-drive-service";

// Published by Release-RetroBat.ps1: RIESCADE-v1.0.1.7z (RIESCADE version). The older packages were named after
// the RetroBat version (RIESCADE-RetroBat-8.3.1.7z) and only count while no RIESCADE-v package exists.
const PACKAGE_PATTERN = /^RIESCADE-v(\d+)\.(\d+)\.(\d+)\.7z$/;
const LEGACY_PACKAGE_PATTERN = /^RIESCADE-RetroBat-(\d+)\.(\d+)\.(\d+)\.7z$/;

export interface RetroBatPackage {
  version: string;
  fileName: string;
  size: number | null;
  updatedAt: string | null;
  downloadUrl: string;
}

function compareVersions(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

export function pickLatestRetroBatPackage(
  files: GoogleDriveFile[]
): RetroBatPackage | null {
  let latest: { parts: number[]; file: GoogleDriveFile } | null = null;

  for (const file of files) {
    const current = PACKAGE_PATTERN.exec(file.name);
    const match = current ?? LEGACY_PACKAGE_PATTERN.exec(file.name);
    if (!match || file.capabilities?.canDownload === false) continue;
    // [current naming first, major, minor, patch]
    const parts = [current ? 1 : 0, ...match.slice(1, 4).map(Number)];
    if (!latest || compareVersions(parts, latest.parts) > 0) latest = { parts, file };
  }

  if (!latest) return null;
  const { file, parts } = latest;
  return {
    version: parts.slice(1).join("."),
    fileName: file.name,
    size: file.size ? Number(file.size) : null,
    updatedAt: file.modifiedTime ?? null,
    // The usercontent host with confirm=t skips Drive's large-file scan warning page.
    downloadUrl: `https://drive.usercontent.google.com/download?id=${encodeURIComponent(file.id)}&export=download&confirm=t`,
  };
}

export async function getLatestRetroBatPackage(): Promise<RetroBatPackage | null> {
  const folderId = process.env.GOOGLE_RELEASES_FOLDER_ID?.trim();
  if (!folderId) throw new Error("GOOGLE_RELEASES_FOLDER_ID is not configured");
  return pickLatestRetroBatPackage(await listGoogleDriveFolder(folderId));
}
