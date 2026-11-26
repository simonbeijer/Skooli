// Tar fram innehållet till en Grej of the Day med en AI-modell via OpenRouter.
// Modellen söker och läser artiklar på svenska och engelska Wikipedia (gratis, ingen nyckel).
// Varje fakta-påstående måste ha minst en källa, och varje källa måste vara en
// artikel som modellen faktiskt läste i just den här körningen.

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
// Gratismodeller. Den första används i första hand, de andra om den är upptagen eller nere.
const MODELS = process.env.OPENROUTER_MODEL
  ? [process.env.OPENROUTER_MODEL]
  : ["google/gemma-4-31b-it:free", "nvidia/nemotron-3-super-120b-a12b:free", "openrouter/free"];
const UA = "GrejOfTheDay/0.1 (lärarverktyg; kontakt via README)";
const MAX_ARTICLE_CHARS = 12000;

const BASE = `Du hjälper en lärare i årskurs 3 i Sverige att ta fram innehåll till lektionen "Grej of the Day".

Språk: enkel, korrekt svenska för 9-åringar. Korta meningar. Förklara svåra ord direkt i meningen.
Skriv alltid svenska namn, även när källan är på engelska (t.ex. "dvärgsilkesapa", inte "pygmy marmoset").

KÄLLKRAV (viktigast av allt):
- Hitta fakta med sok_wikipedia och läs artiklar med las_wikipedia, på svenska (sv) och engelska (en).
- Varje faktatext ska ha minst en källa i "sources".
- En källa är den exakta URL som las_wikipedia gav dig för en artikel du har läst. Hitta aldrig på eller gissa en URL.
- Skriv bara fakta som artikeln faktiskt stöder. Är något osäkert eller omstritt: skriv det inte.
- Siffror ska stämma med källan. Avrunda hellre försiktigt ("ungefär", "mer än") än överdriv.`;

const SYSTEM = `${BASE}

GREJEN är ämnet som läraren skriver, t.ex. "regnskogen". Hela lektionen handlar om just den grejen:
ledtrådarna leder fram till den, avslöjandet visar den och all fakta handlar om den.
Lärarens önskemål (t.ex. "fokus på djuren") styr bara VILKA fakta du väljer om grejen, aldrig vad grejen är.

Lektionens upplägg:
1. Tre ledtrådar som eleverna gissar på. Från svårast till lättast. Skrivna i jag-form ("Jag finns ...").
2. Avslöjande av grejen.
3. Allmän fakta i korta punkter.
4. Mer ingående fakta.
5. Var grejen finns, eller vad den förknippas med.
6. Fyra nyckelord som eleverna sedan skriver egna meningar med.

ARBETSGÅNG:
1. Sök och läs 2–4 relevanta artiklar.
2. Anropa spara_grej exakt en gång med allt innehåll.

Filmer: lämna "filmer" som en tom lista. Läraren lägger till filmer själv.
Skriv ingen annan slutlig text än anropet till spara_grej.`;

// Hur kreativa nya förslag ska vara. Läraren väljer i gränssnittet.
export const STYLES = {
  kul: "Roliga, knasiga och oväntade fakta som får 9-åringar att skratta eller säga 'va?!'.",
  intressant: "Spännande och lärorika fakta, gärna sådant som förvånar.",
  overraska: "Ovanliga saker som sällan nämns, t.ex. ovanliga djur, rekord eller udda detaljer. Undvik det mest kända.",
};

const sourceList = { type: "array", items: { type: "string" }, description: "Exakta URL:er från las_wikipedia." };
const sourcedText = {
  type: "object",
  required: ["text", "sources"],
  properties: { text: { type: "string" }, sources: sourceList },
};
const avsnittSchema = {
  type: "object",
  required: ["rubrik", "typ", "punkter", "bildsok"],
  properties: {
    rubrik: { type: "string" },
    typ: { type: "string", enum: ["fakta", "lista"], description: "fakta = 3–5 korta stycken. lista = 6–12 korta ord/fraser, t.ex. djur." },
    punkter: { type: "array", items: sourcedText },
    bildsok: { type: "string", description: "Kort sökfras på engelska för att hitta bilder till sliden." },
  },
};

