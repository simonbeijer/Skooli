# PLAN

Skooli är plattformen och står för inloggning, header, utseende och en enkel meny med modulerna. Varje modul är en egen mapp inne i Next.js-appen, med sin sida, sitt API och sin logik. Läraren loggar in en gång och når alla moduler. Lektionsplaneraren är modul 1, Grej of the Day modul 2.

## Steg

| # | Steg | Vem | Klart när | Status |
|---|---|---|---|---|
| 1 | Merga `skooli-plattform` i båda repona | Användaren | Branchen är mergad till main i Skooli och grej-of-the-day | Klart |
| 2 | Radera nattfilerna och skriv PLAN.md | Agent | Roten har bara projektfiler och PLAN.md finns | Klart |
| 3 | Flytta in grej-of-the-day i Skooli-repot, t.ex. `tools/grej-of-the-day/`, med git-historiken kvar | Agent (commit: användaren) | Ett repo, och båda delarna startar och testerna går som förut | Klart |
| 4 | Laga eller ta bort de 22 tester som fallerar | Agent | Alla tester är gröna och GitHub Actions är grön | Klart lokalt (Jest 204/204, grej-of-the-day 10/10, lint rent). Cypress kunde inte köras lokalt. Väntar på push för att se Actions |
| 5 | Gör lektionsplaneraren till en modul. Välj en mappstruktur för moduler och skriv den under "Val". Senare steg följer den. Dashboarden blir en enkel meny med modulerna | Agent | Lektionsplaneringen fungerar som förut efter inloggning, och alla tester och bygget är gröna | Klart (Jest 204/204, lint rent, build grönt) |
| 6 | Grej of the Day, del 1. `lib/` och Express-routes blir modulens logik och route handlers. `pptxgenjs` och `image-size` läggs till i Skoolis `package.json`. Testerna flyttas med | Agent | API:t fungerar bakom inloggningen och testerna är gröna | Klart (Jest 209/209, lint rent, build grönt) |
| 7 | Grej of the Day, del 2. Sidan blir modulens sida bakom inloggningen, menyn pekar på den, och `tools/` tas bort | Agent | Grej of the Day fungerar inne i Skooli, och alla tester och bygget är gröna | Klart (Jest 213/213, lint rent, build grönt). Inte provad inloggad i webbläsare |
| 8 | Driftsättning | Användaren | | Klart |

**Användarens egna steg:** driftsättning (steg 8), commits och push.

**Inställningar per modul:** görs med miljövariabler med modulens namn som prefix, till exempel `GOTD_`.

**Utanför planen:** Python-moduler. De löses när de behövs.

## Att tänka på vid driftsättning

- Lös så att jobben inte ligger i serverns minne och att bilduppladdning ryms inom Vercels 4,5 MB per anrop. Bara en notering, ingen lösning byggs i steg 5–7.
- Thumb-proxyn (`/api/grej-of-the-day/thumb`) hämtar vilken http(s)-URL som helst, som originalet. Begränsa till bildkällornas värdar och neka interna adresser innan publik drift.
- `pptx.js` hittar bilderna via `process.cwd()` + `src/modules/grej-of-the-day/assets`. På Vercel kan `outputFileTracingIncludes` behövas för export-routen.
- Verktygsraden i Grej of the Day (`position: sticky`) fastnar troligen inte, eftersom `overflow-x-hidden` i `src/app/(auth)/layout.tsx` blir scrollcontainer. Kolla visuellt.
- Nycklarna heter nu `GOTD_OPENROUTER_API_KEY`, `GOTD_OPENROUTER_MODEL` (valfri), `GOTD_PEXELS_API_KEY`, `GOTD_PIXABAY_API_KEY`, `GOTD_UNSPLASH_ACCESS_KEY`, `GOTD_FLICKR_API_KEY`.

## Arbetsregler

