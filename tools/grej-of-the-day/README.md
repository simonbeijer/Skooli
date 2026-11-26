# Grej of the Day

Tar fram en färdig Grej of the Day-presentation (.pptx) i lärarens egen stil.

1. **Färg och ämne:** välj färg på presentationen och skriv veckans grej. AI:n (en gratismodell via OpenRouter) söker på Wikipedia och skriver ledtrådar, fakta, nyckelord och en fråga på nivå för årskurs 3.
2. **Granska:** varje faktatext har klickbara källor. Klicka **＋ Ta med** på det som ska vara med, eller **✕ Ta bort**. Det som inte är valt kommer inte med. Egna texter går att skriva till varje del.
3. **Fler förslag:** under varje del: klicka 😄 Kul, 🤓 Intressant eller 🎲 Överraska mig så tar AI:n fram nya förslag. Ett önskemål, t.ex. "grodor", är valfritt. Klickar man en annan stil avbryts den pågående sökningen. Det går också att skapa en helt ny slide.
4. **Bilder:** sök i flera bildkällor samtidigt och klicka för att välja. Egna bilder (länk eller fil) går också. Bilder som redan valts på en annan slide märks.
5. **Ladda ner:** .pptx som öppnas i Google Presentationer. Varje faktatext har ett källnummer, och sista sliden listar alla källor och bildkrediter.

## Källkontroll
AI:n får bara ange källor som den faktiskt läst (svenska eller engelska Wikipedia) under körningen. Servern kontrollerar detta (`lib/content.js`, `itemProblems`). Om en källa inte är en läst artikel skickas innehållet tillbaka till AI:n för rättning. Läraren granskar och godkänner allt till sist.

## Starta
```bash
npm install
cp .env.example .env   # lägg in OPENROUTER_API_KEY (https://openrouter.ai/keys)
npm start              # öppna http://localhost:3000
```

## Bildkällor
| Källa | Nyckel |
|---|---|
| Wikimedia Commons | ingen |
| Openverse (samlar många fria bildarkiv) | ingen |
| NASA | ingen |
| The Met (museum, public domain) | ingen |
| Pexels | `PEXELS_API_KEY` |
| Pixabay | `PIXABAY_API_KEY` |
| Unsplash | `UNSPLASH_ACCESS_KEY` |
| Flickr (endast Creative Commons) | `FLICKR_API_KEY` |

## Filer
- `server.js`: webbserver och API
- `lib/content.js`: AI via OpenRouter + Wikipedia + källkontroll
- `lib/images.js`: bildsökning
- `lib/pptx.js`: bygger presentationen (vald färg, grön #9DD679 som standard, Lexend)
- `public/`: webbsidan
- `assets/`: instruktionsbilden från lärarens presentation
