# Task: UC-34 Klargør Roadcue til Azure-deployment

**Dato:** 2026-08-24  
**Status:** In Progress
**Use case:** [../features/deployment/UC-34-DEPLOY-ROADCUE-TIL-AZURE.md](../features/deployment/UC-34-DEPLOY-ROADCUE-TIL-AZURE.md)  
**Type:** Feature

## Resultat

Repositoryet kan bygge, teste og deploye Angular til Azure Static Web Apps samt .NET 10 og Python/FastAPI/VICO som to separate Azure Container Apps. Kun .NET konfigureres med adgang til Simply.com-databasen; Python bruger udelukkende .NET API'et til Roadcue-data.

## Scope

**Med**

- Multi-stage Linux-Dockerfile til `src/Roadcue.Api/Roadcue.Api.csproj`.
- Separat multi-stage Linux-Dockerfile til `vico/` med FastAPI-startkommando.
- Relevante `.dockerignore`-regler, så build-context er lille og ingen lokale secrets medtages.
- Produktionskonfiguration for Angular-build og Azure Static Web Apps.
- Konfigurerbar routing fra Angular til de offentlige .NET- og VICO-endpoints uden hardkodede hemmeligheder.
- Konfigurerbar `ROADCUE_API_BASE_URL` i Python til .NET Container App.
- CORS i de offentlige backend-services begrænset til den konfigurerede Angular-origin.
- Health endpoints/probes og logning, der kan bruges af Azure Container Apps.
- GitHub Actions med separate path filters til Angular, .NET og Python.
- Build, test, image-push til Azure Container Registry og deployment til de relevante Azure-tjenester.
- Dokumentation af nødvendige Azure- og GitHub-secret-navne, manuelle Azure-forudsætninger og røgtest.
- Ingen live OpenAI-kald fra automatiske tests.

**Ikke med**

- Oprettelse af betalbare Azure-ressourcer uden en særskilt, udtrykkelig godkendelse.
- Flytning eller ændring af Simply.com-databasen.
- Direkte databaseadgang fra Python eller Angular.
- AKS, Minikube, Helm eller Kubernetes.
- Samme container til .NET og Python.
- Ændring af UC-01 til UC-04 eller UC-26's produktadfærd.
- Ny autentifikationsløsning, domænefunktionalitet eller persistent LangGraph-checkpointer.
- Endelige produktions-SLA'er, autoskaleringsgrænser eller disaster recovery.

## Verificeret udgangspunkt

- `src/Roadcue.Api/Roadcue.Api.csproj` er det eksisterende .NET API-projekt, og `Roadcue.slnx` samler C#-løsningen.
- `src/Roadcue.Web/` er det eksisterende Angular 20/PWA-projekt med `package.json`, `angular.json` og tests.
- `vico/app/main.py` er FastAPI composition root, og `vico/requirements.txt` beskriver Python-afhængighederne.
- VICO har en eksisterende HTTP-klient i `vico/app/clients/roadcue_api_client.py`; den arkitektoniske grænse kræver, at Python bruger C# API'et frem for SQL.
- Den eksisterende løsning har ingen `.github/workflows` til Azure-deployment.
- Repositoryets rod har ingen verificeret, komponentopdelt Azure-containerkonfiguration.
- Angular bruger aktuelt den relative sti `/api/agent/chat` med lokal proxy. Produktionsrouting til separate Azure-services er derfor et konkret implementeringsvalg, som skal løses uden at bryde lokal udvikling.
- UC-26-testene kræver mock af talegenkendelse, taleafspilning og HTTP og må ikke kalde live OpenAI.
- `.ai/architecture/01-SOLUTION-ARCHITECTURE.md` fastlægger Angular → .NET/VICO, VICO → .NET og .NET → SQL samt fravalg af Kubernetes uden et målt behov.
- Ingen Azure-ressourcer oprettes i denne start-task.

## Påvirkning

| Område | Forventet ændring |
|---|---|
| Angular | Produktionsbuild/config til Static Web Apps og miljøbaseret API-routing; eksisterende lokal proxy bevares |
| C# API/Application/Domain/Infrastructure | Containerisering, CORS/config og health endpoint; ingen ændring i domæneregler eller SQL-ejerskab |
| Python/VICO | Separat containerisering, startkommando, health endpoint og konfigureret .NET-base-URL; ingen SQL-adgang |
| SQL/migration | Ingen |
| Kontrakter/config | Dockerfiles, dockerignore, Azure/GitHub-konfiguration, secret-navne og miljøvariabler |
| Tests/dokumentation | CI-builds/tests uden live OpenAI, deploymentguide, secretoversigt og røgtestprocedure |

