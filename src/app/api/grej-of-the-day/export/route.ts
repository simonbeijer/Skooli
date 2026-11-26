import { NextResponse, type NextRequest } from "next/server";
import { requireLogin } from "@/modules/grej-of-the-day/lib/auth";
import { buildPptx } from "@/modules/grej-of-the-day/lib/pptx";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const denied = await requireLogin(request);
  if (denied) return denied;
  try {
    const { content, images, color } = await request.json();
    const buf = await buildPptx(content, images, color);
    const name = `GOTD - ${content.amne}.pptx`.replace(/[\\/:*?"<>|]/g, "");
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
