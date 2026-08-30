# Task: Registrer chaufførens aktuelle GPS-position (UC-37)

**Dato:** 2026-08-30  
**Status:** Ready  
**Use case:** [../features/UC-37-REGISTRER-AKTUEL-GPS-POSITION.md](../features/UC-37-REGISTRER-AKTUEL-GPS-POSITION.md)  
**Type:** Feature

## Resultat

Når Roadcue Web kører og brugeren har givet browserens lokationstilladelse, kan Angular hente enhedens GPS-position via W3C Geolocation API og sende validerede positionssamples til Roadcue.Api. C# gemmer samples som beskyttede Roadcue-data for den aktuelle, backend-bestemte chauffør og kan returnere den senest gyldige position med eksplicit information om freshness og egnethed til præcis rutesammenligning.

Implementeringen danner fundament for UC-38, UC-39 og senere UC-35 uden at indføre routing eller route-deviation i denne task.

## Scope

**Med**

- Genbrug og udvid den eksisterende `DriverLocation`-model i `Roadcue.Domain` frem for at oprette en parallel GPS-model.
- Gør `speed` og `heading` valgfrie og tilføj `accuracyMeters`, så modellen matcher data fra browserens Geolocation API.
- Application-lag for lokation med:
  - validering af latitude, longitude, timestamp, accuracy, speed og heading;
  - en eksplicit freshness-vurdering;
  - en eksplicit vurdering af om samplet er egnet til præcis route-deviation-sammenligning;
  - repository-interface til lagring og opslag af seneste gyldige position.
- Infrastructure-repository over eksisterende `RoadcueDbContext.DriverLocations`.
- API-kontrakt uden frit `driverId` i request-body eller URL for den aktuelle chaufførs position:
  - `POST /api/location/current` til at registrere et sample;
  - `GET /api/location/current` til at hente seneste position og dens kvalitets-/freshness-status.
- Et lille `ICurrentDriverContext`-abstraktionspunkt, så controller/application ikke stoler på et driver-id fra VICO-prompten eller GPS-payloaden.
- POC-implementation af `ICurrentDriverContext`, der kun må være aktiv når et kontrolleret simuleret driver-id er konfigureret server-side. Den skal kunne udskiftes med login/token-baseret context uden at ændre LocationService eller endpoint-kontrakten.
- Angular feature `features/location/` med:
  - `GeolocationAdapter` omkring `navigator.geolocation`;
  - `LocationSyncService` som bruger `HttpClient` og same-origin `/api/location/current`;
  - start/stop af `watchPosition` mens Roadcue-webappen er aktiv;
  - ingen HTTP-request når browseren afviser eller mangler lokationstilladelse.
- Dev-/Azure-routing til C# API for `/api/location`, efter samme mønster som `/api/speech` og `/api/drivers`.
- EF Core migration for `AccuracyMeters` og nullable speed/heading, hvis den faktiske eksisterende database-model kræver det.
- Unit-/integrationstests med simulerede GPS-samples; ingen real GPS og ingen live OpenAI-/eksterne API-kald.

**Ikke med**

- Rigtig login/Entra/authentication eller en generel autorisationsplatform. UC-37 introducerer kun et udskifteligt current-driver-context og en serverstyret POC-resolver; rigtig identitet skal senere levere samme interface.
- En klientstyret `driverId`-header, query parameter eller payload som autoritativ identitet.
- Deling af position med venner eller adgang til andre chaufførers positioner.
- Movement-status, stop-detektion eller historiske bevægelsesanalyser.
- Route-deviation, tolerance/hysterese eller rerouting; dette hører til UC-35 efter UC-38/39.
- Truck-routing, Trip-lifecycle eller Route Context.
- Baggrundslokation når PWA/browseren er lukket eller suspenderet.
- Google Maps, Google Directions eller betalt GPS-SDK.
- Nyt VICO-tool i denne task. C#-endpoint/service gør positionen tilgængelig for senere godkendte tools.

## Verificeret udgangspunkt