## Implementeringsplan

1. Verificér de faktiske build-, test- og startkommandoer for `Roadcue.Api`, `Roadcue.Web` og `vico`; registrér nødvendige porte og runtime-versioner.
2. Tilføj en multi-stage Dockerfile til .NET API'et, kør som non-root hvor runtime tillader det, eksponér korrekt port og verificér et lokalt container-build.
3. Tilføj en separat Dockerfile til VICO, installer låste afhængigheder fra `requirements.txt`, start FastAPI med en produktions-egnet kommando og verificér et lokalt container-build.
4. Tilføj målrettede dockerignore-regler, som udelukker build-output, Git-metadata, lokale miljøfiler, secrets og unødvendige dependencies.
5. Tilføj eller verificér health endpoints til .NET og Python, uden database- eller OpenAI-kald i den simple liveness-kontrol.
6. Gør CORS-origins og backend-URL'er miljøkonfigurerbare. Bevar Angulars lokale `/api`-proxy og vælg/dokumentér en produktionsrouting, der kan nå både VICO og .NET over HTTPS.
7. Konfigurér Python med `ROADCUE_API_BASE_URL` til .NET Container App. Tilføj ingen databasepakke, connection string eller direkte SQL-fallback i Python.
8. Klargør Angular til Azure Static Web Apps med korrekt output-mappe, SPA-fallback og produktionskonfiguration uden serverhemmeligheder.
9. Tilføj separate GitHub Actions-workflows eller klart adskilte jobs for Angular, .NET og Python med path filters, build/test-gates, sporbare image-tags og Azure deployment via secrets/OIDC efter den valgte Azure-forbindelsesmetode.
10. Dokumentér nødvendige Azure-ressourcer, konfigurationsnøgler og secret-navne. Secretværdier må ikke tilføjes til repositoryet.
11. Verificér først manuelle builds og tests. Verificér derefter deployment-workflows mod udtrykkeligt godkendte Azure-ressourcer.
12. Udfør og dokumentér røgtest af Angular → VICO, Angular → .NET, VICO → .NET og .NET → Simply.com samt negative kontroller for Python/Angular-databaseadgang.

## Implementeringsspecifikke acceptkriterier

- [ ] `.NET` og Python bygges fra hver sin Dockerfile og resulterer i to uafhængige images.
- [ ] Containerne kan startes separat og rapporterer healthy uden at kontakte OpenAI.
- [ ] Python-konfigurationen indeholder en .NET API-base-URL, men ingen Simply.com-connection string eller direkte SQL-fallback.
- [ ] Kun .NET-workloaden dokumenteres og konfigureres med database-secret.
- [ ] Angulars lokale `/api`-udviklingsflow virker fortsat efter produktionskonfigurationen.
- [ ] Produktionsrouting og CORS er HTTPS-baseret og begrænset til den godkendte Static Web App-origin.
- [ ] Workflow-path filters matcher mindst `src/Roadcue.Web/**`, relevante `src/**`-stier og `vico/**`.
- [ ] En fejlet test stopper deployment af den berørte komponent.
- [ ] Container-images tagges med commit-SHA eller anden entydig, sporbar version.
- [ ] Ingen workflow-, Docker- eller Angular-fil indeholder secretværdier.
- [ ] Automatiske .NET-, Angular- og Python-tests kan køre uden live OpenAI.
- [ ] Deploymentdokumentationen skelner mellem manuel Azure-oprettelse, GitHub-konfiguration og automatiseret deployment.
- [ ] Ingen AKS-, Minikube-, Helm- eller Kubernetes-filer tilføjes.

## Valideringsplan

- [ ] `dotnet restore`, `dotnet build` og relevante `dotnet test`-kommandoer er grønne.
- [ ] `npm ci`, Angular unit-tests og `npm run build` er grønne uden live backend/OpenAI.
- [ ] `pytest` er grøn med mockede model- og HTTP-afhængigheder.
- [ ] Lokale builds af .NET- og Python-images gennemføres.
- [ ] Container-røgtest bekræfter separate health endpoints og Python → .NET-konfiguration.
- [ ] Workflow-YAML valideres, og path filters testes med relevante filændringer.
- [ ] Manuel kontrol bekræfter, at Angular-buildet ikke indeholder connection strings eller andre secrets.
- [ ] Efter særskilt Azure-godkendelse: deployment og end-to-end-røgtest gennemføres mod Azure.

