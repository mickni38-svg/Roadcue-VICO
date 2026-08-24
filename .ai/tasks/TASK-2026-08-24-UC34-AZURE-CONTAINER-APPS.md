# Task: UC-34 Azure Container Apps-klargøring

**Dato:** 2026-08-24
**Status:** Ready
**Use case:** [../features/deployment/UC-34-DEPLOY-ROADCUE-TIL-AZURE.md](../features/deployment/UC-34-DEPLOY-ROADCUE-TIL-AZURE.md)
**Type:** Feature

## Resultat

Roadcue-repositoryet kan bygge, teste og deploye Angular til Azure Static Web Apps samt .NET 10 og VICO/FastAPI som to Azure Container Apps. Alle miljøgrænser er dokumenteret, og kun .NET modtager forbindelsesstrengen til databasen hos Simply.com.

## Scope

**Med**

- Multi-stage Dockerfile til .NET API med .NET 10 SDK/runtime og repository-roden som build context.
- Dockerfile til VICO med Python-runtime, installerede requirements og Uvicorn på port 8000.
- `.dockerignore`-regler for begge builds, herunder udelukkelse af `.env`, secrets, `bin/`, `obj/`, `node_modules/`, testcache og lokale IDE-filer.
- Angular `staticwebapp.config.json` med navigation fallback og eksklusion af `/api/*`.
- CI-workflow for .NET-build, Python-tests og Angular-build/tests uden live OpenAI-kald.
- Deployment-workflow for commit-SHA-taggede .NET- og VICO-images til ACR og opdatering af eksisterende Container Apps.
- Deployment-workflow for Angular til Azure Static Web Apps.
- OIDC-baseret Azure-login i Container Apps-workflowet.
- Dokumentation af Azure-prærekvisitter, Static Web Apps Standard/backend-link, GitHub variables/secrets, Container Apps secrets, porte, intern service discovery og Simply.com-netværkskrav.
- Manuel smoke-testplan for Angular → VICO og VICO → .NET uden live AI-kald i automatiske tests.

**Ikke med**

- Oprettelse eller betaling af Azure-ressourcer.
- Bicep/Terraform eller anden automatisk provisionering af infrastrukturen.
- Kubernetes, AKS, Minikube, Helm eller pods.
- Flytning eller ændring af Simply.com-databasen.
- Automatisk EF Core-migration eller produktions-seeding.
- Direkte databaseadgang fra VICO eller Angular.
- Ændringer i agentlogik, prompts, domænelogik, request/response-kontrakten eller UC-01..UC-04/UC-26. En tynd `/api/agent/chat`-routingalias er dog med, fordi Azure-proxyen kræver præfikset.
- Entra-login, custom domains, produktionsalarmer eller komplet observability.

## Verificeret udgangspunkt

- `src/Roadcue.Api/Roadcue.Api.csproj` targeter `net10.0` og refererer `Roadcue.Application` og `Roadcue.Infrastructure`, så Docker-buildet skal kunne se de øvrige projekter under `src/`.
- `src/Roadcue.Api/Program.cs` læser SQL Server-forbindelsen via `GetConnectionString("Roadcue")`; miljøvariablen er derfor `ConnectionStrings__Roadcue`.
- .NET kalder `RoadcueSeed.SeedAsync` ved hver opstart. Seeding stopper, hvis der allerede findes en driver, men automatisk produktions-seeding er en kendt driftsrisiko og skal ikke udvides i denne task.
- `vico/app/config.py` kræver `ROADCUE_API_BASE_URL` og `OPENAI_API_KEY`; `OPENAI_MODEL` har standardværdien `gpt-4.1-mini`.
- `vico/app/clients/roadcue_api_client.py` er VICO's eneste verificerede vej til Roadcue-data og kalder .NET over HTTP.
- `vico/app/main.py` eksponerer `/health` og `POST /agent/chat`.
- `src/Roadcue.Web/src/app/features/voice/agent-chat.service.ts` bruger det relative endpoint `/api/agent/chat`.
- `src/Roadcue.Web/proxy.conf.json` fjerner lokalt `/api` før kaldet til VICO; Azure Static Web Apps' linkede backend videresender derimod hele `/api`-stien, mens VICO aktuelt eksponerer `/agent/chat` uden `/api`. Denne verificerede forskel skal løses i deploymentkonfigurationen uden at bryde lokal udvikling eller opfinde et nyt offentligt chat-endpoint.
- Angular 20 bygger med output fra `@angular/build:application`; den endelige output-sti skal verificeres under implementeringen og bruges korrekt af Static Web Apps-workflowet.
- Der findes ingen Dockerfiles, `.github/workflows/`, `staticwebapp.config.json` eller Azure-deploymentdokumentation i repositoryet.
- Der findes ingen .NET-testprojekter i den aktuelle solution. CI kan bygge .NET og skal køre tests automatisk, når testprojekter senere tilføjes.
- De eksisterende VICO- og Angular-tests er designet til mocks/fakes. CI må bruge en tydeligt ikke-hemmelig dummyværdi, hvor settings-validering kræver en OpenAI-nøgle, men må aldrig sende et live modelkald.
- `.ai/00-ROUTER.md` henviser til `.ai/features/README.md` og `.ai/features/USE-CASE-TEMPLATE.md`, men de filer findes ikke. UC-34 følger derfor formatet fra eksisterende use cases; denne task ændrer ikke routeren som uvedkommende oprydning.
- Microsofts aktuelle dokumentation bekræfter, at Static Web Apps kan linke en Container App som `/api`-backend, men integrationen kræver Static Web Apps Standard og virker ikke i pull-request preview environments.
- Microsofts aktuelle dokumentation bekræfter, at Container Apps i samme environment kan bruge `http://<APP_NAME>` til intern service discovery, og at trafikken forbliver i environmentet.

