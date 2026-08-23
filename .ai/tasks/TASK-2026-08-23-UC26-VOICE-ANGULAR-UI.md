# Task: UC-26 Voice-UI i Angular med central emoji

**Dato:** 2026-08-23  
**Status:** Done  
**Use case:** [../features/voice/UC-26-BETJEN-VICO-MED-STEMMEN.md](../features/voice/UC-26-BETJEN-VICO-MED-STEMMEN.md)  
**Type:** Feature

## Resultat

Et Angular 20 voice-UI i `src/Roadcue.Web/`, hvor én central emoji viser tilstandene Klar → Lytter → Behandler → Taler → Klar (samt Fejl). Chaufførens tale sendes som `message` til det eksisterende `POST /agent/chat`, og det returnerede `thread_id` genbruges uændret i den aktive samtale. Ingen agentlogik eller OpenAI-kald i frontenden.

## Scope

**Med**

- Angular 20 app scaffoldet i `src/Roadcue.Web/` med SCSS, routing og PWA (allerede oprettet – kun feature-kode tilføjes).
- Én `VoiceComponent` med central emoji og tilstandsmaskine (`idle | listening | processing | speaking | error`).
- `AgentChatService` som kalder `POST /agent/chat` og opbevarer `thread_id` i memory for aktuel session.
- `SpeechRecognitionAdapter` og `SpeechSynthesisAdapter` som injektérbare interfaces med Web Speech API-implementering + fake test-implementeringer.
- Mikrofon deaktiveres under `processing` og `speaking`. Tryk på emoji starter/stopper/afbryder afhængigt af tilstand.
- Fejlhåndtering for mikrofontilladelse, tom transskription, HTTP-fejl og TTS-fejl uden opdigtet `thread_id`.
- Deterministiske frontendtests med mockede adaptere og `HttpTestingController` – ingen live kald. Baseline-browser er **Chrome** (Web Speech API-support bekræftet); tests kører på `ChromeHeadless`.
- **Miljø-strategi:** Ingen absolut backend-URL i frontend. Angular kalder same-origin relativ sti `/api/agent/chat` i alle miljøer.
  - **Lokalt (dev):** `proxy.conf.json` mapper `/api` → lokal VICO (`http://127.0.0.1:8000`). Frontenden bruger fortsat `/api` og forbliver HTTPS-ren i egen kode.
  - **Test på simply.com:** Angular-buildet serveres statisk, og `/api` reverse-proxies til VICO. Ingen CORS, ingen hardkodede hosts, samme kode virker begge steder.
- **Solution-integration:** `src/Roadcue.Web/` tilføjes som mappe/solution items i `Roadcue.slnx`, så projektet er synligt i Visual Studio (uden .csproj).
- **Oprydning af Angular-scaffolding:** Al ubrugt scaffolding-kode fra `ng new` skal slettes, når den erstattes/ikke bruges. Konkret: placeholder-indhold i `src/app/app.html` (den store template med gradient/links), tilhørende inline `<style>`, default `title`-signalet i `src/app/app.ts` hvis det ikke bruges, samt `app.spec.ts` hvis den erstattes af en meningsfuld `VoiceComponent`-spec. `README.md` genereret af CLI må gerne beholdes, men skal opdateres eller slettes hvis den ikke tilføjer værdi.

**Ikke med**

- Ændringer i UC-01..UC-04 backend-adfærd, prompts eller tools.
- Nye endpoints, WebSockets eller streaming.
- Wake word, kontinuerlig baggrundslytning, valg af 3.-parts taleleverandør.
- Persistens af `thread_id` på tværs af sider/reloads.
- Autorisation, brugerlogin og sikkerhedslag.
- Opsætning af reverse proxy på simply.com-testmiljøet (infrastrukturopgave uden for denne task – frontenden er kun kompatibel med den).

## Verificeret udgangspunkt

