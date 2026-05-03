"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Header from "../../components/header";
import Button from "../../components/button";

const demoPlan = {
  theme: "Skogens Djur",
  grade: "2",
  subjects: "Matematik + Svenska + NO",
  duration: "2 veckor",
  curriculumReferences: 3,
  markdown: `# Tematisk Lektionsplan: Skogens Djur

**Årskurs:** 2  •  **Längd:** 2 veckor  •  **Ämnen:** Matematik, Svenska, NO

---

## Övergripande syfte

Eleverna utvecklar sin kunskap om vanliga svenska skogsdjur och tränar samtidigt på att läsa och skriva faktatexter samt på att räkna med tiotal och ental. Temat ger ett konkret innehåll att hänga undervisningen på och låter eleverna möta samma djur i flera ämnen under perioden.

## Läroplanskopplingar (Lgr22)

- **NO – Biologi (åk 1–3):** "Djur och växter i närmiljön och hur de kan sorteras, grupperas och artbestämmas samt namn på några vanligt förekommande arter."
- **Svenska (åk 1–3):** "Beskrivande och förklarande texter för barn, till exempel faktatexter, och hur deras innehåll kan organiseras."
- **Matematik (åk 1–3):** "Naturliga tal och deras egenskaper samt hur talen kan delas upp och hur de kan användas för att ange antal och ordning."

## Lärandemål

Efter arbetsområdet ska eleven kunna:

- Namnge minst fem vanliga svenska skogsdjur och beskriva var de lever.
- Sortera djur efter vad de äter (växtätare, köttätare, allätare).
- Skriva en kort faktatext med rubrik, inledning och minst tre faktameningar.
- Använda tiotal och ental för att läsa och jämföra tal upp till 100.

## Vecka 1 – Vi lär känna djuren

### Lärpass 1 — NO + Svenska
Genomgång i helklass av fem skogsdjur: älg, räv, ekorre, igelkott och hackspett. Läraren visar bilder och berättar kort om varje djur. Eleverna antecknar i sin tematext-bok två saker de lärt sig om varje djur.

### Lärpass 2 — NO
Sorteringsövning. Eleverna får bildkort på olika djur och placerar dem under rubrikerna *växtätare*, *köttätare* och *allätare*. Diskussion i helklass om vad djuren äter och varför.

### Lärpass 3 — Svenska
Modellering: läraren skriver en faktaruta om ekorren tillsammans med klassen. Eleverna får sedan välja ett eget djur och börja samla fakta från klassens faktaböcker eller en utskriven källtext.

### Lärpass 4 — Matematik
Tiotal och ental. Eleverna räknar djurfigurer eller naturmaterial (t.ex. kottar) och grupperar i tiotal. Avslutning med tallinjeövning där eleverna placerar antal på en tom tallinje.

## Vecka 2 – Vi skriver och presenterar

### Lärpass 5 — Svenska
Eleverna skriver klart sin faktatext om sitt valda djur enligt mallen: *rubrik – utseende – var den bor – vad den äter – en rolig fakta*. Kamratrespons i par med stödfrågor.

### Lärpass 6 — Matematik
Räkneövningar i tematisk inramning: addera och subtrahera antal djur (t.ex. "I skogen finns 24 ekorrar och 17 till flyttar in – hur många blir det totalt?"). Fokus på att läsa och tolka textuppgifter.

### Lärpass 7 — NO + Svenska
Läraren samlar elevernas faktatexter till en gemensam klassbok eller väggutställning. Eleverna läser varandras texter och skriver en kort kommentar på en post-it.

### Lärpass 8 — Avslutning
Korta redovisningar i mindre grupper. Varje elev presenterar sitt djur i 1–2 minuter. Klassen avslutar med en gemensam reflektion: *Vad har vi lärt oss? Vad var roligt? Vad var svårt?*

## Bedömning

- **Formativ:** observation under sortering, skrivande och samtal. Stödfrågor under kamratrespons.
- **Summativ:** elevens faktatext och räkneuppgifter samlas i portföljen och bedöms mot lärandemålen.

## Differentiering

- Elever som behöver mer stöd får en utökad mall för faktatexten och bildstöd vid skrivandet.
- Elever som vill utmanas kan skriva en längre text eller jämföra två djur i en gemensam text.
- Vid räkneövningarna används konkret material för de elever som behöver det.

## Material

- Bildkort på svenska skogsdjur
- Faktaböcker eller utskrivna källtexter på enkel svenska
- Mall för faktaruta
- Naturmaterial eller plastfigurer för räkneövningar
- Tom tallinje (utskriven)
`,
};

