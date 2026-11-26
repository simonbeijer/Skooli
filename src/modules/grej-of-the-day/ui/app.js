// Grej of the Day – gränssnitt (ren JS som styr DOM:en direkt).
// mountGotd(root) fyller root med sidans HTML, kopplar på allt och returnerar en städfunktion.
// Allt sparas i webbläsaren (localStorage) så att inget försvinner om sidan laddas om.

import { MARKUP } from "./markup.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const STORE = "gotd-state-v1";
const DEFAULT_COLOR = "#9DD679";

const STYLES = [
  ["kul", "Kul", "smile"],
  ["intressant", "Intressant", "bulb"],
  ["overraska", "Överraska mig", "shuffle"],
];

// Ikoner (streck, 24×24). Samma uttryck överallt i stället för emoji.
const ICONS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
  sparkles: '<path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z"/><path d="M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  zoom: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>',
  upload: '<path d="M12 15V4M7 9l5-5 5 5"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5s1.3 1.8 3.5 1.8 3.5-1.8 3.5-1.8M9 9.5h.01M15 9.5h.01"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/>',
  shuffle: '<path d="M16 4h4v4M4 20 20 4M20 16v4h-4M15 15l5 5M4 4l5 5"/>',
  pen: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="m10 8.5 5 3.5-5 3.5z"/>',
};
const icon = (name) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

export function mountGotd(root) {
root.innerHTML = MARKUP;

const $ = (sel, el = root) => el.querySelector(sel);
let disposed = false; // sätts när sidan lämnas, så att inget som väntar på servern rör DOM:en efteråt
const toLogin = () => { window.location.href = "/login"; };

let state = migrate(load()) || { step: 1, content: null, images: {}, queries: {}, color: DEFAULT_COLOR };
const results = {}; // bildsökresultat per slot (sparas inte)
const more = {}; // "Fler förslag"-paneler: vald stil, önskemål och pågående jobb per sektion (sparas inte)

function load() {
  try { return JSON.parse(localStorage.getItem(STORE)); } catch { return null; }
}
function save() {
  try { localStorage.setItem(STORE, JSON.stringify(state)); } catch { /* full eller blockerad: fortsätt utan */ }
}

// Äldre sparat innehåll hade nyckelord som text och en enda fråga.
function migrate(s) {
  if (!s) return s;
  s.color ||= DEFAULT_COLOR;
  const c = s.content;
  if (c && typeof c.nyckelord?.[0] === "string") {
    c.nyckelord = c.nyckelord.map((text) => ({ text, approved: Boolean(c.nyckelordApproved) }));
    delete c.nyckelordApproved;
  }
  if (c && typeof c.fraga === "string") {
    c.fragor = [{ text: c.fraga, approved: Boolean(c.fragaApproved) }];
    delete c.fraga;
    delete c.fragaApproved;
  }
  return s;
}

// ---------- Färg ----------

function applyColor() {
  root.style.setProperty("--theme", state.color);
}

function isDark(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55;
}

function renderColors() {
  $("#colors").innerHTML = `
    <div class="color-row">
      <label class="color-pick" style="background:${esc(state.color)}">
        <input type="color" value="${esc(state.color)}" data-color-input />
        <span>Ändra färg</span>
      </label>
      <div class="slide-preview" style="background:${esc(state.color)}">
        <strong>${esc(state.content?.amne || "Grej of the Day")}</strong>
        <span>Så här blir slidesen</span>
      </div>
    </div>
    <p class="hint warn" data-dark ${isDark(state.color) ? "" : "hidden"}>Texten på slidesen är svart. Välj gärna en ljusare färg så att den syns.</p>`;
}

$("#colors").addEventListener("input", (e) => {
  if (!e.target.matches("[data-color-input]")) return;
  state.color = e.target.value.toUpperCase();
  save();
  applyColor();
  $(".slide-preview").style.background = state.color;
  $(".color-pick").style.background = state.color;
  $("[data-dark]").hidden = !isDark(state.color);
});

// ---------- Navigering ----------

function goto(step) {
  if (step > 1 && !state.content) step = 1;
  state.step = step;
  save();
  root.querySelectorAll(".step").forEach((s) => (s.hidden = s.id !== `step-${step}`));
  root.querySelectorAll("#steps button").forEach((b) => b.classList.toggle("active", Number(b.dataset.step) === step));
  if (step === 2) renderReview();
  if (step === 3) renderSlots();
  if (step === 1) renderColors();
  if (step === 4) renderChecklist();
  window.scrollTo(0, 0);
}
root.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => goto(Number(b.dataset.step))));
root.querySelectorAll("[data-goto]").forEach((b) => b.addEventListener("click", () => goto(Number(b.dataset.goto))));

// ---------- Jobb på servern ----------

const post = (body) => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

