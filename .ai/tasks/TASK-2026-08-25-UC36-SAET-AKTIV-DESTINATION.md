# Task: Sæt aktiv destination (UC-36)

**Dato:** 2026-08-25
**Status:** Done
**Use case:** [UC-36](../features/UC-36-SAET-AKTIV-DESTINATION.md)
**Type:** Feature

## Resultat

Chaufføren kan via VICO sige fx *"Jeg skal til Hamburg"*, hvorefter
Roadcue.Api opløser destinationen til struktureret data (navn,
koordinater, evt. adresse/provider-id) via en HERE-baseret geocoding-
abstraktion og gemmer den som aktiv destination på chaufførens aktive
Trip. Senere use cases (UC-35/39, UC-05, UC-06) kan hente
destinationen uden at gentage samtalen.

## Scope

**Med**

- Ny domænemodel:
  - `Trip` – minimal: `Id`, `DriverId`, `Status` (`Active`/`Ended`),
	`StartedAt`, `LastChangedAt`, én-til-én med aktiv `Destination`.
  - `Destination` – value object/entity på Trip med
	`Name`, `Latitude`, `Longitude`, `Address?`, `ProviderPlaceId?`,
	`SetAt`.
- `IDestinationGeocoder` i `Roadcue.Application/Destinations/` med
  request/response-records – ingen HERE-detaljer på interfacet.
- `HereDestinationGeocoder` i `Roadcue.Infrastructure/Geocoding/` som
  kalder HERE Geocoding & Search API. Nøgle læses fra config/env
  (`Here:ApiKey`). Aldrig hardcodet.
- Application-service `DestinationService` i
  `Roadcue.Application/Destinations/`:
  - `SetActiveDestinationAsync(driverId, rawText, hints?)` – kalder
	geocoder, klassificerer resultat som *entydig*, *tvetydig* eller
	*ikke fundet* og enten gemmer eller returnerer afklaringsforslag.
  - `GetActiveDestinationAsync(driverId)`.
  - **Auto-opret minimal aktiv Trip** hvis ingen findes for driveren.
	Fuld Trip-lifecycle hører til UC-38.
- Nyt endpoint i `Roadcue.Api`:
  - `PUT /api/drivers/{driverId}/destination` – body:
	`{ "query": "Hamburg" }` (evt. `"country"` som hint).
	Returnerer 200 med den gemte destination, 409 med
	`Ambiguous`-payload (kandidatliste), eller 502/503 hvis geocoder
	fejler (**gammel destination bevares**).
  - `GET /api/drivers/{driverId}/destination` – 200 med aktiv
	destination eller 404.
- VICO:
  - Nyt tool `set_active_destination(driver_id, destination_text,
	hints?)` under `vico/app/tools/set_active_destination.py`, der
	kalder Roadcue.Api – aldrig HERE direkte.
  - Domæne-mappe `vico/app/domains/destinations/instructions.py`
	med kort domæneprompt: skelne mellem *at tale om et sted* og
	*at sætte destination*, og aldrig gemme destinationen kun i
	samtalememory.
  - Registrer tool + instructions i `vico_agent.py`.
- EF-konfiguration + migration for `Trips` og ejet `Destination`.
- Registrering i DI: `IDestinationGeocoder` → `HereDestinationGeocoder`,
  med en `StubDestinationGeocoder` som bruges når `Here:ApiKey`
  mangler (dev/POC uden nøgle) og i tests.
- Tests: unit (klassificerings-/tvetydigheds-logik, service), API-
  tests (happy, tvetydig, provider-fejl bevarer eksisterende), VICO
  agent-test (mock Roadcue-klient) og HERE-adapter kontraktstub-test.

**Ikke med**

- Fuld Trip-lifecycle: annuller/afslut, historik, flere samtidige
  ture pr. driver. Hører til **UC-38** (findes endnu ikke som fil).
- Intern rute-beregning, RouteContext, afvigelses-genberegning.
  Hører til **UC-35 / UC-39**.
- Angular-UI for destinationsvalg – ikke nævnt i UC-36.
- Google Maps eller andre geocoding-providers (eksplicit forbudt i
  `.ai/external-apis/GEOCODING.md`).
- Live HERE-kald fra automatiske tests.
- Persistering af HERE-svarets rå payload ud over de felter der
  kræves af UC-36's datakrav.

## Verificeret udgangspunkt

- Domæne i dag: `Driver`, `DriverLocation`, `Friendship`, `Place`.
  Ingen `Trip`, `Destination`, ingen `IDestinationGeocoder`.
- `RoadcueDbContext` har kun `Drivers`, `DriverLocations`,
  `Friendships`, `Places`.
- Migrations: `20260821120519_InitialCreate` og
  `20260821120655_InitialCreate2`.
