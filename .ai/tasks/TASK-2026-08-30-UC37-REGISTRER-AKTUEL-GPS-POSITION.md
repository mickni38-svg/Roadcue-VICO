# Task: Registrer chaufførens aktuelle GPS-position (UC-37)

**Dato:** 2026-08-30  
**Status:** In Progress  
**Use case:** [../features/UC-37-REGISTRER-AKTUEL-GPS-POSITION.md](../features/UC-37-REGISTRER-AKTUEL-GPS-POSITION.md)  
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

## Verificeret udgangspunkt

- `DriverLocation` og `DbSet<DriverLocation>` fandtes allerede.
- Speed/heading var NOT NULL og accuracy manglede.
- Angular havde ingen location-feature.
- Browser-API'er skal ligge bag adaptere, og C# ejer SQL/validering.

## Påvirkning

| Område | Ændring |
|---|---|
| Angular | Geolocation-adapter, sync-service, app composition og tests |
| C# | Location service/repository/context/controller |
| Python/VICO | Ingen |
| SQL | Accuracy nullable + speed/heading nullable + index på DriverId/RecordedAt |
| Config | Location thresholds + serverstyret simulated driver id |
| CI | Application tests køres i API workflow |

## Implementeringsplan

1. Udvid domænemodel og migration.
2. Tilføj Location application-kontrakter og deterministiske regler.
3. Implementér repository og current-driver-context.
4. Tilføj API-endpoints.
5. Tilføj Angular Geolocation-adapter og sync-service.
6. Tilføj tests og valider CI/migration.

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
- [x] API build og idempotent EF migration generation er grøn i GitHub Actions.
- [ ] Nye xUnit LocationService-tests er kørt i den opdaterede workflow.
- [ ] API workflow med den nye test-step er fuldt grønt.
- [ ] Production migration/deploy er fuldført.

## Risici og åbne spørgsmål

- Production skal have `SimulatedCurrentDriver__DriverId` sat til et eksisterende driver-GUID, indtil rigtig authentication overtager `ICurrentDriverContext`.
- Persistent consent/withdrawal og retention-politik er ikke del af UC-37.

## Implementeringslog

- Ændrede filer: `Roadcue.Application/Locations/*`, `DriverLocation`, `DriverLocationRepository`, `LocationController`, `SimulatedCurrentDriverContext`, `RoadcueDbContext`, EF migration/snapshot, Angular `features/location/*`, `app.config.ts`, `proxy.conf.json`, `appsettings.json`, API workflow og tests.
- Vigtige beslutninger: GPS-identitet kan ikke komme fra request/prompt; POC bruger serverkonfigureret driver-GUID. Freshness og route-egnethed beregnes i C#.
- Afvigelser fra planen: Ingen VICO/Python-ændringer. Production-routing for Static Web Apps ændres ikke, fordi den ikke er dokumenteret i repoet som en filbaseret proxy; kun den eksisterende lokale Angular proxy er udvidet.

## Resultat af validering

- Automatiske tests: Angular workflow har gennemført `npm test` og `npm run build` grønt. API workflow har gennemført restore/build og EF idempotent script-generation grønt; nyt workflow med xUnit-step afventes.
- Manuel kontrol: Ikke udført med real GPS; use casen kræver ikke real device GPS til automatiske tests.
- Resterende begrænsninger: Server-side simulated driver-id skal konfigureres i deployment-miljøet før endpointet accepterer positionssamples.
