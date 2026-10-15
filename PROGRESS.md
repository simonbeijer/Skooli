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
