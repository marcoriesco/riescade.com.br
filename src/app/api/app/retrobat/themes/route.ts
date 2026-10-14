import { NextResponse } from "next/server";
import { listRetroBatThemes } from "@/services/retrobat-themes-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public metadata only; the download link requires an active subscription.
export async function GET() {
  try {
    return NextResponse.json(
      { themes: await listRetroBatThemes() },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (error) {
    console.error("RetroBat themes error:", error);
    return NextResponse.json(
      { error: "Failed to load RetroBat themes" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
