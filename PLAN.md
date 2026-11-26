# PLAN

Skooli är "huset": hemsida, inloggning och en dashboard med verktygskort. Varje verktyg är ett eget, fristående projekt.

## Steg

| # | Steg | Vem | Klart när | Status |
|---|---|---|---|---|
| 1 | Merga `skooli-plattform` i båda repona | Användaren | Branchen är mergad till main i Skooli och grej-of-the-day | Klart |
| 2 | Radera nattfilerna och skriv PLAN.md | Agent | Roten har bara projektfiler och PLAN.md finns | Klart |
| 3 | Flytta in grej-of-the-day i Skooli-repot, t.ex. `tools/grej-of-the-day/`, med git-historiken kvar | Agent (commit: användaren) | Ett repo, och båda delarna startar och testerna går som förut | Klart (väntar på användarens commit) |
| 4 | Laga eller ta bort de 22 tester som fallerar | Agent | Alla tester är gröna och GitHub Actions är grön | Klart lokalt (Jest 204/204, grej-of-the-day 10/10, lint rent). Cypress kunde inte köras lokalt. Väntar på användarens commit + push för att se Actions |
| 5 | Mall för ett verktyg (gemensam theme.css, header, länk tillbaka till Skooli, egen port, egen URL-variabel). Bygg om grej-of-the-day efter mallen | Agent | Mallen finns och grej-of-the-day följer den | Ej påbörjat |
| 6 | Bygg om dashboarden så att verktygskorten kommer från ett verktygsregister, en fil som listar alla verktyg | Agent | Ett nytt verktyg kräver bara en rad i registret | Ej påbörjat |

**Användarens egna steg:** inloggning, driftsättning, commits och push.

**Öppen fråga till användaren:** ska grej-of-the-day dela inloggning med Skooli, ha en egen eller ingen alls? Underlag finns i `docs/auth-plan.md`.

**Utanför planen:** ett andra verktyg.

## Arbetsregler

- Ett steg per session.
- Läs PLAN.md först i varje ny session.
- Uppdatera Status när ett steg är klart.
- Håll sessionen under ca 120k tokens.
- Fråga användaren bara när ett beslut inte går att ångra. Annars: välj, skriv valet kort under "Val" nedan och fortsätt.
- Agenten gör inga commits och ingen push.

## Så hänger det ihop i dag (från nattpasset 2026-10-16)

- `shared/theme.css` i Skooli är originalet för design tokens (`--sk-*`) och headerns stil (`.sk-header…`). Skooli importerar den i `src/app/globals.css`.
- grej-of-the-day ligger i `tools/grej-of-the-day/` och har en kopia i `public/theme.css` som uppdateras med `npm run sync:theme` (kopierar från `../../shared/theme.css` eller `SKOOLI_DIR`). Ett test fallerar om kopian skiljer sig från originalet. En kopia valdes för att grej-of-the-day ska se rätt ut även när Skooli inte körs.
- Länkar: Skoolis dashboardkort går till `NEXT_PUBLIC_GOTD_URL` (default `http://localhost:3001`). grej-of-the-days "← Tillbaka till Skooli" går till `SKOOLI_URL` + `/dashboard` (default `http://localhost:3000`). `server.js` ersätter `{{SKOOLI_URL}}` i `index.html` vid start.
- grej-of-the-day startar på port 3000 som standard, vilket krockar med Next. Kör `PORT=3001 npm start` i `tools/grej-of-the-day/`. Den har egen `package.json` och `node_modules` (kör `npm ci` där).
- grej-of-the-day testas med `node --test` (inget testpaket): `npm test` i `tools/grej-of-the-day/`. Jest i roten hoppar över `tools/`.

## Kvar från nattpasset (små frågor, inte egna steg)

- Accentfärg i grej-of-the-day följer presentationens valda färg (default limegrön), medan Skooli är teal. Ska verktygets UI låsas till teal? Hör till steg 5.
- Verktygsraden under headern i grej-of-the-day går kant till kant, medan headern är centrerad (1152px). Hör till steg 5.
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
