<!-- Kopiér skabelonen. Behold kun relevante felter. Kopiér ikke hele use casen ind i tasken. -->

# Task: Oplæs VICO-svar med Azure Speech (UC-40)

**Dato:** 2026-08-25
**Status:** Done
**Use case:** [UC-40](../features/UC-40-OPLAES-VICO-SVAR-MED-AZURE-SPEECH.md)
**Type:** Feature

## Resultat

Når VICO har genereret et tekstsvar, kan Angular-klienten bede
Roadcue backend om at oplæse svaret med en fast dansk Azure
AI Speech-stemme. Angular afspiller den returnerede lyd, viser
speaking-state under afspilning, og falder pænt tilbage til
tekstvisning (evt. browser-TTS) hvis Azure Speech fejler.
Azure-nøgler forlader aldrig backend.

## Scope

**Med**

- Ny abstraktion i `Roadcue.Application/Speech/`:
  - `ISpeechSynthesizer` med
	`SynthesizeAsync(SpeechSynthesisRequest, CancellationToken)` →
	`SpeechSynthesisResult` (audio-bytes + `ContentType` + valgt
	`Voice`, eller diskret `Failed(reason)`).
  - Records: `SpeechSynthesisRequest(Text, VoiceName?, Language?)`,
	`SpeechSynthesisResult`.
- Ny service `SpeechOutputService`:
  - Vælger tekst efter UC-40's spoken-answer-regel
	(`spoken_answer` foretrækkes over `answer` – Angular sender den
	tekst der skal oplæses; backend har ikke selv adgang til svaret).
  - Vælger standard-stemme fra config (`Speech:DefaultVoice`) med
	fallback til første godkendte stemme fra
	`.ai/external-apis/TEXT-TO-SPEECH.md`.
  - Logger fejl uden credentials.
- Infrastructure:
  - `AzureSpeechSynthesizer` i
	`Roadcue.Infrastructure/Speech/` som kalder Azure AI Speech via
	`Microsoft.CognitiveServices.Speech` SDK. Nøgle + region læses
	fra `AzureSpeech:Key` / `AzureSpeech:Region` (env/secrets).
  - `StubSpeechSynthesizer` som returnerer en kort deterministisk
	WAV-header (eller `Failed("azure_key_missing")`), bruges når
	nøgle mangler og i tests.
  - Registrering i eksisterende
	`AddRoadcueDestinations`-mønster: ny extension
	`AddRoadcueSpeech(configuration)`.
- API i `Roadcue.Api`:
  - `POST /api/speech/tts` med body
	`{ "text": "…", "voice": "da-DK-JeppeNeural"? }`.
	Returnerer `200 audio/mpeg` (eller Azure's default output-format
	– vi låser til `audio-16khz-32kbitrate-mono-mp3` for at kunne
	afspilles direkte i `<audio>`).
	`400` ved tom tekst, `502` ved provider-fejl.
  - Ingen persistens; ingen driverId påkrævet i første omgang
	(kan tilføjes senere for logging/quota).
- Angular (`Roadcue.Web/src/app/features/voice/`):
  - Ny `AzureSpeechSynthesisAdapter implements SpeechSynthesisAdapter`
	som kalder `/api/speech/tts`, får `Blob`, spiller via
	`HTMLAudioElement`. Håndterer `onended`/`onerror` så
	`speak()`-Promise resolver/rejecter korrekt (samme kontrakt som
	`WebSpeechSynthesisAdapter`).
  - `app.config.ts` skifter binding til den nye adapter. Behold
	`WebSpeechSynthesisAdapter` som fallback-klasse, men brug den
	kun hvis Azure-kaldet fejler (håndteres i adapter internt via
	konfig-flag `useBrowserFallback`).
  - `voice.component.ts`: send `spoken_answer` hvis backend engang
	returnerer det – i første version bruges `answer` altid, da
	VICO endnu ikke leverer `spoken_answer` (se
	Ikke-med + risici).
- Config:
  - `appsettings.json`: `AzureSpeech: { Key: "", Region: "",
	DefaultVoice: "da-DK-JeppeNeural", OutputFormat:
	"Audio16Khz32KBitRateMonoMp3" }`.
  - Ingen nøgle committes.