- API i dag: kun `DriversController`. Ingen destination-endpoints.
- VICO-tools i dag: `get_drivers`, `get_driver_friends`. Ingen tool
  for destination. `vico_agent.py` registrerer tools i en simpel
  liste; nyt tool tilføjes samme sted.
- `Roadcue.Application`-projektet er tomt – service, interface og
  DTO'er placeres her.
- `.ai/external-apis/GEOCODING.md`: HERE er eneste godkendte
  provider; abstraktion krævet; ingen live-kald i tests.
- `.ai/external-apis/README.md`: credentials via env, mock i tests.
- UC-38 (Trip lifecycle) og UC-39 (routing) findes **ikke** som
  use-case-filer endnu – bekræftet ved søgning.
- Der findes ingen aktiv task for UC-36. Ældre
  `TASK-2026-08-24-UC35-INTERN-TRUCK-RUTE.md` bundtede tidligere
  UC-35+36+38+39 sammen; UC-35 er siden splittet op og
  UC-35-tasken skal formentlig re-scopes eller markeres skipped
  (uden for denne task).

## Påvirkning

| Område | Forventet ændring |
|---|---|
| Angular | Ingen |
| C# API | Ny `DestinationController` (eller udvidelse på drivers-route) med `PUT`/`GET` |
| C# Application | Nyt projektindhold: `DestinationService`, `IDestinationGeocoder`, DTO'er, klassificerings-politik |
| C# Domain | Nye: `Trip`, `TripStatus`, `Destination` (ejet type på Trip) |
| C# Infrastructure | `HereDestinationGeocoder`, `StubDestinationGeocoder`, `HttpClient`-registrering, EF-konfiguration, ny migration |
| Python/VICO | Nyt tool + domæne-instructions + registrering i `vico_agent.py` |
| SQL/migration | Ny migration med `Trips`-tabel + ejet `Destination`-kolonner + unique filtered index på `(DriverId) WHERE Status = 'Active'` |
| Kontrakter/config | `Here:ApiKey`, `Here:GeocodingBaseUrl` i `appsettings.json`. Ingen nøgle committes. VICO's tool tilføjes til agent-graf |
| Tests/dokumentation | xUnit + pytest + task-log opdateres under `/continue` |

## Implementeringsplan

1. **Domæne.** Tilføj `Trip`, `TripStatus`, `Destination` (som ejet
   type på Trip). Én aktiv Trip pr. driver håndhæves i domænet.
