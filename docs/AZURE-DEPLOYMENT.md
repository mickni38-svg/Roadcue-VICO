# Roadcue Azure deployment

Roadcue deployes som tre selvstændige workloads:

- Angular i Azure Static Web Apps.
- Roadcue .NET 10 API i Azure Container Apps.
- Python/FastAPI/VICO i Azure Container Apps.
- Images til de to Container Apps i Azure Container Registry.
- SQL Server forbliver hos Simply.com og må kun tilgås af .NET API'et.

AKS, Minikube og Helm indgår ikke i denne deployment.

## 1. Opret Azure-ressourcer manuelt

Før workflows aktiveres, skal følgende eksistere:

1. En Resource Group.
2. Et Azure Container Registry.
3. Et Container Apps Environment.
4. En Container App til `roadcue-api` med port `8080` og health path `/health`.
5. En Container App til `roadcue-vico` med port `8000` og health path `/health`.
6. En Azure Static Web App til Angular.
7. Et federated service principal/OIDC-login til GitHub med mindst nødvendige rettigheder til registryet og de to Container Apps.

Azure-ressourcerne oprettes ikke automatisk af repositoryets workflows. Det forhindrer utilsigtet oprettelse af betalbare ressourcer.

## 2. Container App-konfiguration

### Roadcue API

Konfigurér disse miljøværdier/secrets på .NET Container App:

| Navn | Type | Formål |
|---|---|---|
| `ConnectionStrings__Roadcue` | Secret reference | Simply.com SQL connection string; findes kun på .NET |
| `Cors__AllowedOrigins__0` | Environment value | Den eksakte HTTPS-origin til Angular Static Web App |
| `ASPNETCORE_ENVIRONMENT` | Environment value | Eksempelvis `Production` |

Databasen skal tillade en krypteret forbindelse fra .NET-workloadens Azure-egress. Del aldrig connection string med Angular eller VICO.

### VICO

Konfigurér disse værdier på Python Container App:

| Navn | Type | Formål |
|---|---|---|
| `OPENAI_API_KEY` | Secret reference | Modeladgang til runtime; aldrig til automatiske tests |
| `OPENAI_MODEL` | Environment value | Den godkendte model |
| `ROADCUE_API_BASE_URL` | Environment value | HTTPS-base-URL til .NET Container App |
| `CORS_ALLOWED_ORIGINS` | Environment value | Den eksakte Angular-origin; flere origins separeres med komma |

VICO må ikke få `ConnectionStrings__Roadcue`, en Simply.com-connection string eller en SQL-fallback.

## 3. GitHub environment

Opret GitHub Environment `azure-production`. Tilføj følgende secrets:

| Secret | Formål |
|---|---|
| `AZURE_CLIENT_ID` | OIDC application/client ID |
| `AZURE_TENANT_ID` | Microsoft Entra tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Deploymenttoken til Static Web App |

Tilføj følgende GitHub repository variables. De er ikke hemmelige, men bruges af workflows til at finde de på forhånd oprettede ressourcer:

| Variable | Eksempel/indhold |
|---|---|
| `AZURE_RESOURCE_GROUP` | Navnet på Resource Group |
| `AZURE_CONTAINER_REGISTRY_NAME` | ACR-navn uden `.azurecr.io` |
| `AZURE_ROADCUE_API_APP_NAME` | Navnet på .NET Container App |
| `AZURE_VICO_APP_NAME` | Navnet på Python Container App |
| `AZURE_ROADCUE_API_BASE_URL` | .NET-appens offentlige HTTPS-base-URL |
| `AZURE_VICO_BASE_URL` | VICO-appens offentlige HTTPS-base-URL |

Secretværdier må ikke skrives i workflowfiler, appsettings, Angular-buildet eller logs.

## 4. Første deployment

1. Verificér lokale builds og tests.
2. Opret de tomme Container Apps med placeholder-images eller deploy første image manuelt.
3. Konfigurér miljøværdier, secret references, ingress, health probes og CORS.
4. Kør hvert workflow manuelt med `workflow_dispatch`.
5. Kontrollér at images er tagget med Git commit-SHA.
6. Kontrollér at Container Apps bruger de forventede SHA-tags.
7. Verificér Angulars genererede `runtime-config.js` uden at lægge secrets i filen.

Ved push til `master` deployer kun workflows, hvis den relevante komponentsti er ændret.

## 5. Røgtest

- Åbn Angular-appens HTTPS-URL og kontrollér, at app-shell og PWA-assets indlæses.
- Kald .NET `/health`; forvent HTTP 200 uden database- eller OpenAI-kald.
- Kald VICO `/health`; forvent HTTP 200 uden database- eller OpenAI-kald.
- Send en testbesked gennem Angular til VICO og kontrollér et gyldigt `thread_id`.
- Udfør et VICO-flow, der bruger et godkendt .NET-tool, og kontrollér VICO → .NET.
- Kald et eksisterende .NET-endpoint, der læser Simply.com-data, og kontrollér .NET → database.
- Kontrollér i VICO- og Angular-konfigurationen, at ingen database-secret findes.
- Kontrollér CORS fra Angular-origin og bekræft, at en ikke-godkendt origin afvises.

## 6. Skalering og state

VICO bruger aktuelt samtalestate, som kan være bundet til processens memory. Start med én replica og uden uverificeret scale-to-zero. Før flere replicas aktiveres, skal LangGraph-state gøres persistent eller begrænsningen accepteres eksplicit.
