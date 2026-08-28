# Task: Etabler og vedligehold VICO's interne truck-rute

**Dato:** 2026-08-24
**Status:** Ready
**Use case:** [UC-35](../features/UC-35-ETABLER-OG-VEDLIGEHOLD-INTERN-TRUCK-RUTE.md)
**Type:** Feature

## Resultat

Roadcue.Api kan aktivere en destination for en chauffør, beregne en
intern rute via en godkendt routing-abstraktion i C#, gemme den som
en aktiv tur i databasen, og genberegne den ved vedvarende
GPS-afvigelse. Ruten er tydeligt adskilt fra chaufførens eksterne
GPS/navigation og kan læses igen på tværs af senere tool-kald.

## Scope

**Med**

- Ny domænemodel: `Trip`, `Destination`, `Route` (intern rute) + statusenum.
- `TruckProfile` value object med de parametre der er kendt i dag på
  `Driver` (må starte tomt – se risici).
- `IRoutingProvider` i `Roadcue.Application` + POC-implementation
  `StubRoutingProvider` i `Roadcue.Infrastructure` (deterministisk,
  straight-line + estimeret hastighed pr. profil). Ingen ekstern
  provider kobles til uden ADR.
- Application-service `TripService` med:
  - `ActivateDestinationAsync(driverId, destination, truckProfile)`
	→ opretter/opdaterer aktiv `Trip`, kalder provider, gemmer `Route`.
  - `EvaluateLocationAgainstRouteAsync(driverId, location)` →
	returnerer om ruten fortsat er gyldig, forældet eller skal
	genberegnes (håndterer tolerance + hysterese mod GPS-støj).
  - `RecalculateActiveRouteAsync(driverId, fromLocation)` → genberegn
	fra aktuel position til samme destination.
- To nye endpoints i `Roadcue.Api`:
  - `POST /api/drivers/{driverId}/trip/destination`
  - `GET  /api/drivers/{driverId}/trip/route`
- EF Core-konfiguration + migration for de nye entiteter.
- Enhedstests (afvigelses-/hysterese-logik, TripService, StubRoutingProvider).
- API-tests for de to endpoints (happy path + provider-fejl + ukendt driver).

**Ikke med**

- Rigtig ekstern truck-routingservice (HERE, TomTom, ORS…) – kræver ADR.
- VICO-tool (`set_destination` / `get_active_route`) – hører til
  UC-06/UC-26-tasks når API'et er stabilt.
- Angular-UI for destinationsvalg – ikke nævnt i UC-35.
- Auto-hook fra UC-05's location-endpoint til `EvaluateLocationAgainstRouteAsync`.
  UC-05 har endnu ikke et endpoint i koden; koblingen dokumenteres og
  gennemføres i UC-05's egen task.
- Chaufførens køretøjs-/truck-profil som permanent domænedata.
  `TruckProfile` accepteres i request-body og gemmes på `Trip`.

## Verificeret udgangspunkt

- Domæne i dag: `Driver`, `DriverLocation` (lat/lon/speed/heading/recordedAt),
  `Friendship`, `Place`. Ingen `Trip`, `Destination` eller `Route`.
- `RoadcueDbContext` har kun `Drivers`, `DriverLocations`, `Friendships`,
  `Places`.
- Migrations: `20260821120519_InitialCreate` + `20260821120655_InitialCreate2`.
  Ingen route-relaterede kolonner.
- API i dag: kun `DriversController` (`GET /api/drivers`,
  `GET /api/drivers/{id}/friends`). Ingen trip/route-endpoints.
- VICO tools: `get_drivers`, `get_driver_friends`. Ingen routing-tool.
- UC-05 forventer eksplicit at "UC-35 aktiveres for at beregne en ny
  intern rute" ved vedvarende afvigelse – bekræfter kontrakten.
- UC-06 forventer "aktiv destination og intern rute via UC-35".
- Arkitektur (`01-SOLUTION-ARCHITECTURE.md`, `04-AI-BOUNDARY.md`):
  eksterne providers skal ligge bag Roadcue-ejede C#-interfaces, og
  routing er eksplicit C#-ansvar. Rute-aktivering kræver driver-bekræftelse.