- Ett steg per session.
- Läs PLAN.md först i varje ny session.
- Uppdatera Status när ett steg är klart.
- Håll sessionen under ca 120k tokens.
- Fråga användaren bara när ett beslut inte går att ångra. Annars: välj, skriv valet kort under "Val" nedan och fortsätt.
- Agenten gör inga commits och ingen push.
- Bygg bara det som behövs för det som driftsätts nu. Inga förberedelser för framtida verktyg.

## Så hänger det ihop i dag

- En app (Next.js). Lektionsplaneraren och Grej of the Day är moduler enligt mappstrukturen under "Val" (steg 5).
- `shared/theme.css` är originalet för design tokens (`--sk-*`) och headerns stil (`.sk-header…`). Skooli importerar den i `src/app/globals.css`.
- Alla tester körs med Jest i roten (`npx jest`).

## Kvar från nattpasset (små frågor, inte egna steg)

- Accentfärg i grej-of-the-day följer presentationens valda färg (default limegrön), medan Skooli är teal. Ska verktygets UI låsas till teal?
- Verktygsraden under headern i grej-of-the-day går kant till kant, medan headern är centrerad (1152px).
- Typsnitten laddas två gånger i Skooli (Google Fonts-import i theme.css + `next/font` i layout.tsx).
- Tre ställen i grej-of-the-day har `font-weight: 300`, som visas som 400 eftersom Inter 300 inte laddas.

## Val