// Startar ett jobb och väntar tills det är klart. onLog får alla statusrader hittills.
// ctl.cancel() avbryter jobbet (då kastas felet "Avbruten").
async function runJob(url, body, onLog, ctl = {}) {
  let cancelled = false;
  let id;
  ctl.cancel = () => {
    cancelled = true;
    if (id) fetch(`/api/grej-of-the-day/jobs/${id}`, { method: "DELETE" }).catch(() => {});
  };
  const res = await fetch(url, post(body));
  if (res.status === 401) { toLogin(); throw new Error("Avbruten"); }
  const started = await res.json().catch(() => ({ error: `Servern svarade inte som väntat (${res.status}). Starta om Skooli (npm run dev) och försök igen.` }));
  if (started.error) throw new Error(started.error);
  id = started.id;
  if (cancelled || disposed) ctl.cancel(); // svar efter avbrott eller unmount: ta bort jobbet på servern
  if (disposed) throw new Error("Avbruten");
  let job;
  do {
    await new Promise((r) => setTimeout(r, 1500));
    if (cancelled || disposed) throw new Error("Avbruten");
    const r = await fetch(`/api/grej-of-the-day/jobs/${id}`);
    if (disposed) throw new Error("Avbruten");
    if (r.status === 401) { toLogin(); throw new Error("Avbruten"); }
    // Jobben finns bara i serverns minne. Startas servern om försvinner pågående jobb.
    if (r.status === 404) throw new Error("Servern startades om medan AI:n arbetade, så arbetet försvann. Försök igen.");
    job = await r.json();
    if (disposed) throw new Error("Avbruten");
    onLog(job.log || []);
  } while (job.status === "running");
  if (cancelled) throw new Error("Avbruten");
  if (job.status === "error") throw new Error(job.error);
  return job.result;
}

// ---------- Steg 1: generera ----------

$("#generate").addEventListener("click", async () => {
  const topic = $("#topic").value.trim();
  if (!topic) return $("#topic").focus();
  if (state.content && !confirm("Det finns redan en påbörjad presentation. Ersätta den?")) return;
  const btn = $("#generate");
  btn.disabled = true;
  $("#cancel-generate").hidden = false;
  $("#gen-error").hidden = true;
  $("#progress").hidden = false;
  $("#log").innerHTML = "";
  try {
    const result = await runJob("/api/grej-of-the-day/generate", { topic, notes: $("#notes").value }, (log) => {
      $("#log").innerHTML = log.map((l) => `<li>${esc(l)}</li>`).join("");
      $("#log").scrollTop = 1e6;
    }, genCtl);
    if (disposed) return;
    state = { ...state, step: 2, content: prepare(result), images: {}, queries: {} };
    save();
    goto(2);
  } catch (e) {
    if (disposed) return;
    if (e.message !== "Avbruten") {
      $("#gen-error").textContent = e.message;
      $("#gen-error").hidden = false;
    }
  } finally {
    if (!disposed) {
      btn.disabled = false;
      $("#cancel-generate").hidden = true;
      $("#progress").hidden = true;
    }
  }
});

const genCtl = {};
$("#cancel-generate").addEventListener("click", () => genCtl.cancel?.());

// Gör om AI:ns svar till det som granskas. Inget är med förrän läraren valt det.
function prepare(c) {
  const fact = (f) => ({ ...f, approved: false });
  return {
    amne: c.amne,
    bildsok: c.bildsok,
    bildsok_fler: c.bildsok_fler || [],
    definition: fact(c.definition),
    ledtradar: c.ledtradar.map(fact),
    avsnitt: c.avsnitt.map((a) => ({ ...a, punkter: a.punkter.map(fact) })),
    nyckelord: c.nyckelord.map((text) => ({ text, approved: false })),
    fragor: [{ text: c.fraga, approved: false }],
    filmer: c.filmer.map((f) => ({ ...f, approved: false })),
  };
}

// ---------- Steg 2: granska ----------

// Varje text pekas ut med en "path", t.ex. ["avsnitt", 1, "punkter", 2].
const getAt = (path) => path.reduce((o, k) => o[k], state.content);

// En text får tas med om den har en källa, eller om läraren skrivit den själv.
const canInclude = (fact) => fact.text.trim() && (fact.sources.length > 0 || fact.own);

function includeButtons(item, { removable = true } = {}) {
  return `
    <div class="choice">
      <button class="pick ${item.approved ? "on" : ""}" data-act="toggle" aria-pressed="${Boolean(item.approved)}">${icon(item.approved ? "check" : "plus")}${item.approved ? "Med" : "Ta med"}</button>
      ${removable ? `<button class="drop" data-act="remove">${icon("x")}Ta bort</button>` : ""}
      ${item.isNew ? `<span class="tag new">Nytt förslag</span>` : ""}
      ${item.own ? `<span class="tag">Egen text</span>` : ""}
    </div>`;
}

// Källans namn kort: "Regnskog – Wikipedia" eller webbplatsens namn för egna länkar.
function sourceName(s) {
  if (!s.manual) return s.title || s.url;
  try { return new URL(s.url).hostname.replace(/^www\./, ""); } catch { return s.url; }
}

function factHtml(fact, path, { multiline = true, removable = true } = {}) {
  const p = esc(JSON.stringify(path));
  const blocked = !canInclude(fact);
  const cls = fact.approved ? "approved" : blocked ? "invalid" : "";
  return `
  <div class="item ${cls}" data-path='${p}'>
    ${multiline
      ? `<textarea rows="2" data-act="text" placeholder="Skriv här …">${esc(fact.text)}</textarea>`
      : `<input data-act="text" value="${esc(fact.text)}" placeholder="Skriv här …" />`}
    <div class="item-foot">
      ${includeButtons(fact, { removable })}
      <div class="refs">
        ${fact.sources.map((s, i) => `
          <span class="ref">
            <a href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(s.url)}">${icon("link")}<span>${esc(sourceName(s))}</span></a>
            <button class="ref-x" data-act="rm-source" data-i="${i}" aria-label="Ta bort källan ${esc(sourceName(s))}">${icon("x")}</button>
          </span>`).join("")}
        ${blocked && fact.text.trim() ? `<span class="missing">${icon("alert")}Saknar källa</span>` : ""}
        <details class="add-source">
          <summary title="Lägg till en egen källa">${icon("plus")}Källa</summary>
          <div class="row">
            <input type="url" placeholder="Klistra in länk till källan" data-act="source-input" />
            <button class="secondary" data-act="add-source">Lägg till</button>
          </div>
        </details>
      </div>
    </div>
  </div>`;
}

