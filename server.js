import "dotenv/config";
import express from "express";
import crypto from "node:crypto";
import { generateContent, generateMore } from "./lib/content.js";
import { searchImages, listSources } from "./lib/images.js";
import { buildPptx } from "./lib/pptx.js";

const app = express();
app.use(express.json({ limit: "60mb" })); // egna uppladdade bilder skickas som data-URL:er
app.use(express.static("public"));

// Textgenereringen tar 1–3 minuter, så den körs som ett jobb som webbsidan frågar efter.
const jobs = new Map();

function startJob(run) {
  const id = crypto.randomUUID();
  const job = { status: "running", log: [], result: null, error: null, abort: new AbortController() };
  jobs.set(id, job);
  run((line) => job.log.push(line), job.abort.signal)
    .then((result) => Object.assign(job, { status: "done", result }))
    .catch((err) => {
      console.error(err);
      const noKey = /OPENROUTER_API_KEY saknas/.test(err.message || "");
      const error = noKey ? "Det saknas en nyckel till OpenRouter. Lägg in OPENROUTER_API_KEY i filen .env och starta om." : err.message || String(err);
      Object.assign(job, { status: "error", error });
    });
  return id;
}

app.post("/api/generate", (req, res) => {
  const { topic, notes } = req.body || {};
  if (!topic?.trim()) return res.status(400).json({ error: "Skriv ett ämne." });
  res.json({ id: startJob((log, signal) => generateContent(topic, notes, log, signal)) });
});

// Nya förslag till en del av presentationen (fler fakta, ledtrådar, nyckelord, frågor eller ett nytt avsnitt).
app.post("/api/more", (req, res) => {
  const body = req.body || {};
  if (!body.topic?.trim() || !body.kind) return res.status(400).json({ error: "Ämne och sort saknas." });
  res.json({ id: startJob((log, signal) => generateMore(body, log, signal)) });
});

app.get("/api/jobs/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: "Okänt jobb" });
  const { abort, ...info } = job;
  res.json(info);
  if (job.status !== "running") setTimeout(() => jobs.delete(req.params.id), 10 * 60 * 1000);
});

// Miniatyrbilder hämtas via servern: några åt gången, med cache och nytt försök.
// Annars svarar t.ex. Wikimedia "429 Too Many Requests" när webbläsaren laddar många bilder samtidigt.
const thumbCache = new Map();
const THUMB_CACHE_MAX = 400;
let thumbActive = 0;
const thumbQueue = [];
const withThumbSlot = async (fn) => {
  if (thumbActive >= 4) await new Promise((r) => thumbQueue.push(r));
  thumbActive++;
  try { return await fn(); } finally { thumbActive--; thumbQueue.shift()?.(); }
};

async function fetchThumb(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "GrejOfTheDay/0.1 (lärarverktyg)" }, signal: AbortSignal.timeout(15000) });
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      continue;
    }
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.startsWith("image/")) throw new Error(`${res.status} ${type}`);
    return { type, buf: Buffer.from(await res.arrayBuffer()) };
  }
  throw new Error("upptagen");
}

app.get("/api/thumb", async (req, res) => {
  const url = String(req.query.u || "");
  if (!/^https?:\/\//.test(url)) return res.status(400).end();
  try {
    let hit = thumbCache.get(url);
    if (!hit) {
      hit = await withThumbSlot(() => fetchThumb(url));
      thumbCache.set(url, hit);
      if (thumbCache.size > THUMB_CACHE_MAX) thumbCache.delete(thumbCache.keys().next().value);
    }
    res.set({ "Content-Type": hit.type, "Cache-Control": "public, max-age=86400" }).send(hit.buf);
  } catch {
    res.status(502).end();
  }
});

// Avbryter ett jobb, t.ex. när läraren ångrar sig och vill söka på något annat.
app.delete("/api/jobs/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (job?.status === "running") {
    job.abort.abort();
    Object.assign(job, { status: "error", error: "Avbruten" });
  }
  res.json({ ok: true });
});

app.get("/api/image-sources", (_req, res) => res.json(listSources()));

app.get("/api/images", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "Tom sökning" });
  res.json(await searchImages(q));
});

app.post("/api/export", async (req, res) => {
  try {
    const { content, images, color } = req.body;
    const buf = await buildPptx(content, images, color);
    const name = `GOTD - ${content.amne}.pptx`.replace(/[\\/:*?"<>|]/g, "");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(name)}`);
    res.send(buf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Grej of the Day körs på http://localhost:${port}`));