const fn = (name, description, parameters) => ({ type: "function", function: { name, description, parameters } });

const WIKI_TOOLS = [
  fn("sok_wikipedia", "Söker efter artiklar på Wikipedia. Ger titlar och korta utdrag.", {
    type: "object",
    required: ["fraga", "sprak"],
    properties: {
      fraga: { type: "string", description: "Sökord, t.ex. 'regnskog'." },
      sprak: { type: "string", enum: ["sv", "en"], description: "sv = svenska Wikipedia, en = engelska." },
    },
  }),
  fn("las_wikipedia", "Läser en Wikipedia-artikel. Ger artikelns URL (använd den som källa) och text.", {
    type: "object",
    required: ["titel", "sprak"],
    properties: {
      titel: { type: "string", description: "Artikelns titel från sok_wikipedia." },
      sprak: { type: "string", enum: ["sv", "en"] },
    },
  }),
];

const SAVE_GREJ = fn("spara_grej", "Spara det färdiga innehållet till presentationen. Anropas en gång när all fakta har källor.", {
  type: "object",
  required: ["amne", "definition", "ledtradar", "avsnitt", "nyckelord", "fraga", "filmer", "bildsok", "bildsok_fler"],
  properties: {
    amne: { type: "string", description: "Grejen, exakt lärarens ämne med stor bokstav, t.ex. 'Regnskogen'." },
    definition: { ...sourcedText, description: "En mening som förklarar vad grejen är." },
    ledtradar: { type: "array", items: sourcedText, description: "Exakt 3 ledtrådar, svårast först." },
    avsnitt: {
      type: "array",
      description: "3–5 faktaslides i lektionens ordning: allmän fakta, fördjupning, var den finns / vad den förknippas med, ev. varför den är viktig.",
      items: avsnittSchema,
    },
    nyckelord: { type: "array", items: { type: "string" }, description: "Exakt 4 nyckelord för elevernas meningar." },
    fraga: { type: "string", description: "En fråga till eleverna på sista sliden, t.ex. 'Vilka djur skulle du vilja se i regnskogen?'" },
    filmer: { type: "array", items: { type: "object" }, description: "Lämna tom." },
    bildsok: { type: "string", description: "Kort sökfras på engelska för huvudbilden/avslöjandet." },
    bildsok_fler: { type: "array", items: { type: "string" }, description: "2 andra korta sökfraser på engelska för bildgalleriet och sista sliden, olika från bildsok." },
  },
});

function normalizeUrl(u) {
  try {
    const url = new URL(String(u).trim());
    url.hash = "";
    let s = decodeURI(url.toString());
    if (s.endsWith("/")) s = s.slice(0, -1);
    return s.replace(/^http:/, "https:").replace("://www.", "://");
  } catch {
    return null;
  }
}

async function wiki(lang, params) {
  const url = `https://${lang === "en" ? "en" : "sv"}.wikipedia.org/w/api.php?` +
    new URLSearchParams({ format: "json", formatversion: "2", ...params });
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Wikipedia svarade ${res.status}`);
  return res.json();
}

async function searchWikipedia({ fraga, sprak }) {
  const data = await wiki(sprak, { action: "query", list: "search", srsearch: fraga, srlimit: "6" });
  const hits = data.query?.search || [];
  if (!hits.length) return "Inga träffar. Prova andra sökord eller det andra språket.";
  return hits.map((h) => `- ${h.title}: ${h.snippet.replace(/<[^>]*>/g, "")}`).join("\n");
}

// Läser en artikel och registrerar dess URL som en godkänd källa.
async function readWikipedia({ titel, sprak }, seen) {
  const lang = sprak === "en" ? "en" : "sv";
  const data = await wiki(lang, { action: "query", prop: "extracts", explaintext: "1", redirects: "1", titles: titel });
  const page = data.query?.pages?.[0];
  if (!page || page.missing || !page.extract) return `Ingen artikel med titeln "${titel}". Sök först med sok_wikipedia.`;
  const url = `https://${lang}.wikipedia.org/wiki/${page.title.replace(/ /g, "_")}`;
  seen.set(normalizeUrl(url), { url, title: `${page.title} – Wikipedia (${lang})` });
  return `URL (använd exakt denna som källa): ${url}\n\n${page.extract.slice(0, MAX_ARTICLE_CHARS)}`;
}

