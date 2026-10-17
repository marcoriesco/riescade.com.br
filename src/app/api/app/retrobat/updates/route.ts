import { NextResponse } from "next/server";
import { listRetroBatUpdates } from "@/services/retrobat-update-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Signed release manifests of the RIESCADE RetroBat channel (ES menu "updates").
export async function GET() {
  try {
    return NextResponse.json(
      { releases: await listRetroBatUpdates() },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (error) {
    console.error("RetroBat updates error:", error);
    return NextResponse.json(
      { error: "Failed to load RetroBat updates" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
