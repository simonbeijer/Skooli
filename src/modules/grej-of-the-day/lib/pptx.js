// Bygger .pptx i samma stil som lärarens egna presentationer:
// färgad bakgrund (grön #9DD679 som standard, läraren kan välja), typsnitt Lexend, svart text, 16:9 (10 x 5.625 tum, Google Slides standard).
import PptxGenJS from "pptxgenjs";
import { imageSize } from "image-size";
import fs from "node:fs/promises";
import path from "node:path";

// Bilderna läses från källkodsmappen (import.meta.url pekar på den byggda filen i Next).
const ASSETS = path.join(process.cwd(), "src", "modules", "grej-of-the-day", "assets");

const DEFAULT_BG = "9DD679";
const FONT = "Lexend";
const W = 10;
const H = 5.625;
const UA = "GrejOfTheDay/0.1 (lärarverktyg)";

// ---- Bilder ---------------------------------------------------------------

async function loadImage(img) {
  const urls = [img.full, img.fallback, img.thumb].filter(Boolean);
  for (const url of urls) {
    try {
      let buf, mime;
      if (url.startsWith("data:")) {
        const m = url.match(/^data:([^;]+);base64,(.*)$/);
        mime = m[1];
        buf = Buffer.from(m[2], "base64");
      } else {
        let res;
        for (let attempt = 0; attempt < 3; attempt++) {
          res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
          if (res.status !== 429) break;
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1))); // för många på en gång: vänta och försök igen
        }
        if (!res.ok) continue;
        mime = res.headers.get("content-type")?.split(";")[0] || "image/jpeg";
        buf = Buffer.from(await res.arrayBuffer());
      }
      const dim = imageSize(buf);
      return { data: `data:${mime};base64,${buf.toString("base64")}`, w: dim.width, h: dim.height };
    } catch {
      // prova nästa storlek
    }
  }
  return null;
}

// Placerar en bild så stor som möjligt i rutan utan att förvränga den ("contain").
function addImageContain(slide, loaded, box) {
  if (!loaded) return;
  const r = Math.min(box.w / loaded.w, box.h / loaded.h);
  const w = loaded.w * r;
  const h = loaded.h * r;
  slide.addImage({ data: loaded.data, x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h });
}

// Fyller rutan och beskär överskottet ("cover"), som hennes helbildsslides.
function addImageCover(slide, loaded, box) {
  if (!loaded) return;
  // pptxgenjs räknar ut beskärningen från bildens proportioner (w/h) jämfört med rutan (sizing.w/h).
  slide.addImage({
    data: loaded.data, x: box.x, y: box.y, w: box.w, h: (box.w * loaded.h) / loaded.w,
    sizing: { type: "cover", w: box.w, h: box.h },
  });
}

function grid(n, box, gap = 0.08) {
  const cols = n <= 1 ? 1 : n <= 4 ? 2 : 3;
  const rows = Math.ceil(n / cols);
  const cw = (box.w - gap * (cols - 1)) / cols;
  const ch = (box.h - gap * (rows - 1)) / rows;
  return Array.from({ length: n }, (_, i) => ({
    x: box.x + (i % cols) * (cw + gap),
    y: box.y + Math.floor(i / cols) * (ch + gap),
    w: cw,
    h: ch,
  }));
}

// ---- Källnumrering --------------------------------------------------------

function makeSourceRegistry() {
  const list = [];
  const index = new Map();
  return {
    list,
    numbersFor(sources) {
      return sources.map((s) => {
        if (!index.has(s.url)) {
          list.push(s);
          index.set(s.url, list.length);
        }
        return index.get(s.url);
      });
    },
  };
}

// Text + upphöjda källnummer, t.ex. "Det regnar nästan varje dag.¹ ²"
// breakLine = true avslutar stycket efter källnumren.
function runsWithRefs(text, nums, opts = {}, breakLine = false) {
  if (!nums.length) return [{ text, options: { ...opts, breakLine } }]; // lärarens egen text utan källa
  return [
    { text, options: { ...opts } },
    { text: ` ${nums.join(",")}`, options: { ...opts, superscript: true, color: "333333", breakLine } },
  ];
}

// ---- Slides ---------------------------------------------------------------

const title = (slide, text, opts = {}) =>
  slide.addText(text, { x: 0.3, y: 0.15, w: W - 0.6, h: 0.75, fontFace: FONT, fontSize: 28, color: "000000", align: "center", ...opts });

