# Task: UC-38 – Opret og vedligehold aktiv Trip

**Dato:** 2026-08-30  
**Status:** Ready  
**Use case:** [UC-38 – Opret og vedligehold aktiv Trip](../features/UC-38-OPRET-OG-VEDLIGEHOLD-AKTIV-TUR.md)  
**Type:** Feature

## Resultat

Roadcue får en autoritativ backend-kontrakt for chaufførens aktuelle Trip. Den eksisterende Trip, som UC-36 allerede opretter/opdaterer ved destinationsændring, kan hentes uden samtalehistorik, kan afsluttes eller annulleres deterministisk og returnerer aktuel GPS-kontekst fra UC-37 uden at kopiere positionshistorik ind i Trip-tabellen. En afsluttet/annulleret Trip er ikke længere aktiv, og en senere destination kan derfor oprette en ny Trip.

## Scope

**Med**

- Udbyg den eksisterende `Trip`-lifecycle i C# med eksplicit annullering og tidsstempler for afslutning/annullering; behold eksisterende `Active`/`Ended`-semantik for kompatibilitet og tilføj `Cancelled`.
- Genbrug `LastChangedAt` som domænets eksisterende updated-timestamp; undgå unødvendig omdøbning af eksisterende kolonner.
- Opret Application-kontrakt/service til at hente, afslutte og annullere den aktive Trip for et autoritativt `driverId`.
- Sammensæt aktuel Trip-kontekst med seneste `LocationResult` fra `ILocationService` ved læsning. GPS-data forbliver i `DriverLocations`; der tilføjes ikke TripId eller positionshistorik til Trip.
- Eksponér current-driver API til hent/afslut/annullér aktiv Trip. Endpoints må ikke acceptere et LLM-valgt driver-id som autoritativ identitet; `ICurrentDriverContext` bruges som i UC-37.
- Beskyt den eksisterende UC-36 destination-route mod cross-driver adgang ved at validere route-`driverId` mod `ICurrentDriverContext`, så destinationsændringer ikke kan ændre en anden chaufførs aktive Trip.
- Bevar den eksisterende filtrerede unikke SQL-indeksregel for højst én `Active` Trip pr. chauffør.
- Tilføj EF Core-migration for de nye nullable lifecycle-timestamps.
- Tilføj en read-only VICO-klient/tool-kontrakt til at hente den aktuelle Trip via current-driver backend-endpointet uden `driver_id`-parameter. Tool'et må ikke læse SQL eller rekonstruere Trip fra chat-historik.
- Registrér read-only Trip-tool'et i den eksisterende VICO-graf uden at tilføje endnu et stort globalt domænepromptmodul; toolbeskrivelsen skal være tilstrækkeligt præcis til opslag af aktuel Trip.
- Automatiske tests bruger fakes/mocks og foretager ingen live OpenAI-, GPS- eller eksterne API-kald.

**Ikke med**

- Intern truck-route/polyline, ETA, distance eller routing-metadata; det hører til UC-35.
- HERE Routing eller andre nye eksterne providers.
- Lagring af GPS-historik på Trip; UC-37's separate lokationsmodel genbruges.
- `threadId` på Trip i denne leverance. Det eksisterende C# destination/location-flow leverer ikke `thread_id`, og aktiv Trip skal kunne findes ud fra chaufføridentitet uafhængigt af en kortlivet LLM-session.
- VICO-tools til at afslutte eller annullere Trip. De er muterende/konsekvente handlinger og kræver et særskilt bekræftelsesflow, før de eksponeres som agenthandlinger; UC-38 leverer backend-lifecycle først.
- Rigtig login/token-implementering. POC'en genbruger den eksisterende `ICurrentDriverContext`/`SimulatedCurrentDriverContext`, som senere kan erstattes af autentificeret request context.
- Angular-ændringer; UC-37 leverer allerede GPS til backend.

## Verificeret udgangspunkt

