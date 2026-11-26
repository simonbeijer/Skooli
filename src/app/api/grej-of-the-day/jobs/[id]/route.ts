import { NextResponse, type NextRequest } from "next/server";
import { requireLogin } from "@/modules/grej-of-the-day/lib/auth";
import { jobs } from "@/modules/grej-of-the-day/lib/jobs";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  const denied = await requireLogin(request);
  if (denied) return denied;
  const { id } = await params;
  const job = jobs.get(id);
  if (!job) return NextResponse.json({ error: "Okänt jobb" }, { status: 404 });
  const { abort: _abort, ...info } = job;
  if (job.status !== "running") setTimeout(() => jobs.delete(id), 10 * 60 * 1000);
  return NextResponse.json(info);
}

// Avbryter ett jobb, t.ex. när läraren ångrar sig och vill söka på något annat.
export async function DELETE(request: NextRequest, { params }: Context) {
  const denied = await requireLogin(request);
  if (denied) return denied;
  const { id } = await params;
  const job = jobs.get(id);
  if (job?.status === "running") {
    job.abort.abort();
    Object.assign(job, { status: "error", error: "Avbruten" });
  }
  return NextResponse.json({ ok: true });
}