- `Roadcue.Application`-projektet er tomt i dag – service og
  interface placeres her og udgør første "rigtige" indhold.
- Dokumentationsafvigelse: UC-35 taler om "godkendt truck-routingservice",
  men der findes ingen sådan i repo'et. Stub anvendes til POC – registreret
  som åbent spørgsmål.

## Påvirkning

| Område | Forventet ændring |
|---|---|
| Angular | Ingen |
| C# API | Ny `TripController` med to endpoints |
| C# Application | Ny: `TripService`, `IRoutingProvider`, DTO'er, `TruckProfile`, tolerance-/hysterese-politik |
| C# Domain | Ny: `Trip`, `Destination`, `Route`, `RouteStatus`, `TripStatus` |
| C# Infrastructure | `RoadcueDbContext` udvidet, EF-konfiguration, `StubRoutingProvider`, ny migration |
| Python/VICO | Ingen (nyt tool hører til UC-06/UC-26-tasks) |
| SQL/migration | Ny migration med tabeller for `Trips`, `Routes`, evt. `Destinations` (afhænger af modellering – se plan) |
| Kontrakter/config | Registrering af `IRoutingProvider` → `StubRoutingProvider` i DI. Ny konfigurationssektion `Routing:Provider` med default `"stub"` |
| Tests/dokumentation | xUnit-tests + API-tests. Task-log opdateres under `/continue` |

## Implementeringsplan

1. **Domænemodel.** Tilføj `Trip`, `Destination` (value object med
   navn, coordinates, evt. externalPlaceId), `Route` (polyline,
   distanceMeters, estimatedDuration, calculatedAt, routingProfile,
   status), `RouteStatus`, `TripStatus`, `TruckProfile`. Én aktiv
   `Trip` pr. `DriverId` håndhæves via unique filtered index.
2. **`IRoutingProvider`** i `Roadcue.Application/Routing/` med
   request/response-records. Ingen provider-specifikke felter.
3. **`StubRoutingProvider`** i `Roadcue.Infrastructure/Routing/`:
   returnerer straight-line polyline, distance via haversine, tid via
   fast km/t pr. profil. Fejlsimulering styret af config for tests.
4. **`TripService`** i `Roadcue.Application/Trips/`:
   - `ActivateDestinationAsync` – finder eller opretter aktiv Trip,
	 kalder provider, gemmer Route, returnerer resultat. Ved
	 provider-fejl gemmes destination, ingen aktiv Route markeres.
   - Tolerance-/hysterese-politik som ren funktion
	 (`RouteDeviationPolicy`): kræver N på hinanden følgende punkter
	 uden for korridor før genberegning udløses. N + korridor er
	 konstanter, refaktoreres til config senere.
   - `EvaluateLocationAgainstRouteAsync` bruger politikken.
   - `RecalculateActiveRouteAsync` erstatter aktiv Route, gammel Route
	 markeres `Superseded`.
5. **EF-konfiguration + migration.** `Trip` → `Trips`, `Route` →
   `Routes` med FK til `Trips`. `Destination` inlines som ejet type.
   Unique filtered index på `Trips(DriverId) WHERE Status = 'Active'`.
6. **DI-registrering.** Tilføj `AddScoped<IRoutingProvider,
   StubRoutingProvider>()` i `Program.cs` (eller ny extension i
   `Roadcue.Infrastructure`), styret af `Routing:Provider`-config.
7. **`TripController`** med:
   - `POST /trip/destination` – body: `{ name, latitude, longitude,
	 truckProfile? }`. Returnerer aktiv Route eller 502 hvis provider
	 fejler (destination gemt, `RouteStatus = Unavailable`).
   - `GET /trip/route` – returnerer aktiv Route eller 404.
8. **Tests.**
   - Unit: `RouteDeviationPolicy` (kortvarig støj → ingen genberegning;
	 vedvarende afvigelse → genberegning; ingen aktiv rute → ingen
	 effekt).
   - Unit: `TripService` med `IRoutingProvider`-fake (aktivér,
	 genberegn, provider-fejl, forkert driver).
   - Unit: `StubRoutingProvider` (deterministisk output).
   - API: happy path + provider-fejl (`Unavailable`) + ukendt driver.
