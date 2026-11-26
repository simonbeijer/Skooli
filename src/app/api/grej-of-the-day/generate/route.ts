import { NextResponse, type NextRequest } from "next/server";
import { requireLogin } from "@/modules/grej-of-the-day/lib/auth";
import { startJob } from "@/modules/grej-of-the-day/lib/jobs";
import { generateContent } from "@/modules/grej-of-the-day/lib/content";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const denied = await requireLogin(request);
  if (denied) return denied;
  const { topic, notes } = (await request.json().catch(() => null)) || {};
  if (typeof topic !== "string" || !topic.trim()) return NextResponse.json({ error: "Skriv ett ämne." }, { status: 400 });
  return NextResponse.json({ id: startJob((log, signal) => generateContent(topic, notes, log, signal)) });
}
