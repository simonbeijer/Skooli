# Inloggning delad mellan Skooli och fristående verktyg

Status: förslag, inget är byggt. Skrivet 2026-10-16.

## 1. Nuläge

Skooli har en egen, enkel inloggning:

- **Inloggning** (`src/app/api/auth/login/route.ts`): e-post och lösenord kontrolleras mot tabellen `User` i Postgres (lösenord hashade med bcrypt). Vid lyckad inloggning skapas en **JWT**, en signerad "biljett" som innehåller id, e-post, namn och roll och gäller i 2 timmar.
- **Signering** (`src/lib/auth.ts`): biljetten signeras med **HS256**, alltså en hemlig nyckel (`JWT_SECRET`). Samma nyckel används både för att skapa och för att kontrollera biljetten.
- **Cookie**: biljetten sparas i cookien `token` med `HttpOnly` (JavaScript kommer inte åt den), `Secure` i produktion, `SameSite=Strict` och `Path=/`. Ingen `Domain` är satt, så cookien hör bara till exakt den värd som satte den.
- **Skydd av sidor** (`src/middleware.ts`): varje sidanrop utom `/`, `/login` och `/demo` kräver giltig cookie, annars skickas man till `/login`. Den som redan är inloggad och går till `/login` skickas vidare till `/dashboard`. API-routes och sökvägar med filändelse (t.ex. `.js`, `.css`) undantas av middleware. API-routes kontrollerar själva.
- **Vem är inloggad?** `GET /api/auth/user` läser cookien och svarar med användaren (det finns ingen `/api/auth/me`, men den här fyller samma roll).
- **Utloggning** (`src/app/api/auth/logout/route.ts`) tömmer cookien.

Grej of the Day (`/Users/simon/dev/grej-of-the-day`, Express) har ingen inloggning alls i dag.

## 2. Frågor som avgör valet

1. **Samma domän eller subdomän?** `skooli.se/gotd` (Skooli skickar vidare trafiken, en "rewrite") eller `gotd.skooli.se`? Samma domän är enklast för cookies. Subdomän kräver att cookien sätts för hela `skooli.se`.
2. **Verktyg i valfritt språk.** Lösningen får inte kräva Next.js eller någon särskild biblioteksfunktion. Att kontrollera en JWT eller göra ett HTTP-anrop går att göra i alla språk.
3. **Enkelhet.** En utvecklare, få användare, ingen brådska. Färre rörliga delar och färre hemligheter att hålla reda på väger tyngre än skalbarhet.
4. **Behöver verktyget veta vem användaren är**, eller bara att någon är inloggad? GotD sparar inget per användare i dag.

## 3. Alternativ

### (a) Delad JWT-cookie, verktyget kontrollerar biljetten själv

**Så funkar det:** Skooli sätter cookien som i dag. Webbläsaren skickar med den till verktyget, och verktyget kontrollerar signaturen själv.

- **HS256 (delad hemlighet):** verktyget får samma `JWT_SECRET`. Enklast, men varje verktyg som har hemligheten kan också *skapa* falska biljetter. En läcka i ett verktyg drabbar alla.
- **RS256/ES256 med JWKS (nyckelpar):** Skooli signerar med en privat nyckel och publicerar den publika nyckeln på t.ex. `skooli.se/.well-known/jwks.json`. Verktygen kan bara *kontrollera*, inte skapa. Säkrare när verktygen blir fler.

**För:** snabbt (ingen extra nätverksfråga), fungerar i alla språk, verktyget vet vem användaren är.
**Nackdelar:** en stulen eller kopierad biljett kan inte spärras innan den går ut (2 h). Det gäller även (b) och (c), eftersom `/api/auth/user` bara kontrollerar signaturen och det inte finns någon spärrlista. Vanlig utloggning fungerar direkt på samma domän, eftersom cookien töms. Med HS256 sprids hemligheten.
**Insats:** HS256 ungefär en halv dag per verktyg. JWKS ungefär 1–2 dagar första gången.

### (b) Skooli som auth-tjänst (fråga Skooli varje gång)

**Så funkar det:** verktyget tar cookien från anropet och frågar `GET skooli.se/api/auth/user`: "är den här giltig?" Skooli svarar ja/nej plus användaren.

**För:** ingen hemlighet i verktyget, språkoberoende, all logik på ett ställe.
**Nackdelar:** ett extra anrop per förfrågan (kan cachas en kort stund). Ligger Skooli nere är verktyget också nere. Cookien måste ändå nå verktyget (samma domän eller förälderdomän).
**Insats:** en halv dag.

### (c) Grind i Skooli (proxyn skyddar `/gotd`)

**Så funkar det:** `skooli.se/gotd/*` skickas via Skoolis middleware/rewrite till GotD. Middleware släpper bara igenom inloggade. GotD litar på att bara Skooli når det.

**För:** enklast av allt, noll inloggningskod i verktyget, och du kan använda redan befintlig middleware.
**Nackdelar:** fungerar bara med samma domän. Verktygets egen adress (t.ex. `gotd-xyz.vercel.app`) är öppen om den inte låses, så det skyddet är "lås på framdörren, bakdörren olåst". Ska verktyget veta vem användaren är måste Skooli skicka med det i en header, och då måste verktyget kunna lita på att headern verkligen kommer från Skooli. (Obs: dagens middleware sätter `x-user-id` på *svaret* till webbläsaren, inte på anropet vidare.)
**Insats:** några timmar, plus att låsa verktygets egen adress.

### (d) Extern inloggningstjänst (IdP) med OIDC

**Så funkar det:** Clerk, Auth0, Supabase Auth eller liknande sköter konton och inloggning. Auth.js (NextAuth) är ett bibliotek i Skooli, inte en fristående tjänst, och löser inte delningen själv. Verktygen kontrollerar tjänstens biljetter via deras publika nycklar (JWKS) eller loggar in via standarden OIDC.

