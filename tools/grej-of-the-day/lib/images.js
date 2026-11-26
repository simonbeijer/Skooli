// Söker bilder i flera fria bildkällor samtidigt.
// Källor utan nyckel används alltid. Källor med nyckel används bara om nyckeln finns i .env.
// Varje bild får samma form:
// { id, source, title, thumb, full, pageUrl, author, license, width, height }

const UA = "GrejOfTheDay/0.1 (lärarverktyg; kontakt via README)";
const PER_SOURCE = 16;

async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers: { "User-Agent": UA, ...headers }, signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

const stripHtml = (s) => (s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

const SOURCES = {
  wikimedia: {
    label: "Wikimedia Commons",
    async search(q) {
      const u = new URL("https://commons.wikimedia.org/w/api.php");
      Object.entries({
        action: "query", format: "json", generator: "search", gsrsearch: `${q} filetype:bitmap`,
        gsrnamespace: "6", gsrlimit: String(PER_SOURCE), prop: "imageinfo",
        iiprop: "url|extmetadata|size", iiurlwidth: "1600", origin: "*",
      }).forEach(([k, v]) => u.searchParams.set(k, v));
      const data = await getJson(u);
      return Object.values(data.query?.pages || {})
        .sort((a, b) => a.index - b.index)
        .filter((p) => p.imageinfo?.[0])
        .map((p) => {
          const ii = p.imageinfo[0];
          const m = ii.extmetadata || {};
          return {
            id: `wm-${p.pageid}`,
            title: stripHtml(m.ObjectName?.value) || p.title.replace(/^File:/, ""),
            thumb: ii.thumburl?.replace(/\/\d+px-/, "/500px-") || ii.url, // 500 är en av Wikimedias standardstorlekar
            full: ii.thumburl || ii.url,
            pageUrl: ii.descriptionurl,
            author: stripHtml(m.Artist?.value) || "Okänd",
            license: stripHtml(m.LicenseShortName?.value) || "se källsidan",
            width: ii.width, height: ii.height,
          };
        });
    },
  },

  openverse: {
    label: "Openverse",
    async search(q) {
      const u = new URL("https://api.openverse.org/v1/images/");
      u.searchParams.set("q", q);
      u.searchParams.set("page_size", String(PER_SOURCE));
      u.searchParams.set("mature", "false");
      const data = await getJson(u);
      return (data.results || []).map((r) => ({
        id: `ov-${r.id}`,
        title: r.title || q,
        thumb: r.thumbnail || r.url,
        full: r.url,
        pageUrl: r.foreign_landing_url || r.url,
        author: r.creator || "Okänd",
        license: `${(r.license || "").toUpperCase()} ${r.license_version || ""}`.trim() + (r.provider ? ` (via ${r.provider})` : ""),
        width: r.width, height: r.height,
      }));
    },
  },

  nasa: {
    label: "NASA",
    async search(q) {
      const u = new URL("https://images-api.nasa.gov/search");
      u.searchParams.set("q", q);
      u.searchParams.set("media_type", "image");
      u.searchParams.set("page_size", String(PER_SOURCE));
      const data = await getJson(u);
      return (data.collection?.items || []).slice(0, PER_SOURCE).filter((it) => it.links?.[0]).map((it) => {
        const d = it.data?.[0] || {};
        const thumb = it.links[0].href;
        return {
          id: `nasa-${d.nasa_id}`,
          title: d.title || q,
          thumb,
          full: thumb.replace("~thumb.", "~large."),
          fallback: thumb,
          pageUrl: `https://images.nasa.gov/details/${encodeURIComponent(d.nasa_id)}`,
          author: d.photographer || d.center || "NASA",
          license: "Public domain (NASA)",
        };
      });
    },
  },

  met: {
    label: "The Met (museum)",
    async search(q) {
      const u = new URL("https://collectionapi.metmuseum.org/public/collection/v1.1/search");
      u.searchParams.set("q", q);
      u.searchParams.set("hasImages", "true");
      u.searchParams.set("limit", "10");
      const data = await getJson(u);
      const ids = data.objectIDs || [];
      const objs = await Promise.allSettled(
        ids.map((id) => getJson(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)),
      );
      return objs
        .filter((o) => o.status === "fulfilled" && o.value.isPublicDomain && o.value.primaryImageSmall)
        .map(({ value: o }) => ({
          id: `met-${o.objectID}`,
          title: o.title || q,
          thumb: o.primaryImageSmall,
          full: o.primaryImageSmall, // web-large räcker till en slide; original kan vara många MB
          fallback: o.primaryImageSmall,
          pageUrl: o.objectURL,
          author: o.artistDisplayName || "The Metropolitan Museum of Art",
          license: "Public domain (CC0)",
        }));
    },
  },

  pexels: {
    label: "Pexels",
    key: "PEXELS_API_KEY",
    async search(q) {
      const u = new URL("https://api.pexels.com/v1/search");
      u.searchParams.set("query", q);
      u.searchParams.set("per_page", String(PER_SOURCE));
      const data = await getJson(u, { Authorization: process.env.PEXELS_API_KEY });
      return (data.photos || []).map((p) => ({
        id: `px-${p.id}`,
        title: p.alt || q,
        thumb: p.src.medium,
        full: p.src.large2x || p.src.large,
        pageUrl: p.url,
        author: p.photographer,
        license: "Pexels-licens",
        width: p.width, height: p.height,
      }));
    },
  },

  pixabay: {
    label: "Pixabay",
    key: "PIXABAY_API_KEY",
    async search(q) {
      const u = new URL("https://pixabay.com/api/");
      Object.entries({ key: process.env.PIXABAY_API_KEY, q, per_page: String(PER_SOURCE), image_type: "photo", safesearch: "true" })
        .forEach(([k, v]) => u.searchParams.set(k, v));
      const data = await getJson(u);
      return (data.hits || []).map((h) => ({
        id: `pb-${h.id}`,
        title: h.tags || q,
        thumb: h.webformatURL,
        full: h.largeImageURL || h.webformatURL,
        pageUrl: h.pageURL,
        author: h.user,
        license: "Pixabay-licens",
        width: h.imageWidth, height: h.imageHeight,
      }));
    },
  },

  unsplash: {
    label: "Unsplash",
    key: "UNSPLASH_ACCESS_KEY",
    async search(q) {
      const u = new URL("https://api.unsplash.com/search/photos");
      u.searchParams.set("query", q);
      u.searchParams.set("per_page", String(PER_SOURCE));
      u.searchParams.set("content_filter", "high");
      const data = await getJson(u, { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` });
      return (data.results || []).map((r) => ({
        id: `us-${r.id}`,
        title: r.alt_description || r.description || q,
        thumb: r.urls.small,
        full: r.urls.regular,
        pageUrl: r.links.html,
        author: r.user?.name || "Okänd",
        license: "Unsplash-licens",
        width: r.width, height: r.height,
      }));
    },
  },

  flickr: {
    label: "Flickr (Creative Commons)",
    key: "FLICKR_API_KEY",
    async search(q) {
      const u = new URL("https://www.flickr.com/services/rest/");
      Object.entries({
        method: "flickr.photos.search", api_key: process.env.FLICKR_API_KEY, text: q, license: "1,2,3,4,5,6,9,10",
        safe_search: "1", content_type: "1", sort: "relevance", extras: "url_q,url_l,url_c,owner_name,license",
        per_page: String(PER_SOURCE), format: "json", nojsoncallback: "1",
      }).forEach(([k, v]) => u.searchParams.set(k, v));
      const data = await getJson(u);
      const LIC = { 1: "CC BY-NC-SA 2.0", 2: "CC BY-NC 2.0", 3: "CC BY-NC-ND 2.0", 4: "CC BY 2.0", 5: "CC BY-SA 2.0", 6: "CC BY-ND 2.0", 9: "CC0", 10: "Public domain" };
      return (data.photos?.photo || []).filter((p) => p.url_q).map((p) => ({
        id: `fl-${p.id}`,
        title: p.title || q,
        thumb: p.url_q,
        full: p.url_l || p.url_c || p.url_q,
        pageUrl: `https://www.flickr.com/photos/${p.owner}/${p.id}`,
        author: p.ownername,
        license: LIC[p.license] || "Creative Commons",
      }));
    },
  },
};

