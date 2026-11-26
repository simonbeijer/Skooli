import { NextResponse, type NextRequest } from "next/server";
import { requireLogin } from "@/modules/grej-of-the-day/lib/auth";
import { searchImages } from "@/modules/grej-of-the-day/lib/images";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const denied = await requireLogin(request);
  if (denied) return denied;
  const q = (request.nextUrl.searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ error: "Tom sökning" }, { status: 400 });
  return NextResponse.json(await searchImages(q));
}