## Risici og åbne spørgsmål

- Angular bruger i dag same-origin `/api/agent/chat`. Azure Static Web Apps og to separate Container Apps kræver en eksplicit produktionsrouting eller miljøbaserede URLs; løsningen skal vælges under implementeringen uden at bryde lokal proxy.
- Den konkrete Azure-region, resource names, subscription, registry-navn og godkendelsesmetode mellem GitHub og Azure er endnu ikke verificeret. De skal være konfiguration, ikke antagelser i kode.
- Simply.com kan kræve firewall-/adgangsopsætning for Azure-egress. Kun .NET må åbnes mod databasen.
- Hvis VICO's LangGraph-state er in-memory, kan scale-to-zero, genstart eller flere replicas miste eller splitte samtaler. Første deployment skal dokumentere begrænsningen og undgå uverificeret horisontal skalering.
- Repositoryet har ikke et verificeret dedikeret .NET-testprojekt. Implementeringen skal køre eksisterende tests og må ikke opfinde testdækning.
- Azure-oprettelse kan medføre omkostninger og udføres derfor ikke alene på baggrund af denne task.

## Implementeringslog

- Ændrede filer:
  - Separate Dockerfiles i `src/Roadcue.Api/` og `vico/` samt root `.dockerignore`.
  - Tre path-filtrerede workflows i `.github/workflows/` til Angular, .NET og VICO.
  - .NET `Program.cs`/`appsettings.json` med konfigurerbar CORS, `/health` og development-only seed.
  - VICO `config.py`/`main.py` med konfigurerbar CORS; eksisterende `/health` bevaret.
  - Angular runtime-konfiguration, Static Web Apps-konfiguration og endpointtests.
  - `docs/AZURE-DEPLOYMENT.md` med Azure-forudsætninger, secrets/variables og røgtest.
  - Python-tests for UC-01..UC-03 rettet, så `ChatOpenAI` mockes ved kilden og aldrig kaldes live.
- Vigtige beslutninger:
  - Angular læser `runtime-config.js`; lokal default er fortsat `/api/agent/chat`, mens workflowet indsætter Azure HTTPS-URLs ved produktionsbuild.
  - Kun .NET dokumenteres med `ConnectionStrings__Roadcue`; VICO får kun `ROADCUE_API_BASE_URL`.
  - GitHub bruger OIDC til Azure for Container Apps og et Static Web Apps deploymenttoken til Angular.
  - Container-images tagges med Git commit-SHA og .NET/Python deployes uafhængigt.
- Afvigelser fra planen:
  - Angular-appens eksisterende imports pegede på `./voice/`, selv om featurefilerne ligger i `./features/voice/`; imports blev rettet, fordi produktionsbuild ellers fejlede.
  - Azure-ressourcer og end-to-end-røgtest er ikke udført, da særskilt godkendelse og konkrete ressourcenavne/secrets mangler.

## Resultat af validering

- Automatiske tests:
  - Python: `17 passed`; alle model- og HTTP-afhængigheder er mockede, og ingen live OpenAI blev kaldt.
  - Angular: testbundtet kompilerer; lokal Karma-kørsel kan ikke starte, fordi valideringsmiljøet ikke har en Chrome-binær.
  - Angular: `npm run build` er grøn; `runtime-config.js` og `staticwebapp.config.json` findes i build-outputtet.
  - Workflow-YAML og JSON-konfiguration er syntaktisk valideret.
- Manuel kontrol:
  - Frontend-buildet er scannet uden database-connection strings eller secrets.
  - Python- og Angular-konfiguration indeholder ingen Simply.com-databaseadgang.
  - Implementeringen indeholder ingen AKS-, Minikube-, Helm- eller Kubernetes-filer.
- Resterende begrænsninger:
  - Lokalt miljø mangler .NET 10 SDK og Docker-daemon; .NET-build og de to container-builds skal derfor valideres af GitHub Actions eller i et egnet udviklingsmiljø.
  - Der blev ikke registreret et GitHub Actions-run umiddelbart efter publicering af det nye workflow-commit.
  - Azure-deployment, Container App health probes, Simply.com-forbindelse og end-to-end-røgtest afventer de manuelt oprettede og særskilt godkendte Azure-ressourcer.