const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(t); reject(new Error("Avbruten")); }, { once: true });
  });

// Gratismodeller är ofta upptagna eller svarar konstigt. Därför försöker vi många gånger
// med allt längre väntan (upp till ca 4 minuter totalt) innan vi ger upp.
const CHAT_ATTEMPTS = 8;

async function chat(messages, tools, temperature, log, signal) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY saknas");
  let lastError = "";
  for (let attempt = 0; attempt < CHAT_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      const wait = Math.min(60000, 5000 * 2 ** (attempt - 1));
      log(`Gratismodellen är upptagen, väntar ${Math.round(wait / 1000)} s och försöker igen (${attempt + 1}/${CHAT_ATTEMPTS}) …`);
      await sleep(wait, signal);
    }
    if (signal?.aborted) throw new Error("Avbruten");
    let res, data;
    try {
      res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "X-Title": "Grej of the Day",
        },
        body: JSON.stringify({ models: MODELS, messages, tools, tool_choice: "auto", temperature }),
        signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(180000)]) : AbortSignal.timeout(180000),
      });
      data = await res.json().catch(() => ({}));
    } catch (err) {
      // Nätverksfel eller timeout: försök igen. Läraren som avbryter: sluta direkt.
      if (signal?.aborted) throw new Error("Avbruten");
      lastError = err.name === "TimeoutError" ? "modellen svarade inte i tid" : err.message;
      continue;
    }
    const choice = data.choices?.[0];
    if (res.ok && choice?.message && choice.finish_reason !== "error") return choice.message;
    const msg = data.error?.message || choice?.error?.message || `${res.status} ${res.statusText}`;
    if (res.status === 401) throw new Error("OPENROUTER_API_KEY är fel: " + msg);
    if (res.status === 402 || /per-day|free-models-per-day/i.test(msg)) {
      throw new Error("Dagens gratiskvot hos OpenRouter är slut. Försök igen i morgon, eller lägg in lite kredit på openrouter.ai så höjs gränsen. (" + msg + ")");
    }
    if (res.status === 400 && !/provider|upstream/i.test(msg)) throw new Error("OpenRouter: " + msg);
    lastError = msg;
  }
  throw new Error(`Gratismodellerna var upptagna för länge (${lastError}). Vänta en minut och försök igen.`);
}

// Problem med en faktatext (tom lista = godkänd).
function itemProblems(item, where, seen) {
  const problems = [];
  if (!item?.text?.trim()) problems.push(`${where}: tom text`);
  if (!item?.sources?.length) problems.push(`${where}: saknar källa ("${item?.text}")`);
  for (const s of item?.sources || []) {
    if (!seen.has(normalizeUrl(s))) problems.push(`${where}: källan ${s} är inte en artikel du läst med las_wikipedia`);
  }
  return problems;
}

// Byter ut käll-URL:er mot objekt {url, title} så att gränssnittet kan visa titlar.
const enrich = (seen) => (item) => ({
  text: item.text.trim(),
  sources: item.sources.map((s) => seen.get(normalizeUrl(s)) || { url: s, title: s }),
});

// Gratismodeller skickar ibland listor och objekt som JSON-text ("[...]") i stället för riktiga listor.
function unstring(v) {
  if (typeof v === "string" && /^\s*[[{]/.test(v)) {
    try { return unstring(JSON.parse(v)); } catch { return v; }
  }
  if (Array.isArray(v)) return v.map(unstring);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, unstring(x)]));
  return v;
}

/**
 * Kör modellen med Wikipedia-verktygen tills den anropar spara-verktyget med godkänt innehåll.
 * check(args, seen, { lenient }) returnerar { result } när innehållet duger, annars { problems }.
 * lenient = sista rättningsförsöket: sortera bort det som inte håller i stället för att ge upp.
 */
const MAX_FIXES = 4;

