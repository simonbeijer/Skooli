/**
 * Textgenereringen tar 1–3 minuter, så den körs som ett jobb som webbsidan frågar efter.
 * Jobben ligger i serverns minne (se "Att tänka på vid driftsättning" i PLAN.md).
 */

import crypto from "node:crypto";

type Log = (line: string) => void;

export interface Job {
  status: "running" | "done" | "error";
  log: string[];
  result: unknown;
  error: string | null;
  abort: AbortController;
}

// På globalThis så att alla route handlers ser samma jobb, även efter omladdning i dev.
const store = globalThis as typeof globalThis & { __gotdJobs?: Map<string, Job> };
export const jobs: Map<string, Job> = (store.__gotdJobs ??= new Map());

export function startJob(run: (log: Log, signal: AbortSignal) => Promise<unknown>): string {
  const id = crypto.randomUUID();
  const job: Job = { status: "running", log: [], result: null, error: null, abort: new AbortController() };
  jobs.set(id, job);
  run((line) => job.log.push(line), job.abort.signal)
    .then((result) => Object.assign(job, { status: "done", result }))
    .catch((err: unknown) => {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      const noKey = /GOTD_OPENROUTER_API_KEY saknas/.test(message);
      const error = noKey
        ? "Det saknas en nyckel till OpenRouter. Lägg in GOTD_OPENROUTER_API_KEY bland miljövariablerna och starta om."
        : message || String(err);
      Object.assign(job, { status: "error", error });
    });
  return id;
}
