# Task: Registrer chaufførens aktuelle GPS-position (UC-37)

**Dato:** 2026-08-30  
**Status:** Done  
**Use case:** [../features/done/UC-37-REGISTRER-AKTUEL-GPS-POSITION.md](../features/done/UC-37-REGISTRER-AKTUEL-GPS-POSITION.md)  
**Type:** Feature

## Resultat

Roadcue Web henter GPS via browserens W3C Geolocation API og sender samples til Roadcue.Api. C# validerer og gemmer positionsdata for en backend-bestemt chauffør og returnerer deterministisk freshness og præcisionsstatus.

## Scope

**Med**

- Udvid eksisterende `DriverLocation` med nullable accuracy/speed/heading.
- Application service/repository-kontrakt for validering, freshness og præcision.
- `POST /api/location/current` og `GET /api/location/current` uden client-sendt `driverId`.
- Serverstyret `ICurrentDriverContext` til POC.
- Angular `features/location/` med Geolocation-adapter og `LocationSyncService`.
- EF migration og tests med simulerede GPS-data.

**Ikke med**

- Rigtig login/Entra authentication.
- Deling af position med venner.
- Movement-status, route-deviation, truck-routing, Trip lifecycle eller Route Context.
- Background tracking når browser/PWA er suspenderet.
- Google Maps/Directions eller betalt GPS SDK.
- Nyt VICO-tool.

## Implementeringsspecifikke acceptkriterier

- [x] POST-kontrakten indeholder intet `driverId`; identitet kommer fra `ICurrentDriverContext`.
- [x] POC-current-driver-context er serverstyret og udskifteligt.
- [x] Ugyldige koordinater/timestamps/negative kvalitetsværdier afvises.
- [x] Accuracy, speed og heading kan være null.
- [x] Dårlig accuracy kan gemmes men markeres ikke egnet til præcis rutesammenligning.
- [x] Seneste position vælges efter `RecordedAt`.
- [x] Freshness afgøres deterministisk i C#.
- [x] Permission denied medfører ingen POST/fallback-position.
- [x] Angular tilgår geolocation via adapter.
- [x] Python/LLM har ingen direkte databaseadgang.

## Valideringsplan

- [x] Angular unit tests og build er grønne i GitHub Actions.
- [x] .NET application tests er grønne i GitHub Actions.
- [x] API build er grøn.
- [x] Idempotent EF migration script genereres grønt.
- [x] Migration er kørt mod Simply.com SQL Server.
- [x] API container er bygget, pushed og deployet til Azure Container Apps.

## Risici og åbne spørgsmål

- Production skal have `SimulatedCurrentDriver__DriverId` sat til et eksisterende driver-GUID, indtil rigtig authentication overtager `ICurrentDriverContext`.
- Persistent consent/withdrawal og retention-politik er ikke del af UC-37.

## Implementeringslog

- Ændrede filer: `Roadcue.Application/Locations/*`, `DriverLocation`, `DriverLocationRepository`, `LocationController`, `SimulatedCurrentDriverContext`, `RoadcueDbContext`, EF migration/snapshot, Angular `features/location/*`, `app.config.ts`, `proxy.conf.json`, `appsettings.json`, API workflow og tests.
- Vigtige beslutninger: GPS-identitet kommer aldrig fra request/prompt; POC bruger serverkonfigureret driver-GUID. Freshness og route-egnethed beregnes i C#.
- Afvigelser fra planen: Ingen VICO/Python-ændringer. Production-routing for Static Web Apps blev ikke ændret, fordi repoet ikke dokumenterer en filbaseret backend-proxy; kun eksisterende lokal Angular proxy blev udvidet.

## Resultat af validering

- Automatiske tests: Angular `npm test` + build grøn. .NET application tests grøn. EF script-generation grøn.
- Deployment: Simply.com migration grøn; Azure API deploy grøn; Angular deploy grøn.
- Manuel kontrol: Ikke udført med real GPS; automatiske tests bruger simulerede samples som krævet.
- Resterende begrænsninger: `SimulatedCurrentDriver__DriverId` skal konfigureres server-side, ellers returnerer location-endpointet 401 og gemmer ingen position.