- UC-37 kræver latitude/longitude/recordedAt samt valgfri accuracy/speed/heading; ugyldige eller stale data må ikke fremstilles som sikre aktuelle data, og tests skal bruge simuleret GPS.  
- `.ai/external-apis/LOCATION-GPS.md` godkender kun browserens `navigator.geolocation` til device GPS og kræver adapter/mocks i tests.
- `.ai/domain/03-IDENTITY-LOCATION-AND-CONSENT.md` kræver, at autoritativt driver-id i MVP kommer fra login/token eller godkendt request context. Navneopslag er ikke sikker identitet, og position er beskyttet data.
- Der findes endnu ingen authentication/current-driver-context i API'et. `DriversController` tager i dag `driverId` direkte i friends-route, så den nuværende API kan ikke opfylde UC-37's identitetskrav ved blot at kopiere dette mønster.
- `src/Roadcue.Domain/Drivers/DriverLocation.cs` findes allerede med `Id`, `DriverId`, `Latitude`, `Longitude`, `SpeedKmh`, `Heading`, `RecordedAt` og navigation til `Driver`. `SpeedKmh` og `Heading` er i dag obligatoriske doubles, og `AccuracyMeters` findes ikke.
- `RoadcueDbContext` har allerede `DbSet<DriverLocation> DriverLocations`; lokationsdata er således allerede placeret i det korrekte C#/SQL-ejerskab, men der findes ingen dedikeret Location application-service, repository eller API-controller.
- De eksisterende initiale migrationer oprettede den nuværende DriverLocation-model; seneste migration er UC-36's `AddTripsAndDestination`.
- Angular har kun `features/voice/`. Frontend-arkitekturen kræver, at browser-API'er som Geolocation wrappes bag adapter + InjectionToken, og at HTTP går gennem `HttpClient`.
- `proxy.conf.json` har allerede specifikke C#-routes for `/api/speech` og `/api/drivers` før den brede `/api`-route til VICO; `/api/location` skal følge dette mønster.
- Python/VICO har ingen GPS-tool i dag. Denne task behøver ikke ændre LangGraph for at gøre lokationen til vedvarende Roadcue-kontekst.
- Produktionsdatabasen ligger hos Simply.com. En ny EF migration vil automatisk blive omsat til idempotent SQL og kørt af den eksisterende API-deploymentpipeline før container-deploy.

## Påvirkning

| Område | Forventet ændring |
|---|---|
| Angular | Ny `features/location/` med Geolocation-adapter, sync-service, mocks/tests og opstartskomposition. |
| C# API/Application/Domain/Infrastructure | Location endpoint/service/repository/current-driver-context; eksisterende `DriverLocation` udvides. |
| Python/VICO | Ingen. |
| SQL/migration | `DriverLocations`: ny nullable `AccuracyMeters`; `SpeedKmh` og `Heading` gøres nullable hvis de i nuværende schema er NOT NULL. Ingen ny parallel location-tabel. |
| Kontrakter/config | Nye `/api/location/current` POST/GET-kontrakter samt server-side POC current-driver-id config. Proxy-rute til C# API. |
| Tests/dokumentation | Nye C# location-tests og Angular adapter/service-tests. Ingen live GPS, OpenAI eller ekstern provider. |

## Implementeringsplan

1. **Domænemodel og database-baseline.** Verificér den aktuelle `DriverLocations`-migration/schema, ændr `DriverLocation.SpeedKmh`/`Heading` til nullable og tilføj `AccuracyMeters?`. Konfigurér relevante felter eksplicit i `RoadcueDbContext` og generér en målrettet EF migration.
2. **Location-kontrakter og validering.** Opret `Roadcue.Application/Locations/` med request/result DTO'er, `ILocationService`, `IDriverLocationRepository` og rene validerings-/freshness-regler. Afvis latitude uden for `[-90,90]`, longitude uden for `[-180,180]`, fremtidige/åbenlyst ugyldige timestamps, negativ accuracy/speed og heading uden for det aftalte interval. Bevar rå sample-timestamp som `RecordedAt`.
3. **Freshness og præcision.** Gør grænserne konfigurerbare via `LocationOptions` med konservative defaults til POC (fx max alder for `Current` og max accuracy for `PreciseRouteComparison`). Returnér status som strukturerede felter frem for at lade VICO/LLM gætte ud fra tallet.
4. **Persistens.** Implementér repository i Infrastructure. Gem validerede samples append-only og hent seneste gyldige sample pr. `DriverId` sorteret på `RecordedAt`; en ældre sample må ikke erstatte den logiske "seneste" blot fordi den ankommer senere.
5. **Aktuel chauffør-context.** Definér `ICurrentDriverContext` ved API/Application-grænsen. POC-implementationen læser et serverstyret simuleret driver-id fra config og verificerer, at driveren findes. Endpointet accepterer aldrig driver-id fra GPS-payload eller prompt. Hvis current-driver-context ikke kan etableres, returneres 401/403-lignende fejl frem for at gemme data på en vilkårlig driver.
6. **API.** Tilføj `LocationController` med `POST /api/location/current` og `GET /api/location/current`. POST validerer gennem service, gemmer kun accepterede samples og returnerer en kompakt position/status. GET returnerer seneste sample plus `isCurrent`, `ageSeconds`, accuracy og `isSuitableForPreciseRouteComparison`; 404 når ingen position findes.
7. **Angular Geolocation-adapter.** Opret `features/location/geolocation.adapter.ts` med `watchPosition`/stop-kontrakt og browser-implementation over `navigator.geolocation`. Oversæt permission-denied/unavailable/timeout til kontrollerede fejl uden HTTP-fallback eller fabrikerede koordinater.
8. **Angular sync-service.** Opret `LocationSyncService` som starter watch, mapper browserens `GeolocationPosition` til API-payload og POSTer til `/api/location/current`. Brug kun `HttpClient`; throttle/deduplikér kun hvis nødvendigt for at undgå unødvendig trafik uden at ændre samplets `recordedAt`. Stop watch ved app-destroy/unload så vidt browseren tillader.
9. **Komposition/routing.** Start tracking fra appens composition/root uden at lægge browser-/forretningslogik i root-komponenten. Tilføj `/api/location` som specifik C#-proxy/backend-route før den generelle VICO `/api`-route.
10. **Tests.** Tilføj C# tests for validering, freshness, accuracy, newest-sample selection, unknown current driver og manglende location. Tilføj Angular tests med fake Geolocation-adapter + `HttpTestingController` for permission denied, korrekt payload, optional speed/heading og stop. Ingen test må bruge real device GPS eller OpenAI.
11. **Validering.** Kør .NET build/tests, Angular build/tests og generér/inspectér EF migrationen. Manuel POC-kontrol må bruge browserens devtools/simuleret location; real GPS er ikke nødvendigt for at godkende tasken.