function simpleHtml(item, path) {
  return `
  <div class="item ${item.approved ? "approved" : ""}" data-path='${esc(JSON.stringify(path))}'>
    <input data-act="text" value="${esc(item.text)}" placeholder="Skriv här …" />
    ${includeButtons(item)}
  </div>`;
}

// Knappens text visar vad som händer: med eller utan önskemål.
function generateLabel(m, needsWish) {
  if (m.running) return "Tar fram …";
  if (needsWish) return "Skapa slide";
  return m.wish.trim() ? "Ta fram med önskemål" : "Ta fram direkt";
}

// Panel efter varje sektion: välj stil, skriv ett önskemål om du vill, och klicka på knappen.
function moreHtml(key, { own = "Skriv egen", wishPlaceholder = "t.ex. grodor", needsWish = false } = {}) {
  const m = (more[key] ||= { style: "intressant", wish: "" });
  const off = m.running ? "disabled" : "";
  return `
  <div class="more" data-more="${esc(key)}" data-needs-wish="${needsWish}">
    <div class="more-head">${icon("sparkles")}${needsWish ? "Låt AI:n skriva en ny slide" : "Fler förslag från AI:n"}</div>
    <div class="more-grid">
      <span class="more-label">Stil</span>
      <div class="seg" role="group" aria-label="Stil">
        ${STYLES.map(([id, name, ic]) => `<button class="seg-btn ${m.style === id ? "on" : ""}" data-style="${id}" aria-pressed="${m.style === id}" ${off}>${icon(ic)}${name}</button>`).join("")}
      </div>
      <label class="more-label" for="wish-${esc(key)}">${needsWish ? "Handlar om" : "Önskemål"}</label>
      <div class="more-row">
        <input id="wish-${esc(key)}" data-wish placeholder="${needsWish ? "" : "Valfritt, "}${esc(wishPlaceholder)}" value="${esc(m.wish)}" ${off} />
        <button class="primary" data-generate ${m.running || (needsWish && !m.wish.trim()) ? "disabled" : ""}>${icon("sparkles")}<span>${generateLabel(m, needsWish)}</span></button>
        ${own ? `<button class="secondary" data-own>${icon("pen")}${esc(own)}</button>` : ""}
      </div>
    </div>
    ${m.running ? `<div class="more-status"><div class="spinner small"></div><span data-status>${esc(m.status || "Startar …")}</span>
      <button class="link" data-cancel>Avbryt</button></div>` : ""}
    ${m.error ? `<p class="error">${esc(m.error)}</p>` : ""}
    ${m.info ? `<p class="hint">${esc(m.info)}</p>` : ""}
  </div>`;
}

function renderReview() {
  const c = state.content;
  const el = $("#review");
  el.innerHTML = `
    <div class="card">
      <div class="section-head"><h3>Ämne</h3></div>
      <input data-field="amne" value="${esc(c.amne)}" />
    </div>

    <div class="card">
      <div class="section-head"><h3>Ledtrådar</h3><span class="tag">svårast först</span></div>
      ${c.ledtradar.map((l, i) => factHtml(l, ["ledtradar", i])).join("")}
      ${moreHtml("ledtradar")}
    </div>

    <div class="card">
      <div class="section-head"><h3>Vad är det?</h3><span class="tag">visas på sista sliden</span></div>
      ${factHtml(c.definition, ["definition"], { removable: false })}
    </div>

    ${c.avsnitt.map((a, ai) => `
      <div class="card">
        <div class="section-head">
          <input data-field="avsnitt.${ai}.rubrik" value="${esc(a.rubrik)}" />
          <span class="tag">${a.typ === "lista" ? "lista" : "fakta"}</span>
          <button class="secondary" data-approve-all="${ai}">${icon("check")}Ta med alla</button>
          <button class="icon-btn" data-rm-section="${ai}" title="Ta bort sliden" aria-label="Ta bort sliden">${icon("trash")}</button>
        </div>
        ${a.punkter.map((p, pi) => factHtml(p, ["avsnitt", ai, "punkter", pi], { multiline: a.typ !== "lista" })).join("")}
        ${moreHtml(`avsnitt-${ai}`)}
      </div>`).join("")}

    <div class="card new-section">
      <div class="section-head"><h3>Ny slide</h3><span class="tag">AI:n skriver en ny faktaslide</span></div>
      ${moreHtml("nytt-avsnitt", { own: "Tom slide", needsWish: true, wishPlaceholder: "t.ex. regnskogens fyra lager, grodor, Amazonasdelfinen" })}
    </div>

    <div class="card">
      <div class="section-head"><h3>Nyckelord</h3><span class="tag">välj 4, eleverna skriver meningar med dem</span></div>
      <div class="keywords">${c.nyckelord.map((k, i) => simpleHtml(k, ["nyckelord", i])).join("")}</div>
      ${moreHtml("nyckelord", { wishPlaceholder: "t.ex. ord om djur" })}
    </div>

    <div class="card">
      <div class="section-head"><h3>Fråga till eleverna</h3><span class="tag">välj en</span></div>
      ${c.fragor.map((f, i) => simpleHtml(f, ["fragor", i])).join("")}
      ${moreHtml("fragor", { wishPlaceholder: "t.ex. något att rita" })}
    </div>

    <div class="card">
      <div class="section-head"><h3>Film</h3><span class="tag">valfritt</span></div>
      ${c.filmer.length ? "" : `<p class="hint">Ingen film. Ingen film-slide skapas.</p>`}
      ${c.filmer.map((f, i) => `
        <div class="item ${f.approved ? "approved" : ""}" data-path='${esc(JSON.stringify(["filmer", i]))}'>
          <div class="item-row">
            <a href="${esc(f.url)}" target="_blank" rel="noopener" class="film">${icon("play")}${esc(f.titel)}</a>
            <span class="hint">${f.minuter ? f.minuter + " min" : ""}</span>
          </div>
          ${includeButtons(f)}
        </div>`).join("")}
    </div>`;
  updateCount();
}