- `POST /agent/chat` findes i `vico/app/main.py` og accepterer `{ message, thread_id? }` → `{ answer, thread_id }` (bekræftet i UC-01..UC-04-arbejdet).
- Angular 20 projekt er scaffoldet i `src/Roadcue.Web/` med SCSS + PWA (`@angular/pwa` tilføjet). `npm run build` er grønt.
- Nuværende `src/app/app.html` indeholder CLI-placeholder (342 linjer med gradient-template). `src/app/app.ts`, `app.scss`, `app.spec.ts` er default scaffolding.
- Ingen HTTP-klient, ingen adaptere og ingen tilstandsmaskine findes endnu.
- Repo-regel (copilot-instructions): alle URLs skal være HTTPS, også i frontend-kode og config.

## Påvirkning

| Område | Forventet ændring |
|---|---|
| Angular | Ny `VoiceComponent` + tilstandsmaskine, `AgentChatService`, to adapter-interfaces + Web Speech-impl., DI-wiring i `app.config.ts`, sletning af CLI-scaffolding placeholder |
| C# API/Application/Domain/Infrastructure | Ingen |
| Python/VICO | Ingen (kontrakten er uændret) |
| SQL/migration | Ingen |
| Kontrakter/config | `proxy.conf.json` for `ng serve` (dev), relativ base-path `/api` i `AgentChatService`; ingen absolutte URLs i frontend-koden |
| Solution | `Roadcue.slnx` opdateres til at inkludere `src/Roadcue.Web/` som solution items |
| Tests/dokumentation | Nye Angular unit-tests for komponent + service + tilstandsmaskine med mocks; kort note i task-loggen |

## Implementeringsplan

1. Ryd CLI-scaffolding: erstat `src/app/app.html`, `app.scss`, `app.ts` med minimal shell der monterer `VoiceComponent`; slet `app.spec.ts` når ny spec er på plads.
2. Tilføj `provideHttpClient()` i `app.config.ts`. Opret `proxy.conf.json` som mapper `/api` → `http://127.0.0.1:8000` og opdatér `angular.json` `serve`-target til at bruge proxy'en. `AgentChatService` bruger konstanten `'/api/agent/chat'`.
3. Implementér `AgentChatService.sendMessage(message)` som holder `threadId` i en `signal` og kalder `POST /agent/chat`.
4. Definér `SpeechRecognitionAdapter` og `SpeechSynthesisAdapter` som `InjectionToken`-interfaces + Web Speech API-implementeringer bag DI.
5. Byg `VoiceComponent` med tilstandssignal og emoji-mapping; håndtér tap-adfærd pr. tilstand og deaktivér mikrofon under `processing`/`speaking`.
6. Tilføj fejlhåndtering: mikrofonafvisning, tom transskription (ingen HTTP), HTTP-fejl (bevar `threadId`), TTS-fejl (vis tekst).
7. Skriv unit-tests: tilstandsflow, `message`-payload, `thread_id`-genbrug ved opfølgende afklaring, ingen HTTP ved tom tale, fejlstier, afbrydelse.
8. Kør `npm run build` og `npm test -- --watch=false --browsers=ChromeHeadless`; slet resterende ubrugt scaffolding og verificér at intet placeholder-indhold er tilbage.
9. Opdatér `Roadcue.slnx` så `src/Roadcue.Web/` optræder som solution items (Angular-projektet har ingen .csproj, så det tilføjes som mappe/filer, ikke som byggeprojekt).

## Implementeringsspecifikke acceptkriterier

- [ ] Ingen CLI-scaffolding-placeholder er tilbage i `src/Roadcue.Web/` efter tasken (`app.html` gradient-template, ubrugte default-signals, tomme scaffolding-specs).
- [ ] `AgentChatService` genbruger uændret `thread_id` fra første respons i alle efterfølgende requests i samme session.
- [ ] Mikrofonen er programmæssigt stoppet før HTTP-kald sendes og forbliver stoppet indtil `speaking` er slut.
- [ ] Angular-koden indeholder ingen absolutte backend-URLs; kun relativ `/api/agent/chat`. HTTPS-reglen holdes af same-origin hosting.
- [ ] `ng serve` med `proxy.conf.json` kan kalde lokal VICO uden CORS-fejl.
- [ ] `Roadcue.slnx` viser `src/Roadcue.Web/` i Visual Studio.
- [ ] Ingen Angular-kode importerer eller kalder OpenAI-SDK'er direkte.

