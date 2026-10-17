import "server-only";

import {
  isGoogleDriveFolder,
  listGoogleDriveFolder,
  readGoogleDriveFileText,
  type GoogleDriveFile,
} from "@/services/google-drive-service";

// RIESCADE RetroBat release channel. Atualizar-RetroBat.cmd uploads, for every release N,
// RIESCADE-update-rN.json (signed manifest) next to the full .7z and the RIESCADE-update-rN.zip delta.
// The site only lists the manifests: riescade-native verifies each signature before installing.
const MANIFEST_PATTERN = /^RIESCADE-update-r(\d+)\.json$/;
// A client older than this many releases falls back to the full package anyway.
const MAX_RELEASES = 30;

export interface RetroBatUpdateManifestFile {
  release: number;
  file: GoogleDriveFile;
}

export function pickRetroBatUpdateManifests(files: GoogleDriveFile[]): RetroBatUpdateManifestFile[] {
  const byRelease = new Map<number, GoogleDriveFile>();
  for (const file of files) {
    const match = MANIFEST_PATTERN.exec(file.name);
    if (!match || isGoogleDriveFolder(file) || file.capabilities?.canDownload === false) continue;
    const release = Number(match[1]);
    const current = byRelease.get(release);
    if (!current || (file.modifiedTime ?? "") > (current.modifiedTime ?? "")) byRelease.set(release, file);
  }
  return [...byRelease.entries()]
    .sort((a, b) => b[0] - a[0])
    .slice(0, MAX_RELEASES)
    .reverse()
    .map(([release, file]) => ({ release, file }));
}

export function parseRetroBatUpdateManifest(text: string, release: number): Record<string, unknown> | null {
  try {
    const manifest = JSON.parse(text);
    if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) return null;
    if (manifest.product !== "riescade-retrobat" || manifest.release !== release) return null;
    if (typeof manifest.signature !== "string") return null;
    return manifest;
  } catch {
    return null;
  }
}

export async function listRetroBatUpdates(): Promise<Record<string, unknown>[]> {
  const folderId = process.env.GOOGLE_RELEASES_FOLDER_ID?.trim();
  if (!folderId) throw new Error("GOOGLE_RELEASES_FOLDER_ID is not configured");

  const manifests = await Promise.all(
    pickRetroBatUpdateManifests(await listGoogleDriveFolder(folderId)).map(async ({ release, file }) =>
      parseRetroBatUpdateManifest(await readGoogleDriveFileText(file.id), release)
    )
  );
  return manifests.filter((manifest): manifest is Record<string, unknown> => manifest !== null);
}