function allFacts() {
  const c = state.content;
  return [c.definition, ...c.ledtradar, ...c.avsnitt.flatMap((a) => a.punkter)];
}

// Det som stoppar nedladdningen. Texter som inte är valda kommer helt enkelt inte med.
function pending() {
  const c = state.content;
  if (!c) return ["Inget innehåll ännu"];
  const out = [];
  if (!c.definition.approved) out.push("Ta med texten under \"Vad är det?\"");
  if (!c.ledtradar.some((l) => l.approved)) out.push("Ta med minst en ledtråd");
  if (!c.avsnitt.some((a) => a.punkter.some((p) => p.approved))) out.push("Ta med minst en faktatext");
  if (!c.nyckelord.some((k) => k.approved)) out.push("Ta med nyckelord");
  if (!c.fragor.some((f) => f.approved)) out.push("Välj en fråga till eleverna");
  return out;
}

// Bra att veta, men stoppar inte.
function notes() {
  const c = state.content;
  const out = [];
  const left = allFacts().filter((f) => !f.approved && f.text.trim()).length;
  if (left) out.push(`${left} texter är inte valda och kommer inte med`);
  const lt = c.ledtradar.filter((l) => l.approved).length;
  if (lt && lt !== 3) out.push(`${lt} ledtrådar valda (brukar vara 3)`);
  const kw = c.nyckelord.filter((k) => k.approved).length;
  if (kw && kw !== 4) out.push(`${kw} nyckelord valda (brukar vara 4)`);
  return out;
}

function updateCount() {
  const facts = allFacts();
  const ok = facts.filter((f) => f.approved).length;
  $("#approve-count").textContent = `${ok} av ${facts.length} texter är med`;
}

// Tar bort ett avsnitt och flyttar bildvalen för avsnitten efter så att de följer med rätt slide.
function removeSection(idx) {
  state.content.avsnitt.splice(idx, 1);
  const imgs = {};
  for (const [k, v] of Object.entries(state.images)) {
    const m = k.match(/^avsnitt-(\d+)$/);
    if (!m) imgs[k] = v;
    else if (Number(m[1]) < idx) imgs[k] = v;
    else if (Number(m[1]) > idx) imgs[`avsnitt-${Number(m[1]) - 1}`] = v;
  }
  state.images = imgs;
  for (const k of Object.keys(state.queries)) if (k.startsWith("avsnitt-")) delete state.queries[k];
}

// Be AI:n om fler förslag till en sektion.
async function askMore(key, style) {
  const c = state.content;
  const m = more[key];
  m.ctl?.cancel(); // ny sökning ersätter en pågående
  m.style = style;
  m.info = null;
  m.error = null;
  const base = { topic: c.amne, style: m.style, wish: m.wish };
  let body;
  if (key === "ledtradar") body = { ...base, kind: "ledtradar", existing: c.ledtradar.map((l) => l.text) };
  else if (key === "nyckelord") body = { ...base, kind: "nyckelord", existing: c.nyckelord.map((k) => k.text) };
  else if (key === "fragor") body = { ...base, kind: "fraga", existing: c.fragor.map((f) => f.text) };
  else if (key === "nytt-avsnitt") {
    if (!m.wish.trim()) { m.error = "Skriv först vad sliden ska handla om, t.ex. \"grodor\"."; return renderReview(); }
    body = { ...base, kind: "avsnitt", existing: c.avsnitt.map((a) => a.rubrik) };
  } else {
    const ai = Number(key.split("-")[1]);
    const a = c.avsnitt[ai];
    body = { ...base, kind: "punkter", rubrik: a.rubrik, typ: a.typ, existing: c.avsnitt.flatMap((x) => x.punkter.map((p) => p.text)) };
  }

  // Avsnittet kan flyttas medan AI:n arbetar (om ett annat tas bort), så vi minns själva objektet.
  const target = key.startsWith("avsnitt-") ? c.avsnitt[Number(key.split("-")[1])] : null;
  const ctl = (m.ctl = {});
  Object.assign(m, { running: true, status: "Startar … (tar ofta en minut)" });
  renderReview();
  try {
    const r = await runJob("/api/grej-of-the-day/more", body, (log) => {
      if (m.ctl !== ctl) return;
      m.status = log.at(-1) || m.status;
      const s = $(`[data-more="${key}"] [data-status]`);
      if (s) s.textContent = m.status;
    }, ctl);
    if (disposed || state.content !== c || m.ctl !== ctl) return; // läraren har börjat om eller sökt på nytt
    const count = r.forslag?.length ?? r.avsnitt?.punkter.length;
    const fresh = (f) => ({ ...f, approved: false, isNew: true });
    if (key === "ledtradar") c.ledtradar.push(...r.forslag.map(fresh));
    else if (key === "nyckelord") c.nyckelord.push(...r.forslag.map((text) => ({ text, approved: false, isNew: true })));
    else if (key === "fragor") c.fragor.push(...r.forslag.map((text) => ({ text, approved: false, isNew: true })));
    else if (key === "nytt-avsnitt") { c.avsnitt.push({ ...r.avsnitt, punkter: r.avsnitt.punkter.map(fresh) }); m.wish = ""; }
    else if (target && c.avsnitt.includes(target)) target.punkter.push(...r.forslag.map(fresh));
    m.info = key === "nytt-avsnitt" ? "Ny slide tillagd ovanför." : `${count} nya förslag tillagda ovanför (märkta "nytt förslag").`;
    save();
  } catch (e) {
    if (disposed || m.ctl !== ctl) return;
    if (e.message !== "Avbruten") m.error = e.message;
  } finally {
    if (!disposed && m.ctl === ctl) {
      m.running = false;
      m.ctl = null;
      if (state.step === 2) renderReview();
    }
  }
}