export function listSources() {
  return Object.entries(SOURCES).map(([id, s]) => ({
    id, label: s.label, enabled: !s.key || Boolean(process.env[s.key]), key: s.key || null,
  }));
}

// Samma bild kan finnas i flera källor (t.ex. Wikimedia-bilder i Openverse). Nycklar för att känna igen dem.
function sameImageKeys(img) {
  const keys = [];
  for (const u of [img.pageUrl, img.full]) {
    try {
      const url = new URL(u);
      const file = decodeURIComponent(url.pathname.split("/").pop() || "").replace(/^\d+px-/, "").replace(/^File:/i, "").toLowerCase();
      if (file.length > 4) keys.push(file);
      keys.push(url.host.replace(/^www\./, "") + url.pathname.toLowerCase());
    } catch { /* ingen giltig länk */ }
  }
  return keys;
}

/** Söker i alla aktiva källor parallellt. Fel i en källa stoppar inte de andra. Dubbletter tas bort. */
export async function searchImages(query, only) {
  const active = Object.entries(SOURCES).filter(
    ([id, s]) => (!s.key || process.env[s.key]) && (!only?.length || only.includes(id)),
  );
  const results = await Promise.allSettled(active.map(([, s]) => s.search(query)));
  const seen = new Set();
  return active.map(([id, s], i) => ({
    source: id,
    label: s.label,
    error: results[i].status === "rejected" ? String(results[i].reason?.message || results[i].reason) : null,
    images: results[i].status === "fulfilled"
      ? results[i].value
        .filter((img) => {
          const keys = sameImageKeys(img);
          if (keys.some((k) => seen.has(k))) return false;
          keys.forEach((k) => seen.add(k));
          return true;
        })
        .map((img) => ({ ...img, source: s.label }))
      : [],
  }));
}