**För:** färdig lösenordsåterställning, inloggning med Google/Microsoft (skolkonton), tvåstegsverifiering, bibliotek för många språk.
**Nackdelar:** nytt konto och beroende hos en leverantör, kostnad vid tillväxt, flytt av befintliga användare, mer att sätta upp. Kontrollera var tjänsten lagrar data (GDPR, skoldata).
**Insats:** 2–5 dagar.

### (e) Ingen delning, varje verktyg har egen inloggning

Helt frikopplat, men lärare loggar in flera gånger och användare finns i flera databaser. Bara en jämförelse.

## 4. Säkerhet

- **HttpOnly**: behåll. Skript på sidan kommer inte åt biljetten.
- **Secure**: behåll i produktion (bara https).
- **Domain**: utan `Domain` hör cookien bara till `skooli.se`. Med `Domain=skooli.se` skickas den också till *alla* subdomäner. Det behövs för subdomäner, men då litar du på varje subdomän.
- **SameSite**: `Strict` skickar inte cookien när någon klickar på en länk till Skooli från en annan sajt, t.ex. webbmejl i webbläsaren. Användaren ser då inloggningssidan trots att hen är inloggad. Länkar från ett mejlprogram på datorn skickar oftast cookien ändå. `Lax` är vanligare och fortfarande ett bra skydd. Subdomäner av `skooli.se` räknas som samma "site", så båda värdena fungerar mellan dem.
- **CSRF** (en annan sajt lurar webbläsaren att skicka ett anrop med din cookie): `SameSite=Lax/Strict` stoppar det mesta. Verktygen bör bara ändra saker via POST, aldrig GET. Med subdomäner kan en osäker subdomän kringgå SameSite, så då bör man också kontrollera `Origin`-headern.
- **Lokalt: cookies följer värd, inte port.** Webbläsaren ser `localhost:3000` och `localhost:3001` som samma värd när det gäller cookies. Loggar du in i Skooli på `:3000` skickas cookien `token` automatiskt även till GotD på `:3001`. (GotD startar på port 3000 som standard i `server.js` och kör bara på 3001 med `PORT=3001`. Utan det krockar GotD med Next.) Det betyder:
  - Lokalt "fungerar" delningen direkt, utan någon konfiguration. Det beter sig alltså som samma domän, inte som subdomän.
  - Alla appar du kör på `localhost`, oavsett port, ser din inloggningscookie.
  - Ett annat verktyg på localhost som också sätter en cookie som heter `token` skriver över Skoolis. Välj ett unikt namn, t.ex. `skooli_token`.
- **Hemligheter** får aldrig ligga i koden eller i git, bara i env-variabler.

## 5. Rekommendation

**Kör verktygen under samma domän via rewrite (`skooli.se/gotd`), låt Skoolis middleware vara grinden (c) och låt verktyget dessutom själv kontrollera JWT-cookien (a), först med HS256 och senare med RS256/JWKS när verktygen blir fler eller skrivs av andra.**

Motivering: samma domän betyder att dagens cookie fungerar utan `Domain` och utan CORS. Grinden ger samma upplevelse överallt (inte inloggad → `/login`). Att verktyget också kontrollerar biljetten stänger bakdörren, och det är bara några rader kod i alla språk. Allt bygger på det som redan finns. Extern IdP (d) sparas tills behovet av t.ex. inloggning med skolkonton dyker upp.

### Stegplan (senare)

1. Bestäm adressmönster: `skooli.se/<verktyg>`. **[Simon]**
2. GotD: lägg alla sidor och API-anrop under ett prefix (`/gotd/...`). I dag anropar frontenden `/api/...`, och det skulle hamna i Skooli efter en rewrite.
3. Skooli: lägg till rewrite `/gotd/:path*` → GotD:s adress, och låt middleware skydda `/gotd`. Obs: grinden skyddar bara sidor. Middleware hoppar över sökvägar med filändelse, så `/gotd/app.js` och `/gotd/style.css` släpps igenom. Ett API-anrop till `/gotd/api/...` utan inloggning får en omdirigering till `/login` i stället för felkoden 401. Därför behövs verktygets egen kontroll i steg 5.
4. Byt ev. `SameSite` till `Lax` och cookienamn till `skooli_token`.
5. GotD: liten middleware i Express som läser cookien och kontrollerar den med `jose` och `JWT_SECRET`. Svarar 401 om ogiltig.
6. Lägg in `JWT_SECRET` i GotD:s env lokalt och i Vercel. **[Simon: hemligheter/env]**
7. Driftsätt GotD som eget Vercel-projekt och sätt dess adress i Skoolis rewrite. **[Simon: konto/driftsättning]**
8. Senare: byt till RS256, skapa nyckelpar, publicera JWKS och ta bort `JWT_SECRET` från verktygen. **[Simon: nycklar/env]**

## 6. Öppna frågor till Simon

1. Samma domän (`skooli.se/gotd`) eller subdomän (`gotd.skooli.se`)? Rekommendationen förutsätter samma domän.
2. Behöver verktygen veta *vem* läraren är (spara saker per användare), eller räcker "inloggad"?
3. Räcker det att en stulen biljett slutar gälla efter högst 2 timmar, eller behövs en spärrlista så att man kan spärra en session direkt (t.ex. om ett konto missbrukas)?
4. Är inloggning med Google/Microsoft-skolkonton önskvärd längre fram? Då väger (d) tyngre.
5. Ska verktyg kunna användas utan Skooli (egen publik demo), eller alltid bakom inloggningen?
6. Får det finnas flera roller (t.ex. admin) som verktygen måste ta hänsyn till?
