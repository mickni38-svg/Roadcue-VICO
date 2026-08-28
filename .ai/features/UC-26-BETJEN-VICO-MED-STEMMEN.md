# UC-26 – Betjen VICO med stemmen

**Fase:** MVP efter tekst-POC  
**Status:** Planlagt – Angular-UI er ikke implementeret endnu  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren kan føre en sammenhængende samtale med VICO via tale gennem et enkelt, roligt og let aflæseligt Angular-UI.

## Nuværende fundament

- UC-01 til UC-04 fungerer allerede gennem Swagger.
- VICO modtager tekst via `POST /agent/chat`.
- Endpointet accepterer `message` og et valgfrit `thread_id`.
- Endpointet returnerer `answer` og det `thread_id`, som samtalen skal fortsætte med.
- Voice-UI'et er et nyt klientlag oven på den eksisterende samtaleadfærd. Det må ikke kalde OpenAI direkte eller duplikere agentlogik i Angular.

## Forudsætninger

- Angular-klienten kan få adgang til en browserunderstøttet talegenkendelse og taleafspilning gennem udskiftelige frontend-adaptere.
- Brugeren har givet mikrofontilladelse.
- `POST /agent/chat` er tilgængeligt.
- Samtalens aktuelle `thread_id` kan holdes i Angular-klientens state, så længe den aktive samtale varer.

## UI-koncept

- Skærmen har én stor, central VICO-emoji som det primære betjeningselement.
- Der må ikke vises flere samtidige emojis eller konkurrerende primære stemmeknapper.
- Den samme centrale emoji skifter udtryk og/eller animation, så brugeren kan se den aktuelle tilstand:
  - **Klar:** VICO venter på aktivering.
  - **Lytter:** Mikrofonen er aktiv, og brugerens tale registreres.
  - **Behandler:** Talegenkendelsen er afsluttet, og VICO venter på HTTP-svaret.
  - **Taler:** Svaret afspilles som tale.
  - **Fejl eller gentagelse:** VICO kan ikke fortsætte og viser en rolig, forståelig fejltilstand.
- Kort statustekst og transskription må understøtte emojiens tilstand, men emojien er fortsat det centrale element.
- Mikrofonen må ikke være aktiv, mens VICO behandler eller afspiller tale, så VICO ikke opfanger sit eget svar.
- Et tryk på emojien kan starte en ny ytring, stoppe aktiv lytning eller afbryde taleafspilning afhængigt af den aktuelle tilstand.

## Hovedflow

1. Chaufføren aktiverer den centrale emoji.
2. UI'et går til **Lytter**, og talegenkendelsen starter.
3. Talegenkendelsen leverer en teksttransskription.
4. UI'et stopper mikrofonen, går til **Behandler** og sender transskriptionen som `message` til `POST /agent/chat`.
5. Ved samtalens første request kan `thread_id` udelades eller være `null`.
6. Angular-klienten gemmer det returnerede `thread_id`.
7. Alle efterfølgende ytringer i den aktive samtale sendes til samme endpoint med præcis det samme `thread_id`.
8. UI'et modtager `answer`, går til **Taler** og afspiller svaret som tale.
9. Når afspilningen er færdig, går UI'et tilbage til **Klar**.
10. Chaufføren kan fortsætte samtalen med en ny ytring.

## Afklarende spørgsmål

1. Hvis VICO mangler oplysninger eller er usikker, returnerer det et afklarende spørgsmål i `answer`.
2. Angular-klienten behandler ikke spørgsmålet med særskilt agentlogik, men oplæser det som ethvert andet svar.
3. Chaufføren svarer med en ny ytring.
4. Svaret sendes til `POST /agent/chat` med samme `thread_id`.
5. VICO kan derfor bruge samtalehistorikken fra UC-02 og fortsætte den oprindelige intention uden at bede om allerede kendte oplysninger.

## API-kontrakt

Voice-UI'et genbruger den eksisterende kontrakt og introducerer ikke et nyt voice- eller chat-endpoint.

Første request:

```json
{
  "message": "Fortæl mig om rastepladsen foran mig",
  "thread_id": null
}
```

Svar:

```json
{
  "answer": "Hvilken retning kører du i?",
  "thread_id": "c1f0a2b4-8e5d-4a2f-9b1c-1234567890ab"
}
```

Opfølgende request:

```json
{
  "message": "Jeg kører mod syd",
  "thread_id": "c1f0a2b4-8e5d-4a2f-9b1c-1234567890ab"
}
```

