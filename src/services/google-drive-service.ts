import "server-only";

import { GoogleAuth } from "google-auth-library";

const DRIVE_READONLY_SCOPE =
  "https://www.googleapis.com/auth/drive.readonly";
const DRIVE_API_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  md5Checksum?: string;
  modifiedTime?: string;
  webContentLink?: string;
  capabilities?: {
    canDownload?: boolean;
  };
}

interface GoogleDriveListResponse {
  nextPageToken?: string;
  files?: GoogleDriveFile[];
}

let googleAuth: GoogleAuth | null = null;

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function getGoogleAuth(): GoogleAuth {
  if (!googleAuth) {
    googleAuth = new GoogleAuth({
      credentials: {
        client_email: requiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
        private_key: requiredEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(
          /\\n/g,
          "\n"
        ),
      },
      scopes: [DRIVE_READONLY_SCOPE],
    });
  }
  return googleAuth;
}

function assertDriveId(value: string, label: string): void {
  if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
    throw new Error(`Invalid ${label}`);
  }
}

export async function listGoogleDriveFolder(
  folderId: string
): Promise<GoogleDriveFile[]> {
  assertDriveId(folderId, "Google Drive folder ID");

  const client = await getGoogleAuth().getClient();
  const driveId = process.env.GOOGLE_SHARED_DRIVE_ID?.trim();
  if (driveId) {
    assertDriveId(driveId, "Google shared drive ID");
  }

  const files: GoogleDriveFile[] = [];
  let pageToken: string | undefined;

  do {
    const response = await client.request<GoogleDriveListResponse>({
      url: DRIVE_API_FILES_URL,
      method: "GET",
      params: {
        q: `'${folderId}' in parents and trashed = false`,
        fields:
          "nextPageToken,files(id,name,mimeType,size,md5Checksum,modifiedTime,webContentLink,capabilities(canDownload))",
        pageSize: 1000,
        pageToken,
        orderBy: "name",
        spaces: "drive",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        ...(driveId
          ? {
              corpora: "drive",
              driveId,
            }
          : {}),
      },
    });

    files.push(...(response.data.files ?? []));
    pageToken = response.data.nextPageToken;
  } while (pageToken);

  return files;
}

// For small text files (release manifests); large packages are downloaded by the clients from Drive.
export async function readGoogleDriveFileText(fileId: string): Promise<string> {
  assertDriveId(fileId, "Google Drive file ID");

  const client = await getGoogleAuth().getClient();
  const response = await client.request<string>({
    url: `${DRIVE_API_FILES_URL}/${fileId}`,
    method: "GET",
    params: { alt: "media", supportsAllDrives: true },
    responseType: "text",
  });

  return response.data;
}

export function isGoogleDriveFolder(file: GoogleDriveFile): boolean {
  return file.mimeType === FOLDER_MIME_TYPE;
}

export function getGoogleSharedDriveId(): string {
  const driveId = requiredEnv("GOOGLE_SHARED_DRIVE_ID");
  assertDriveId(driveId, "Google shared drive ID");
  return driveId;
}

export async function findUniqueGoogleDriveFolder(
  parentFolderId: string,
  expectedName: string
): Promise<GoogleDriveFile> {
  const normalizedName = expectedName.trim().toLocaleLowerCase();
  const matches = (await listGoogleDriveFolder(parentFolderId)).filter(
    (file) =>
      isGoogleDriveFolder(file) &&
      file.name.trim().toLocaleLowerCase() === normalizedName
  );

  if (matches.length === 0) {
    throw new Error(
      `Google Drive folder "${expectedName}" was not found inside ${parentFolderId}`
    );
  }
  if (matches.length > 1) {
    throw new Error(
      `Google Drive folder "${expectedName}" is duplicated inside ${parentFolderId}`
    );
  }

  return matches[0];
}