- 2026-11-26: Nattfilerna (PROMPT.md, AGENT-LOGG.md, PLAN-NATT.md, PROGRESS.md) raderades. Det som fortfarande behövs står ovan. Resten finns i git-historiken och i `docs/auth-plan.md`.
- 2026-11-26: `test-curriculum.js` ligger kvar i roten. Det är ett gammalt fristående skript (från första commiten) som körs med `node` och testar kopior av funktionerna i `src/lib/curriculum-data.ts`. Jest kör det inte. Beslut om det ska flyttas eller tas bort tas senare, t.ex. i steg 4.
- 2026-11-26 (steg 3): grej-of-the-day ligger i `tools/grej-of-the-day/`. Flyttad med subtree-merge (`git merge -s ours --no-commit --allow-unrelated-histories` + `git read-tree --prefix=tools/grej-of-the-day/ -u`), så historiken finns kvar som en andra förälder till merge-commiten. `git log -- tools/grej-of-the-day` visar inte de gamla commitarna (där låg filerna i roten). Använd `git log <merge-commit>^2`.
- 2026-11-26 (steg 3): `tools` togs bort ur `.gitignore` (låg där sedan första commiten, mappen fanns inte). `jest.config.js` hoppar över `tools/`. Standardsökvägen till Skooli i `sync-theme.js` och `test/theme.test.js` är nu `../..` i stället för `../Skooli`.
- 2026-11-26 (steg 3): Det gamla repot `../grej-of-the-day` ligger kvar orört. Användaren bestämmer när det ska arkiveras eller raderas. `.env` följer inte med (ignoreras), användaren kopierar den själv.
- 2026-11-26 (steg 4): De 22 Jest-felen var testdrift. Koden hade ändrats med flit (commit 6e40edd "Remove complexity", lazy JWT-secret i c7bc7f0, färg-tokens) men testerna hade inte följt med. Testerna ändrades, ingen kod. 2 tester togs bort: `blockDurationMs`-testet i api-utils och `clearError`-testet i userContext (funktionerna finns inte längre). Antal tester: 206 → 204.
- 2026-11-26 (steg 4): Cypress-jobbet i Actions föll också (3 av 4, grönt senast 2026-02-03). Också testdrift: login-headern har ingen `nav`, dashboarden säger "Välkommen tillbaka, {namn}!" och "Längd/2 veckor" har blivit "Antal lektioner". Specarna är rättade men inte körda lokalt (ingen Postgres/Docker igång). Visas i Actions efter push.
- 2026-11-26 (steg 4): `test-curriculum.js` togs bort. Det testade kopior av funktionerna (inte `src/lib/curriculum-data.ts`) och hade inga asserts, så det kunde aldrig fallera. Finns kvar i git-historiken.
- 2026-11-26: Ny riktning. Grej of the Day byggs in i Skooli i stället för att vara ett fristående verktyg. De gamla steg 5 (mall för verktyg) och 6 (verktygsregister) togs bort. Den öppna frågan om inloggning togs bort eftersom allt blir en app.
- 2026-11-26: Ny bild. Skooli är plattformen och lektionsplaneraren och Grej of the Day är moduler. Gamla steg 5 (bygg in Grej of the Day) och 6 (driftsättning) ersattes av steg 5–8. "Kvar att lösa vid driftsättning" (jobb i minnet, 4,5 MB-gränsen) ingick först i steg 6 men står nu under "Att tänka på vid driftsättning".
- 2026-11-26 (steg 5): Mappstruktur för moduler. Varje modul har ett kort id (lektionsplaneraren: `lektionsplanering`). Logiken (lib, komponenter, typer) ligger i `src/modules/<id>/`, sidorna i `src/app/(auth)/<id>/` och API:t i `src/app/api/<id>/`. Plattformskod (auth, prisma, header, delade komponenter, userContext) ligger kvar där den låg. Menyn i dashboarden läser listan i `src/modules/modules.ts`. Lektionsplaneraren nås nu på `/lektionsplanering` (förut `/generate`), resultatet på `/lektionsplanering/results` (förut `/results`) och API:t på `/api/lektionsplanering/generate-plan`. Grej of the Day står kvar i menyn som länk till den fristående appen tills steg 7.
- 2026-11-26 (steg 6): Grej of the Day har id `grej-of-the-day`. `content.js`, `images.js` och `pptx.js` är kopierade (ren JS, med `.d.ts` bredvid) till `src/modules/grej-of-the-day/lib/` och bilderna till `assets/` där. Jobben ligger kvar i minnet (`jobs.ts`, på `globalThis`). Express-routerna är route handlers under `src/app/api/grej-of-the-day/` med samma svar: `POST generate`, `POST more`, `GET`/`DELETE jobs/[id]`, `GET thumb`, `GET image-sources`, `GET images`, `POST export`. Alla kräver inloggning (cookien `token` + `verifyAuth`, annars 401). Miljövariabler: `GOTD_OPENROUTER_API_KEY`, `GOTD_OPENROUTER_MODEL` (valfri), `GOTD_PEXELS_API_KEY`, `GOTD_PIXABAY_API_KEY`, `GOTD_UNSPLASH_ACCESS_KEY`, `GOTD_FLICKR_API_KEY`. Ingen delad nyckel återanvänds (Gemini-nyckeln gäller inte OpenRouter). `page.js`, `SKOOLI_URL` och testerna i `tools/` hör till den fristående sidan och ligger kvar till steg 7. Nytt Jest-test: `__tests__/gotd-api.test.js`. `buildPptx` testas inte i Jest (pptxgenjs gör `import('node:fs')`), men gav en giltig .pptx via `next start`.
- 2026-11-26 (steg 7): Grej of the Day-sidan ligger på `/grej-of-the-day` bakom inloggningen, i Skoolis layout och header. Den fristående appens gränssnitt används nästan som det var: `app.js` ligger i `src/modules/grej-of-the-day/ui/` och är inlindad i `mountGotd(root)`, HTML:en ligger i `markup.js` och `page.tsx` är en client component som anropar `mountGotd` i `useEffect`. Anropen går till `/api/grej-of-the-day/*`. `style.css` blev `gotd.css`, där alla regler ligger under `.gotd` så att inget läcker ut (`main` blev `.gotd-main`, eftersom layouten redan har en `main`). Egen header, tillbaka-länk, `SKOOLI_URL`, `theme.css`-kopian och `sync-theme.js` togs bort. Menyn länkar till `/grej-of-the-day` och `NEXT_PUBLIC_GOTD_URL` finns inte längre. `tools/` är borttagen, och den finns kvar i git-historiken (även `GOTD - R.pdf`, `exempel.json` och README:n). Nya Jest-test: `__tests__/gotd-page.test.js`.
