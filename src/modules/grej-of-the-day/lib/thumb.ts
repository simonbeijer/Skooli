/**
 * Miniatyrbilder hämtas via servern: några åt gången, med cache och nytt försök.
 * Annars svarar t.ex. Wikimedia "429 Too Many Requests" när webbläsaren laddar många bilder samtidigt.
 */

interface Thumb {
  type: string;
  buf: Buffer;
}

const thumbCache = new Map<string, Thumb>();
const THUMB_CACHE_MAX = 400;
let thumbActive = 0;
const thumbQueue: Array<() => void> = [];

async function withThumbSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (thumbActive >= 4) await new Promise<void>((r) => thumbQueue.push(r));
  thumbActive++;
  try {
    return await fn();
  } finally {
    thumbActive--;
    thumbQueue.shift()?.();
  }
}

async function fetchThumb(url: string): Promise<Thumb> {
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

export async function getThumb(url: string): Promise<Thumb> {
  let hit = thumbCache.get(url);
  if (!hit) {
    hit = await withThumbSlot(() => fetchThumb(url));
    thumbCache.set(url, hit);
    if (thumbCache.size > THUMB_CACHE_MAX) {
      const oldest = thumbCache.keys().next().value;
      if (oldest !== undefined) thumbCache.delete(oldest);
    }
  }
  return hit;
}