// Händelser i granskningsvyn (delegering, så att fokus inte tappas när man skriver).
$("#review").addEventListener("input", (e) => {
  const t = e.target;
  const c = state.content;
  const item = t.closest(".item[data-path]");
  const panel = t.closest("[data-more]");
  if (panel && t.matches("[data-wish]")) {
    const m = more[panel.dataset.more];
    m.wish = t.value;
    const needsWish = panel.dataset.needsWish === "true";
    const btn = $("[data-generate]", panel);
    $("span", btn).textContent = generateLabel(m, needsWish);
    btn.disabled = needsWish && !m.wish.trim();
    return;
  }
  if (item && t.dataset.act === "text") {
    getAt(JSON.parse(item.dataset.path)).text = t.value;
  } else if (t.dataset.field) {
    const keys = t.dataset.field.split(".");
    const last = keys.pop();
    keys.reduce((o, k) => o[k], c)[last] = t.value;
  }
  save();
});

$("#review").addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || !e.target.matches("[data-wish]")) return;
  const key = e.target.closest("[data-more]").dataset.more;
  askMore(key, more[key].style);
});

$("#review").addEventListener("click", (e) => {
  const t = e.target.closest("button");
  if (!t) return;
  const c = state.content;

  const panel = t.closest("[data-more]");
  if (panel) {
    const key = panel.dataset.more;
    if (t.dataset.style) {
      more[key].style = t.dataset.style;
      panel.querySelectorAll("[data-style]").forEach((b) => {
        b.classList.toggle("on", b === t);
        b.setAttribute("aria-pressed", b === t);
      });
      return;
    }
    if (t.dataset.generate !== undefined) return askMore(key, more[key].style);
    if (t.dataset.cancel !== undefined) {
      more[key].ctl?.cancel();
      Object.assign(more[key], { running: false, ctl: null });
      return renderReview();
    }
    if (t.dataset.own !== undefined) {
      if (key === "nytt-avsnitt") c.avsnitt.push({ rubrik: more[key].wish.trim() || "Ny slide", typ: "fakta", punkter: [], bildsok: c.bildsok });
      else if (key === "nyckelord") c.nyckelord.push({ text: "", approved: false });
      else if (key === "fragor") c.fragor.push({ text: "", approved: false });
      else if (key === "ledtradar") c.ledtradar.push({ text: "", sources: [], approved: false, own: true });
      else c.avsnitt[Number(key.split("-")[1])].punkter.push({ text: "", sources: [], approved: false, own: true });
      save();
      renderReview();
      // Sätt markören i den nya, tomma texten.
      const card = key === "nytt-avsnitt" ? $(".new-section").previousElementSibling : $(`[data-more="${key}"]`).closest(".card");
      const inputs = card.querySelectorAll(key === "nytt-avsnitt" ? "[data-field]" : "[data-act=text]");
      inputs[inputs.length - 1]?.focus();
      return;
    }
    return;
  }

  const item = t.closest(".item[data-path]");
  const path = item && JSON.parse(item.dataset.path);

  if (t.dataset.act === "toggle") {
    const it = getAt(path);
    if (!it.approved && path[0] !== "fragor" && path[0] !== "nyckelord" && path[0] !== "filmer" && !canInclude(it)) {
      return alert(it.text.trim() ? "Lägg till en källa först (eller skriv om texten till din egen)." : "Skriv något först.");
    }
    if (!it.approved && !it.text?.trim() && (path[0] === "fragor" || path[0] === "nyckelord")) return alert("Skriv något först.");
    it.approved = !it.approved;
    it.isNew = false;
    if (path[0] === "fragor" && it.approved) c.fragor.forEach((f) => { if (f !== it) f.approved = false; });
  } else if (t.dataset.act === "remove") {
    const idx = path.pop();
    getAt(path).splice(idx, 1);
  } else if (t.dataset.act === "rm-source") {
    const fact = getAt(path);
    fact.sources.splice(Number(t.dataset.i), 1);
    if (!canInclude(fact)) fact.approved = false;
  } else if (t.dataset.act === "add-source") {
    const input = $("[data-act=source-input]", item);
    const url = input.value.trim();
    try { new URL(url); } catch { return alert("Klistra in en hel länk, t.ex. https://sv.wikipedia.org/wiki/Regnskog"); }
    getAt(path).sources.push({ url, title: url, manual: true });
  } else if (t.dataset.approveAll) {
    c.avsnitt[Number(t.dataset.approveAll)].punkter.forEach((p) => { if (canInclude(p)) { p.approved = true; p.isNew = false; } });
  } else if (t.dataset.rmSection) {
    if (!confirm("Ta bort hela sliden?")) return;
    removeSection(Number(t.dataset.rmSection));
  } else return;
  save();
  renderReview();
});

// ---------- Steg 3: bilder ----------

// Bilder från nätet går via servern, som hämtar några åt gången (annars blockerar t.ex. Wikimedia).
const imgSrc = (u) => (!u || u.startsWith("data:") ? u : `/api/grej-of-the-day/thumb?u=${encodeURIComponent(u)}`);

// Varje bildruta får egna sökord, så att samma sökning inte står på flera ställen.
function slotDefs() {
  const c = state.content;
  const fler = c.bildsok_fler || [];
  const defs = [
    { id: "omslag", title: `Avslöjandet: "${c.amne}"`, hint: "En stor bild, eller upp till 4", max: 4, q: c.bildsok },
    { id: "galleri", title: "Bildgalleri", hint: "1–2 bilder per slide, välj upp till 6", max: 6, q: fler[0] || `${c.bildsok} close-up` },
    ...c.avsnitt.map((a, i) => ({
      id: `avsnitt-${i}`,
      title: a.rubrik,
      hint: a.typ === "lista" ? "Bildrutnät, upp till 9" : "1 bild fyller högerkanten, eller 2–3 mindre",
      max: a.typ === "lista" ? 9 : 3,
      q: a.bildsok,
    })),
    { id: "sammanfattning", title: "Sista sliden", hint: "Upp till 3 bilder", max: 3, q: fler[1] || `${c.bildsok} landscape` },
  ];
  const extra = ["close-up", "landscape", "nature", "illustration", "detail", "animals"];
  const used = new Set();
  for (const d of defs) {
    let q = (d.q || c.amne).trim();
    for (let i = 0; used.has(q.toLowerCase()); i++) q = `${d.q} ${extra[i % extra.length]}${i >= extra.length ? ` ${i}` : ""}`;
    used.add(q.toLowerCase());
    d.q = q;
  }
  return defs;
}

// Vilka bilder som redan är valda någon annanstans, så att samma bild inte hamnar överallt.
function usedElsewhere(slot) {
  const titles = Object.fromEntries(slotDefs().map((s) => [s.id, s.title]));
  const used = new Map();
  for (const [k, list] of Object.entries(state.images)) {
    if (k === slot) continue;
    for (const img of list) used.set(img.id, titles[k] || k);
  }
  return used;
}

async function renderSlots() {
  const res = await fetch("/api/grej-of-the-day/image-sources").catch(() => null);
  if (disposed) return;
  if (res?.status === 401) return toLogin();
  const data = res ? await res.json().catch(() => null) : null;
  if (disposed) return;
  if (res?.ok && Array.isArray(data)) {
    const on = data.filter((s) => s.enabled).map((s) => s.label);
    const off = data.filter((s) => !s.enabled).map((s) => s.label);
    $("#source-status").textContent = `Söker i: ${on.join(", ")}.` + (off.length ? ` Fler källor (${off.join(", ")}) kan slås på med gratis API-nycklar, se .env.example.` : "");
  } else {
    $("#source-status").textContent = data?.error || `Kunde inte hämta bildkällorna (${res ? res.status : "inget svar"}).`;
  }

  $("#slots").innerHTML = slotDefs().map((s) => {
    state.queries[s.id] ??= s.q;
    return `
    <div class="card" data-slot="${s.id}" data-max="${s.max}">
      <div class="slot-head"><h3>${esc(s.title)}</h3><span class="hint">${esc(s.hint)}</span></div>
      <div class="chosen"></div>
      <div class="search-row">
        <input value="${esc(state.queries[s.id])}" data-q />
        <button class="primary" data-search>Sök bilder</button>
      </div>
      <div class="results"></div>
      <div class="own">
        <label class="drop-zone">
          ${icon("upload")}
          <span><b>Dra hit en egen bild</b> eller klicka för att välja fil</span>
          <input type="file" accept="image/*" data-own-file class="sr-only" />
        </label>
        <div class="own-url">
          <input type="url" placeholder="Eller klistra in en länk till en bild" data-own-url aria-label="Länk till en bild" />
          <button class="secondary" data-own-add>Lägg till</button>
        </div>
      </div>
    </div>`;
  }).join("");
  root.querySelectorAll("[data-slot]").forEach((card) => {
    renderChosen(card);
    renderResults(card);
  });
}

