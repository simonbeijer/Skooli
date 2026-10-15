# PROGRESS — natt 2026-10-16

## Läge
- Branch `skooli-plattform` skapad i Skooli och grej-of-the-day (från main resp. master — gotd har ingen main, `master` är dess huvudbranch).
- Baslinje Skooli: `tsc` grönt, `next lint` grönt, `jest`: 22 av 157 tester (5 av 7 sviter) failar redan på main innan något ändrats (api-utils, auth, button, inputField, userContext). Räknas inte som nya fel.
- Plan: se PLAN-NATT.md.

## Logg per uppgift

### A. docs/auth-plan.md (utredning, ingen kod)
- Vad: nytt dokument som jämför fem sätt att dela inloggning mellan Skooli och fristående verktyg.
- Rekommendation: verktygen på samma domän via rewrite (`skooli.se/gotd`), Skoolis JWT-cookie delas; verktyget kontrollerar själv cookien (först delad hemlighet HS256, senare nyckelpar RS256/JWKS). Steg som rör hemligheter/env/konton/driftsättning är märkta **[Simon]**.
- Fynd i koden värda att veta: cookien `token` har `SameSite=Strict` (länk från webbmejl → hamnar på login trots inloggad); middleware släpper igenom alla sökvägar med punkt (filer) — skyddar alltså bara sidor.
- Granskning: underkänd först (5 småfel om utloggning, middleware-matcher, port), rättad, sedan OK.
- Kontroller: bara dokument, lint/test/build ej relevant.

### 1. Skooli: gemensam `shared/theme.css`
- Vad: ny fil `shared/theme.css` = plattformens design tokens (`--sk-color-*`, `--sk-font-body/heading`, `--sk-space-1..8`, `--sk-radius-*`, `--sk-shadow-*`, `--sk-content-width`) + Google Fonts-import (Inter, Playfair Display).
- `src/app/globals.css` importerar den först och alla gamla variabler (`--primary-color`, `--color-primary-dark` osv.) pekar nu på tokens. Värdena finns alltså bara på ett ställe; Skooli ser exakt likadant ut.
- Test: `__tests__/theme.test.js` (31 tester) låser token-värdena och att globals.css använder dem.
- Granskning: OK. Granskaren byggde main och branchen och bekräftade att typsnittsimporten hamnar först i båda (ingen regression).
- Kontroller: lint ✔, tsc ✔, build ✔, jest 22 fail = samma gamla baslinje, 166 pass.

### 3. Grej of the Day: använder samma theme.css
- Vad: `public/theme.css` i gotd är en exakt kopia av `Skooli/shared/theme.css`. Uppdateras med `npm run sync:theme` (skript `scripts/sync-theme.js`, kopierar från `../Skooli` eller `SKOOLI_DIR`).
- `index.html` laddar theme.css före style.css; Lexend borta. `style.css`: text-, bakgrunds-, linje- och radievariabler samt typsnitt hämtas från tokens → Inter i brödtext, Playfair Display i rubriker, som Skooli.
- Färgväljaren för presentationen (`--theme`) fungerar som förut.
- Test: `npm test` (Nodes inbyggda testkörare, inget nytt paket) — 4 tester, bl.a. att kopian är byte-identisk med Skoolis original.
- Granskning: OK. Kontroller: `node --check` alla js ✔, npm test 4/4 ✔, servern startar och serverar `/` + `/theme.css` (200).
- Kvar att veta: tre ställen har `font-weight: 300` som visas som 400 (Inter 300 laddas inte). Ej ändrat.

### 2. Skooli: gemensam header
- Vad: headerns utseende ligger nu som vanlig CSS i `shared/theme.css` (klasser `.sk-header`, `.sk-header__inner/brand/logo/name/nav/link/button/actions`). Vilket projekt som helst kan rendera samma HTML och få exakt samma header — React behövs inte.
- `src/app/components/header.tsx` använder klasserna. Samma länkar, texter, hrefs, dropdown och states som förut (logolänken: `/dashboard`, i login-läget `/`).
- Synlig ändring: headern är nu en vit halvgenomskinlig bar med tunn linje under (enligt STYLE_GUIDE.md), i stället för fritt svävande med stor marginal ovanför. Innehållet börjar därför lite högre upp. Inte sticky (sidornas `overflow-x-hidden` hade gjort sticky verkningslöst, och layoutfilerna ville jag inte röra).
- "Kom Igång" är nu en länk med knappstil i stället för en knapp inuti en länk (giltig HTML, ser likadan ut).
- Test: `__tests__/header.test.js` (alla states, länkar, logolänk, dropdown) + klasserna i `theme.test.js`.
- Granskning: kodaren ändrade först logolänken → backat. Sedan OK.
- Kontroller: lint ✔, tsc ✔, build ✔, jest 22 gamla fail, 184 pass.

### 5. Skooli: test för dashboard-kortet
- Vad: nytt test `__tests__/dashboard-gotd.test.js` som låser att Grej of the Day-kortet länkar till `NEXT_PUBLIC_GOTD_URL`, och till `http://localhost:3001` när variabeln saknas. Ingen produktionskod ändrad.
- Granskning: OK. Kontroller: samma körning som uppgift 2 (lint/tsc/build ✔, jest inga nya fel).

### 4. Grej of the Day: gemensam header + "← Tillbaka till Skooli"
- Vad: `public/index.html` har nu exakt samma header som Skooli (samma klasser, samma bok-logga, "Skooli"). Till höger länken **"← Tillbaka till Skooli"** → `SKOOLI_URL/dashboard`. Loggan går också dit.
- `SKOOLI_URL` är en miljövariabel (default `http://localhost:3000`), motsvarigheten till `NEXT_PUBLIC_GOTD_URL` i Skooli. Servern (`server.js`) läser index.html en gång vid start och ersätter `{{SKOOLI_URL}}` via `lib/page.js` (värdet HTML-escapas).
- Verktygets namn "Grej of the Day" och stegflikarna ligger i en egen rad (`.tool-bar`) under headern, med gotds gamla stil (sticky, kant i vald färg). app.js orörd, alla selectors finns kvar.
- `public/theme.css` synkad igen (nu med header-stilen).
- Test: `test/page.test.js` (ersättning, escaping, default-URL, headerns HTML, länktexten).
- Granskning: underkänd först — `replaceAll` med sträng tolkade `$`-tecken i URL:en så en konstig URL kunde bryta ut ur attributet. Fixat med funktion + test, sedan OK.
- Kontroller: `node --check` ✔, npm test 10/10 ✔, start-rök: `/`, style.css, theme.css, app.js 200, länken pekar på http://localhost:3000/dashboard.

---

## SLUTRAPPORT

### Gjort
| # | Vad | Commit |
|---|---|---|
| A | `docs/auth-plan.md` — utredning om delad inloggning, inget implementerat | Skooli `d4c3378` |
| 1 | `shared/theme.css` med design tokens; Skooli hämtar sina värden därifrån | Skooli `5110e77` |
| 2 | Skoolis header använder gemensamma `.sk-header`-klasser från theme.css | Skooli `8abb2c8` |
| 5 | Test som låser dashboard-kortets länk till Grej of the Day | Skooli `b782390` |
| 3 | Gotd använder samma theme.css (kopia + `npm run sync:theme` + test) | gotd `2eb4244` |
| 4 | Gotd har samma header + "← Tillbaka till Skooli" | gotd `3302769` |

Allt ligger på branch `skooli-plattform` i båda repona. Inget pushat, inget mergat.

### Slutkontroll (ny granskare): GRÖN på alla 7 punkter
1. Bygger: Skooli build/lint/tsc ✔; jest 22 fail på både main och branch (samma gamla tester), 49 nya tester gröna. Gotd npm test 10/10, node --check ✔. Inga nya npm-paket.
2. Startar: Skooli `/`, `/login`, `/demo` 200, `/dashboard` → 307 till login. Gotd på 3001: `/`, css, js 200.
3. Dashboard-kortet → `http://localhost:3001` (oförändrad kod, nu låst med test), gotd svarar där.
4. "← Tillbaka till Skooli" → `http://localhost:3000/dashboard`, svarar.
5. theme.css byte-identisk i båda; samma header-klasser och samma logga (SVG).
6. Skärmdumpar visar samma header, typsnitt och färger. Ligger i `/private/tmp/claude-501/-Users-simon-dev-Skooli/324c5b2c-eda6-49c2-928e-d48f9b8b8529/scratchpad/final/` (tillfällig mapp, kan försvinna).
7. Inget trasigt: gotds API-routes, app.js, lib/ orörda; färgväljaren fungerar.

### Kolla först imorgon
1. Starta båda: Skooli `npm run dev` (3000) och gotd `PORT=3001 npm start`. Logga in → dashboard → klicka kortet → "← Tillbaka till Skooli". 
2. Titta på Skoolis nya header (vit bar med linje under, ingen stor marginal ovanför längre) på `/`, `/dashboard`, `/generate`, `/results`. Gillar du den?
3. Läs `docs/auth-plan.md` (rekommendation + öppna frågor).

### Öppna frågor
- **Accentfärg i gotd:** gotds knappar/flikar följer presentationens valda färg (default limegrön), Skoolis är teal. Ska gotds UI låsas till Skoolis teal, och färgväljaren bara styra presentationen? (Lät det vara — det är en funktion.)
- **Verktygsraden** under headern i gotd går kant till kant medan headern är centrerad (1152px). Vill du att den linjerar?
- **theme.css som kopia:** gotd har en kopia som synkas med `npm run sync:theme`. Vid driftsättning på samma domän (se auth-plan) kan gotd i stället länka Skoolis `/theme.css` direkt. Ditt val senare.
- **Typsnitt laddas två gånger i Skooli** (Google Fonts-import i theme.css + `next/font` i layout.tsx). Fanns redan innan; ej ändrat.
- **22 gamla jest-fel** på main (api-utils, auth, button, inputField, userContext). Orörda — vill du att de lagas ett annat pass?
- Gotd startar på port 3000 som standard (krockar med Next). Kör alltid `PORT=3001`. Ändra default?
