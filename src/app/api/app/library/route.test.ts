import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppApiError } from "@/lib/server/app-errors";

const mocked = vi.hoisted(() => ({ auth: vi.fn(), merge: vi.fn(), list: vi.fn() }));
vi.mock("@/lib/server/app-auth", async importOriginal => ({
  ...await importOriginal<typeof import("@/lib/server/app-auth")>(), authenticateAppRequest: mocked.auth,
}));
vi.mock("@/lib/server/supabase-admin", () => ({ getSupabaseAdmin: () => ({}) }));
vi.mock("@/lib/server/library-sync", async importOriginal => ({
  ...await importOriginal<typeof import("@/lib/server/library-sync")>(), mergeLibraryRows: mocked.merge, listLibraryRows: mocked.list,
}));
import { GET, POST } from "./route";

const post = (body: string) => new Request("https://riescade.example/api/app/library", {
  method: "POST", headers: { Authorization: "Bearer ries_test", "Content-Type": "application/json" }, body,
});
const row = { system: "snes", path: "Game.zip", key: "favorite", value: "true", updated: 10 };

beforeEach(() => {
  vi.clearAllMocks();
  mocked.auth.mockResolvedValue({ id: "authenticated-user" });
  mocked.merge.mockResolvedValue(1);
  mocked.list.mockResolvedValue({ rows: [], cursor: null, more: false });
});

describe("library sync HTTP", () => {
  it("writes the rows of the authenticated user, whatever the body says", async () => {
    const response = await POST(post(JSON.stringify({ userId: "victim", rows: [{ ...row, user_id: "victim" }] })));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ accepted: 1 });
    expect(mocked.merge).toHaveBeenCalledWith({}, "authenticated-user", [row]);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("reads from the cursor of the authenticated user", async () => {
    const response = await GET(new Request("https://riescade.example/api/app/library?since=2026-10-25T05:00:00.000Z", { headers: { Authorization: "Bearer ries_test" } }));
    expect(response.status).toBe(200);
    expect(mocked.list).toHaveBeenCalledWith({}, "authenticated-user", "2026-10-25T05:00:00.000Z");
  });
  it("refuses expired sessions and broken bodies", async () => {
    mocked.auth.mockRejectedValueOnce(new AppApiError(401, "Sessão expirada."));
    expect((await POST(post(JSON.stringify({ rows: [row] })))).status).toBe(401);
    expect((await POST(post("{"))).status).toBe(400);
    expect((await POST(post(JSON.stringify({ rows: [{ ...row, key: "desc" }] })))).status).toBe(400);
    expect(mocked.merge).not.toHaveBeenCalled();
  });
});
