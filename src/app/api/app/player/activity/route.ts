import { NextResponse } from "next/server";
import { authenticateAppRequest, AppApiError } from "@/lib/server/app-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { getPlayerActivity } from "@/lib/server/player-activity";

// Last game, play time and play count per game, read from what the RIESCADE EmulationStation syncs.
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    return NextResponse.json(await getPlayerActivity(getSupabaseAdmin(), user.id), { headers });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    if (status === 500) console.error("Player activity error:", error);
    return NextResponse.json({ error: error instanceof AppApiError ? error.message : "Não foi possível carregar seus jogos." }, { status, headers });
  }
}