## Alternative flows

- Hvis der ikke genkendes tale, sendes ingen tom request. UI'et beder brugeren prøve igen.
- Hvis talegenkendelsen er usikker, viser eller oplæser UI'et en kort besked og kræver en ny ytring frem for at gætte.
- Hvis mikrofontilladelse afvises, forklarer UI'et problemet uden at starte et HTTP-kald.
- Hvis `POST /agent/chat` fejler, stopper behandlingsindikatoren, fejlen vises forståeligt, og brugeren kan prøve igen. Et eksisterende `thread_id` må ikke erstattes af et opdigtet id.
- Hvis taleafspilningen fejler eller ikke understøttes, skal tekstsvaret fortsat kunne vises. Der sendes ikke en ny request alene på grund af afspilningsfejlen.
- Hvis chaufføren afbryder oplæsningen, stoppes taleafspilningen, men samtalens `thread_id` og allerede modtagne svar bevares.
- Handlinger med konsekvens følger fortsat den underliggende use cases krav om oplæsning og bekræftelse før udførelse.
- Voice-laget ændrer ikke autorisation, sikkerhedsregler, toolvalg eller datakilder i de underliggende use cases.

## Krav til fremtidige frontendtests

Frontendtestene skal være deterministiske og må ikke afhænge af browserens mikrofon, højttaler, VICO-backend eller en live AI-model.

- Talegenkendelse mockes gennem frontendens talegenkendelses-adapter.
- Taleafspilning mockes gennem frontendens taleafspilnings-adapter.
- HTTP mockes med Angulars testværktøjer, så `POST /agent/chat` aldrig rammer et live endpoint.
- Tests må aldrig kalde OpenAI eller en anden ekstern AI-tjeneste.
- Tests skal mindst verificere:
  - tilstandsskiftet **Klar → Lytter → Behandler → Taler → Klar**;
  - at en transskription sendes som `message`;
  - at første response gemmer `thread_id`;
  - at alle opfølgende requests, inklusive svar på afklarende spørgsmål, genbruger samme `thread_id`;
  - at `answer` sendes til den mockede taleafspilning;
  - at tom eller mislykket talegenkendelse ikke udløser HTTP;
  - at HTTP- og taleafspilningsfejl håndteres uden live fallback;
  - at afbrydelse stopper den mockede taleafspilning.

## Acceptkriterier

- [ ] Angular-UI'et har én central emoji som primært betjeningselement.
- [ ] Emojien viser tydeligt tilstandene **Klar**, **Lytter**, **Behandler**, **Taler** og **Fejl eller gentagelse**.
- [ ] Chaufførens tale konverteres til tekst og sendes som `message` til det eksisterende `POST /agent/chat`.
- [ ] Angular-klienten kalder ikke OpenAI direkte og indeholder ikke en kopi af VICO's agentlogik.
- [ ] Det `thread_id`, som returneres ved første request, genbruges uændret ved alle efterfølgende requests i den aktive samtale.
- [ ] Et afklarende spørgsmål oplæses, og chaufførens efterfølgende svar sendes med samme `thread_id`.
- [ ] VICO's `answer` afspilles som tale og kan afbrydes.
- [ ] Mikrofonen er ikke aktiv under behandling eller taleafspilning.
- [ ] Tom, manglende eller usikker tale resulterer i gentagelse frem for et gæt eller en tom HTTP-request.
- [ ] Fejl i talegenkendelse, HTTP eller taleafspilning efterlader UI'et i en forståelig og brugbar tilstand.
- [ ] Frontendtests mocker talegenkendelse, taleafspilning og HTTP.
- [ ] Frontendtests foretager ingen live kald til OpenAI, VICO-backend eller andre eksterne AI-tjenester.
- [ ] UC-01 til UC-04 kan anvendes gennem voice-UI'et uden ændring af deres eksisterende backend-adfærd.

## Uden for scope

- Implementering af Angular-UI'et i denne dokumentationsændring.
- Nye backend-endpoints, WebSockets eller streaming.
- Ændringer i UC-01 til UC-04.
- Wake word, kontinuerlig baggrundslytning eller valg af konkret taleleverandør.
- Ændringer i Roadcues autorisations-, sikkerheds- eller toolregler.

## Resultat

- UC-26 beskriver et voice-first Angular-UI, hvor én central emoji formidler hele samtalens tilstand, mens den eksisterende VICO-agent og samme `thread_id` bærer dialogen på tværs af spørgsmål, svar og afklaringer.
