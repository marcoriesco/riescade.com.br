import { beforeEach, describe, expect, it, vi } from "vitest";

const { upsert, listFolder } = vi.hoisted(() => ({
  upsert: vi.fn().mockResolvedValue({ error: null }),
  listFolder: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/server/supabase-admin", () => ({
  getSupabaseAdmin: () => ({ from: () => ({
    update: () => ({ eq: async () => ({ error: null }) }),
    upsert,
  }) }),
}));
vi.mock("@/services/google-drive-service", () => ({
  getGoogleSharedDriveId: () => "root",
  findUniqueGoogleDriveFolder: async () => ({ id: "roms" }),
  isGoogleDriveFolder: (file: { mimeType: string }) => file.mimeType === "folder",
  listGoogleDriveFolder: listFolder,
}));

import { syncGoogleDriveCatalog } from "./google-drive-sync-service";

describe("full media catalog synchronization", () => {
  beforeEach(() => vi.clearAllMocks());
  it("indexes nested ROMs with stable IDs and excludes media folders", async () => {
    const file={id:"rom-file",name:"cabalng.zip",mimeType:"application/zip",size:"123",webContentLink:"https://drive.google.com/uc?id=rom-file"};
    const tree: Record<string,unknown[]>={roms:[{id:"platform-folder",name:"neogeo",mimeType:"folder"}],"platform-folder":[{id:"ports",name:"+ports",mimeType:"folder"},{id:"media",name:"media",mimeType:"folder"}],ports:[file]};
    listFolder.mockImplementation(async (id:string)=>tree[id]??[]);
    await syncGoogleDriveCatalog("neogeo");
    expect(listFolder).not.toHaveBeenCalledWith("media");
    expect(upsert.mock.calls[0][0]).toEqual([expect.objectContaining({filename:"cabalng.zip",install_name:"+ports/cabalng.zip",drive_folder_id:"platform-folder",drive_file_id:"rom-file"})]);
    tree['platform-folder']=[file];
    await syncGoogleDriveCatalog("neogeo");
    expect(upsert.mock.calls[1][0][0].id).toBe(upsert.mock.calls[0][0][0].id);
  });
  it("preserves the index if a nested folder cannot be read", async () => {
    listFolder.mockImplementation(async (id:string)=> {
      if(id==="roms")return [{id:"platform-folder",name:"neogeo",mimeType:"folder"}];
      if(id==="platform-folder")return [{id:"ports",name:"+ports",mimeType:"folder"}];
      throw new Error("Drive unavailable");
    });
    await expect(syncGoogleDriveCatalog("neogeo")).rejects.toThrow("Drive unavailable");
    expect(upsert).not.toHaveBeenCalled();
  });

  it.each(["chihiro", "windows", "nes3d", "fightcade", "switch", "snes", "naomi"])(
    "indexes media independently of %s ROM extensions",
    async (platform) => {
      listFolder.mockImplementation(async (folder: string) => folder === "roms"
        ? [{ id: "platform-folder", name: platform, mimeType: "folder" }]
        : [
          { id: "media-file", name: "_media.zip", mimeType: "application/zip", size: "123", webContentLink: "https://drive.google.com/uc?id=media-file" },
          { id: "unrelated-file", name: "notes.unrecognized", mimeType: "text/plain", webContentLink: "https://drive.google.com/uc?id=unrelated-file" },
        ]);
      await syncGoogleDriveCatalog(platform);
      expect(upsert).toHaveBeenCalledTimes(1);
      expect(upsert.mock.calls[0][0]).toEqual([
        expect.objectContaining({ platform, filename: "_media.zip", active: true, category: "rom" }),
      ]);
    }
  );
});
