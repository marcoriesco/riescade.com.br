import { NextResponse } from "next/server";
import { authenticateAppRequest, AppApiError } from "@/lib/server/app-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { getAchievements, getRaLink, raConfigured } from "@/lib/server/retroachievements";

// The player's RetroAchievements unlocks, read live from RA with the account linked in the Recordes tab.
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    const link = await getRaLink(getSupabaseAdmin(), user.id);
    const configured = raConfigured();
    return NextResponse.json({
      configured,
      link: link && { user: link.ra_user, avatar: link.ra_avatar },
      achievements: link && configured ? await getAchievements(link) : null,
    }, { headers });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    if (status === 500) console.error("Player achievements error:", error);
    return NextResponse.json({ error: error instanceof AppApiError ? error.message : "Não foi possível carregar suas conquistas." }, { status, headers });
  }
}