- `src/Roadcue.Domain/Trips/Trip.cs` findes allerede fra UC-36 med `Id`, `DriverId`, `Status`, `StartedAt`, `LastChangedAt`, owned `Destination` og `Driver` navigation. Kommentaren angiver eksplicit, at fuld lifecycle håndteres af UC-38.
- `TripStatus` har i dag `Active` og `Ended`; ingen fundet produktionskode ændrer en Trip til `Ended`.
- `DestinationService.SetActiveDestinationAsync` henter aktiv Trip via `IActiveTripRepository`, opretter en ny `Active` Trip hvis ingen findes, og opdaterer destination/`LastChangedAt` på den eksisterende aktive Trip.
- `ActiveTripRepository.GetActiveTripAsync` filtrerer på `DriverId` + `TripStatus.Active`; afsluttede statusser vil derfor automatisk falde ud af active-queryen.
- `RoadcueDbContext` har allerede et filtreret unikt indeks på `(DriverId, Status)` med filter `[Status] = 'Active'`, så SQL Server håndhæver højst én aktiv Trip pr. chauffør.
- Migration `20260828114722_AddTripsAndDestination` har allerede oprettet `Trips`, destination-felter, FK til `Drivers` og det filtrerede unikke indeks.
- UC-37 har introduceret `ICurrentDriverContext`, `ILocationService.GetCurrentAsync` og `GET/POST /api/location/current`; `LocationResult` indeholder position, timestamp, accuracy, speed/heading samt deterministisk freshness/route-suitability.
- `DestinationController` bruger stadig `api/drivers/{driverId}/destination` og accepterer route-driverId uden at kontrollere det mod `ICurrentDriverContext`; dette er et konkret identitetsgab i forhold til UC-38's isolation-AC og skal lukkes i denne task uden at ændre selve destinationssemantikken.
- Python `RoadcueApiClient` har destination/friends-kald men intet Trip-kald. VICO-grafen registrerer i dag `get_drivers`, `get_driver_friends` og `set_active_destination`.
- Der findes kun `Roadcue.Application.Tests` på .NET-siden; eksisterende destinationstests bruger fakes og ingen live providers. VICO UC-36 tests mocker `RoadcueApiClient` og kalder ikke live OpenAI.
- Ingen eksisterende aktiv task for UC-38 blev fundet.

## Påvirkning

| Område | Forventet ændring |
|---|---|
| Angular | Ingen |
| C# API/Application/Domain/Infrastructure | Ny Trip-service/DTO'er og current-driver controller-flow; lifecycle på `Trip`; destination-controller får current-driver guard; repository genbruges/udvides kun hvor nødvendigt |
| Python/VICO | Read-only `get_active_trip` i API-klient + lille LangChain tool og registrering i grafen; ingen muterende Trip-tools |
| SQL/migration | Nullable lifecycle-timestamps på `Trips`; eksisterende unikt active-indeks bevares |
| Kontrakter/config | Nye current-driver Trip HTTP-kontrakter; ingen nye secrets/providers/config-værdier |
| Tests/dokumentation | Nye Application-tests og VICO tool-test; tasklog/resultat opdateres under `/continue` |

## Implementeringsplan

1. Udvid `TripStatus` med `Cancelled` og `Trip` med nullable lifecycle-timestamps for normal afslutning og annullering. Opdatér EF-mapping og opret en migration, som kun tilføjer nullable kolonner og bevarer det eksisterende filtered unique index.
2. Introducér et lille Trips-område i Application med DTO/resultat og `ITripService`/`TripService`. Genbrug `IActiveTripRepository`, `TimeProvider` og `ILocationService`: `GetActive` mapper Trip + destination + seneste aktuelle location; `EndActive` sætter `Ended`, timestamp og `LastChangedAt`; `CancelActive` sætter `Cancelled`, timestamp og `LastChangedAt`; ingen aktiv Trip giver et eksplicit not-found-resultat og ingen write.
3. Tilføj et current-driver Trip-controller-flow, foreslået som `GET /api/trips/current`, `POST /api/trips/current/end` og `POST /api/trips/current/cancel`. Controlleren henter driver-id fra `ICurrentDriverContext`, returnerer `401` hvis current driver ikke kan bestemmes og `404` hvis der ikke findes en aktiv Trip.
4. Tilpas `DestinationController` til at validere det eksisterende route-`driverId` mod `ICurrentDriverContext` før GET/PUT. Bevar den eksisterende URL og UC-36 response-kontrakt, så Python-klienten ikke brydes, men afvis cross-driver adgang.
5. Registrér Trip-servicen i DI uden nye eksterne providers. Sørg for at en destinationsændring efter `Ended`/`Cancelled` fortsat bruger den eksisterende UC-36-adfærd og opretter en ny aktiv Trip.
6. Udvid `RoadcueApiClient` med `get_active_trip()` mod current-driver endpointet og tilføj et read-only `get_active_trip` LangChain-tool uden `driver_id`. Registrér kun dette opslagstool i grafen; tilføj ikke VICO end/cancel-handlinger eller ny global prompttekst i UC-38.
7. Tilføj Application-tests for aktiv Trip-læsning, GPS-kontekst, end/cancel, not-found og ny Trip efter lukning. Tilføj VICO-tool-test med mocked API-klient. Kør relevante .NET/Python-tests og verificér migration-script/build; ingen live OpenAI/GPS/HERE-kald.

