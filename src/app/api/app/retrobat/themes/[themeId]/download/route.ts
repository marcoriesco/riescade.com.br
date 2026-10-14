import { NextResponse } from "next/server";
import { AppApiError, authenticateAppRequest } from "@/lib/server/app-auth";
import { assertDownloadAccess } from "@/services/download-service";
import { getRetroBatThemeDownloadUrl } from "@/services/retrobat-themes-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ themeId: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await authenticateAppRequest(request);
    await assertDownloadAccess(user);
    const { themeId } = await context.params;
    const downloadUrl = await getRetroBatThemeDownloadUrl(themeId);
    if (!downloadUrl) throw new AppApiError(404, "Theme package not found");
    return NextResponse.json({ downloadUrl }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error instanceof AppApiError ? error.status : 500;
    if (status === 500) console.error("RetroBat theme download error:", error);
    return NextResponse.json(
      { error: error instanceof AppApiError ? error.message : "Unable to authorize theme download" },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}
