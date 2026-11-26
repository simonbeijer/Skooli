import { NextResponse, type NextRequest } from "next/server";
import { requireLogin } from "@/modules/grej-of-the-day/lib/auth";
import { startJob } from "@/modules/grej-of-the-day/lib/jobs";
import { generateMore } from "@/modules/grej-of-the-day/lib/content";

export const runtime = "nodejs";

// Nya förslag till en del av presentationen (fler fakta, ledtrådar, nyckelord, frågor eller ett nytt avsnitt).
export async function POST(request: NextRequest) {
  const denied = await requireLogin(request);
  if (denied) return denied;
  const body = (await request.json().catch(() => null)) || {};
  if (typeof body.topic !== "string" || !body.topic.trim() || !body.kind) {
    return NextResponse.json({ error: "Ämne och sort saknas." }, { status: 400 });
  }
  return NextResponse.json({ id: startJob((log, signal) => generateMore(body, log, signal)) });
}