2. **Geocoding-abstraktion.** Definér `IDestinationGeocoder` +
   records `GeocodeRequest`, `GeocodeCandidate`, `GeocodeResult`
   (én af *Found*/*Ambiguous(candidates)*/*NotFound*/*Failed(reason)*).
3. **`HereDestinationGeocoder`.** Kalder HERE Geocoding & Search
   med `HttpClient` (typed client). Mapper HERE-svar til
   `GeocodeResult`. Tvetydighed = flere resultater over
   confidence-tærskel eller tydeligt forskellige `resultType`.
   Aldrig genudkastet HERE-fejl direkte – wrappes til `Failed`.
4. **`StubDestinationGeocoder`.** Deterministisk in-memory-tabel
   (fx `hamburg` → koordinater, `hamburg havn` → koordinater,
   `københavn` → tvetydig). Bruges når `Here:ApiKey` mangler
   og i tests.
5. **`DestinationService`.** Auto-opret aktiv Trip hvis ingen
   findes. Kald geocoder. Ved `Found` → gem/opdater destination.
   Ved `Ambiguous` → returnér kandidatliste uden at ændre
   eksisterende destination. Ved `Failed`/`NotFound` → bevar
   eksisterende, returnér typet fejl.
6. **EF-konfiguration + migration.** `Trips` + ejet `Destination`,
   unique filtered index på aktiv Trip pr. driver.
7. **DI + config.** Registrér `IDestinationGeocoder` baseret på
   `Here:ApiKey`: findes den → `HereDestinationGeocoder`, ellers
   → `StubDestinationGeocoder` med log-advarsel. Tilføj
   `Here`-sektion i `appsettings.json` (uden nøgle) og
   `appsettings.Development.json` (kommenteret placeholder).
8. **API-endpoint.** `PUT/GET /api/drivers/{driverId}/destination`.
   Response-modeller matcher UC-36's datakrav.
9. **VICO-tool.** `set_active_destination`-tool der kalder
   `PUT /api/drivers/{driverId}/destination`. Håndter
   `Ambiguous`-svar som "bed om præcisering", ikke fejl.
10. **VICO domæne-instructions.** Tilføj kort tekst der lærer
	agenten at skelne *tale om et sted* fra *sæt destination*
	(som beskrevet i UC-36).
11. **Tests.**
	- xUnit: `DestinationServiceTests` (found/ambiguous/failed/
	  autoopret Trip/forkert driver/eksisterende bevares ved fejl).
	- xUnit: `HereDestinationGeocoderTests` med
	  `HttpMessageHandler`-fake (mapping af HERE-svar, ingen
	  netværkskald).
	- xUnit: `StubDestinationGeocoderTests`.
	- Integration/API-test via `WebApplicationFactory`:
	  happy, ambiguous, geocoder-fejl bevarer eksisterende,
	  ukendt driver.
	- pytest: agent-test der mocker Roadcue-klient og verificerer
	  tool-kald + korrekt håndtering af `Ambiguous`.
12. **Manuel kontrol.** Kør API'et med `Stub`-geocoder via Scalar:
	`PUT /api/drivers/{id}/destination` med `"Hamburg"` →
	verificér gemt destination. Send `"København"` → verificér
	afklaringsspørgsmål fra VICO uden ændring i databasen.

## Implementeringsspecifikke acceptkriterier

Supplerer – gentager ikke – UC-36's egne acceptkriterier.

- [ ] `IDestinationGeocoder` er den eneste vej til geocoding fra
  `DestinationService`. Ingen HERE-typer læker ud af Infrastructure.
- [ ] `HereDestinationGeocoder` bruger `HttpClient` via typed client
  med base URL fra config. Ingen hardcodet URL eller nøgle i kode.
- [ ] Én aktiv Trip pr. driver håndhæves på databaseniveau (unique
  filtered index), ikke kun i C#.
- [ ] `PUT /destination` er idempotent for samme (driverId, query):
  samme geocoder-svar → samme lagrede destination, `SetAt` opdateres
  kun ved reelt skift.
- [ ] Geocoder-fejl må aldrig efterlade en tom eller inkonsistent
  destination. Eksisterende destination bevares uændret.
- [ ] VICO-toolet skriver ikke direkte til DB og kalder ikke HERE.
- [ ] Ingen HERE-nøgle er committet. `Here:ApiKey` læses via
  `IConfiguration`.
- [ ] `StubDestinationGeocoder` er markeret som POC/dev-only i
  XML-doc og logger en advarsel ved opstart, hvis den vælges.
- [ ] pytest-agenten mocker Roadcue-klienten og laver ingen live-kald
  til hverken Roadcue.Api eller OpenAI.

## Valideringsplan

- [ ] xUnit: `DestinationServiceTests`, `HereDestinationGeocoderTests`,
  `StubDestinationGeocoderTests`.
- [ ] API-tests via `WebApplicationFactory`: happy, ambiguous, fejl
  bevarer eksisterende, ukendt driver, 404 på tom destination.
- [ ] Migration køres mod tom DB – tabel + index oprettes.
- [ ] pytest: `set_active_destination`-tool routes og håndterer
  `Ambiguous` med afklarende svar.
- [ ] Manuel: Scalar → sæt destination, læs destination, provokér
  tvetydighed.

## Risici og åbne spørgsmål

- **UC-38 findes ikke.** UC-36 kræver eksplicit at destinationen
  knyttes til den aktive tur. **Foreslået:** auto-opret minimal
  aktiv Trip her; fuld lifecycle (annullér, afslut, historik) laves
  i UC-38-tasken. Bekræft.
- **Ambiguity-detektion i HERE.** HERE returnerer ofte ét bedste
  resultat med lavere confidence + alternativer. Konkret tærskel
  for "tvetydig" (fx score-difference < X, eller > 1 result med
  score > Y) er ikke fastsat. **Foreslået:** start med
  "tvetydig hvis flere resultater med score ≥ 0,8 og score-forskel
  < 0,1". Justeres når vi har rigtige svar.
- **Trip-auto-oprettelse fra API.** Skal `PUT /destination`
  alene lave en Trip, eller skal endpointet returnere 409 hvis
  ingen aktiv Trip findes? **Foreslået:** auto-opret her, da
  UC-36's flow ikke kræver forudgående Trip-oprettelse. Kan
  strammes op når UC-38 er klar.
- **VICO's identifikation af driver.** UC-36 antager kendt
  chauffør. Auth mangler stadig – i denne task bruges seeded
  driverId (samme mønster som `DriversController`). Egentlig
  authZ dækkes tværgående.
- **Ældre UC-35-task.** `TASK-2026-08-24-UC35-INTERN-TRUCK-RUTE.md`
  bundtede destination + routing. Den bør re-scopes til kun UC-35
  (routing) eller markeres skipped. Håndteres uden for denne task,
  men risikerer at forvirre; bør noteres i UC-35-tasken.
- **HERE free-tier rate limit.** Ingen retry/backoff-politik i
  denne task. Fejl → "gem ikke destination". Kan udvides senere.

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