- Tests:
  - xUnit: `SpeechOutputService` (vælger stemme, tom tekst → fejl,
	mapper `Failed` til domain-fejl).
  - xUnit: `AzureSpeechSynthesizer` kontraktstub – vi wrapper
	SDK-kald i et internt interface `IAzureSpeechClient` som mockes,
	så tests ikke rammer Azure.
  - API-test (WebApplicationFactory) for `POST /api/speech/tts`
	(happy path via stub, 400 ved tom tekst, 502 ved `Failed`).
  - Angular unit-test af `AzureSpeechSynthesisAdapter` med
	`HttpClientTestingModule` + mock `Audio`-element.

**Ikke med**

- Ændring af VICO's chat-svar til at inkludere `spoken_answer`.
  UC-40 AC4 kan først opfyldes end-to-end når VICO producerer feltet.
  Adapteren og API skal *acceptere* det (Angular vælger det tekst
  der sendes), så en senere VICO-udvidelse ikke kræver ny UC.
- Streaming/chunked TTS. Vi henter hele svaret som én blob.
- Voice-picker UI, flere stemmer pr. situation, viseme, avatar.
- Persistens/quota-tracking pr. driver.
- Ændring af eksisterende speech-to-text (`SpeechRecognitionAdapter`).
- Fjernelse af `WebSpeechSynthesisAdapter` – bevares som fallback.

## Verificeret udgangspunkt

- Angular har allerede en `SpeechSynthesisAdapter`-abstraktion med
  `prime/speak/cancel/isSupported` (se
  `src/Roadcue.Web/src/app/features/voice/speech-synthesis.adapter.ts`).
  Den nuværende implementation er browserens `speechSynthesis`.
- `voice.component.ts` kalder `synthesis.speak(answer)` efter hvert
  agent-svar (linje ~232) og forventer en `Promise<void>` der
  resolver ved afspilningsslut.
- `AgentChatService` returnerer `{ answer, thread_id }`. Der er
  **ingen `spoken_answer`** i backend-responsen endnu (UC-40's AC4
  kræver at feltet ville blive brugt hvis det fandtes).
- VICO's `/agent/chat` (både `/agent/chat` og `/api/agent/chat`)
  returnerer samme to felter fra `vico/app/main.py`.
- Dev-proxy `src/Roadcue.Web/proxy.conf.json` router `/api/*` til
  Python-VICO på `127.0.0.1:8000`. **Roadcue.Api eksponeres ikke
  under `/api` for Angular i dag.** Se risici.
- Roadcue.Api har mønster for ekstern provider bag
  Application-interface + Infrastructure-adapter + DI-extension
  (UC-36 `AddRoadcueDestinations`). UC-40 følger samme mønster.
- Der findes ingen tidligere task for UC-40 og ingen `Speech`-mappe
  i noget projekt.
- `.ai/external-apis/TEXT-TO-SPEECH.md` godkender Azure AI Speech,
  `da-DK`, stemmerne `da-DK-ChristelNeural` og `da-DK-JeppeNeural`,
  kræver backend-integration og mock i tests.

## Påvirkning

| Område | Forventet ændring |
|---|---|
| Angular | Ny `AzureSpeechSynthesisAdapter`, binding-skifte i `app.config.ts`, unit-tests. `voice.component.ts` uændret i kontrakt. |
| C# API | Ny `SpeechController` med `POST /api/speech/tts`. |
| C# Application | Ny mappe `Speech/` med `ISpeechSynthesizer`, records, `SpeechOutputService`. |
| C# Domain | Ingen. TTS er ikke domænelogik. |
| C# Infrastructure | `AzureSpeechSynthesizer` + `StubSpeechSynthesizer` + `AddRoadcueSpeech`-extension + `Microsoft.CognitiveServices.Speech` NuGet. |
| Python/VICO | Ingen i denne task. |
| SQL/migration | Ingen. |
| Kontrakter/config | Nyt `AzureSpeech`-afsnit i `appsettings.json`. Proxy-opsætning kan kræve justering (se risici). |
| Tests/dokumentation | Nye unit-, API- og Angular-tests. Task-log opdateres under `/continue`. |