## Implementeringsspecifikke acceptkriterier

- [ ] `GET /api/trips/current` bestemmer chaufføren via `ICurrentDriverContext` og returnerer aldrig en anden chaufførs Trip ud fra et request-/LLM-supplied driver-id.
- [ ] Aktiv Trip-response indeholder Trip-identitet/status/timestamps, destination og seneste `LocationResult` når den findes; manglende GPS gør ikke Trip'en ugyldig.
- [ ] GPS-data duplikeres ikke i `Trips`, og ingen `TripId` tilføjes til `DriverLocations` i UC-38.
- [ ] Normal afslutning sætter status `Ended`; annullering sætter status `Cancelled`; begge gør, at `GetActiveTripAsync` ikke længere returnerer Trip'en.
- [ ] Afslutning/annullering uden aktiv Trip giver not-found og opretter/ændrer ikke data.
- [ ] Efter en lukket Trip kan UC-36 oprette en ny aktiv Trip for samme chauffør, mens det filtrerede unikke indeks fortsat forhindrer to `Active` Trips.
- [ ] Eksisterende destination GET/PUT afviser et `driverId`, der ikke matcher current-driver context, uden at ændre UC-36's succes-/geocoder-kontrakter for den korrekte chauffør.
- [ ] VICO kan hente aktiv Trip via et read-only tool uden at kende/gætte `driver_id` og uden at læse chat-historik som datakilde.
- [ ] Ingen VICO end/cancel-tool introduceres i denne task.
- [ ] Ingen live OpenAI-, GPS-, HERE- eller andre eksterne kald udføres af automatiske tests.

## Valideringsplan

- [ ] `Roadcue.Application.Tests`: aktiv Trip mappes med destination og mocked/ fake aktuel location.
- [ ] `Roadcue.Application.Tests`: aktiv Trip kan afsluttes og får `Ended` + timestamp; efterfølgende active-query giver ingen Trip.
- [ ] `Roadcue.Application.Tests`: aktiv Trip kan annulleres og får `Cancelled` + timestamp; efterfølgende active-query giver ingen Trip.
- [ ] `Roadcue.Application.Tests`: end/cancel uden aktiv Trip skriver ikke data.
- [ ] `Roadcue.Application.Tests`: destinationssætning efter en lukket Trip opretter en ny aktiv Trip frem for at genbruge den lukkede.
- [ ] VICO pytest: `get_active_trip` returnerer mocked backend-data/`None` og wrapper HTTP-fejl struktureret uden live OpenAI.
- [ ] `dotnet test tests/Roadcue.Application.Tests/Roadcue.Application.Tests.csproj`.
- [ ] Relevante VICO pytest-tests køres lokalt/CI uden live OpenAI.
- [ ] `dotnet ef migrations script --idempotent` kan genereres, og API build/container pipeline kan fortsat bygge migrationen før deploy.
- [ ] Manuel API-kontrol med konfigureret POC-current-driver: hent aktiv Trip, afslut/annullér den, verificér 404 bagefter og sæt derefter ny destination for at verificere ny Trip.

## Risici og åbne spørgsmål

- Det eksisterende UC-36 endpoint bruger route-`driverId`, mens UC-37 har etableret current-driver context. Planen lukker cross-driver-gabet med en guard uden at bryde den eksisterende URL; rigtig token-baseret identitet er fortsat uden for POC-scope.
- Database-concurrency er allerede delvist dækket af det filtrerede unikke indeks. Ved samtidige requests kan SQL stadig afvise den ene oprettelse; implementeringen må ikke oversætte en sådan databasefejl til falsk succes.
- Aktuel location er dynamisk kontekst og kan være gammel/for upræcis. Trip-responsen skal bevare UC-37's eksisterende `IsCurrent`/`IsSuitableForPreciseRouteComparison` i stedet for at opfinde en ny GPS-kvalitetsregel.
- `threadId` udelades bevidst, fordi chaufførens Trip er varig C#-forretningsstate og ikke må afhænge af LangGraph-sessionen.
- Ingen blokerende åbne spørgsmål; planen kan implementeres med de eksisterende arkitekturgrænser.

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