async function runAgent({ system, user, saveTool, check, temperature = 0.3, log, signal }) {
  const seen = new Map();
  const tools = [...WIKI_TOOLS, saveTool];
  const saveName = saveTool.function.name;
  const messages = [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
  let fixAttempts = 0;

  for (let turn = 0; turn < 30; turn++) {
    if (signal?.aborted) throw new Error("Avbruten");
    log(turn === 0 ? "Söker fakta och källor …" : "Fortsätter …");
    const msg = await chat(messages, tools, temperature, log, signal);
    messages.push({ role: "assistant", content: msg.content || "", tool_calls: msg.tool_calls });

    if (!msg.tool_calls?.length) {
      messages.push({ role: "user", content: `Använd verktygen. När du har läst artiklarna: anropa ${saveName}.` });
      continue;
    }

    for (const call of msg.tool_calls) {
      const name = call.function?.name;
      let args;
      try {
        args = JSON.parse(call.function?.arguments || "{}");
      } catch {
        messages.push({ role: "tool", tool_call_id: call.id, content: "Fel: argumenten var inte giltig JSON. Försök igen." });
        continue;
      }

      let result;
      try {
        if (name === "sok_wikipedia") {
          log(`Söker: ${args.fraga} (${args.sprak})`);
          result = await searchWikipedia(args);
        } else if (name === "las_wikipedia") {
          log(`Läser: ${args.titel} (${args.sprak})`);
          result = await readWikipedia(args, seen);
        } else if (name === saveName) {
          let out;
          try {
            out = check(unstring(args), seen, { lenient: fixAttempts >= MAX_FIXES });
          } catch (err) {
            // Fel form på innehållet ska rättas av AI:n, inte stoppa hela körningen.
            out = { problems: [`innehållet har fel form (${err.message}). Skicka listor som riktiga JSON-listor, inte som text.`] };
          }
          if (out.result) {
            log(`Klart! ${seen.size} källor lästa.`);
            return out.result;
          }
          if (++fixAttempts > MAX_FIXES) {
            throw new Error("AI:n lyckades inte belägga all fakta med riktiga källor:\n" + out.problems.join("\n"));
          }
          log(`Hittade ${out.problems.length} problem med källor, ber AI:n rätta …`);
          result =
            `Inte sparat. Rätta följande och anropa ${saveName} igen. Läs fler artiklar vid behov, eller ta bort påståenden som inte går att belägga:\n- ` +
            out.problems.join("\n- ");
        } else {
          result = `Okänt verktyg: ${name}`;
        }
      } catch (err) {
        if (name === saveName) throw err;
        result = `Fel: ${err.message}`;
      }
      messages.push({ role: "tool", tool_call_id: call.id, content: result });
    }
  }
  throw new Error("AI:n blev inte klar. Försök igen.");
}

// "Regnskog" och "regnskogen" räknas som samma ämne. "Jaguar" gör det inte.
function sameTopic(a, b) {
  const norm = (x) => String(x || "").toLowerCase().replace(/[^a-zåäö0-9]/g, "");
  const [x, y] = [norm(a), norm(b)];
  if (!x || !y) return false;
  const stem = (w) => w.slice(0, Math.max(4, w.length - 3));
  return x.includes(stem(y)) || y.includes(stem(x));
}

/**
 * @param {string} topic   t.ex. "regnskogen"
 * @param {string} notes   valfria önskemål från läraren
 * @param {(msg: string) => void} log  statusrader till gränssnittet
 */
export async function generateContent(topic, notes, log = () => {}, signal) {
  topic = topic.trim();
  const title = topic.charAt(0).toUpperCase() + topic.slice(1);
  const user =
    `GREJEN för veckans Grej of the Day är: ${title}\n` +
    `Ledtrådarna ska leda fram till "${title}", och all fakta handlar om ${title}.` +
    (notes?.trim() ? `\n\nLärarens önskemål om vad fakta ska fokusera på: ${notes.trim()}` : "");
  return runAgent({
    system: SYSTEM,
    user,
    saveTool: SAVE_GREJ,
    log,
    signal,
    check(data, seen, { lenient } = {}) {
      const problems = [];
      for (const key of ["amne", "definition", "ledtradar", "avsnitt", "nyckelord", "fraga", "bildsok"]) {
        if (data[key] == null) problems.push(`${key}: saknas`);
      }
      for (const key of ["ledtradar", "avsnitt", "nyckelord"]) {
        if (!Array.isArray(data[key])) problems.push(`${key}: ska vara en lista`);
      }
      if (problems.length) return { problems };
      if (lenient) {
        // Sista försöket: behåll det som har riktiga källor och släng resten. Läraren granskar ändå.
        const good = (x) => !itemProblems(x, "", seen).length;
        data.ledtradar = data.ledtradar.filter(good).slice(0, 3);
        data.avsnitt = data.avsnitt
          .map((a) => ({ ...a, punkter: (a.punkter || []).filter(good) }))
          .filter((a) => a.punkter.length);
        data.nyckelord = data.nyckelord.slice(0, 4);
      }
      if (seen.size < (lenient ? 1 : 2)) problems.push("källor: läs minst 2 artiklar med las_wikipedia (gärna en på svenska och en på engelska) innan du sparar");
      if (!sameTopic(data.amne, topic)) {
        problems.push(
          `amne: grejen är "${title}", inte "${data.amne}". Skriv om ledtrådarna och definitionen så att de handlar om ${title}. ` +
          `"${data.amne}" får gärna vara en faktapunkt.`,
        );
      }
      problems.push(...itemProblems(data.definition, "definition", seen));
      if (lenient ? !data.ledtradar.length : data.ledtradar.length !== 3) problems.push(`ledtradar: ska vara exakt 3, fick ${data.ledtradar.length}`);
      data.ledtradar.forEach((l, i) => problems.push(...itemProblems(l, `ledtråd ${i + 1}`, seen)));
      if (data.avsnitt.length < (lenient ? 1 : 2)) problems.push("avsnitt: minst 2 behövs");
      data.avsnitt.forEach((a, i) => {
        if (!a.punkter?.length) problems.push(`avsnitt ${i + 1}: inga punkter`);
        (a.punkter || []).forEach((p, j) => problems.push(...itemProblems(p, `avsnitt ${i + 1} ("${a.rubrik}") punkt ${j + 1}`, seen)));
      });
      if (lenient ? data.nyckelord.length < 2 : data.nyckelord.length !== 4) problems.push(`nyckelord: ska vara exakt 4, fick ${data.nyckelord.length}`);
      if (problems.length) return { problems };
      const e = enrich(seen);
      const fler = Array.isArray(data.bildsok_fler) ? data.bildsok_fler.filter((q) => typeof q === "string" && q.trim()) : [];
      return {
        result: {
          ...data,
          amne: title, // grejen är alltid lärarens ämne
          bildsok_fler: fler,
          filmer: [],
          definition: e(data.definition),
          ledtradar: data.ledtradar.map(e),
          avsnitt: data.avsnitt.map((a) => ({ ...a, typ: a.typ === "lista" ? "lista" : "fakta", punkter: a.punkter.map(e) })),
        },
      };
    },
  });
}

/**
 * Tar fram nya förslag till en del av presentationen.
 * @param {object} req
 * @param {string} req.topic     ämnet, t.ex. "Regnskogen"
 * @param {"punkter"|"ledtradar"|"nyckelord"|"fraga"|"avsnitt"} req.kind  vad som ska tas fram
 * @param {string} [req.rubrik]  avsnittets rubrik (kind = punkter)
 * @param {string} [req.typ]     "fakta" eller "lista" (kind = punkter)
 * @param {string[]} [req.existing]  texter som redan finns, så att förslagen blir nya
 * @param {keyof STYLES} [req.style]
 * @param {string} [req.wish]    lärarens önskemål, t.ex. "grodor"
 */
export async function generateMore({ topic, kind, rubrik, typ, existing = [], style, wish }, log = () => {}, signal) {
  const lines = [`GREJEN för veckans Grej of the Day är: ${topic}. Förslagen ska handla om ${topic}.`];
  if (STYLES[style]) lines.push(`Stil på förslagen: ${STYLES[style]}`);
  if (wish?.trim()) lines.push(`Lärarens önskemål: ${wish.trim()}`);
  if (existing.length) lines.push(`Detta finns redan. Upprepa det inte, kom på nytt:\n- ${existing.join("\n- ")}`);

  const sourcedList = (min, max) => ({
    tool: fn("spara_forslag", "Spara de nya förslagen.", {
      type: "object",
      required: ["forslag"],
      properties: { forslag: { type: "array", items: sourcedText, description: `${min}–${max} nya förslag.` } },
    }),
    // Förslag utan godkänd källa sorteras bort. Bara om inget förslag håller ber vi modellen rätta.
    check(data, seen) {
      const list = Array.isArray(data.forslag) ? data.forslag : [];
      const ok = list.filter((f) => !itemProblems(f, "", seen).length).map(enrich(seen));
      if (ok.length) return { result: { forslag: ok } };
      return { problems: list.length ? list.flatMap((f, i) => itemProblems(f, `förslag ${i + 1}`, seen)) : ["forslag: tom lista"] };
    },
  });
  const plainList = (min, max) => ({
    tool: fn("spara_forslag", "Spara de nya förslagen.", {
      type: "object",
      required: ["forslag"],
      properties: { forslag: { type: "array", items: { type: "string" }, description: `${min}–${max} nya förslag.` } },
    }),
    check(data) {
      const ok = (Array.isArray(data.forslag) ? data.forslag : []).map((s) => String(s).trim()).filter(Boolean);
      return ok.length ? { result: { forslag: ok } } : { problems: ["forslag: tom lista"] };
    },
  });

  let task;
  let spec;
  if (kind === "ledtradar") {
    task = `Skriv 3 nya ledtrådar i jag-form ("Jag finns ...") som eleverna kan gissa på. Avslöja inte ämnets namn.`;
    spec = sourcedList(2, 4);
  } else if (kind === "punkter") {
    task = typ === "lista"
      ? `Ge 4–8 nya korta ord eller fraser (t.ex. djurnamn) till listan "${rubrik}". Varje förslag är högst 5 ord, t.ex. "Amazonasdelfin (rosa delfin)". Inga hela meningar.`
      : `Skriv 3 nya korta faktastycken till avsnittet "${rubrik}". Ett påstående per stycke, 1–2 meningar.`;
    spec = sourcedList(3, 8);
  } else if (kind === "nyckelord") {
    task = `Ge 6 nya nyckelord (enstaka ord) om ${topic} som eleverna kan skriva egna meningar med. ` +
      "Varje ord ska vara ett riktigt, rättstavat svenskt ord som en 9-åring förstår och som tydligt hör ihop med ämnet. Inga källor behövs. Du behöver inte söka.";
    spec = plainList(4, 8);
  } else if (kind === "fraga") {
    task = "Ge 3 nya frågor till eleverna för sista sliden, t.ex. 'Vilka djur skulle du vilja se i regnskogen?'. Inga källor behövs. Du behöver inte söka.";
    spec = plainList(2, 4);
  } else if (kind === "avsnitt") {
    task = `Skapa en ny faktaslide (avsnitt) om det läraren önskar. Rubrik, 3–5 korta faktastycken (eller 6–12 ord om det passar bättre som lista) och en bildsökning på engelska.`;
    spec = {
      tool: fn("spara_forslag", "Spara det nya avsnittet.", avsnittSchema),
      check(data, seen) {
        const punkter = (data.punkter || []).filter((p) => !itemProblems(p, "", seen).length);
        if (!data.rubrik?.trim() || !punkter.length) {
          return { problems: ["avsnittet behöver en rubrik och minst en faktatext med källa från las_wikipedia"] };
        }
        return {
          result: {
            avsnitt: { rubrik: data.rubrik.trim(), typ: data.typ === "lista" ? "lista" : "fakta", punkter: punkter.map(enrich(seen)), bildsok: data.bildsok || topic },
          },
        };
      },
    };
  } else {
    throw new Error(`Okänd sorts förslag: ${kind}`);
  }

  return runAgent({
    system: `${BASE}\n\nUPPGIFT: ${task}\nAnropa spara_forslag exakt en gång när du är klar. Skriv ingen annan slutlig text.`,
    user: lines.join("\n\n"),
    saveTool: spec.tool,
    check: spec.check,
    temperature: style === "intressant" ? 0.6 : 0.9,
    log,
    signal,
  });
}