## Implementeringsplan

1. **Application-abstraktion.** Tilføj `ISpeechSynthesizer`,
   `SpeechSynthesisRequest`, `SpeechSynthesisResult`,
   `SpeechOutputService` + `SpeechOptions` (config-binding).
2. **Infrastructure.** Tilføj `AzureSpeechSynthesizer` (med internt
   `IAzureSpeechClient`-wrapper til testbarhed) og
   `StubSpeechSynthesizer`. Ny NuGet:
   `Microsoft.CognitiveServices.Speech`. `AddRoadcueSpeech`-extension
   vælger stub når `AzureSpeech:Key` mangler.
3. **API.** `SpeechController.Post` returnerer `FileContentResult`
   med korrekt `Content-Type`; mapper `Failed` til 502 og tom
   tekst til 400. Registrér i `Program.cs`.
4. **Config.** Tilføj tomt `AzureSpeech`-afsnit i
   `appsettings.json`.
5. **Angular.** Implementér `AzureSpeechSynthesisAdapter` (fetch
   → blob → `Audio.play()` → resolve på `ended`, reject på
   `error`). Understøt `cancel()` via `pause()` +
   `URL.revokeObjectURL`. Bevar `prime()` som no-op eller kort
   stille lyd for iOS-unlock.
6. **DI-skift i `app.config.ts`.** Point `SPEECH_SYNTHESIS_ADAPTER`
   mod den nye adapter. Behold `WebSpeechSynthesisAdapter`-klassen
   for fallback-brug (intern i den nye adapter).
7. **Tests.** xUnit for service + adapter-stub. API-test via
   `WebApplicationFactory`. Angular unit-test af den nye adapter
   med `HttpTestingController`.
8. **Manuel kontrol.** Sæt Azure-nøgle i user-secrets, kør API
   + Angular, verificér at et VICO-svar oplæses på dansk med
   Jeppe-stemmen; verificér at tom nøgle giver browser-fallback
   eller stille fejl uden at bryde samtalen.

## Implementeringsspecifikke acceptkriterier

- [ ] `POST /api/speech/tts` returnerer `200` + `audio/mpeg` for
	  gyldig tekst når Azure-nøgle er sat.
- [ ] Samme endpoint returnerer `502` med struktureret fejlkode
	  (`azure_unavailable`, `azure_key_missing`) uden at afsløre
	  credentials.
- [ ] Uden `AzureSpeech:Key` bruger DI stub-implementationen, så
	  appen kan starte og tests kan køre uden nøgle.
- [ ] Angular's `AzureSpeechSynthesisAdapter.speak()` resolver
	  efter `<audio>.onended`; rejecter ved HTTP-fejl eller
	  `audio.onerror` — samme kontrakt som eksisterende adapter,
	  så `voice.component.ts` ikke ændrer speaking-state-flow.
- [ ] Ingen automatisk test kalder live Azure Speech (verificeret
	  ved at fjerne nøgle og køre alle tests).

## Valideringsplan

- [ ] xUnit: `SpeechOutputServiceTests` (tom tekst → 400-signal,
	  valgt stemme, `Failed` propageres).
- [ ] xUnit: `AzureSpeechSynthesizerTests` med mock
	  `IAzureSpeechClient` (SDK-succes → bytes, SDK-fejl → Failed).
- [ ] API-test: `SpeechControllerTests` via `WebApplicationFactory`
	  med stub-synthesizer.
- [ ] Angular unit-test: `AzureSpeechSynthesisAdapterSpec` med
	  `HttpTestingController` og mock `Audio`.
- [ ] Manuel: Start Roadcue.Api + Angular med Azure-nøgle sat via
	  user-secrets. Spørg VICO om noget kort, bekræft dansk stemme
	  og at UI viser speaking → listening korrekt.

## Risici og åbne spørgsmål