## Påvirkning

| Område | Forventet ændring |
|---|---|
| Angular | Ingen produktfunktioner; kun Static Web Apps-konfiguration og mulig minimal deployment-routingtilpasning for `/api` |
| C# API/Application/Domain/Infrastructure | Ingen domæneændringer; Dockerfile og runtime-konfiguration til API'et |
| Python/VICO | Ingen agentændringer; Dockerfile og en testdækket `/api/agent/chat`-alias til den eksisterende handler |
| SQL/migration | Ingen migration eller schemaændring; eksisterende Simply.com-database bevares |
| Kontrakter/config | Nye Docker-, GitHub Actions- og Azure-konfigurationsfiler; dokumenterede variables/secrets |
| Tests/dokumentation | CI kører eksisterende tests med mocks; ny Azure-deploymentvejledning og smoke-testcheckliste |

## Implementeringsplan

1. Verificér de konkrete lokale build- og testkommandoer for .NET, VICO og Angular samt Angulars faktiske production output-sti.
2. Tilføj en root `.dockerignore` og en multi-stage .NET 10 Dockerfile, der restore/publisher `src/Roadcue.Api/Roadcue.Api.csproj` og starter den publicerede API på port 8080.
3. Tilføj en VICO Dockerfile, der installerer `vico/requirements.txt`, kopierer app-koden og starter `uvicorn app.main:app --host 0.0.0.0 --port 8000` uden `.env` eller testfiler i runtime-imaget.
4. Refaktorér kun FastAPI-handlerens routing, så både det eksisterende `POST /agent/chat` og Azure-aliaset `POST /api/agent/chat` peger på præcis samme handler. Bevar Angulars `/api/agent/chat`, lokal `proxy.conf.json`, request/response og `thread_id`-adfærd; tilføj ikke en hardkodet Azure-host.
5. Tilføj `staticwebapp.config.json` til Angular-assets med `index.html` navigation fallback og eksplicit undtagelse for `/api/*` og statiske filer, der ikke må omskrives.
6. Tilføj et CI-workflow, der på pull requests og pushes bygger .NET, kører VICO-tests og bygger/tester Angular. Alle AI-, HTTP-, talegenkendelses- og taleafspilningsafhængigheder forbliver mockede; ingen live OpenAI-kald er tilladt.
7. Tilføj et Container Apps-workflow for `master` og manuel aktivering: OIDC-login, ACR-login, build/push af begge images med commit-SHA-tag og opdatering af de to eksisterende Container Apps.
8. Tilføj et Static Web Apps-workflow for Angular på `master` og pull requests. Dokumentér at PR-previewet kun validerer den statiske frontend, fordi den linkede Container Apps-backend ikke understøttes i preview environments.
9. Opret `docs/AZURE-DEPLOYMENT.md` med rækkefølge for manuel Azure-opsætning, nødvendige GitHub variables/secrets, Container Apps environment variables/secrets, intern appadresse, porte, Static Web Apps backend-link og Simply.com IP-/TLS-kontrol.
10. Kør lokale builds/tests og Docker-builds, gennemgå images/config for secrets og verificér workflow-syntaks. Udfør kun ikke-betalbare, lokale kontroller; ingen Azure-ressourcer oprettes i denne task.

## Implementeringsspecifikke acceptkriterier

