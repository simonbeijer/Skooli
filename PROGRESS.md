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
