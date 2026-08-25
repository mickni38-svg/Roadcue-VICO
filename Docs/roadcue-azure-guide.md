# Roadcue: Azure\-opsætning trin for trin

Denne guide fører dig fra **All resources** i Azure Portal til en komplet testopsætning af Roadcue\.

Guiden er skrevet til denne arkitektur:

- Angular 20 PWA hostes i **Azure Static Web Apps**\.
- VICO/Python/FastAPI kører i sin egen **Azure Container App**\.
- Roadcue \.NET 10 API kører i sin egen **Azure Container App**\.
- Begge container\-apps bruger samme **Container Apps Environment**\.
- Docker\-images gemmes i **Azure Container Registry**\.
- SQL\-databasen bliver hos Simply\.com\.
- Kun \.NET API’et må forbinde til databasen\.
- VICO henter data gennem \.NET API’et over intern HTTP\.
- GitHub Actions deployer fra `mickni38-svg/Roadcue-VICO`\.

> Guiden opretter ressourcer, som kan koste penge. Kontrollér altid **Review + create** og den viste pris, før du vælger **Create**. Start med teststørrelser og budgetalarmer.

## 1\. Det færdige resultat

|Ressource                 |Foreslået navn         |Placering/plan            |
|--------------------------|-----------------------|--------------------------|
|Resource Group            |`roadcue-test-rg`      |West Europe               |
|Container Registry        |`roadcuetestacr<unik>` |West Europe, Basic        |
|Log Analytics Workspace   |`roadcue-test-logs`    |West Europe               |
|Container Apps Environment|`roadcue-test-env`     |West Europe, Consumption  |
|.NET Container App        |`roadcue-api-test`     |Intern ingress, port 8080 |
|VICO Container App        |`roadcue-vico-test`    |Ekstern ingress, port 8000|
|Static Web App            |`roadcue-web-test`     |Standard                  |
|Entra app registration    |`github-roadcue-deploy`|GitHub OIDC               |

`<unik>` betyder, at du skal tilføje nogle bogstaver eller tal, fordi navnet på et Container Registry skal være globalt unikt\. Eksempel: `roadcuetestacrmn38`\. Registry\-navnet må kun indeholde bogstaver og tal\.

Brug samme region til Resource Group, Container Registry, Log Analytics og Container Apps\. **West Europe** er et praktisk udgangspunkt tæt på Danmark\. Hvis Azure Portal ikke tilbyder en nødvendig tjeneste i regionen, vælg **North Europe** konsekvent for Container Apps\-delene\.

## 2\. Før du begynder

Du skal have:

- adgang til Azure\-abonnementet `Yatzy`;
- rettighed til at oprette ressourcer og rolletildelinger;
- administrator\- eller skriveadgang til GitHub\-repositoriet;
- connection string til Simply\.com\-databasen;
- en gyldig OpenAI API\-nøgle;
- draft PR [\#2](https://github.com/mickni38-svg/Roadcue-VICO/pull/2) gennemgået og klar til merge\.

Brug aldrig connection strings eller API\-nøgler i GitHub\-kode, workflowfiler, screenshots eller almindelige Azure\-miljøvariabler\. De skal gemmes som secrets\.

## 3\. Opret et Azure\-budget først

Dette er ikke teknisk nødvendigt, men det beskytter mod overraskelser\.

1. Skriv `Cost Management + Billing` i søgefeltet øverst i Azure Portal\.
2. Åbn **Cost Management \+ Billing**\.
3. Vælg **Cost Management** → **Budgets**\.
4. Vælg abonnementet `Yatzy` som scope\.
5. Vælg **Add**\.
6. Opret eksempelvis et månedsbudget på det beløb, du accepterer til test\.
7. Tilføj alarmer ved f\.eks\. 50 %, 80 % og 100 %\.
8. Angiv din e\-mail som modtager og gem budgettet\.

## 4\. Registrér nødvendige resource providers

1. Søg efter `Subscriptions` i Azure Portal\.
2. Åbn abonnementet `Yatzy`\.
3. Vælg **Settings** → **Resource providers**\.
4. Søg efter og registrér disse, hvis status ikke allerede er **Registered**:
  - `Microsoft.App`
  - `Microsoft.ContainerRegistry`
  - `Microsoft.OperationalInsights`
  - `Microsoft.Web`
5. Vent, indtil alle viser **Registered**\.

## 5\. Opret Resource Group

Du står allerede på siden **All resources** i dit screenshot\.

1. Vælg **Resource groups** i venstremenuen\.
2. Vælg **Create**\.
3. Udfyld:
  - **Subscription:** `Yatzy`
  - **Resource group:** `roadcue-test-rg`
  - **Region:** `West Europe`
4. Vælg **Review \+ create**\.
5. Vælg **Create**\.

Alle Roadcue\-testressourcer skal placeres i denne Resource Group\. Så kan hele testmiljøet senere fjernes samlet\. 

## 6\. Opret Log Analytics Workspace

1. Søg efter `Log Analytics workspaces`\.
2. Vælg **Create**\.
3. Udfyld:
  - **Subscription:** `Yatzy`
  - **Resource group:** `roadcue-test-rg`
  - **Name:** `roadcue-test-logs`
  - **Region:** `West Europe`
4. Vælg **Review \+ create** → **Create**\.

Workspace bruges til logs fra \.NET og VICO\. Kontrollér senere retention og dagligt data\-loft under **Usage and estimated costs**, så logs ikke vokser ukontrolleret\.

## 7\. Opret Azure Container Registry

1. Søg efter `Container registries`\.
2. Vælg **Create**\.
3. På fanen **Basics** udfylder du:
  - **Subscription:** `Yatzy`
  - **Resource group:** `roadcue-test-rg`
  - **Registry name:** eksempelvis `roadcuetestacrmn38`
  - **Location:** `West Europe`
  - **SKU:** `Basic`
4. Behold offentlig netværksadgang til den første testopsætning\.
5. Lad **Admin user** være deaktiveret\. Vi bruger identiteter i stedet for registry\-brugernavn og adgangskode\.
6. Vælg **Review \+ create** → **Create**\.
7. Åbn ressourcen, og notér:
  - registry\-navnet, eksempelvis `roadcuetestacrmn38`;
  - login\-serveren, eksempelvis `roadcuetestacrmn38.azurecr.io`\.

Microsofts portalvejledning til ACR findes [her](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-get-started-portal)\.

## 8\. Opret Container Apps Environment

Den nemmeste portalvej er at oprette environmentet sammen med den første midlertidige Container App\.

1. Søg efter `Container Apps`\.
2. Vælg **Create** → **Container App**\.
3. På **Basics**:
  - **Subscription:** `Yatzy`
  - **Resource group:** `roadcue-test-rg`
  - **Container app name:** `roadcue-api-test`
  - **Deployment source:** `Container image`
  - **Region:** `West Europe`
4. Ved **Container Apps environment** vælger du **Create new**\.
5. Angiv:
  - **Environment name:** `roadcue-test-env`
  - **Log destination:** `Azure Log Analytics`
  - **Log Analytics workspace:** `roadcue-test-logs`
6. Behold **Consumption** som workload profile til test\.
7. Aktivér ikke zone redundancy eller eget virtuelt netværk i første testopsætning\.
8. Vælg **Create** i environment\-dialogen\.

Microsofts aktuelle portalflow for en Container App er beskrevet [her](https://learn.microsoft.com/en-us/azure/container-apps/quickstart-portal)\.

## 9\. Opret den midlertidige \.NET Container App

Du er fortsat i oprettelsen af `roadcue-api-test`\.

### 9\.1 Midlertidigt image

1. Åbn fanen **Container**\.
2. Vælg **Use quickstart image**\.
3. Behold den foreslåede testcontainer\.
4. Vælg den mindste CPU\- og hukommelsesstørrelse, som portalen tillader til Consumption\-test\.

Quickstart\-imaget er kun en pladsholder\. GitHub Actions erstatter det senere med Roadcue \.NET\-imaget\.

### 9\.2 Ingress under første oprettelse

1. Åbn fanen **Ingress**\.
2. Aktivér ingress\.
3. Vælg **Limited to Container Apps Environment** eller tilsvarende intern adgang\.
4. Brug quickstart\-imagets foreslåede target port, typisk `80`, i første omgang\.
5. Vælg **Review \+ create** → **Create**\.

Når deployment er færdig, vælger du **Go to resource**\.

### 9\.3 Aktivér system\-assigned identity

1. I `roadcue-api-test` vælger du **Settings** → **Identity**\.
2. Under **System assigned** sætter du status til **On**\.
3. Vælg **Save** og bekræft\.
4. Kopiér eventuelt **Object &#40;principal&#41; ID** til dine noter\.

### 9\.4 Giv appen læseadgang til ACR

1. Åbn dit Container Registry\.
2. Vælg **Access control &#40;IAM&#41;**\.
3. Vælg **Add** → **Add role assignment**\.
4. Vælg rollen **AcrPull**\.
  - Hvis dit registry bruger den nyere ABAC\-model, skal du i stedet vælge den tilsvarende repository\-reader\-rolle, som portalen anbefaler til image pull\.
5. Under **Members** vælger du **Managed identity**\.
6. Vælg **Select members** → **Container App** → `roadcue-api-test`\.
7. Vælg **Review \+ assign**\.

Managed identity og `AcrPull` er Microsofts anbefalede model til private images; se [vejledningen](https://learn.microsoft.com/en-us/azure/container-apps/managed-identity-image-pull)\.

## 10\. Konfigurér \.NET\-appens secrets og miljøvariabler

Gør dette **før** det rigtige \.NET\-image deployes, fordi applikationen skal kunne kontakte databasen ved opstart\.

### 10\.1 Opret secret

1. Åbn `roadcue-api-test`\.
2. Vælg **Settings** → **Secrets**\.
3. Vælg **Add**\.
4. Angiv:
  - **Key:** `roadcue-db-connection`
  - **Value:** den fulde connection string fra Simply\.com
5. Vælg **Save**\.

### 10\.2 Opret miljøvariabler

1. Vælg **Application** → **Containers**\.
2. Vælg **Edit and deploy**\.
3. Vælg den eksisterende container\.
4. Under **Environment variables** tilføjer du:

|Name                        |Source          |Value                  |
|----------------------------|----------------|-----------------------|
|`ConnectionStrings__Roadcue`|Secret reference|`roadcue-db-connection`|
|`ASPNETCORE_ENVIRONMENT`    |Manual entry    |`Production`           |
|`ASPNETCORE_URLS`           |Manual entry    |`http://+:8080`        |

5. Vælg **Save** eller **Create**, så Azure opretter en ny revision\.

Kontrollér, at ingen database\-secret findes i VICO\-appen eller Static Web App\.

### 10\.3 Sæt den endelige ingress\-port

1. Vælg **Settings** → **Ingress**\.
2. Behold ingress aktiveret\.
3. Behold trafikken begrænset til Container Apps Environment\.
4. Skift **Target port** til `8080`\.
5. Vælg **Save**\.

Quickstart\-revisionen kan blive unhealthy efter portskiftet\. Det er forventet, indtil GitHub deployer det rigtige \.NET\-image\.

## 11\. Opret VICO Container App

1. Søg efter `Container Apps`\.
2. Vælg **Create** → **Container App**\.
3. Udfyld:
  - **Subscription:** `Yatzy`
  - **Resource group:** `roadcue-test-rg`
  - **Container app name:** `roadcue-vico-test`
  - **Deployment source:** `Container image`
  - **Region:** `West Europe`
  - **Container Apps environment:** det eksisterende `roadcue-test-env`
4. På fanen **Container** vælger du **Use quickstart image**\.
5. På fanen **Ingress**:
  - aktivér ingress;
  - vælg **Accepting traffic from anywhere** eller **External**;
  - behold quickstart\-porten, typisk `80`, under første oprettelse\.
6. Vælg **Review \+ create** → **Create**\.

VICO skal være eksternt tilgængelig, fordi Static Web Apps skal linke den som `/api`\-backend\. \.NET forbliver intern\.

## 12\. Konfigurér VICO identity, secrets og miljøvariabler

### 12\.1 Aktivér identity og ACR pull

Gentag trin 9\.3 og 9\.4 for `roadcue-vico-test`:

1. Slå **System assigned identity** til\.
2. Giv identiteten rollen **AcrPull** på dit Container Registry\.

### 12\.2 Opret OpenAI\-secret

1. Åbn `roadcue-vico-test`\.
2. Vælg **Settings** → **Secrets** → **Add**\.
3. Angiv:
  - **Key:** `openai-api-key`
  - **Value:** din OpenAI API\-nøgle
4. Gem\.

### 12\.3 Opret miljøvariabler

1. Vælg **Application** → **Containers** → **Edit and deploy**\.
2. Vælg containeren\.
3. Tilføj:

|Name                  |Source          |Value                    |
|----------------------|----------------|-------------------------|
|`OPENAI_API_KEY`      |Secret reference|`openai-api-key`         |
|`OPENAI_MODEL`        |Manual entry    |`gpt-4.1-mini`           |
|`ROADCUE_API_BASE_URL`|Manual entry    |`http://roadcue-api-test`|

4. Gem som en ny revision\.

`http://roadcue-api-test` bruger intern service discovery i samme Container Apps Environment\. Tilføj ikke database\-driver, SQL\-bruger eller connection string til VICO\.

Apps i samme environment kan kontakte apps med intern ingress; se Microsofts [Container Apps\-mikroservicearkitektur](https://learn.microsoft.com/en-us/azure/architecture/example-scenario/serverless/microservices-with-container-apps)\.

### 12\.4 Sæt VICO\-porten

1. Vælg **Settings** → **Ingress**\.
2. Behold **External** aktiveret\.
3. Skift **Target port** til `8000`\.
4. Vælg **Save**\.

Quickstart\-revisionen kan være unhealthy, indtil det rigtige VICO\-image deployes\.

## 13\. Tilføj health probes efter første rigtige deployment

Når Roadcue\-images er deployet i trin 19, skal hver app have en HTTP\-probe:

|App                |Path     |Port  |
|-------------------|---------|------|
|`roadcue-api-test` |`/health`|`8080`|
|`roadcue-vico-test`|`/health`|`8000`|

I hver Container App:

1. Vælg **Application** → **Containers**\.
2. Vælg **Edit and deploy**\.
3. Åbn containerens **Health probes**\.
4. Tilføj mindst en **Liveness**\-probe af typen HTTP\.
5. Brug den relevante path og port fra tabellen\.
6. Brug et roligt startinterval, eksempelvis initial delay på 10–20 sekunder\.
7. Gem som ny revision\.

Tilføj gerne en tilsvarende Readiness\-probe, når du har bekræftet, at `/health` ikke udfører tunge eller betalbare kald\.

## 14\. Opret Static Web App

Backend\-link til Container Apps kræver **Static Web Apps Standard**\. Det virker ikke i GitHub pull\-request preview environments\. Se Microsofts [begrænsninger og opsætning](https://learn.microsoft.com/en-us/azure/static-web-apps/apis-container-apps)\.

1. Søg efter `Static Web Apps`\.
2. Vælg **Create**\.
3. Udfyld:
  - **Subscription:** `Yatzy`
  - **Resource group:** `roadcue-test-rg`
  - **Name:** `roadcue-web-test`
  - **Plan type:** `Standard`
  - **Region for Azure Functions API and staging environments:** `West Europe`, hvis den tilbydes
4. Under **Deployment details** vælger du **Other** eller en tilsvarende manuel deployment\-kilde\.

Vælg ikke automatisk GitHub\-generering her, fordi repositoryet allerede indeholder `.github/workflows/azure-angular.yml`\. Ellers risikerer du to konkurrerende workflows\.

5. Vælg **Review \+ create** → **Create**\.
6. Åbn ressourcen\.
7. Vælg **Overview** → **Manage deployment token**\.
8. Kopiér tokenet til en password manager midlertidigt\. Det må ikke deles eller committes\.

Microsoft beskriver håndtering af deployment token [her](https://learn.microsoft.com/en-us/azure/static-web-apps/deployment-token-management)\.

## 15\. Link VICO som `/api`\-backend

Gør dette efter `roadcue-vico-test` findes og har external ingress\.

1. Åbn `roadcue-web-test`\.
2. Find **Settings** → **APIs** eller **Backend APIs**\.
3. Vælg **Link**\.
4. Vælg backendtypen **Container App**\.
5. Vælg:
  - **Subscription:** `Yatzy`
  - **Resource group:** `roadcue-test-rg`
  - **Container App:** `roadcue-vico-test`
6. Bekræft og gem linket\.

Angular kalder samme origin på `/api/agent/chat`\. VICO indeholder en `/api/agent/chat`\-alias, så frontend behøver ikke kende VICO\-appens offentlige hostnavn\.

## 16\. Opret identitet til GitHub Actions med OIDC

OIDC betyder, at GitHub kan logge sikkert ind i Azure uden en langtidsholdbar client secret\.

### 16\.1 Opret App Registration

1. Søg efter `Microsoft Entra ID`\.
2. Vælg **App registrations** → **New registration**\.
3. Angiv:
  - **Name:** `github-roadcue-deploy`
  - **Supported account types:** kun konti i dette directory/single tenant
  - **Redirect URI:** tom
4. Vælg **Register**\.
5. Kopiér disse værdier fra **Overview**:
  - **Application &#40;client&#41; ID**
  - **Directory &#40;tenant&#41; ID**
6. Find desuden **Subscription ID** under `Subscriptions` → `Yatzy` → **Overview**\.

### 16\.2 Opret federated credential

1. I `github-roadcue-deploy` vælger du **Certificates & secrets**\.
2. Vælg fanen **Federated credentials**\.
3. Vælg **Add credential**\.
4. Vælg scenariet **GitHub Actions deploying Azure resources**\.
5. Angiv præcist:
  - **Organization:** `mickni38-svg`
  - **Repository:** `Roadcue-VICO`
  - **Entity type:** `Environment`
  - **GitHub environment name:** `azure-production`
  - **Credential name:** `github-roadcue-azure-production`
6. Vælg **Add**\.

Navne og store/små bogstaver skal matche GitHub præcist\. Microsofts OIDC\-guide findes [her](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure-openid-connect), og portalflowet for GitHub federation findes [her](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation-create-trust#github-actions)\.

## 17\. Giv GitHub\-identiteten de nødvendige Azure\-roller

Brug mindst mulige rettigheder\.

### 17\.1 Container Apps

1. Åbn Resource Group `roadcue-test-rg`\.
2. Vælg **Access control &#40;IAM&#41;** → **Add role assignment**\.
3. Tildel rollen **Container Apps Contributor** til app registration/service principal `github-roadcue-deploy`\.

Hvis rollen ikke kan vælges på Resource Group\-niveau i din portal, tildel den separat på `roadcue-api-test` og `roadcue-vico-test`\.

### 17\.2 Push til Container Registry

1. Åbn dit Container Registry\.
2. Vælg **Access control &#40;IAM&#41;** → **Add role assignment**\.
3. Tildel **AcrPush** til `github-roadcue-deploy`\.
  - Ved et ABAC\-aktiveret registry skal du bruge den tilsvarende repository\-writer\-rolle\.

Giv ikke Owner eller bred Contributor på hele abonnementet, hvis de smallere roller virker\.

## 18\. Opret GitHub Environment, secrets og variables

Åbn [GitHub\-repositoriet](https://github.com/mickni38-svg/Roadcue-VICO)\.

### 18\.1 Opret environment

1. Vælg **Settings** → **Environments**\.
2. Vælg **New environment**\.
3. Navngiv det præcist `azure-production`\.
4. Vælg **Configure environment**\.
5. Du kan eventuelt kræve manuel godkendelse før production deployment\.

### 18\.2 Environment secrets

Under `azure-production` → **Environment secrets** opretter du:

|Secret                 |Værdi                            |
|-----------------------|---------------------------------|
|`AZURE_CLIENT_ID`      |Application (client) ID fra Entra|
|`AZURE_TENANT_ID`      |Directory (tenant) ID            |
|`AZURE_SUBSCRIPTION_ID`|ID for abonnementet `Yatzy`      |

Der skal ikke oprettes `AZURE_CLIENT_SECRET`, fordi workflowet bruger OIDC\.

### 18\.3 Repository variables

Gå til **Settings** → **Secrets and variables** → **Actions** → **Variables**, og opret:

|Variable                       |Eksempelværdi       |
|-------------------------------|--------------------|
|`AZURE_RESOURCE_GROUP`         |`roadcue-test-rg`   |
|`AZURE_CONTAINER_REGISTRY_NAME`|`roadcuetestacrmn38`|
|`AZURE_ROADCUE_API_APP_NAME`   |`roadcue-api-test`  |
|`AZURE_VICO_APP_NAME`          |`roadcue-vico-test` |

Brug registry\-navnet uden `.azurecr.io`\.

### 18\.4 Static Web Apps\-token

Gå til **Settings** → **Secrets and variables** → **Actions** → **Secrets**, og opret:

|Secret                           |Værdi                       |
|---------------------------------|----------------------------|
|`AZURE_STATIC_WEB_APPS_API_TOKEN`|token fra `roadcue-web-test`|

## 19\. Merge og udfør første deployment

1. Gennemgå draft PR [\#2](https://github.com/mickni38-svg/Roadcue-VICO/pull/2)\.
2. Når den er godkendt, markér den **Ready for review**, og merge den til `master`\.
3. Åbn repositoryets **Actions**\-fane\.
4. Kør workflows manuelt i denne rækkefølge:
  1. **Azure \- Roadcue API**
  2. **Azure \- VICO**
  3. **Azure \- Angular**
5. Vælg branchen `master`, når **Run workflow** spørger\.
6. Vent på grønt resultat for hvert workflow, før du starter det næste første gang\.

Rækkefølgen sikrer, at VICO først starter, når den interne \.NET\-service er tilgængelig\.

Hvis Container Apps ikke kan hente imaget:

- kontrollér `AcrPull` på appens managed identity;
- kontrollér, at Container App registry\-konfigurationen bruger managed identity;
- kontrollér, at workflowet faktisk har pushet imaget til det forventede registry\.

## 20\. Kontrollér Container App revisions

For begge apps:

1. Åbn Container App’en\.
2. Vælg **Application** → **Revision management**\.
3. Kontrollér, at den nyeste revision er **Healthy** og modtager 100 % trafik\.
4. Vælg **Monitoring** → **Log stream**\.
5. Kontrollér, at der ikke er secret\-, port\-, image pull\- eller databasefejl\.

For \.NET skal containerens image komme fra noget i stil med:

```text
roadcuetestacrmn38.azurecr.io/roadcue-api:<commit-sha>
```

For VICO skal det komme fra:

```text
roadcuetestacrmn38.azurecr.io/roadcue-vico:<commit-sha>
```

## 21\. Kontrollér Simply\.com\-forbindelsen

Kun `roadcue-api-test` må forbinde til Simply\.com\.

1. Åbn `roadcue-test-env`\.
2. Find environmentets **Outbound IP addresses** under **Overview**, **Properties** eller **Networking**\.
3. Hvis Simply\.com har IP\-allowlist/firewall, tilføj de nødvendige Azure outbound\-adresser dér\.
4. Brug krypteret databaseforbindelse og et database\-login med mindst mulige rettigheder\.
5. Kontrollér \.NET\-loggen for vellykket forbindelse og migrations\-/seed\-fejl\.

> Vigtigt: Outbound IP-adresser i en simpel Consumption-opsætning kan ændre sig. Hvis Simply.com kræver én stabil allowlist-IP til produktion, skal Container Apps Environment senere bruge workload profiles, VNet og NAT Gateway eller en anden kontrolleret egress-løsning. Microsoft beskriver netværksforholdene [her](https://learn.microsoft.com/en-us/azure/container-apps/networking).

Python/VICO må kun have denne dataforbindelse:

```text
VICO → http://roadcue-api-test → Simply.com SQL
```

## 22\. Sluttest

### 22\.1 Test VICO health

1. Åbn `roadcue-vico-test` → **Overview**\.
2. Kopiér **Application Url**\.
3. Åbn:

```text
https://<vico-host>/health
```

Du skal få et succesfuldt svar uden et OpenAI\-kald\.

### 22\.2 Test Angular

1. Åbn `roadcue-web-test` → **Overview**\.
2. Åbn webappens URL\.
3. Kontrollér, at Angular\-applikationen indlæses over HTTPS\.
4. Kontrollér browserens Developer Tools → **Network** for 404\-, CORS\- eller mixed\-content\-fejl\.

### 22\.3 Test same\-origin API\-routing

Fra Angular\-hostens domæne skal kaldet gå til:

```text
https://<angular-host>/api/agent/chat
```

Det skal routes af Static Web Apps til `roadcue-vico-test`\. Angular må ikke kalde databasen eller have en connection string\.

Et rigtigt chatkald kan bruge OpenAI\-kredit\. Brug først en kort, kontrolleret test, og bekræft at samme `thread_id` genbruges i samtalen\.

## 23\. Sikkerhedskontrol

Kontrollér alle punkter:

- [ ] \.NET er kun tilgængelig internt i Container Apps Environment\.
- [ ] VICO er den eneste offentlige Container App\.
- [ ] Angular bruger `/api/agent/chat` på samme origin\.
- [ ] Kun \.NET har `ConnectionStrings__Roadcue`\.
- [ ] VICO har ingen database\-secret\.
- [ ] Angular har ingen server\-secrets\.
- [ ] OpenAI\-nøglen ligger kun som Azure Container App\-secret\.
- [ ] GitHub bruger OIDC og har ingen Azure client secret\.
- [ ] Container Apps bruger managed identity til at hente images fra ACR\.
- [ ] ACR admin user er deaktiveret\.
- [ ] GitHub\-identiteten har ikke Owner på abonnementet\.
- [ ] Health endpoints foretager ikke OpenAI\-kald\.
- [ ] Budgetalarmer er aktive\.

## 24\. Typiske fejl

### `unauthorized` eller `pull access denied` fra ACR

- Kontrollér managed identity på Container App’en\.
- Kontrollér `AcrPull`/repository reader på ACR\.
- Kontrollér registry\-navnet i GitHub variable\.
- Kontrollér, at Container App registry\-indstillingen bruger identity og ikke tomme credentials\.

### GitHub OIDC\-login fejler

- Kontrollér client\-, tenant\- og subscription\-ID\.
- Kontrollér at federated credential bruger organization `mickni38-svg` og repository `Roadcue-VICO`\.
- Kontrollér at entity type er **Environment** med præcis `azure-production`\.
- Kontrollér at workflow\-jobbet bruger samme GitHub Environment\.

### Container App er unhealthy

- \.NET skal lytte på port `8080`\.
- VICO skal lytte på port `8000`\.
- Kontrollér target port og `/health`\.
- Kontrollér appens **Log stream** og seneste revision\.

### VICO kan ikke nå \.NET

- Begge apps skal ligge i `roadcue-test-env`\.
- \.NET ingress skal være aktiveret og intern\.
- `ROADCUE_API_BASE_URL` skal være `http://roadcue-api-test`\.
- Brug ikke Pod\-IP, localhost eller Simply\.com fra VICO\.

### Angular får 404 på `/api/agent/chat`

- Kontrollér at Static Web App er på Standard\-planen\.
- Kontrollér backend\-linket til `roadcue-vico-test`\.
- Test på production\-URL’en; backend\-linket understøttes ikke i PR\-preview environments\.
- Kontrollér at Angular\-workflowet deployede den forventede build\-mappe\.

### \.NET kan ikke forbinde til Simply\.com

- Kontrollér secret reference og navnet `ConnectionStrings__Roadcue`\.
- Kontrollér TLS/Encrypt\-parametre i connection string\.
- Kontrollér Simply\.com firewall/IP\-allowlist\.
- Kontrollér environmentets outbound IP\-adresser\.

## 25\. Ressourcer, der skal kunne ses til sidst

Filtrér **All resources** på Resource Group `roadcue-test-rg`\. Du skal mindst se:

- `roadcue-test-logs` — Log Analytics Workspace
- `roadcuetestacr<unik>` — Container Registry
- `roadcue-test-env` — Container Apps Environment
- `roadcue-api-test` — Container App
- `roadcue-vico-test` — Container App
- `roadcue-web-test` — Static Web App

Azure kan også oprette administrerede eller skjulte understøttelsesressourcer\. Slet dem ikke enkeltvis uden at kontrollere deres tilknytning\.

## 26\. Stop eller fjern testmiljøet

Container Apps på Consumption kan skalere ned, men ACR, Static Web Apps Standard, logs og netværkstrafik kan stadig koste penge\.

Hvis hele testmiljøet skal fjernes:

1. Åbn Resource Group `roadcue-test-rg`\.
2. Kontrollér nøje, at gruppen ikke indeholder ressourcer fra andre projekter\.
3. Vælg **Delete resource group**\.
4. Indtast gruppens navn og bekræft\.

Dette sletter Azure\-ressourcerne i gruppen, men ikke databasen hos Simply\.com, GitHub\-repositoriet eller OpenAI\-kontoen\.

---

Guideversion: 2026\-08\-24\. Azure Portal ændrer løbende navne og placeringer i menuerne; brug portalens øverste søgefelt, hvis et menupunkt har fået et nyt navn\.