function renderChosen(card) {
  const list = state.images[card.dataset.slot] || [];
  $(".chosen", card).innerHTML = list.length
    ? list.map((img, i) => `<figure title="${esc(img.title)} – ${esc(img.author)} (${esc(img.license)})"><img src="${esc(imgSrc(img.thumb))}" alt="" onerror="this.classList.add('broken')" /><button data-unpick="${i}" aria-label="Ta bort bilden">${icon("x")}</button></figure>`).join("")
    : `<span class="hint">Inga bilder valda ännu.</span>`;
}

function renderResults(card) {
  const slot = card.dataset.slot;
  const r = results[slot];
  const el = $(".results", card);
  if (!r) return (el.innerHTML = "");
  if (r.loading) return (el.innerHTML = `<div class="spinner"></div>`);
  if (r.error) return (el.innerHTML = `<p class="error">${esc(r.error)}</p>`);
  const groups = r.groups;
  const active = r.active;
  const visible = active === "alla" ? groups.flatMap((g) => g.images) : groups.find((g) => g.source === active)?.images || [];
  const chosenIds = new Set((state.images[slot] || []).map((i) => i.id));
  const used = usedElsewhere(slot);
  el.innerHTML = `
    <div class="results-tabs">
      <button data-tab="alla" class="${active === "alla" ? "active" : ""}">Alla (${groups.reduce((n, g) => n + g.images.length, 0)})</button>
      ${groups.map((g) => `<button data-tab="${g.source}" class="${active === g.source ? "active" : ""}" ${g.error ? `title="${esc(g.error)}"` : ""}>
        ${esc(g.label)} ${g.error ? '<span class="err">(fel)</span>' : `(${g.images.length})`}</button>`).join("")}
    </div>
    <div class="grid">
      ${visible.map((img) => `
        <button class="thumb ${chosenIds.has(img.id) ? "selected" : ""}" data-pick="${esc(img.id)}" title="${esc(img.title)} – ${esc(img.author)} (${esc(img.license)})">
          <img src="${esc(imgSrc(img.thumb))}" loading="lazy" alt="" onerror="this.closest('.thumb').remove()" />
          <span class="zoom" data-zoom="${esc(img.id)}" title="Förstora">${icon("zoom")}</span>
          ${used.has(img.id) ? `<span class="used">Vald på: ${esc(used.get(img.id))}</span>` : ""}
          <span class="src">${esc(img.source)}</span>
        </button>`).join("") || `<p class="hint">Inga träffar. Prova en annan sökning, gärna på engelska.</p>`}
    </div>`;
}

async function search(card) {
  const slot = card.dataset.slot;
  const q = $("[data-q]", card).value.trim();
  if (!q) return;
  state.queries[slot] = q;
  save();
  results[slot] = { loading: true };
  renderResults(card);
  const res = await fetch(`/api/grej-of-the-day/images?q=${encodeURIComponent(q)}`).catch(() => null);
  if (disposed) return;
  if (res?.status === 401) return toLogin();
  const groups = res ? await res.json().catch(() => null) : null;
  if (disposed) return;
  if (res?.ok && Array.isArray(groups)) results[slot] = { groups, active: "alla" };
  else results[slot] = { error: groups?.error || `Bildsökningen misslyckades (${res ? res.status : "inget svar"}).` };
  renderResults(card);
}

function findResult(slot, id) {
  return results[slot]?.groups?.flatMap((g) => g.images).find((i) => i.id === id);
}

function pick(card, img) {
  const slot = card.dataset.slot;
  const list = (state.images[slot] ||= []);
  const i = list.findIndex((x) => x.id === img.id);
  if (i >= 0) list.splice(i, 1);
  else if (list.length >= Number(card.dataset.max)) return alert(`Max ${card.dataset.max} bilder här.`);
  else list.push(img);
  save();
  root.querySelectorAll("[data-slot]").forEach((c) => { renderChosen(c); renderResults(c); });
}

$("#slots").addEventListener("click", (e) => {
  const card = e.target.closest("[data-slot]");
  if (!card) return;
  const slot = card.dataset.slot;
  const zoom = e.target.closest("[data-zoom]");
  if (zoom) {
    e.stopPropagation();
    const img = findResult(slot, zoom.dataset.zoom);
    $("#img-dialog-img").src = imgSrc(img.full);
    $("#img-dialog-meta").innerHTML = `${esc(img.title)}<br>${esc(img.author)} · ${esc(img.license)} · ${esc(img.source)}<br><a href="${esc(img.pageUrl)}" target="_blank" rel="noopener">${esc(img.pageUrl)}</a>`;
    return $("#img-dialog").showModal();
  }
  const t = e.target.closest("button");
  if (!t) return;
  if (t.dataset.search !== undefined) search(card);
  else if (t.dataset.tab) { results[slot].active = t.dataset.tab; renderResults(card); }
  else if (t.dataset.pick) pick(card, findResult(slot, t.dataset.pick));
  else if (t.dataset.unpick) { state.images[slot].splice(Number(t.dataset.unpick), 1); save(); renderChosen(card); renderResults(card); }
  else if (t.dataset.ownAdd !== undefined) {
    const url = $("[data-own-url]", card).value.trim();
    try { new URL(url); } catch { return alert("Klistra in en hel bildlänk."); }
    const author = prompt("Vem har tagit bilden / var kommer den ifrån? (hamnar på källsliden)", new URL(url).hostname) || new URL(url).hostname;
    pick(card, { id: `own-${Date.now()}`, title: "Egen bild", thumb: url, full: url, pageUrl: url, author, license: "angiven av läraren", source: "Egen" });
    $("[data-own-url]", card).value = "";
  }
});