9. **Manuel kontrol.** Kør API'et lokalt via Scalar, aktivér destination
   for en seeded driver, hent aktiv rute, kald igen med afvigende
   startposition (simuleret) og verificér genberegning.

## Implementeringsspecifikke acceptkriterier

Supplerer – gentager ikke – UC-35's egne acceptkriterier.

- [ ] `IRoutingProvider` er den eneste vej til rute-beregning fra
  `TripService`; ingen provider-detaljer lækker til Domain eller Api.
- [ ] `StubRoutingProvider` er markeret som POC-implementation i XML-doc
  og registreres via config, så en fremtidig provider kan overtage
  uden kode-ændringer i `TripService`.
- [ ] Én aktiv `Trip` pr. driver håndhæves på databaseniveau
  (unique filtered index), ikke kun i C#.
- [ ] Superseded Routes slettes ikke – de bevares med `Status =
  Superseded` for audit/senere UC'er.
- [ ] `RouteDeviationPolicy` er en ren, testbar funktion uden
  DbContext-afhængighed.
- [ ] `POST /trip/destination` er idempotent for samme (driverId,
  destination) inden for samme aktive Trip: genererer ikke en ny Trip,
  men opdaterer Route hvis der er kaldt igen.
- [ ] Provider-fejl gemmer destinationen med `RouteStatus = Unavailable`
  og returnerer 502 med struktureret fejl-body – aldrig en falsk aktiv rute.

## Valideringsplan

- [ ] xUnit: `RouteDeviationPolicyTests` (støj, vedvarende afvigelse,
  ingen rute).
- [ ] xUnit: `TripServiceTests` (aktivér, genaktivér samme destination,
  genberegn, provider-fejl, forkert driver).
- [ ] xUnit: `StubRoutingProviderTests` (haversine-distance, tid pr.
  profil, deterministik).
- [ ] Integration/API-test via `WebApplicationFactory`:
  - `POST /trip/destination` happy path → 200 + Route.
  - `POST /trip/destination` provider-fejl → 502 + destination gemt.
  - `GET /trip/route` når aktiv rute findes → 200.
  - `GET /trip/route` uden aktiv rute → 404.
- [ ] Migration køres mod tom DB i test – tabeller og index oprettes.
- [ ] Manuel: aktivér destination via Scalar for seeded driver,
  verificér JSON og at ingen navigation vises i logs.

## Risici og åbne spørgsmål

- **Provider-valg.** UC-35 nævner "godkendt truck-routingservice",
  men ingen provider er valgt i repo'et. **Foreslået:** POC bruger
  `StubRoutingProvider`; valg af ekstern provider (HERE / TomTom /
  ORS) kræver ADR før tilslutning. Bekræft med bruger.
- **TruckProfile-datakilde.** UC-35 lister mange truck-parametre.
  Ingen findes i dag på `Driver`. **Foreslået:** accepter dem i
  request-body pr. tur i denne task; permanent lagring pr. driver/
  vehicle er en senere UC.
- **UC-05-kobling.** UC-05 har endnu ikke et location-endpoint i
  koden. `EvaluateLocationAgainstRouteAsync` bygges, men kaldes først
  fra UC-05-tasken. Skal denne task alligevel eksponere et test-endpoint
  til manuel simulation?
- **Tolerance/hysterese-værdier.** Sættes som konstanter (fx
  korridor 250 m, mindst 5 på hinanden følgende punkter). Skal de
  være config allerede nu?
- **Autorisation.** Endpoints er i dag uden auth i `DriversController`.
  Fastholder samme mønster her; egentlig authZ dækkes af en tværgående
  task.
- **Persistering af Destination.** Skal `Destination` være ejet type
  på `Trip` eller egen tabel med FK til `Place`? **Foreslået:** ejet
  type nu; refactor til `Place`-reference når UC-07 (find sted) er på plads.

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
