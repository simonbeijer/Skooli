import { NextResponse, type NextRequest } from "next/server";
import { requireLogin } from "@/modules/grej-of-the-day/lib/auth";
import { listSources } from "@/modules/grej-of-the-day/lib/images";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const denied = await requireLogin(request);
  if (denied) return denied;
  return NextResponse.json(listSources());
}
