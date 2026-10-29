import "server-only";
import crypto from "node:crypto";

import {
  isGoogleDriveFolder,
  listGoogleDriveFolder,
  readGoogleDriveFileText,
  type GoogleDriveFile,
} from "@/services/google-drive-service";

// RIESCADE RetroBat release channel. Atualizar-RetroBat.cmd uploads, for every release N,
// RIESCADE-update-rN.json (signed manifest) next to the full .7z and the RIESCADE-update-rN.zip delta.
// The site only lists the manifests: both server and riescade-native verify each Ed25519 signature.
const MANIFEST_PATTERN = /^RIESCADE-update-r(\d+)\.json$/;
// A client older than this many releases falls back to the full package anyway.
const MAX_RELEASES = 30;
// Same Ed25519 public key as system_update.rs / updater.rs (SPKI DER, base64).
export const RETROBAT_UPDATE_PUBLIC_KEY_SPKI =
  "MCowBQYDK2VwAyEABNMUFjB8l7IUTM6RjyL+6EvyAeyJKpXcJ+6jxV7hgfg=";

const manifestCache = new Map<string, Record<string, unknown> | null>();

export function clearRetroBatUpdateManifestCache(): void {
  manifestCache.clear();
}

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

function formatPackagePayload(pkg: unknown): string | null {
  if (!pkg || typeof pkg !== "object" || Array.isArray(pkg)) return null;
  const p = pkg as Record<string, unknown>;
  if (
    typeof p.name !== "string" ||
    typeof p.url !== "string" ||
    typeof p.size !== "number" ||
    !Number.isSafeInteger(p.size) ||
    p.size <= 0 ||
    typeof p.sha256 !== "string" ||
    !/^[a-fA-F0-9]{64}$/.test(p.sha256)
  ) {
    return null;
  }
  return JSON.stringify({
    name: p.name,
    url: p.url,
    size: p.size,
    sha256: p.sha256,
  });
}

export function buildRetroBatSignedPayload(manifest: Record<string, unknown>): string | null {
  if (manifest.product !== "riescade-retrobat") return null;
  if (typeof manifest.release !== "number" || !Number.isSafeInteger(manifest.release) || manifest.release <= 0) return null;
  if (typeof manifest.retrobat !== "string") return null;
  if (typeof manifest.version !== "string" || manifest.version.length === 0 || manifest.version.length > 64) return null;
  const notes = typeof manifest.notes === "string" ? manifest.notes : "";
  const from = manifest.from === undefined || manifest.from === null ? null : manifest.from;
  if (from !== null && (typeof from !== "number" || !Number.isSafeInteger(from) || from <= 0)) return null;
  const fullJson = formatPackagePayload(manifest.full);
  if (!fullJson) return null;
  let deltaJson = "null";
  if (manifest.delta !== undefined && manifest.delta !== null) {
    if (from === null) return null;
    const formattedDelta = formatPackagePayload(manifest.delta);
    if (!formattedDelta) return null;
    deltaJson = formattedDelta;
  }
  const removed = manifest.removed === undefined ? [] : manifest.removed;
  if (!Array.isArray(removed) || !removed.every((item): item is string => typeof item === "string")) return null;
  return `{"product":${JSON.stringify("riescade-retrobat")},"release":${manifest.release},"retrobat":${JSON.stringify(manifest.retrobat)},"version":${JSON.stringify(manifest.version)},"notes":${JSON.stringify(notes)},"from":${from === null ? "null" : from},"delta":${deltaJson},"full":${fullJson},"removed":${JSON.stringify(removed)}}`;
}

export function verifyRetroBatUpdateSignature(
  manifest: Record<string, unknown>,
  publicKeySpkiBase64: string = RETROBAT_UPDATE_PUBLIC_KEY_SPKI
): boolean {
  try {
    if (typeof manifest.signature !== "string" || manifest.signature.length === 0) return false;
    const payload = buildRetroBatSignedPayload(manifest);
    if (!payload) return false;
    const publicKey = crypto.createPublicKey({
      key: Buffer.from(publicKeySpkiBase64, "base64"),
      format: "der",
      type: "spki",
    });
    const signatureBytes = Buffer.from(manifest.signature, "base64");
    if (signatureBytes.length !== 64) return false;
    return crypto.verify(null, Buffer.from(payload, "utf8"), publicKey, signatureBytes);
  } catch {
    return false;
  }
}

export function parseRetroBatUpdateManifest(
  text: string,
  release: number,
  publicKeySpkiBase64: string = RETROBAT_UPDATE_PUBLIC_KEY_SPKI
): Record<string, unknown> | null {
  try {
    const manifest = JSON.parse(text);
    if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) return null;
    if (manifest.product !== "riescade-retrobat" || manifest.release !== release) return null;
    if (typeof manifest.signature !== "string") return null;
    if (!verifyRetroBatUpdateSignature(manifest as Record<string, unknown>, publicKeySpkiBase64)) return null;
    return manifest as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getManifestCacheKey(file: GoogleDriveFile): string {
  const stamp = file.md5Checksum ?? file.modifiedTime ?? file.size ?? "";
  return `${file.id}:${stamp}`;
}

export async function listRetroBatUpdates(
  publicKeySpkiBase64: string = RETROBAT_UPDATE_PUBLIC_KEY_SPKI
): Promise<Record<string, unknown>[]> {
  const folderId = process.env.GOOGLE_RELEASES_FOLDER_ID?.trim();
  if (!folderId) throw new Error("GOOGLE_RELEASES_FOLDER_ID is not configured");

  const picked = pickRetroBatUpdateManifests(await listGoogleDriveFolder(folderId));
  const activeKeys = new Set<string>();
  const manifests = await Promise.all(
    picked.map(async ({ release, file }) => {
      const key = `${getManifestCacheKey(file)}:${publicKeySpkiBase64}`;
      activeKeys.add(key);
      if (manifestCache.has(key)) {
        return manifestCache.get(key) ?? null;
      }
      const text = await readGoogleDriveFileText(file.id);
      const parsed = parseRetroBatUpdateManifest(text, release, publicKeySpkiBase64);
      manifestCache.set(key, parsed);
      return parsed;
    })
  );
  if (manifestCache.size > MAX_RELEASES * 2) {
    for (const key of manifestCache.keys()) {
      if (!activeKeys.has(key)) manifestCache.delete(key);
    }
  }
  return manifests.filter((manifest): manifest is Record<string, unknown> => manifest !== null);
}