## Implementeringsspecifikke acceptkriterier

- [ ] `POST /api/location/current` har intet `driverId` i request body, route eller query; driveren bestemmes af `ICurrentDriverContext`.
- [ ] POC current-driver-context er serverstyret og tydeligt markeret som simulated/test context; den kan erstattes af senere login/token-context uden ændring af LocationService.
- [ ] En sample med ugyldige koordinater/timestamp afvises og persisteres ikke.
- [ ] `accuracyMeters`, `speedKmh` og `heading` kan være `null` uden at samplet afvises.
- [ ] En position kan godt gemmes selv om accuracy er for lav til præcis rutesammenligning; response markerer i så fald `isSuitableForPreciseRouteComparison = false`.
- [ ] `GET /api/location/current` vælger seneste sample efter `RecordedAt`, ikke efter insert-rækkefølge.
- [ ] Freshness afgøres deterministisk i C# og returneres struktureret; LLM'en afgør ikke selv om GPS er stale.
- [ ] Browser-permission denied medfører ingen POST og ingen hardcoded/fallback-position.
- [ ] Angular-koden tilgår ikke `navigator.geolocation` direkte uden om Geolocation-adapteren.
- [ ] Ingen Python-kode eller LLM får direkte databaseadgang til positionsdata.

## Valideringsplan

- [ ] xUnit: gyldig position gemmes og kan hentes som seneste.
- [ ] xUnit: ugyldig latitude/longitude, fremtidig/ugyldig timestamp og negativ accuracy afvises uden persistens.
- [ ] xUnit: stale/current status beregnes deterministisk omkring konfigureret freshness-grænse.
- [ ] xUnit: god/dårlig/manglende accuracy giver korrekt `isSuitableForPreciseRouteComparison`.
- [ ] xUnit: en sent ankommet ældre sample overskriver ikke logisk seneste position.
- [ ] API/integration: request uden current-driver-context gemmer intet og returnerer autorisationsfejl; gyldig simuleret context binder data til den konfigurerede driver.
- [ ] Angular: fake geolocation leverer sample → præcis HTTP-payload; optional `speed`/`heading` håndteres som null.
- [ ] Angular: permission denied/unavailable → ingen HTTP-request og kontrolleret state/error.
- [ ] Angular: stop rydder browser-watch gennem adapteren.
- [ ] `dotnet test` og Angular `npm test -- --watch=false --browsers=ChromeHeadless` er grønne uden live OpenAI/GPS.
- [ ] EF migration gennemgås for kun de forventede `DriverLocations`-ændringer.

## Risici og åbne spørgsmål

- **Identitet:** Roadcue har endnu ikke rigtig login/token-authentication. For at respektere UC-37 og domænereglen må vi ikke bruge et vilkårligt client-sendt driver-id som sikker identitet. Planen bruger derfor en tydeligt serverstyret, simuleret POC-current-driver-context bag et interface. Dette er tilstrækkeligt til POC/test, men er ikke en erstatning for senere rigtig authentication.
- **Samtykke:** W3C Geolocation API håndhæver browserens lokationstilladelse. Roadcue har endnu ingen separat persistent consent-model. Denne task gemmer kun samples, som browseren faktisk leverer efter tilladelse; en vedvarende Roadcue-consent/withdrawal-model er et senere privacy/auth-arbejde og må ikke foregives implementeret her.
- **Retention:** Arkitekturen kræver, at retention/precision/anonymization besluttes før real-driver pilot. Denne task gemmer samples append-only til POC, men definerer ikke en produktions-retentionpolitik. Før real pilot skal retention besluttes særskilt.
- **Frekvens:** `watchPosition` kan levere mange samples og browser/OS styrer cadence. Start uden egen hård polling; tilføj kun simpel deduplikering/throttling under `/continue` hvis tests eller faktisk browseradfærd viser behov.
- **Baggrund:** Browser/PWA kan suspendere geolocation når appen ikke er aktiv. UC-37 garanterer derfor ikke background tracking med lukket app.

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