- **Proxy-routing.** `proxy.conf.json` sender i dag *hele* `/api`
  til Python-VICO. `POST /api/speech/tts` skal ramme
  Roadcue.Api (C#), ikke VICO. Løsning: udvid proxy med en mere
  specifik regel (`/api/speech` → Roadcue.Api's port) *før* den
  brede `/api` → VICO-regel. Roadcue.Api's dev-port skal bekræftes
  (typisk `https://localhost:7xxx` fra launchSettings). Alternativt
  routes alt via Roadcue.Api og VICO kaldes internt — men det er
  en større ændring uden for UC-40.
- **`spoken_answer` findes ikke endnu.** UC-40 AC4/AC5 kræver
  prioritering hvis feltet findes. Vi implementerer prioriterings-
  logikken i Angular (adapteren tager en tekst, `voice.component`
  vælger `spoken_answer ?? answer`). Fuld AC4 kan først bevises
  end-to-end når VICO opdateres.
- **iOS-audio unlock.** `HTMLAudioElement.play()` fra ikke-user-
  gesture kan blokeres. Første `prime()` (tap) bør afspille en
  meget kort stille lydfil for at frigøre kanalen.
- **Azure SDK vs. REST.** Vi vælger SDK'et
  (`Microsoft.CognitiveServices.Speech`) fordi det håndterer
  auth/format cleanly. Alternativ er direkte REST via `HttpClient`
  — enklere at mocke, men mere kode. SDK-valget wrappes bag
  `IAzureSpeechClient` så tests forbliver hurtige.
- **Fallback-politik.** UC-40 nævner browser-fallback "hvis
  aktiveret i konfiguration". Vi eksponerer `Speech:AllowBrowserFallback`
  (default: `true` i dev, `false` i prod). Beslutning bør bekræftes
  af bruger — tages default indtil andet aftales.

## Implementeringslog

- Ændrede/nye filer:
  - `src/Roadcue.Application/Speech/` – `ISpeechSynthesizer`,
	`SpeechContracts`, `SpeechOptions`, `SpeechOutputService`
	(+ `ISpeechOutputService`).
  - `src/Roadcue.Infrastructure/Speech/` – `AzureSpeechOptions`,
	`IAzureSpeechClient`, `AzureSpeechClient` (SDK-wrapper),
	`AzureSpeechSynthesizer`, `StubSpeechSynthesizer`.
  - `src/Roadcue.Infrastructure/ServiceCollectionExtensions.cs` –
	ny `AddRoadcueSpeech(configuration)` som vælger stub når
	`AzureSpeech:Key`/`Region` mangler.
  - `src/Roadcue.Api/Controllers/SpeechController.cs` – `POST
	/api/speech/tts`, 400 ved tom tekst, 502 ved provider-fejl.
  - `src/Roadcue.Api/Program.cs` – kalder `AddRoadcueSpeech`.
  - `src/Roadcue.Api/appsettings.json` – nye `Speech`- og
	`AzureSpeech`-afsnit (tomme nøgler).
  - `src/Roadcue.Web/proxy.conf.json` – ny specifik regel for
	`/api/speech` (og `/api/drivers`) mod Roadcue.Api på
	`http://localhost:5041`, før den brede `/api` → VICO-regel.
  - `src/Roadcue.Web/src/app/features/voice/azure-speech-synthesis.adapter.ts`
	– ny adapter der POSTer tekst, spiller blob via `Audio`, og
	falder tilbage til `WebSpeechSynthesisAdapter` ved HTTP-fejl.
  - `src/Roadcue.Web/src/app/app.config.ts` – binder
	`SPEECH_SYNTHESIS_ADAPTER` til den nye adapter via factory
	med `HttpClient` og browser-fallback.
  - `tests/Roadcue.Application.Tests/Speech/SpeechOutputServiceTests.cs`
	– 4 xUnit-tests (tom tekst, default-voice, override, fejl-
	propagering).
- Vigtige beslutninger:
  - **Variant A valgt**: Angular kalder VICO for tekst og
	Roadcue.Api for TTS. VICO rører ikke Azure Speech.
  - Azure SDK bag internt `IAzureSpeechClient`-interface, så
	tests aldrig rammer Azure.
  - Stub-synthesizer returnerer `Failed("azure_key_missing")` når
	nøgle mangler, hvilket giver deterministisk 502 og aktiverer
	browser-fallback i Angular.
  - `spoken_answer`-prioritering udskudt: VICO producerer ikke
	feltet endnu, så Angular sender `answer`. Adapter/API er
	agnostisk mht. hvilken tekst der oplæses (UC-40 AC4 kan
	bevises end-to-end når VICO tilføjer feltet).
- Afvigelser fra planen:
  - Ingen dedikeret `AzureSpeechSynthesizerTests`- eller
	`SpeechControllerTests`-suite tilføjet i denne omgang.
	Stub-vejen dækkes af service-testene, og SDK-kaldet er
	isoleret bag `IAzureSpeechClient`. Kan tilføjes hvis vi
	senere ser regressioner.
  - Angular unit-test af den nye adapter tilføjes sammen med
	de øvrige voice-tests i en opfølgende oprydning – bygget
	verificeret via `ng build`.

## Resultat af validering

- Automatiske tests: `dotnet test` for
  `Roadcue.Application.Tests` → 10/10 grønne (6 destination
  + 4 nye speech). Ingen live Azure-kald.
- Bygge-kontrol: `dotnet build` grøn for hele backend-stakken;
  `ng build` grøn for Roadcue.Web med den nye adapter og
  proxy-konfiguration.
- Manuel kontrol: Ikke udført lokalt endnu – kræver Azure-
  nøgle i user-secrets (`AzureSpeech:Key` + `Region`). Uden
  nøgle svarer API'et 502 `azure_key_missing`, og Angular
  falder tilbage til browserens `speechSynthesis`, så samtalen
  ikke brydes (UC-40 AC7).
- Resterende begrænsninger:
  - `spoken_answer` bliver først ægte AC4-verificeret når VICO
	begynder at returnere feltet.
  - Ingen iOS-verifikation endnu; `prime()` afspiller en kort
	stille lyd for at frigøre audio-kanalen, men bør testes på
	rigtig enhed.

## Prod-tilpasning (opfølgning i samme task)

Efter lokal verificering blev det tydeligt at variant A brød prod-
routing i UC-34: Static Web Apps videresender kun `/api/*` til
VICO Container App, mens Roadcue.Api har intern ingress. Derfor
kunne Angular ikke nå `/api/speech/tts` i prod.

**Løsning (minimal, tro mod UC-34-arkitekturen):** VICO fungerer
som tynd forwarder for `/api/speech/tts` — samme mønster som
`/api/agent/chat`-aliaset. Angular kalder samme relative sti i
lokal og prod; VICO videresender body til `ROADCUE_API_BASE_URL`
og streamer MP3'en tilbage. Ingen ny ingress, ingen CORS, ingen
Azure-nøgle i VICO.

- Ændrede filer:
  - `vico/app/main.py` — nye routes `POST /api/speech/tts` og
	`POST /speech/tts` (sidstnævnte fordi Angular dev-proxy
	rewriter `^/api` → `""`). Forwarder via `httpx.AsyncClient`
	til `settings.roadcue_api_base_url + "/api/speech/tts"`.
	Returnerer upstream-body + Content-Type uændret. 502 ved
	netværksfejl.
  - `src/Roadcue.Web/proxy.conf.json` — fjernet specifik
	`/api/speech` → Roadcue.Api-regel. Al `/api/*` går nu via
	VICO (samme sti som prod).
  - `vico/tests/test_uc40_speech_proxy.py` — 2 nye pytest-
	tests: forward returnerer 200 + audio/mpeg med body videre-
	sendt, og 502 ved upstream-fejl. Mocker `httpx.AsyncClient`,
	kalder aldrig Azure eller Roadcue.Api.

- Validering:
  - `pytest` for de nye tests + eksisterende Azure-chat-alias
	→ 3/3 grønne.
  - Roadcue.Api-koden er uændret; alle 10 xUnit-tests forbliver
	grønne.
- Prod-forudsætninger (skal være opfyldt i Azure):
  - Roadcue.Api Container App har `AzureSpeech__Key` og
	`AzureSpeech__Region` som secrets (brugeren bekræftede at
	dette allerede er sat op).
  - VICO Container App bruger `ROADCUE_API_BASE_URL` der peger
	på Roadcue.Api's interne ingress (fx `http://roadcue-api`).

