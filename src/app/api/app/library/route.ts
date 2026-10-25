import { NextResponse } from "next/server";
import { authenticateAppRequest, AppApiError } from "@/lib/server/app-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { listLibraryRows, mergeLibraryRows, validateLibraryCursor, validateLibraryRows } from "@/lib/server/library-sync";

// Favorites, play counts and play time of the RIESCADE EmulationStation, kept in step between the user's computers.
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
const MAX_BODY = 1024 * 1024;

function failure(error: unknown) {
  const status = error instanceof AppApiError ? error.status : 500;
  if (status === 500) console.error("Library sync error:", error);
  return NextResponse.json({ error: error instanceof AppApiError ? error.message : "Não foi possível sincronizar sua biblioteca." }, { status, headers });
}

export async function GET(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    const since = validateLibraryCursor(new URL(request.url).searchParams.get("since"));
    return NextResponse.json(await listLibraryRows(getSupabaseAdmin(), user.id, since), { headers });
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateAppRequest(request);
    const text = await request.text();
    if (text.length > MAX_BODY) throw new AppApiError(413, "Lote da biblioteca muito grande.");
    let body: unknown;
    try { body = JSON.parse(text); } catch { throw new AppApiError(400, "Dados da biblioteca inválidos."); }
    // Never accept a user ID from the body; the rows belong to the validated login.
    const accepted = await mergeLibraryRows(getSupabaseAdmin(), user.id, validateLibraryRows(body));
    return NextResponse.json({ accepted }, { headers });
  } catch (error) { return failure(error); }
}
