import { NextResponse, type NextRequest } from "next/server";
import { requireLogin } from "@/modules/grej-of-the-day/lib/auth";
import { getThumb } from "@/modules/grej-of-the-day/lib/thumb";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const denied = await requireLogin(request);
  if (denied) return denied;
  const url = request.nextUrl.searchParams.get("u") || "";
  if (!/^https?:\/\//.test(url)) return new NextResponse(null, { status: 400 });
  try {
    const hit = await getThumb(url);
    return new NextResponse(new Uint8Array(hit.buf), {
      headers: { "Content-Type": hit.type, "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