- [ ] .NET Dockerfile bruger et .NET 10 SDK-buildstage og et ASP.NET 10 runtime-stage og kan bygge alle project references fra repository-roden.
- [ ] VICO-imaget starter FastAPI på port 8000 og indeholder ikke lokal `.env`, pytest-cache eller tests.
- [ ] Angulars eksisterende `/api/agent/chat` er uændret og fungerer både med den lokale path rewrite og den dokumenterede Azure-backendrouting.
- [ ] En kontrakttest bekræfter, at `/agent/chat` og `/api/agent/chat` bruger samme handleradfærd uden duplikeret agentlogik.
- [ ] `staticwebapp.config.json` ender i roden af Angulars production output og omskriver ikke `/api/*` til `index.html`.
- [ ] `ConnectionStrings__Roadcue` findes kun i dokumenteret .NET secret-mapping og aldrig i VICO-/Angular-konfiguration eller committed værdier.
- [ ] `ROADCUE_API_BASE_URL` peger på .NET Container Apps interne appnavn; VICO får ingen SQL-host, databasebruger eller databasepassword.
- [ ] Container images pushes med `${{ github.sha }}` eller et tilsvarende uforanderligt SHA-tag.
- [ ] Azure-login bruger GitHub OIDC med `id-token: write`; ingen Azure client secret lagres i repositoryet.
- [ ] Pull requests kan ikke opdatere de delte Container Apps.
- [ ] CI bruger kun mockede AI-/speech-/HTTP-afhængigheder og foretager ingen live OpenAI-kald.
- [ ] Deploymentvejledningen skelner mellem GitHub variables, GitHub secrets, Azure Container Apps secrets og almindelige environment variables.
- [ ] Ingen workflow eller konfiguration opretter betalbare Azure-ressourcer automatisk.

## Valideringsplan

- [ ] .NET: `dotnet restore Roadcue.slnx` og `dotnet build Roadcue.slnx --configuration Release --no-restore`.
- [ ] Python: installer requirements og kør `pytest` fra `vico/` med testkonfiguration, der ikke kan ramme live OpenAI.
- [ ] Angular: `npm ci`, `npm run build` og `npm test -- --watch=false --browsers=ChromeHeadless` fra `src/Roadcue.Web/`.
- [ ] Docker: byg .NET-imaget fra repository-roden og VICO-imaget fra den dokumenterede build context.
- [ ] Container smoke test: verificér VICO `/health`; verificér .NET-imagets entrypoint og port. En faktisk .NET-opstart kræver en disponibel SQL Server og må ikke bruge produktionshemmeligheder.
- [ ] Statisk kontrol: søg i nye filer og image histories efter `.env`, connection strings, OpenAI-nøgler og andre secrets.
- [ ] Workflowkontrol: valider YAML og bekræft branch/path filters, minimale permissions, SHA-tags og secret-referencer.
- [ ] Manuel Azure-kontrol efter brugerens senere opsætning: Angular → `/api/agent/chat` → VICO og VICO → intern .NET API; dette må ikke udføres som en live OpenAI-test i CI.

## Risici og åbne spørgsmål

- Static Web Apps videresender hele `/api`-stien til den linkede backend, mens VICO aktuelt eksponerer `/agent/chat`. Den valgte løsning er en tynd `/api/agent/chat`-alias til samme handler, dækket af en kontrakttest.
- Static Web Apps Container Apps-integration kræver Standard-planen; det er en reel driftsomkostning og skal fremgå tydeligt af deploymentvejledningen.
- Linket backend virker ikke i Static Web Apps pull-request preview environments; end-to-end API-validering skal derfor ske i det delte miljø eller lokalt.
- Simply.com kan kræve firewall/IP-allowlisting og krypteret SQL-forbindelse. Den konkrete Simply.com-konfiguration kan ikke verificeres fra repositoryet og skal udføres manuelt før deployment.
- Azure Container Apps kan have flere outbound-IP-adresser, og de kan ændres ved visse miljøændringer. Guiden skal undgå at anbefale bred offentlig databaseadgang.
- .NET udfører aktuelt test-seeding ved opstart. Denne task ændrer ikke domæne-/seed-adfærd; før egentlig produktion bør seeding styres af environment eller en separat godkendt task.
- Python dependencies er ikke versionslåste i `vico/requirements.txt`, hvilket kan gøre image-builds mindre reproducerbare. Versionslåsning er en separat dependency-opgave, medmindre et konkret Docker-build ellers ikke kan reproduceres.

## Verificerede Azure-kilder

- [API support in Azure Static Web Apps with Azure Container Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/apis-container-apps)
- [Communicate between container apps in Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/connect-apps)
- [Configure Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)
- [Deploy to Azure Container Apps with GitHub Actions](https://learn.microsoft.com/en-us/azure/container-apps/github-actions)
- [Authenticate to Azure from GitHub Actions by OpenID Connect](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure-openid-connect)

## Implementeringslog

Udfyldes først under `/continue`.

- Ændrede filer:
- Vigtige beslutninger:
- Afvigelser fra planen:

## Resultat af validering

Udfyldes først under `/continue`. Gem korte resultater, ikke komplette logs.

- Automatiske tests:
- Manuel kontrol:
- Resterende begrænsninger:
