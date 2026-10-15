# PLAN-NATT (2026-10-16)

Mål: Skooli och Grej of the Day (gotd) ska se ut och fungera som EN sajt.
Branch `skooli-plattform` i båda repon. Ingen push, ingen merge.

## Designbeslut
- **En källa för theme.css:** `Skooli/shared/theme.css` är originalet. Skooli importerar den i `src/app/globals.css`.
  Gotd har en kopia i `grej-of-the-day/public/theme.css` som uppdateras med `npm run sync:theme`
  (kopierar från `../Skooli/shared/theme.css`). Ett test i gotd failar om kopian skiljer sig från originalet.
  Varför kopia och inte länk till localhost:3000/theme.css? Då slutar gotd se rätt ut så fort Skooli inte körs.
- **Tokens** heter `--sk-*` (färger, typsnitt, avstånd, radier, skuggor) och har Skoolis nuvarande värden (teal #3E8E7E, Inter + Playfair Display).
- **Gemensam header** = samma HTML-struktur och CSS-klasser (`.sk-header…`), stilen ligger i theme.css.
  Skooli renderar den i React (`src/app/components/header.tsx`), gotd i vanlig HTML. Samma logga + "Skooli".
- **Tillbaka-länk i gotd** pekar på `SKOOLI_URL` (miljövariabel, default `http://localhost:3000`) + `/dashboard`, speglar `NEXT_PUBLIC_GOTD_URL` i Skooli.
- Gotds färgväljare (`--theme`, färg på presentationen) behålls som den är — det är en funktion.
- Gotd saknar test-runner. Vi använder Nodes inbyggda `node --test` (inget nytt paket).

## Uppgifter (vertikala skivor)
| # | Projekt | Uppgift | Test först |
|---|---|---|---|
| A | Skooli | `docs/auth-plan.md` — utredning, ingen kod | – |
| 1 | Skooli | `shared/theme.css` med tokens; `globals.css` hämtar värden därifrån. Ingen synlig ändring. | jest: filen finns och har alla tokens |
| 2 | Skooli | Header-stil `.sk-header` i theme.css; `header.tsx` använder klasserna (samma states/länkar) | jest/RTL: header renderar `.sk-header`, logga, länkar per state |
| 3 | gotd | Kopia av theme.css + `sync:theme` + `test`-script; `index.html` laddar theme.css; `style.css` använder tokens (typsnitt, bakgrund, text, linjer, radier) | node --test: kopian = originalet, index.html länkar theme.css |
| 4 | gotd | Gemensam header i `index.html` med "← Tillbaka till Skooli" (SKOOLI_URL); stegnavigeringen flyttas under headern | node --test: länktext + href, URL-ersättning |
| 5 | Skooli | Test som låser att dashboard-kortet pekar på `NEXT_PUBLIC_GOTD_URL` / localhost:3001 | jest |
| S | båda | Slutkontroll av helheten (ny granskare) | build + start + länkar |

## Kontroller per uppgift
- Skooli: `npx next lint`, `npx tsc --noEmit`, `npx jest` (baslinje: 22 tester i 5 sviter failar redan på main — inga NYA fel får tillkomma), `npm run build`.
- gotd: `node --check` på alla .js (ersätter lint), `npm test`, start-rök: `PORT=3001 npm start` + curl.

## Utanför scope (GÖR INTE)
Inloggning (bara docs), driftsättning, nya verktyg, .env/nycklar/konton, nya funktioner, att laga de gamla failande jest-testerna, städa dubbelladdade typsnitt, byta `lang="en"`.