$("#slots").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.matches("[data-q]")) search(e.target.closest("[data-slot]"));
});

function addOwnFile(card, file) {
  if (!file.type.startsWith("image/")) return alert("Filen är ingen bild. Välj en bild (t.ex. .jpg eller .png).");
  const reader = new FileReader();
  reader.onload = () => {
    const author = prompt("Var kommer bilden ifrån? (hamnar på källsliden)", "Egen bild") || "Egen bild";
    pick(card, { id: `own-${Date.now()}`, title: file.name, thumb: reader.result, full: reader.result, pageUrl: "", author, license: "angiven av läraren", source: "Egen" });
  };
  reader.readAsDataURL(file);
}

$("#slots").addEventListener("change", (e) => {
  if (!e.target.matches("[data-own-file]")) return;
  const file = e.target.files[0];
  if (file) addOwnFile(e.target.closest("[data-slot]"), file);
  e.target.value = "";
});

// Dra och släpp en bild var som helst på en bildruta.
const hasFiles = (e) => e.dataTransfer?.types.includes("Files");
$("#slots").addEventListener("dragover", (e) => {
  const card = e.target.closest("[data-slot]");
  if (!card || !hasFiles(e)) return;
  e.preventDefault();
  card.classList.add("dragging");
});
$("#slots").addEventListener("dragleave", (e) => {
  const card = e.target.closest("[data-slot]");
  if (card && !card.contains(e.relatedTarget)) card.classList.remove("dragging");
});
$("#slots").addEventListener("drop", (e) => {
  const card = e.target.closest("[data-slot]");
  if (!card || !hasFiles(e)) return;
  e.preventDefault();
  card.classList.remove("dragging");
  addOwnFile(card, e.dataTransfer.files[0]);
});
// En bild som släpps bredvid en bildruta ska inte öppnas i webbläsaren och lämna sidan.
const blockFileDrop = (e) => hasFiles(e) && e.preventDefault();
window.addEventListener("dragover", blockFileDrop);
window.addEventListener("drop", blockFileDrop);

// ---------- Steg 4: export ----------

function renderChecklist() {
  const p = pending();
  const n = notes();
  const imgCount = Object.values(state.images).flat().length;
  $("#checklist").innerHTML = `<ul>
    ${p.length ? p.map((x) => `<li class="bad">${icon("x")}${esc(x)}</li>`).join("") : `<li class="ok">${icon("check")}Allt som behövs är med</li>`}
    ${n.map((x) => `<li class="info">${icon("info")}${esc(x)}</li>`).join("")}
    <li class="${imgCount ? "ok" : "info"}">${icon(imgCount ? "check" : "info")}${imgCount} bilder valda</li>
  </ul>
  ${p.length ? `<button class="link" data-goto2>Gå till granskningen</button>` : ""}`;
  $("[data-goto2]")?.addEventListener("click", () => goto(2));
  $("#export").disabled = p.length > 0;
}

// Bara det som är med skickas till presentationen. Bildvalen följer med sina slides.
function exportData() {
  const c = state.content;
  const on = (x) => x.approved && x.text?.trim() !== "";
  const images = Object.fromEntries(Object.entries(state.images).filter(([k]) => !k.startsWith("avsnitt-")));
  const avsnitt = [];
  c.avsnitt.forEach((a, i) => {
    const punkter = a.punkter.filter(on);
    if (!punkter.length) return;
    if (state.images[`avsnitt-${i}`]) images[`avsnitt-${avsnitt.length}`] = state.images[`avsnitt-${i}`];
    avsnitt.push({ ...a, punkter });
  });
  return {
    color: state.color,
    images,
    content: {
      amne: c.amne,
      bildsok: c.bildsok,
      definition: c.definition,
      ledtradar: c.ledtradar.filter(on),
      avsnitt,
      nyckelord: c.nyckelord.filter(on).map((k) => k.text.trim()),
      fraga: c.fragor.find(on)?.text.trim() || "",
      filmer: c.filmer.filter((f) => f.approved),
    },
  };
}

$("#export").addEventListener("click", async () => {
  const btn = $("#export");
  btn.disabled = true;
  btn.textContent = "Skapar presentationen …";
  $("#export-error").hidden = true;
  try {
    const res = await fetch("/api/grej-of-the-day/export", post(exportData()));
    if (!res.ok) throw new Error((await res.json()).error);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `GOTD - ${state.content.amne}.pptx`;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (e) {
    if (disposed) return;
    $("#export-error").textContent = "Något gick fel: " + e.message;
    $("#export-error").hidden = false;
  } finally {
    if (!disposed) {
      btn.disabled = false;
      btn.textContent = "Ladda ner .pptx";
    }
  }
});

$("#reset").addEventListener("click", () => {
  if (!confirm("Radera allt och börja om?")) return;
  state = { step: 1, content: null, images: {}, queries: {}, color: state.color };
  save();
  $("#topic").value = "";
  $("#notes").value = "";
  goto(1);
});

applyColor();
goto(state.step || 1);

return () => {
  disposed = true;
  genCtl.cancel?.(); // avbryter jobbet på servern (DELETE) och stoppar pollningen
  Object.values(more).forEach((m) => m.ctl?.cancel?.());
  window.removeEventListener("dragover", blockFileDrop);
  window.removeEventListener("drop", blockFileDrop);
  root.innerHTML = "";
};
}
