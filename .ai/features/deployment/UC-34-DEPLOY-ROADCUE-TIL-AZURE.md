# UC-34 – Deploy Roadcue til Azure

**Fase:** POC/MVP-drift  
**Status:** Planlagt – Azure-konfiguration er ikke implementeret endnu  
**Primær aktør:** Systemejer  
**Mål:** Roadcue kan bygges og deployes reproducerbart til Azure, mens komponenternes eksisterende ansvar og databasegrænser bevares.

## Nuværende fundament

- Angular-klienten ligger i `src/Roadcue.Web/`.
- Roadcue .NET 10 API og de øvrige C#-lag ligger under `src/`.
- Python/FastAPI/VICO ligger i `vico/`.
- Databasen forbliver hos Simply.com.
- Python/VICO henter Roadcue-data gennem godkendte HTTP-kald til .NET API'et.
- Kun .NET må kende databasens connection string eller forbinde til databasen.

## Målarkitektur

- Angular deployes som Azure Static Web App.
- Roadcue .NET 10 API deployes som en selvstændig Azure Container App.
- Python/FastAPI/VICO deployes som en selvstændig Azure Container App.
- .NET- og Python-images opbevares i Azure Container Registry.
- GitHub Actions bygger, tester og deployer komponenterne fra repositoryet.
- Simply.com-databasen forbliver ekstern og tilgås udelukkende af .NET.
- Løsningen anvender ikke AKS, Minikube eller Helm.

## Forudsætninger

- Et Azure-abonnement og en GitHub-forbindelse er tilgængelige.
- Nødvendige Azure-ressourcenavne, region og miljønavne vælges før oprettelse.
- Simply.com tillader en krypteret databaseforbindelse fra den deployede .NET-service.
- Hemmeligheder kan gemmes som Azure-secrets eller i Key Vault og må ikke committes.
- De eksisterende build- og testkommandoer kan køres uden live OpenAI-kald.

## Hovedflow

1. Systemejer opretter én Resource Group, ét Azure Container Apps Environment og ét Azure Container Registry.
2. .NET API'et bygges som et Linux-container-image og publiceres i registryet.
3. Python/FastAPI/VICO bygges som et separat Linux-container-image og publiceres i registryet.
4. De to images deployes som hver sin Azure Container App.
5. Python konfigureres med .NET API'ets URL, men uden database-driverkonfiguration eller connection string.
6. Kun .NET Container App konfigureres med Simply.com-databasens connection string som secret.
7. Angular bygges som produktionsbuild og deployes til Azure Static Web Apps.
8. Angular konfigureres med de nødvendige offentlige API-adresser eller en dokumenteret routingstrategi.
9. CORS begrænses til den faktiske Static Web App-origin og eventuelle udtrykkeligt godkendte miljøer.
10. GitHub Actions udfører relevante builds og tests før deployment og deployer kun den berørte komponent.
11. Systemejer udfører røgtests af Angular, VICO, .NET API og det tilladte .NET-til-database-flow.

## Deployment- og sikkerhedsregler

- .NET og Python skal have separate Dockerfiles, images og Container Apps.
- Python og .NET må ikke pakkes i samme container eller deployes som én fælles service.
- Angular må ikke indeholde databaseoplysninger eller andre serverhemmeligheder.
- Python må ikke have en Simply.com-connection string og må ikke forbinde direkte til SQL.
- VICO må kun hente eller ændre Roadcue-data gennem godkendte .NET-endpoints.
- Database-, OpenAI- og deployment-hemmeligheder må ikke ligge i repositoryet eller i frontend-buildet.
- Produktionsendpoints skal anvende HTTPS.
- Health checks og logs skal kunne skelne mellem .NET- og Python-servicen.
- Skalering af Python må ikke aktiveres på en måde, der mister eller splitter nødvendig LangGraph-samtalestate. Ved in-memory state skal begrænsningen dokumenteres.

## GitHub Actions

- Angular, .NET og Python har adskilte build/deployment-jobs eller workflows.
- Path filters forhindrer unødvendig deployment af uberørte komponenter.
- .NET-tests, Python-tests og Angular-tests/build køres uden live OpenAI-kald.
- Images tagges sporbarligt, eksempelvis med commit-SHA, og deployment må ikke afhænge af et lokalt `latest`-image.
- Workflows refererer kun til GitHub/Azure secrets via secret-navne; værdier må ikke skrives i YAML eller logs.
- En fejlet build eller test stopper deployment af den pågældende komponent.

## Alternative flows

- Hvis Azure-ressourcerne ikke findes, stopper deployment med en tydelig fejl; workflowet må ikke opfinde ressourcenavne.
- Hvis en secret mangler, stopper den berørte deployment uden at udskrive secretens værdi.
- Hvis Simply.com afviser forbindelsen, forbliver Python og Angular uden databaseadgang, og fejlen diagnosticeres i .NET-laget.
- Hvis Python ikke kan nå .NET API'et, returnerer VICO en kontrolleret servicefejl og forsøger ikke direkte databaseadgang.
- Hvis en røgtest fejler, betragtes deploymenten ikke som godkendt.
- Manuel deployment kan bruges til første verificering, før automatiseret deployment aktiveres.

## Acceptkriterier

- [ ] Angular kan bygges og deployes til Azure Static Web Apps.
- [ ] .NET 10 API'et kan bygges som et selvstændigt image og køre som Azure Container App.
- [ ] Python/FastAPI/VICO kan bygges som et selvstændigt image og køre som Azure Container App.
- [ ] .NET- og Python-images publiceres i Azure Container Registry med sporbare tags.
- [ ] Python kalder Roadcue-data gennem .NET API'et og har ingen direkte databasekonfiguration.
- [ ] Kun .NET Container App har Simply.com-connection string.
- [ ] Angular indeholder ingen database- eller serverhemmeligheder.
- [ ] CORS tillader den godkendte Angular-origin uden at være åbent for alle origins i produktion.
- [ ] GitHub Actions bygger, tester og deployer de tre komponenter med relevante path filters.
- [ ] Automatiske tests foretager ingen live kald til OpenAI eller andre betalte AI-tjenester.
- [ ] Secrets er ikke committed eller udskrevet i workflowlogs.
- [ ] HTTPS, health checks og central logning er konfigureret for de offentlige services.
- [ ] En dokumenteret røgtest bekræfter Angular → VICO, Angular → .NET, VICO → .NET og .NET → Simply.com.
- [ ] Løsningen introducerer ikke AKS, Minikube eller Helm.

## Uden for scope

- Flytning af databasen fra Simply.com til Azure SQL.
- Direkte databaseadgang fra Python eller Angular.
- AKS, Minikube, Helm eller Kubernetes-manifester.
- Sammenpakning af .NET og Python i samme container.
- Ændringer i Roadcues domæneregler, agentlogik eller eksisterende use-case-adfærd.
- Oprettelse af produktionsressourcer som del af denne dokumentationsændring.
- Valg af endelige priser, autoskaleringsgrænser eller disaster-recovery-strategi.

## Resultat

- Roadcue har en godkendelig deploymentkontrakt for Azure Static Web Apps og Azure Container Apps, som bevarer .NET som eneste databaseejer og gør hver komponent selvstændigt byggbar, testbar og deploybar.
