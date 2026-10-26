import "server-only";

import {
  isGoogleDriveFolder,
  listGoogleDriveFolder,
  type GoogleDriveFile,
} from "@/services/google-drive-service";

// Zipped and uploaded by Release-RetroBat.ps1 as <THEME>.retrobat.zip.
const DEFAULT_THEMES_FOLDER_ID = "1KZNsfmSRRamu9DlVpvL76JwPn6H3r3Yg";
const PACKAGE_PATTERN = /^(RIESCADE_[A-Z0-9_]+)\.retrobat\.zip$/;

export interface RetroBatThemeInfo {
  id: string;
  name: string;
  description: string;
  previewUrl: string | null;
}

export interface RetroBatTheme extends RetroBatThemeInfo {
  fileName: string | null;
  size: number | null;
  updatedAt: string | null;
  // "version: X.Y.Z" from the theme.xml header, stored by Release-Drive.cjs in the file's appProperties.
  version: string | null;
}

// Display order on the dashboard. RIESCADE_ORIGINS ships inside the release.
export const RETROBAT_EXCLUSIVE_THEMES: RetroBatThemeInfo[] = [
  {
    id: "RIESCADE_OS",
    name: "RIESCADE Classic",
    description: "Interface clássica RIESCADE, com biblioteca de jogos em grade, navegação por sistemas e arte em tela cheia.",
    previewUrl: "/themes/retrobat/os.webp",
  },
  {
    id: "RIESCADE_PS5",
    name: "PlayStation 5",
    description: "A tela inicial do PS5, com a fileira de tiles sobre a arte em tela cheia e a biblioteca de jogos em grade.",
    previewUrl: "/themes/retrobat/ps5.webp",
  },
  {
    id: "RIESCADE_SWITCH2",
    name: "Switch 2",
    description: "O HOME menu do Nintendo Switch 2 em carrossel, biblioteca em grade, cursor animado e modos claro e escuro.",
    previewUrl: "/themes/retrobat/switch2.webp",
  },
  {
    id: "RIESCADE_EDITION",
    name: "Edition",
    description: "Visual de revista impressa: painel diagonal sobre a arte, tipografia condensada gigante, grão de impressão e retícula.",
    previewUrl: "/themes/retrobat/edition.webp",
  },
  {
    id: "RIESCADE_HYPERSPIN",
    name: "HyperSpin",
    description: "O clássico frontend arcade: roleta de logos, vídeo em moldura, smart themes por sistema e filtro CRT.",
    previewUrl: "/themes/retrobat/hyperspin.webp",
  },
  {
    id: "RIESCADE_COINOPS",
    name: "CoinOPS",
    description: "Inspirado no CoinOPS ARISE: gabinetes de fliperama com o gameplay tocando na tela da máquina.",
    previewUrl: "/themes/retrobat/coinops.webp",
  },
  {
    id: "RIESCADE_XBOXS",
    name: "Xbox Series",
    description: "A Home do Xbox Series, com a fileira de tiles e os cards sobre a arte em tela cheia, e a biblioteca completa em grade.",
    previewUrl: "/themes/retrobat/xboxs.webp",
  },
];

function themesFolderId(): string {
  return process.env.GOOGLE_RETROBAT_THEMES_FOLDER_ID?.trim() || DEFAULT_THEMES_FOLDER_ID;
}

export function pickRetroBatThemePackages(files: GoogleDriveFile[]): Map<string, GoogleDriveFile> {
  const packages = new Map<string, GoogleDriveFile>();
  for (const file of files) {
    const match = PACKAGE_PATTERN.exec(file.name);
    if (!match || isGoogleDriveFolder(file) || file.capabilities?.canDownload === false) continue;
    const current = packages.get(match[1]);
    // Release-Drive.cjs replaces in place; if a duplicate slips in, serve the newest.
    if (!current || (file.modifiedTime ?? "") > (current.modifiedTime ?? "")) packages.set(match[1], file);
  }
  return packages;
}

export function retroBatThemesFromFiles(files: GoogleDriveFile[]): RetroBatTheme[] {
  const packages = pickRetroBatThemePackages(files);
  return RETROBAT_EXCLUSIVE_THEMES.map((theme) => {
    const file = packages.get(theme.id);
    return {
      ...theme,
      fileName: file?.name ?? null,
      size: file?.size ? Number(file.size) : null,
      updatedAt: file?.modifiedTime ?? null,
      version: file?.appProperties?.themeVersion ?? null,
    };
  });
}

export async function listRetroBatThemes(): Promise<RetroBatTheme[]> {
  return retroBatThemesFromFiles(await listGoogleDriveFolder(themesFolderId()));
}

export async function getRetroBatThemeDownloadUrl(themeId: string): Promise<string | null> {
  if (!RETROBAT_EXCLUSIVE_THEMES.some((theme) => theme.id === themeId)) return null;
  const file = pickRetroBatThemePackages(await listGoogleDriveFolder(themesFolderId())).get(themeId);
  // The usercontent host with confirm=t skips Drive's large-file scan warning page.
  return file
    ? `https://drive.usercontent.google.com/download?id=${encodeURIComponent(file.id)}&export=download&confirm=t`
    : null;
}