export async function buildPptx(content, images, color) {
  const bg = /^#?[0-9a-f]{6}$/i.test(color || "") ? color.replace("#", "").toUpperCase() : DEFAULT_BG;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  pptx.title = `GOTD - ${content.amne}`;
  pptx.defineSlideMaster({ title: "GOTD", background: { color: bg } });
  const newSlide = () => pptx.addSlide({ masterName: "GOTD" });
  const refs = makeSourceRegistry();

  // Ladda alla valda bilder parallellt.
  const slots = Object.keys(images || {});
  const loaded = {};
  await Promise.all(
    slots.map(async (slot) => {
      loaded[slot] = await Promise.all((images[slot] || []).map(loadImage));
    }),
  );
  const pick = (slot) => (loaded[slot] || []).filter(Boolean);

  // 1. GOTD
  newSlide().addText("GOTD", { x: 0, y: 0, w: W, h: H, fontFace: FONT, fontSize: 40, bold: false, align: "center", valign: "middle", color: "000000" });

  // 2. Instruktioner (hennes egen bild)
  {
    const s = newSlide();
    const instr = await fs.readFile(path.join(ASSETS, "instruktioner.png"));
    s.addImage({ data: `data:image/png;base64,${instr.toString("base64")}`, x: 3.0, y: 0, w: 3.99, h: H });
    const book = await fs.readFile(path.join(ASSETS, "skrivbok.png"));
    s.addImage({ data: `data:image/png;base64,${book.toString("base64")}`, x: 7.43, y: 0.35, w: 2.07, h: 2.93 });
  }

  // 3. Ledtrådar
  {
    const s = newSlide();
    title(s, "Ledtrådar", { y: 0.45 });
    const runs = content.ledtradar.flatMap((l) => runsWithRefs(l.text, refs.numbersFor(l.sources), { fontSize: 20 }, true));
    s.addText(runs, { x: 0.5, y: 1.5, w: W - 1, h: 3.0, fontFace: FONT, align: "center", valign: "top", color: "000000", paraSpaceAfter: 30 });
  }

  // 4. Avslöjandet: rubrik + stor bild
  {
    const s = newSlide();
    title(s, content.amne, { y: 0.05, h: 0.65 });
    const imgs = pick("omslag");
    if (imgs.length === 1) addImageCover(s, imgs[0], { x: 0.97, y: 0.76, w: 8.06, h: 4.6 });
    else grid(imgs.length, { x: 0.3, y: 0.76, w: W - 0.6, h: 4.7 }).forEach((b, i) => addImageCover(s, imgs[i], b));
  }

  // 5. Bildgalleri (en eller två bilder per slide, som hennes slides 11–12)
  {
    const imgs = pick("galleri");
    for (let i = 0; i < imgs.length; i += 2) {
      const s = newSlide();
      const pair = imgs.slice(i, i + 2);
      if (pair.length === 1) addImageContain(s, pair[0], { x: 0.4, y: 0.2, w: W - 0.8, h: H - 0.4 });
      else pair.forEach((img, j) => addImageCover(s, img, { x: 0.1 + j * 4.95, y: 0.36, w: 4.9, h: 4.7 }));
    }
  }

  // 6. Faktaslides
  content.avsnitt.forEach((a, ai) => {
    const s = newSlide();
    const imgs = pick(`avsnitt-${ai}`);
    const hasImgs = imgs.length > 0;
    const textW = hasImgs ? (a.typ === "lista" ? 2.6 : 6.4) : W - 0.6;
    s.addText(a.rubrik, { x: 0.3, y: 0.15, w: textW + 1, h: 0.6, fontFace: FONT, fontSize: 22, color: "000000" });

    if (a.typ === "lista") {
      const runs = a.punkter.flatMap((p) => runsWithRefs(p.text, refs.numbersFor(p.sources), { fontSize: 13 }, true));
      s.addText(runs, { x: 0.55, y: 0.8, w: textW, h: H - 0.9, fontFace: FONT, color: "000000", valign: "top", paraSpaceAfter: 4 });
      if (hasImgs) {
        s.addShape(pptx.ShapeType.rect, { x: 3.27, y: 0.6, w: 6.6, h: 4.9, fill: { color: "FFFFFF" }, line: { color: "FFFFFF" } });
        grid(imgs.length, { x: 3.37, y: 0.7, w: 6.4, h: 4.7 }).forEach((b, i) => addImageCover(s, imgs[i], b));
      }
    } else {
      const runs = a.punkter.flatMap((p) => runsWithRefs(p.text, refs.numbersFor(p.sources), { fontSize: a.punkter.length > 4 ? 15 : 17 }, true));
      s.addText(runs, { x: 0.3, y: 0.85, w: textW, h: H - 1.0, fontFace: FONT, color: "000000", valign: "top", paraSpaceAfter: 12 });
      if (hasImgs) {
        if (imgs.length === 1) addImageCover(s, imgs[0], { x: 6.87, y: 0, w: W - 6.87, h: H });
        else grid(imgs.length, { x: 6.9, y: 0.1, w: 3.0, h: H - 0.2 }).forEach((b, i) => addImageContain(s, imgs[i], b));
      }
    }
  });

  // 7. Film
  if (content.filmer?.length) {
    const s = newSlide();
    s.addText("Film", { x: 1.6, y: 1.1, w: 6, h: 0.45, fontFace: FONT, fontSize: 20, color: "000000" });
    content.filmer.forEach((f, i) => {
      s.addText(
        [
          { text: f.titel, options: { hyperlink: { url: f.url }, color: "1A73A8", underline: { style: "sng" } } },
          ...(f.minuter ? [{ text: `   ${f.minuter} min`, options: { color: "000000" } }] : []),
        ],
        { x: 1.6, y: 1.55 + i * 0.4, w: 7.5, h: 0.4, fontFace: "Arial", fontSize: 13 },
      );
    });
  }

  // 8. Sammanfattning: definition, nyckelord, stjärnfråga
  {
    const s = newSlide();
    const imgs = pick("sammanfattning");
    s.addText(content.amne, { x: 0.3, y: 0.08, w: 7, h: 0.75, fontFace: FONT, fontSize: 32, color: "000000" });
    s.addText(runsWithRefs(content.definition.text, refs.numbersFor(content.definition.sources), { fontSize: 20 }), {
      x: 0.25, y: 0.75, w: W - 0.5, h: 0.55, fontFace: FONT, color: "000000",
    });
    s.addText(
      content.nyckelord.map((k) => ({ text: k, options: { bullet: true, breakLine: true } })),
      { x: 0.3, y: 1.4, w: 3.0, h: 2.9, fontFace: FONT, fontSize: 22, color: "000000", paraSpaceAfter: 18, valign: "top" },
    );
    if (imgs.length) grid(imgs.length, { x: 3.2, y: 1.35, w: W - 3.3, h: 3.5 }).forEach((b, i) => addImageCover(s, imgs[i], b));
    s.addShape(pptx.ShapeType.star5, { x: 0.1, y: 4.55, w: 0.5, h: 0.5, fill: { color: "FFFF00" }, line: { color: "555555", width: 0.75 } });
    s.addText(content.fraga, { x: 0.65, y: 4.55, w: 8, h: 0.5, fontFace: FONT, fontSize: 17, color: "000000" });
  }

  // 9. Källor (fakta + bilder)
  const allImages = Object.values(images || {}).flat();
  const factLines = refs.list.map((src, i) => ({
    text: `${i + 1}. ${src.title} – ${src.url}`,
    options: { breakLine: true, hyperlink: { url: src.url }, color: "000000" },
  }));
  const imageLines = allImages.map((img) => ({
    text: `${img.title} – ${img.author} – ${img.license} – ${img.source}${img.pageUrl ? ` – ${img.pageUrl}` : ""}`,
    options: { breakLine: true, color: "000000" },
  }));
  const PER_PAGE = 16;
  const chunks = [];
  const factHeader = { text: "Fakta", options: { bold: true, breakLine: true, color: "000000" } };
  const imgHeader = { text: "Bilder", options: { bold: true, breakLine: true, color: "000000" } };
  const all = [factHeader, ...factLines, ...(imageLines.length ? [{ text: " ", options: { breakLine: true } }, imgHeader, ...imageLines] : [])];
  for (let i = 0; i < all.length; i += PER_PAGE) chunks.push(all.slice(i, i + PER_PAGE));
  chunks.forEach((chunk, i) => {
    const s = newSlide();
    s.addText(chunks.length > 1 ? `Källor (${i + 1}/${chunks.length})` : "Källor", { x: 0.3, y: 0.1, w: 9, h: 0.55, fontFace: FONT, fontSize: 22, color: "000000" });
    s.addText(chunk, { x: 0.3, y: 0.7, w: W - 0.6, h: H - 0.8, fontFace: FONT, fontSize: 9, valign: "top" });
  });

  return pptx.write({ outputType: "nodebuffer" });
}
