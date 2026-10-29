import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authenticateAppRequest, AppApiError } from "@/lib/server/app-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import {
  getRaLink,
  listRecords,
  lookupRaUser,
  raConfigured,
  refreshRecords,
  validateRaUsername,
} from "@/lib/server/retroachievements";

// The player's RetroAchievements link and the leaderboard records read from it.
export const dynamic = "force-dynamic";
// a refresh reads up to 50 RA games, paced to stay under RA's rate limit (~25 s)
export const maxDuration = 60;
const headers = { "Cache-Control": "no-store" };

function failure(error: unknown) {
  const status = error instanceof AppApiError ? error.status : 500;
  if (status === 500) console.error("Player records error:", error);
  return NextResponse.json({ error: error instanceof AppApiError ? error.message : "Não foi possível carregar seus recordes." }, { status, headers });
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) return body as Record<string, unknown>;
  } catch {}
  throw new AppApiError(400, "Dados inválidos.");
}

async function snapshot(userId: string) {
  const db = getSupabaseAdmin();
  const link = await getRaLink(db, userId);
  return {
    configured: raConfigured(),
    link: link && { user: link.ra_user, avatar: link.ra_avatar, public: link.public, refreshedAt: link.refreshed_at },
    records: link ? await listRecords(db, userId) : [],
  };
}

export async function GET(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    return NextResponse.json(await snapshot(user.id), { headers });
  } catch (error) { return failure(error); }
}

/** Links (or relinks) an RA account: { username, public? }. */
export async function PUT(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    const body = await readJson(request);
    const account = await lookupRaUser(validateRaUsername(body.username));
    const db = getSupabaseAdmin();
    const previous = await getRaLink(db, user.id);
    if (previous && previous.ra_ulid !== account.ra_ulid) {
      // Records of the old account are not this account's records.
      const { error } = await db.from("retroachievements_links").delete().eq("user_id", user.id);
      if (error) throw error;
    }
    const { error } = await db.from("retroachievements_links").upsert(
      { user_id: user.id, ...account, public: body.public !== false, ...(previous?.ra_ulid === account.ra_ulid ? {} : { refreshed_at: null }) },
      { onConflict: "user_id" }
    );
    if (error) {
      if (error.code === "23505") throw new AppApiError(409, "Essa conta do RetroAchievements já está ligada a outra conta RIESCADE.");
      throw error;
    }
    revalidatePath("/recordes");
    return NextResponse.json(await snapshot(user.id), { headers });
  } catch (error) { return failure(error); }
}

/** Shows or hides the player on the public page: { public }. */
export async function PATCH(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    const body = await readJson(request);
    if (typeof body.public !== "boolean") throw new AppApiError(400, "Dados inválidos.");
    const { error } = await getSupabaseAdmin().from("retroachievements_links").update({ public: body.public }).eq("user_id", user.id);
    if (error) throw error;
    revalidatePath("/recordes");
    return NextResponse.json(await snapshot(user.id), { headers });
  } catch (error) { return failure(error); }
}

/** Reads the latest scores from RA. */
export async function POST(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    const db = getSupabaseAdmin();
    const link = await getRaLink(db, user.id);
    if (!link) throw new AppApiError(409, "Ligue sua conta do RetroAchievements primeiro.");
    const result = await refreshRecords(db, user.id, link);
    revalidatePath("/recordes");
    return NextResponse.json({ ...result, ...(await snapshot(user.id)) }, { headers });
  } catch (error) { return failure(error); }
}

/** Unlinks the RA account and deletes the copied records. */
export async function DELETE(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    const { error } = await getSupabaseAdmin().from("retroachievements_links").delete().eq("user_id", user.id);
    if (error) throw error;
    revalidatePath("/recordes");
    return NextResponse.json(await snapshot(user.id), { headers });
  } catch (error) { return failure(error); }
}