export default function DemoPage() {
  const [copied, setCopied] = useState(false);

  const stripMarkdown = (text: string) =>
    text
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/^\s*[-*+]\s+/gm, "• ")
      .replace(/^\s*\d+\.\s+/gm, "")
      .trim();

  const copyToClipboard = async () => {
    try {
      const cleanText = stripMarkdown(demoPlan.markdown);
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(cleanText);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = cleanText;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy demo text:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-shape-1 rounded-full z-0 opacity-90"></div>
      <div className="absolute top-[-50px] right-[-150px] w-[350px] h-[350px] bg-shape-2 rounded-full z-0 opacity-90"></div>
      <div className="absolute top-[400px] left-[-200px] w-[300px] h-[300px] bg-shape-3 rounded-full z-0 opacity-90"></div>
      <div className="absolute top-[700px] right-[-100px] w-[250px] h-[250px] bg-shape-4 rounded-full z-0 opacity-90"></div>

      <Header state="public" />

      <main className="max-w-5xl mx-auto px-6 py-8 relative z-10">
        {/* Demo banner */}
        <div className="bg-primary/10 border border-primary/30 rounded-2xl px-5 py-3 mb-8 flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-foreground text-sm">
            Detta är en exempel-lektionsplan. <Link href="/login" className="font-semibold text-primary hover:underline">Logga in</Link> för att skapa din egen.
          </p>
        </div>

        {/* Header card with metadata */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-playfair font-bold text-foreground">
                Exempel: {demoPlan.theme}
              </h1>
              <p className="text-grey mt-1">
                Så här ser en färdig lektionsplan ut – genererad på 30 sekunder.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-grey/70 font-medium">Tema</p>
              <p className="text-foreground font-semibold mt-1">{demoPlan.theme}</p>
            </div>
            <div className="bg-background rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-grey/70 font-medium">Årskurs</p>
              <p className="text-foreground font-semibold mt-1">{demoPlan.grade}</p>
            </div>
            <div className="bg-background rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-grey/70 font-medium">Ämnen</p>
              <p className="text-foreground font-semibold mt-1">{demoPlan.subjects}</p>
            </div>
            <div className="bg-background rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-grey/70 font-medium">Längd</p>
              <p className="text-foreground font-semibold mt-1">{demoPlan.duration}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            callBack={copyToClipboard}
            variant="primary"
            className="flex items-center space-x-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {copied ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              )}
            </svg>
            <span>{copied ? "Kopierat!" : "Kopiera Text"}</span>
          </Button>
        </div>

        {/* Lesson plan content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/50 shadow-lg mb-12">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-playfair font-bold text-foreground mb-4 first:mt-0">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-playfair font-bold text-foreground mt-10 mb-4 pb-2 border-b border-muted">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold text-primary mt-6 mb-2">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-foreground mb-4 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => <ul className="mb-6 space-y-2 pl-6 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="mb-6 space-y-2 pl-6 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="text-foreground">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              em: ({ children }) => <em className="italic text-primary">{children}</em>,
              hr: () => <hr className="my-8 border-muted" />,
            }}
          >
            {demoPlan.markdown}
          </ReactMarkdown>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-10 text-center shadow-lg">
          <h2 className="text-3xl font-playfair font-bold text-white mb-3">
            Redo att skapa din egen?
          </h2>
          <p className="text-white text-lg mb-6 max-w-xl mx-auto">
            Logga in och skapa en lektionsplan anpassad efter ditt tema, din årskurs och dina ämnen – på under 30 sekunder.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-white text-primary font-medium shadow-lg hover:bg-white/90 transition-colors"
            >
              Skapa Min Första Lektion
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl border border-white/40 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Tillbaka till start
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
