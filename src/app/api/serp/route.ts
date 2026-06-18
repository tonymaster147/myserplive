import { NextRequest, NextResponse } from "next/server";
import { fetchSerp, type Device } from "@/lib/serp";

// SERP fetching + API key must stay server-side.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const keyword = sp.get("q")?.trim();

  if (!keyword) {
    return NextResponse.json(
      { error: "Missing search keyword (?q=...)" },
      { status: 400 }
    );
  }

  const device = (sp.get("device") === "mobile" ? "mobile" : "desktop") as Device;

  const data = await fetchSerp({
    keyword,
    gl: sp.get("gl")?.trim() || "us",
    hl: sp.get("hl")?.trim() || "en",
    location: sp.get("location")?.trim() || undefined,
    device,
  });

  return NextResponse.json(data);
}