## Valideringsplan

- [ ] Unit-test: tilstandsflow Klar → Lytter → Behandler → Taler → Klar med mockede adaptere.
- [ ] Unit-test: `HttpTestingController` bekræfter payload `{ message, thread_id }` og `thread_id`-genbrug ved to på hinanden følgende kald.
- [ ] Unit-test: tom transskription udløser ingen HTTP; HTTP-fejl bevarer eksisterende `thread_id`.
- [ ] Unit-test: afbrydelse stopper mocket `SpeechSynthesisAdapter`.
- [ ] Manuel kontrol: `npm run build` grøn; `npm test` grøn; manuel røgtest mod kørende VICO (valgfri).

## Risici og åbne spørgsmål

- **Baseline-browser:** Chrome (afklaret). Andre browsere er ikke krav i denne task; adapter-mønstret holder døren åben.
- **Miljø-strategi:** afklaret – same-origin `/api` + dev-proxy lokalt + reverse proxy på simply.com. Kræver at testmiljøet konfigureres tilsvarende (infra-opgave).
- **Solution-integration:** afklaret – tilføjes til `Roadcue.slnx` som solution items.
- **`thread_id`-persistens:** valgt løsning er **in-memory kun** (nulstilles ved reload). Rationale: samtalen er kortlivet stemmedialog i kørslen; sessionStorage tilføjer kompleksitet uden aktuel gevinst og kan genopfriske forældede thread-referencer. Kan tilføjes senere som isoleret ændring hvis behov opstår.

## Implementeringslog

- Ændrede filer:
  - Slettet: `src/Roadcue.Web/src/app/app.html`, `app.scss`, `app.spec.ts` (CLI-scaffolding).
  - Ny: `src/app/voice/voice-state.ts`, `speech-recognition.adapter.ts`, `speech-synthesis.adapter.ts`, `agent-chat.service.ts`, `voice.component.ts`, `agent-chat.service.spec.ts`, `voice.component.spec.ts`.
  - Ny: `src/Roadcue.Web/proxy.conf.json`.
  - Opdateret: `src/app/app.ts` (minimal shell der mounter `<app-voice />`), `src/app/app.config.ts` (`provideHttpClient` + adapter-DI), `angular.json` (`serve.development.proxyConfig`).
- Vigtige beslutninger:
  - Relativ endpoint-konstant `'/api/agent/chat'`; ingen absolutte URLs i frontend.
  - `AgentChatService.threadId` er in-memory signal; nulstilles ved reload jf. aftalt strategi.
  - TTS-fejl vises som tekst uden ny HTTP-retry.
  - `Roadcue.slnx` havde allerede `src/Roadcue.Web/` som Website-projekt; ingen slnx-ændring nødvendig.
- Afvigelser fra planen:
  - Trin 9 (slnx-opdatering) blev en no-op fordi projektet allerede var registreret i `Roadcue.slnx`.

## Resultat af validering

- Automatiske tests: `ng test --watch=false --browsers=ChromeHeadless` → 8/8 SUCCESS (3 service-tests + 5 komponent-tests dækker tilstandsflow, `thread_id`-genbrug, ingen HTTP ved tom tale, HTTP-fejl bevarer `thread_id`, afbrydelse annullerer TTS).
- Manuel kontrol: `npm run build` grøn (initial bundle ~71 kB).
- Resterende begrænsninger: Live røgtest mod VICO kræver kørende backend på `127.0.0.1:8000`; simply.com-testmiljøet kræver særskilt reverse-proxy-opsætning (`/api` → VICO) som infra-opgave.
