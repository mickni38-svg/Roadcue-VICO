# Roadcue – Problemformulering og kravspecifikation

**Version:** 1.0  
**Dato:** 23. august 2026  
**Relateret dokument:** `Roadcue-VICO-Usecase-Katalog.md`

---

# 1. Projektbeskrivelse

Roadcue er en intelligent, kontekstbevidst og voice-first copilot til lastbilchauffører. Copiloten hedder VICO og fungerer som chaufførens samlede brugergrænseflade til almindelig AI-viden, Roadcues egne data, eksterne tjenester og senere et community af andre chauffører.

Roadcue skal ikke genimplementere navigation, vejr, trafik eller komplette routingmotorer. VICO skal i stedet forstå chaufførens naturlige spørgsmål, vælge de nødvendige interne og eksterne tjenester, kombinere resultaterne og give ét kort, relevant og troværdigt svar.

Løsningen skal opleves som en fysisk copilot på turen. Chaufføren skal kunne spørge naturligt, eksempelvis:

> “Find et sted inden for 45 minutter, hvor jeg kan tanke, spise og sandsynligvis parkere. Se også, om nogen jeg kender er der.”

VICO skal kunne forstå de enkelte behov, anvende chaufførens tilladte GPS-kontekst, hente oplysninger fra flere kilder og præsentere et samlet svar uden at kræve, at chaufføren skifter mellem flere apps.

---

# 2. Baggrund og problem

Lastbilchauffører anvender i dag forskellige apps og tjenester til blandt andet navigation, trafik, parkering, truck stops, vejr, beskeder, oversættelse og kontakt med andre chauffører. Informationerne er fordelt mellem tjenesterne, og chaufføren skal ofte selv søge, vælge filtre, sammenligne resultater og vurdere, om oplysningerne er aktuelle.

Det er særligt problematisk under kørsel, hvor chaufføren bør bruge mindst mulig opmærksomhed på skærmbetjening. Samtidig kan information om parkering, vejspærringer og lokale forhold være mangelfuld eller forældet. Eksisterende tjenester kan normalt kun besvare de spørgsmål, som deres brugergrænseflade og datamodel på forhånd er bygget til.

Der mangler derfor et intelligent lag, som:

- forstår chaufførens naturlige sprog,
- husker samtalens kontekst,
- kender chaufførens tilladte kørselskontekst,
- vælger relevante tools og datakilder,
- kombinerer flere oplysninger i ét svar,
- skelner mellem sikre og usikre oplysninger,
- og senere kan spørge relevante chauffører, når eksisterende data ikke er tilstrækkelige.

---

# 3. Problemformulering

## 3.1 Hovedproblemformulering

> **Hvordan kan der udvikles en kontekstbevidst AI- og stemmecopilot til lastbilchauffører, som gør det muligt at kommunikere naturligt under kørslen, og som automatisk kan afgøre, om et svar skal findes gennem almindelig AI-viden, Roadcues egne data, eksterne tjenester eller andre chauffører, så chaufføren modtager ét kort, relevant og troværdigt svar uden at skulle betjene flere forskellige apps?**

## 3.2 Underspørgsmål

1. Hvordan kan VICO forstå naturligt sprog og bevare konteksten gennem en sammenhængende samtale?
2. Hvordan kan LangChain og LangGraph anvendes til at vælge, kombinere og orkestrere Roadcue-tools automatisk?
3. Hvordan skal ansvaret fordeles mellem .NET/C# og Python, så AI’en ikke selv udfører SQL, geoqueries eller præcise beregninger?
4. Hvordan kan GPS-position, kørselsretning, hastighed, tidspunkt og senere aktiv rute anvendes som sikker og samtykkebaseret kontekst?
5. Hvordan kan eksterne tjenester pakkes bag Roadcues egne interfaces, så systemet ikke bindes til én leverandør?
6. Hvordan kan community-observationer gemmes fleksibelt, findes semantisk og samtidig filtreres deterministisk efter position, retning og tidspunkt?
7. Hvordan kan VICO tydeligt kommunikere forskellen mellem ubekræftede, sandsynlige og bekræftede oplysninger?
8. Hvordan kan LangGraph senere understøtte ventende forløb, hvor VICO spørger andre chauffører og genoptager samtalen, når der kommer svar?
9. Hvordan kan Roadcue foreslå og aktivere en eksternt beregnet ruteændring uden selv at blive en navigations- eller routingmotor?
10. Hvordan kan voice-first betjening reducere behovet for skærmbrug uden at gøre VICO unødvendigt snakkende eller distraherende?

---

# 4. Formål

Formålet med projektet er at udvikle og afprøve en arkitektur, hvor VICO fungerer som det samlende AI-lag oven på Roadcues interne funktioner og udvalgte eksterne tjenester.

Projektet skal demonstrere, at VICO kan:

- forstå et naturligt formuleret chaufførspørgsmål,
- huske konteksten i opfølgende spørgsmål,
- vælge relevante tools uden faste stemmekommandoer,
- gennemføre flere tool-kald i en nødvendig rækkefølge,
- kombinere resultater fra flere datakilder,
- anvende en simuleret eller rigtig chaufførkontekst,
- og formulere et kort og anvendeligt svar.

Den første POC skal gennemføres med tekst. Tale-til-tekst og tekst-til-tale lægges først på, når agent- og tool-flowet fungerer stabilt.

---

# 5. Succeskriterier

Projektets første POC er vellykket, når:

1. VICO kan føre en almindelig tekstbaseret AI-samtale.
2. VICO kan bevare konteksten gennem flere beskeder.
3. VICO kan vælge mellem direkte AI-svar og mindst to Roadcue-tools.
4. VICO kan hente venner gennem det eksisterende C#-API.
5. VICO kan bruge en simuleret chauffør- og GPS-kontekst.
6. VICO kan finde et relevant sted gennem en kontrolleret C#-service.
7. VICO kan kombinere steddata og vennedata i ét spørgsmål.
8. Præcise afstande og tider beregnes uden for LLM’en.
9. VICO kan sige, når den ikke har tilstrækkelige eller sikre oplysninger.
10. Tool-valg, fejl og svartider kan spores.

---

# 6. Interessenter og aktører

| Aktør | Ansvar og interesse |
|---|---|
| Chauffør | Primær bruger af VICO |
| VICO | Forstår intentionen, vælger tools og formulerer svaret |
| Roadcue Backend | Ejer forretningslogik, data, autorisation og beregninger |
| Ekstern tjeneste | Leverer eksempelvis sted-, trafik-, vejr- eller routingdata |
| Community-chauffør | Kan senere dele observationer og besvare spørgsmål |
| Administrator/produktejer | Konfigurerer løsningen og følger kvalitet og drift |

---

# 7. Afgrænsning

Roadcue er afgrænset således:

- Roadcue er ikke en komplet turn-by-turn-navigationsapp.
- Roadcue udvikler ikke selv en avanceret europæisk lastbilroutingmotor.
- Routing og rutealternativer kan leveres af eksterne services.
- Roadcue er ikke et komplet flådestyrings-, dispatch-, fragt-, ERP- eller faktureringssystem.
- Roadcue er ikke et juridisk tachograf- eller køre-/hviletidssystem.
- POC’en integrerer ikke direkte med lastbilens CAN-bus.
- Telefon eller iPad leverer tilstrækkelig GPS-kontekst til POC og MVP.
- Første version anvender ikke Kubernetes eller en omfattende microservicearkitektur.
- Roadcue er ikke et socialt medie med likes, followers, stories eller avancerede feeds.
- VICO er ikke en nummereret voice-menu og kræver ikke faste kommandoer.
- Der implementeres ikke én use case for hvert almindeligt AI-spørgsmål.
- LLM’en udfører ikke præcise geo-, afstands-, tids-, kø- eller parkeringsberegninger.
- LLM’en har ikke direkte adgang til SQL Server.
- Community-observationer kræver ikke en databasekolonne for hver observationstype.
- Roadcue anvender både almindelig AI, egne data, eksterne kilder og senere community-data.
- Første POC er reaktiv og indeholder ikke proaktive afbrydelser.
- Avanceret kø- og parkeringsprognose ligger i en senere vision.
- Ask the Road implementeres efter de første enkle reaktive flows.
- Eksterne leverandører placeres bag Roadcues egne C#-interfaces.
- VICO rådgiver chaufføren og styrer aldrig køretøjet.

---

# 8. Prioriteringsmodel

| Prioritet | Betydning |
|---|---|
| MUST | Nødvendigt for den angivne fase |
| SHOULD | Vigtigt, men fasen kan demonstreres uden |
| COULD | Ønsket udvidelse, hvis tid og økonomi tillader det |
| LATER | Bevidst placeret i en senere fase eller vision |

---

# 9. Funktionelle krav

## 9.1 Naturlig samtale og kontekst

| ID | Krav | Prioritet | Fase | Use case |
|---|---|---|---|---|
| FR-001 | Chaufføren skal kunne kommunikere med VICO i naturligt hverdagssprog uden faste kommandoer. | MUST | POC | UC-01 |
| FR-002 | VICO skal kunne besvare almindelige AI-spørgsmål uden et specifikt tool til hvert spørgsmål. | MUST | POC | UC-01 |
| FR-003 | VICO skal som udgangspunkt svare på dansk. | MUST | POC | UC-01 |
| FR-004 | VICO skal kunne skifte sprog efter chaufførens ønske. | SHOULD | POC | UC-01 |
| FR-005 | Svar skal formuleres kort, naturligt og egnet til oplæsning. | MUST | POC | UC-01 |
| FR-006 | VICO skal bevare samtalekonteksten gennem et stabilt `thread_id`. | MUST | POC | UC-02 |
| FR-007 | VICO skal forstå henvisninger som “der”, “den”, “ham” og “stedet” ud fra samtalen. | MUST | POC | UC-02 |
| FR-008 | VICO skal bede om præcisering, når en henvisning eller intention er tvetydig. | MUST | POC | UC-02/UC-04 |
| FR-009 | Chaufføren skal kunne bede om gentagelse, uddybning eller et kortere svar. | SHOULD | POC | UC-01 |
| FR-010 | VICO skal kunne bruges som companion til almindelig samtale, quiz, sprogtræning og humor. | SHOULD | MVP | UC-28 |

## 9.2 Valg af datakilder og tools

| ID | Krav | Prioritet | Fase | Use case |
|---|---|---|---|---|
| FR-011 | VICO skal afgøre, om et spørgsmål kan besvares direkte af AI-modellen. | MUST | POC | UC-03 |
| FR-012 | VICO skal afgøre, om et spørgsmål kræver Roadcue-data. | MUST | POC | UC-03 |
| FR-013 | VICO skal afgøre, om et spørgsmål kræver en ekstern tjeneste. | MUST | POC | UC-03 |
| FR-014 | VICO skal senere kunne afgøre, om andre chauffører bør spørges. | LATER | Senere | UC-03/UC-16 |
| FR-015 | VICO skal automatisk vælge blandt de tools, som systemet har godkendt. | MUST | POC | UC-03 |
| FR-016 | VICO skal kunne kalde flere tools i den nødvendige rækkefølge. | MUST | POC | UC-03 |
| FR-017 | Output fra ét tool skal kunne anvendes som input til det næste. | MUST | POC | UC-03 |
| FR-018 | VICO skal kombinere flere tool-resultater til ét samlet svar. | MUST | POC | UC-03/UC-08 |
| FR-019 | VICO skal undgå unødvendige tool-kald. | SHOULD | POC | UC-03 |
| FR-020 | VICO skal give en forståelig fejl, hvis et nødvendigt tool ikke er tilgængeligt. | MUST | POC | UC-03/UC-04 |
| FR-021 | VICO må ikke opfinde Roadcue-data eller hævde, at en mislykket handling lykkedes. | MUST | Alle | UC-04 |
| FR-022 | VICO skal kunne fortælle, hvilke oplysninger der mangler eller er usikre. | MUST | POC | UC-04 |

## 9.3 Chauffør- og kørselskontekst

| ID | Krav | Prioritet | Fase | Use case |
|---|---|---|---|---|
| FR-023 | Roadcue skal identificere chaufføren gennem login eller token i den færdige løsning. | MUST | MVP | UC-05 |
| FR-024 | POC’en skal kunne anvende en kontrolleret simuleret chauffør. | MUST | POC | UC-05 |
| FR-025 | VICO skal modtage chaufførens autoriserede `driverId` som kontekst. | MUST | MVP | UC-05 |
| FR-026 | POC’en skal kunne anvende simulerede GPS-positioner. | MUST | POC | UC-05 |
| FR-027 | VICO skal kunne anvende position, retning, hastighed og tidspunkt som kontekst. | MUST | MVP | UC-05 |
| FR-028 | VICO skal senere kunne anvende en aktiv rute som kontekst. | LATER | Senere | UC-05 |
| FR-029 | Lokationsdata må kun anvendes med relevant samtykke. | MUST | MVP | UC-05 |
| FR-030 | Chaufføren skal kunne stoppe eller begrænse lokationsdeling. | MUST | MVP | UC-05 |

## 9.4 Aktuelle oplysninger, steder og faciliteter

| ID | Krav | Prioritet | Fase | Use case |
|---|---|---|---|---|
| FR-031 | VICO skal kunne besvare aktuelle spørgsmål ved at kombinere tid, position og en ekstern tjeneste. | MUST | MVP | UC-06 |
| FR-032 | VICO skal kunne finde næste relevante truck stop eller rasteplads foran chaufføren. | MUST | POC/MVP | UC-07 |
| FR-033 | Chaufføren skal kunne angive en tidshorisont som “om 45 minutter”. | MUST | MVP | UC-07 |
| FR-034 | Chaufføren skal kunne kombinere krav om mad, tank, toilet, bad og parkering. | MUST | MVP | UC-07 |
| FR-035 | Backend skal filtrere steder ud fra chaufførens retning og kriterier. | MUST | MVP | UC-07 |
| FR-036 | Backend skal beregne afstand og forventet ankomsttid. | MUST | POC/MVP | UC-07/SUC-01 |
| FR-037 | VICO skal kunne foreslå det nærmeste relevante alternativ, hvis ingen steder opfylder alle krav. | SHOULD | MVP | UC-07 |
| FR-038 | VICO skal tydeligt oplyse, hvilke faciliteter der ikke kan bekræftes. | MUST | MVP | UC-07 |
| FR-039 | VICO skal kunne kombinere steddata, venner og community-oplysninger i samme forespørgsel. | SHOULD | MVP/Senere | UC-08 |
| FR-040 | VICO skal skelne mellem officielle steddata og community-oplysninger. | MUST | MVP | UC-09 |

## 9.5 Venner og bevægelsesstatus

| ID | Krav | Prioritet | Fase | Use case |
|---|---|---|---|---|
| FR-041 | VICO skal kunne hente den aktuelle chaufførs venner gennem Roadcue Backend. | MUST | POC | UC-10 |
| FR-042 | VICO skal kunne finde en ven ved navn. | MUST | POC | UC-10 |
| FR-043 | VICO skal håndtere flere personer med samme navn uden at gætte. | MUST | POC | UC-10 |
| FR-044 | VICO skal kunne finde venner, der har delt position i nærheden af chaufføren. | MUST | MVP | UC-11 |
| FR-045 | VICO skal kunne finde venner ved et bestemt eller tidligere omtalt sted. | MUST | MVP | UC-11 |
| FR-046 | Backend skal udføre geografisk match og kun returnere autoriserede positioner. | MUST | MVP | UC-11/SUC-03 |
| FR-047 | VICO skal senere kunne finde chauffører ved et fremtidigt sted og tidspunkt. | LATER | Senere | UC-12 |
| FR-048 | Fremtidige positioner skal præsenteres som forventninger og ikke sikre fakta. | MUST | Senere | UC-12 |
| FR-049 | Backend skal kunne beregne, om en ven kører, holder stille eller har forældede GPS-data. | SHOULD | MVP | UC-33 |
| FR-050 | Bevægelsesstatus skal beregnes ud fra flere GPS-målinger, varighed og seneste opdatering. | MUST | MVP | UC-33 |
| FR-051 | VICO skal kunne fortælle, hvor længe en ven sandsynligvis har holdt stille, og hvornår positionen sidst blev opdateret. | SHOULD | MVP | UC-33 |
| FR-052 | Bevægelsesstatus må kun vises, når vennen har givet den nødvendige tilladelse. | MUST | MVP | UC-33/SUC-03 |

## 9.6 Community-observationer og Ask the Road

| ID | Krav | Prioritet | Fase | Use case |
|---|---|---|---|---|
| FR-053 | Chaufføren skal kunne rapportere en fri observation uden at vælge en kategori. | MUST | MVP | UC-14 |
| FR-054 | Backend skal automatisk tilføje position, vej/område, retning og tidspunkt. | MUST | MVP | UC-14 |
| FR-055 | VICO skal læse den fortolkede observation tilbage før publicering. | MUST | MVP | UC-14 |
| FR-056 | Chaufføren skal kunne rette eller annullere observationen. | MUST | MVP | UC-14 |
| FR-057 | En ny observation skal som udgangspunkt gemmes som ubekræftet. | MUST | MVP | UC-14 |
| FR-058 | Observationer skal kunne søges efter position, sted, tid, alder og gyldighed. | MUST | MVP | UC-15 |
| FR-059 | Fritekstobservationer skal senere kunne søges semantisk sammen med deterministiske filtre. | LATER | Senere | UC-15/SUC-05 |
| FR-060 | VICO skal kunne foreslå at spørge communityet, når eksisterende data ikke er tilstrækkelige. | LATER | Senere | UC-16 |
| FR-061 | Community-spørgsmål må kun sendes til relevante chauffører. | MUST | Senere | UC-16 |
| FR-062 | Relevans skal beregnes ud fra position, retning, tidspunkt, relation og tilladelser. | MUST | Senere | UC-16 |
| FR-063 | Et community-spørgsmål skal have et stabilt ID og en timeout. | MUST | Senere | UC-16/SUC-04 |
| FR-064 | LangGraph-flowet skal kunne vente og genoptages, når der ankommer svar. | MUST | Senere | UC-16/SUC-04 |
| FR-065 | Chaufføren skal kunne annullere et ventende spørgsmål eller få dets status. | SHOULD | Senere | UC-16 |
| FR-066 | Flere chaufførers svar skal opsummeres til ét svar. | MUST | Senere | UC-17 |
| FR-067 | Antal svar, alder, enighed og sikkerhedsstatus skal beregnes uden for LLM’en. | MUST | Senere | UC-17/SUC-06 |

## 9.7 Trafik, parkering og ekstern ruteændring

| ID | Krav | Prioritet | Fase | Use case |
|---|---|---|---|---|
| FR-068 | VICO skal kunne hente relevante trafikoplysninger fra eksterne kilder og community-data. | MUST | MVP | UC-18 |
| FR-069 | Trafikoplysninger skal kunne omfatte kø, ulykker, lukkede spor, vejarbejde, vejproblemer og relevante vejrforhold. | MUST | MVP | UC-18 |
| FR-070 | Trafikoplysninger skal filtreres efter position, retning og aktualitet. | MUST | MVP | UC-18 |
| FR-071 | VICO skal skelne mellem officielle, community-baserede og ubekræftede trafikoplysninger. | MUST | MVP | UC-18 |
| FR-072 | VICO skal kunne hente aktuelle parkeringsobservationer for et valgt sted. | MUST | MVP | UC-19 |
| FR-073 | VICO må ikke love, at en parkeringsplads stadig er ledig ved ankomst. | MUST | Alle | UC-19/UC-22 |
| FR-074 | Roadcue skal kunne vurdere, om en forhindring påvirker chaufførens aktive rute. | LATER | Senere | UC-32 |
| FR-075 | En ekstern routingservice skal kunne beregne et alternativ og forskellen i tid og afstand. | LATER | Senere | UC-32/SUC-02 |
| FR-076 | VICO skal forklare forhindringen, det eksternt beregnede alternativ og usikkerheden. | LATER | Senere | UC-32 |
| FR-077 | Chaufføren skal godkende en ruteændring, før den aktiveres. | MUST | Senere | UC-32 |
| FR-078 | Roadcue skal sende en accepteret rute til den eksterne navigationstjeneste. | LATER | Senere | UC-32 |
| FR-079 | VICO må først bekræfte ruteændringen, når navigationstjenesten har accepteret den. | MUST | Senere | UC-32 |
| FR-080 | Roadcue skal senere kunne registrere mulige trafikproblemer fra anonymiserede GPS- og hastighedssignaler. | LATER | Vision | UC-20 |
| FR-081 | Roadcue skal senere kunne estimere køens begyndelse, slutning, længde og udvikling. | LATER | Vision | UC-21 |
| FR-082 | Roadcue skal senere kunne estimere trafik- og parkeringsforhold ved chaufførens ankomst. | LATER | Vision | UC-21/UC-22 |

## 9.8 Beskeder og oversættelse

| ID | Krav | Prioritet | Fase | Use case |
|---|---|---|---|---|
| FR-083 | Indgående beskeder skal gemmes med afsender, tidspunkt og status. | MUST | MVP | UC-23 |
| FR-084 | Beskeder skal kunne placeres i en ventende kø i stedet for straks at blive afspillet. | MUST | MVP | UC-23 |
| FR-085 | Chaufføren skal kunne vælge næste besked, afsender eller en opsummering. | MUST | MVP | UC-23 |
| FR-086 | Chaufføren skal kunne pause, fortsætte, gentage, springe over eller gemme en besked. | MUST | MVP | UC-23 |
| FR-087 | Chaufføren skal kunne diktere eller skrive et svar. | MUST | MVP | UC-24 |
| FR-088 | Modtager og beskedindhold skal gengives før afsendelse. | MUST | MVP | UC-24 |
| FR-089 | Chaufføren skal bekræfte afsendelsen. | MUST | MVP | UC-24 |
| FR-090 | VICO må først bekræfte afsendelsen efter succes fra backend. | MUST | MVP | UC-24 |
| FR-091 | VICO skal senere kunne oversætte beskeder mellem chaufførernes foretrukne sprog. | LATER | Senere | UC-25 |
| FR-092 | Originaltekst, navne, stednavne og vejnumre skal bevares korrekt. | MUST | Senere | UC-25 |
| FR-093 | Usikker oversættelse skal markeres. | MUST | Senere | UC-25 |

## 9.9 Voice-first brugeroplevelse

| ID | Krav | Prioritet | Fase | Use case |
|---|---|---|---|---|
| FR-094 | Tale-til-tekst skal lægges oven på det fungerende tekstbaserede agent-flow. | MUST | MVP | UC-26 |
| FR-095 | Tekst-til-tale skal kunne oplæse VICO’s svar. | MUST | MVP | UC-26 |
| FR-096 | Chaufføren skal kunne afbryde, stoppe, gentage og fortsætte oplæsning. | MUST | MVP | UC-26 |
| FR-097 | Ved lav talegenkendelsessikkerhed skal VICO bede om gentagelse. | MUST | MVP | UC-26 |
| FR-098 | Handlinger med konsekvens skal læses tilbage og bekræftes. | MUST | MVP | UC-26 |
| FR-099 | Chaufføren skal kunne bede VICO læse relevante dele af appen op gennem naturlige formuleringer. | MUST | MVP | UC-27 |
| FR-100 | VICO skal opsummere lange lister og tilbyde flere detaljer. | SHOULD | MVP | UC-27 |
| FR-101 | De centrale Roadcue-funktioner skal kunne gennemføres uden nødvendig skærmbetjening. | MUST | MVP | UC-26/UC-27 |

## 9.10 Personlighed, sociale møder og proaktivitet

| ID | Krav | Prioritet | Fase | Use case |
|---|---|---|---|---|
| FR-102 | Chaufføren skal kunne konfigurere svarlængde, sprog, oplæsningshastighed og snakkelyst. | SHOULD | MVP | UC-29 |
| FR-103 | Chaufføren skal senere kunne konfigurere humor, proaktivitet og Driving Coach-niveau. | LATER | Senere | UC-29 |
| FR-104 | Personlighedsindstillinger må ikke tilsidesætte sikkerheds- eller sandhedskrav. | MUST | Alle | UC-29 |
| FR-105 | Chaufføren skal senere kunne oprette en tids- og stedafgrænset social forespørgsel. | LATER | Senere | UC-13 |
| FR-106 | Kontakt mellem chauffører skal kræve accept fra begge parter. | MUST | Senere | UC-13 |
| FR-107 | VICO skal senere kunne give relevante proaktive meddelelser. | LATER | Senere | UC-30 |
| FR-108 | Proaktiv relevans skal afhænge af position, retning, tidspunkt, sikkerhed og brugerindstillinger. | MUST | Senere | UC-30 |
| FR-109 | Ikke-kritiske proaktive oplysninger skal kunne placeres i en kø. | MUST | Senere | UC-30 |
| FR-110 | Chaufføren skal kunne dæmpe eller deaktivere proaktive kategorier. | MUST | Senere | UC-30 |
| FR-111 | Driving Coach skal være rådgivende, justerbar og kunne slås fra. | MUST | Senere | UC-31 |
| FR-112 | VICO må aldrig kontrollere køretøjet eller udføre sikkerhedskritiske beslutninger på chaufførens vegne. | MUST | Alle | UC-31 |

---

# 10. Ikke-funktionelle krav

## 10.1 Brugervenlighed og trafiksikkerhed

| ID | Krav | Prioritet |
|---|---|---|
| NFR-001 | VICO’s standardsvar under kørsel skal være korte og kunne forstås ved én oplæsning. | MUST |
| NFR-002 | Chaufføren skal kunne stoppe en oplæsning eller handling straks. | MUST |
| NFR-003 | Systemet skal begrænse unødvendige og gentagne afbrydelser. | MUST |
| NFR-004 | Lange eller ikke-vigtige oplysninger skal kunne gemmes til senere. | SHOULD |
| NFR-005 | VICO skal tydeligt skelne mellem rådgivning og udført handling. | MUST |
| NFR-006 | Voice-first må ikke betyde, at alle oplysninger automatisk læses op. | MUST |

## 10.2 Ydeevne

| ID | Krav | Prioritet |
|---|---|---|
| NFR-007 | Et almindeligt AI-svar bør begynde inden for 3 sekunder under normale forhold. | SHOULD |
| NFR-008 | Et enkelt internt tool-kald bør returnere inden for 2 sekunder under normale forhold. | SHOULD |
| NFR-009 | VICO skal give en status, hvis en forespørgsel tager længere end 5 sekunder. | SHOULD |
| NFR-010 | Alle eksterne kald skal have en konfigurerbar timeout. | MUST |

## 10.3 Pålidelighed

| ID | Krav | Prioritet |
|---|---|---|
| NFR-011 | En skrivehandling må ikke udføres to gange ved retry. | MUST |
| NFR-012 | Ventende beskeder og community-flows må ikke gå tabt ved genstart. | MUST |
| NFR-013 | Fejl fra AI, C# eller eksterne services skal omsættes til forståelige svar. | MUST |
| NFR-014 | VICO må ikke bekræfte en handling uden teknisk bekræftelse fra den ansvarlige service. | MUST |
| NFR-015 | Health-checks skal findes for både C#-API og Python/FastAPI. | MUST |

## 10.4 Sikkerhed og privatliv

| ID | Krav | Prioritet |
|---|---|---|
| NFR-016 | Brugeren må kun få adgang til egne eller eksplicit delte data. | MUST |
| NFR-017 | Alle brugerrelaterede tool-kald skal autoriseres i backend. | MUST |
| NFR-018 | Lokationsdata må kun anvendes med samtykke. | MUST |
| NFR-019 | Der skal kun gemmes de positionsdata, som har et klart formål. | MUST |
| NFR-020 | API-nøgler og secrets må ikke ligge i kode, prompts eller klienten. | MUST |
| NFR-021 | Tool-output, beskeder og community-tekst må ikke kunne overtage systeminstruktionerne. | MUST |
| NFR-022 | Følsomme handlinger skal kunne auditeres. | MUST |
| NFR-023 | Systemet skal understøtte sletning af brugerens relevante data. | SHOULD |

## 10.5 Datakvalitet og troværdighed

| ID | Krav | Prioritet |
|---|---|---|
| NFR-024 | Community-data skal have kilde, tidspunkt, gyldighed og sikkerhedsstatus. | MUST |
| NFR-025 | Gamle observationer skal kunne udløbe eller vægtes lavere. | MUST |
| NFR-026 | Modstridende oplysninger skal kunne repræsenteres og kommunikeres. | MUST |
| NFR-027 | VICO må ikke ændre en beregnet sikkerhedsstatus i sin formulering. | MUST |
| NFR-028 | AI-genererede opsummeringer skal kunne spores til de underliggende data. | SHOULD |

## 10.6 Vedligeholdelse og udvidelse

| ID | Krav | Prioritet |
|---|---|---|
| NFR-029 | Nye domæner og tools skal kunne tilføjes uden at omskrive eksisterende domæner. | MUST |
| NFR-030 | Den generelle VICO-prompt og domæneinstruktioner skal versionsstyres i Git. | MUST |
| NFR-031 | Eksterne leverandører skal kunne udskiftes bag interne interfaces. | MUST |
| NFR-032 | API-request og response-modeller skal være tydelige og versionsbare. | MUST |
| NFR-033 | Løsningen skal kunne køres lokalt uden Kubernetes. | MUST |

## 10.7 Logging og kvalitet

| ID | Krav | Prioritet |
|---|---|---|
| NFR-034 | Systemet skal logge valgte tools, resultatstatus, fejl og svartid. | MUST |
| NFR-035 | Logging må ikke unødvendigt indeholde følsomme persondata eller secrets. | MUST |
| NFR-036 | Der skal findes automatiske tests for centrale agent- og tool-flows. | MUST |
| NFR-037 | Der skal testes for hallucinerede Roadcue-data. | MUST |
| NFR-038 | Der skal testes for tvetydige navne, manglende data og utilgængelige services. | MUST |
| NFR-039 | Nye promptversioner skal kunne evalueres mod faste testscenarier. | SHOULD |

---

# 11. Arkitekturkrav

| ID | Krav |
|---|---|
| ARC-001 | Angular er brugergrænsefladen til mobil web/PWA. |
| ARC-002 | .NET/C# er Roadcues hovedplatform og ejer forretningslogik. |
| ARC-003 | SQL Server anvendes til Roadcues strukturerede data. |
| ARC-004 | Python/FastAPI eksponerer AI- og agentlaget. |
| ARC-005 | LangChain anvendes til tools og modelintegration. |
| ARC-006 | LangGraph anvendes til state, orkestrering og senere ventende flows. |
| ARC-007 | Python må kun tilgå Roadcue-data gennem godkendte C#-API’er. |
| ARC-008 | C# ejer SQL-adgang, autorisation, geoqueries og præcise beregninger. |
| ARC-009 | LLM’en må ikke generere eller udføre SQL mod Roadcue-databasen. |
| ARC-010 | Eksterne data- og routingleverandører implementeres bag C#-interfaces. |
| ARC-011 | VICO er den overordnede agent; Friends, Messages, Community og Traffic er domæner. |
| ARC-012 | Den generelle systemprompt placeres under `app/core/prompts`. |
| ARC-013 | Domænespecifikke instruktioner placeres i deres respektive domæner. |
| ARC-014 | Den første løsning skal være enkel og må ikke kræve Kubernetes eller unødvendige microservices. |

---

# 12. Fasedeling

## Fase 1 – Grundlæggende integration, gennemført eller påbegyndt

- C#-API og Scalar fungerer.
- FastAPI og Swagger fungerer.
- Python kan kalde C#-API’et.
- `GetDrivers` og `GetDriverFriends` findes som LangChain-tools.
- LangGraph-agenten kan vælge og udføre tools.
- VICO er etableret som overordnet agent.
- Generel prompt og Friends-instruktioner er opdelt.

## Fase 2 – Tekstbaseret POC

- Samtaletråde og hukommelse i den aktuelle samtale.
- Kontrolleret simuleret chaufføridentitet.
- Simuleret GPS-position, retning, hastighed og tidspunkt.
- Tool til aktuel chaufførkontekst.
- C#-integration til en billig eller gratis stedtjeneste.
- Find næste relevante truck stop.
- Beregn afstand og forventet ankomsttid i C#.
- Kombinér sted og venner i ét spørgsmål.
- Sikkert flow, når VICO ikke kender svaret.
- Logging og automatiske tests.

## Fase 3 – MVP

- Loginbaseret chaufføridentitet.
- Rigtig telefon-/iPad-GPS med samtykke.
- Venner i nærheden og venners bevægelsesstatus.
- Beskeder, kø, oplæsning og bekræftet svar.
- Tale-til-tekst og tekst-til-tale.
- Frie community-observationer.
- Søgning efter aktive observationer.
- Eksterne trafik-, sted- og vejroplysninger.

## Fase 4 – Community og avanceret orkestrering

- Ask the Road.
- Ventende og genoptagelige LangGraph-flows.
- Opsummering og troværdighedsvurdering af flere svar.
- Fremtidige positioner og sociale møder.
- Automatisk oversættelse mellem chauffører.
- Eksternt beregnede rutealternativer og bekræftet aktivering i navigationstjenesten.

## Fase 5 – Proaktiv Roadcue

- Relevans- og prioritetsmotor.
- Proaktive, justerbare meddelelser.
- Stille tilstand og afbrydelsesregler.
- Valgfri Driving Coach.

## Fase 6 – Datadrevet vision

- Automatisk trafikregistrering fra anonymiserede GPS- og hastighedssignaler.
- Estimering af køens begyndelse, slutning og længde.
- Prognose for trafikforhold ved ankomst.
- Prognose for parkeringsforhold ved ankomst.

---

# 13. Acceptkriterier for den tekstbaserede POC

## AC-01 – Almindelig AI-samtale

**Given** at VICO er startet  
**When** chaufføren skriver “Hvad betyder Umleitung?”  
**Then** svarer VICO på dansk uden at kalde et Roadcue-tool.

## AC-02 – Samtalekontekst

**Given** at VICO har fundet et bestemt truck stop  
**When** chaufføren spørger “Er der nogen, jeg kender der?”  
**Then** forstår VICO, at “der” henviser til det fundne truck stop.

## AC-03 – Friends-tool

**Given** en simuleret chauffør med venner  
**When** chaufføren spørger “Hvem er mine venner?”  
**Then** henter VICO vennedata gennem C#-API’et og opfinder ingen personer.

## AC-04 – Find næste relevante sted

**Given** en simuleret position og kørselsretning  
**When** chaufføren spørger “Find næste sted med mad og tank”  
**Then** vælger VICO det relevante tool, og C# returnerer et sted med beregnet afstand og tid.

## AC-05 – Kombinér tools

**Given** et fundet sted og en chauffør med venner  
**When** chaufføren spørger “Find et sted med mad og se, om nogen jeg kender er der”  
**Then** anvender VICO både sted- og Friends-funktionerne og giver ét samlet svar.

## AC-06 – Manglende data

**Given** at de nødvendige data ikke findes  
**When** chaufføren stiller et spørgsmål, der ikke kan besvares sikkert  
**Then** siger VICO, at oplysningerne mangler, i stedet for at gætte.

## AC-07 – Præcis beregning

**Given** to geografiske positioner  
**When** afstanden skal oplyses  
**Then** kommer den numeriske afstand fra en deterministisk C#-service og ikke fra LLM’en.

## AC-08 – Fejlhåndtering

**Given** at C#-API’et eller en ekstern tjeneste er utilgængelig  
**When** VICO forsøger at udføre et tool  
**Then** modtager chaufføren en kort, forståelig fejl uden teknisk stack trace.

---

# 14. Samlet løsningsprincip

```text
Chaufførens naturlige spørgsmål
              ↓
             VICO
              ↓
   Intention og samtalekontekst
              ↓
  AI-svar eller godkendte tools
              ↓
 Roadcue C#-API og eksterne services
              ↓
 Deterministiske data og beregninger
              ↓
 Ét kort, relevant og troværdigt svar
```

Roadcue skal gøre de underliggende apps og tjenester usynlige for chaufføren. De fungerer som motorer under overfladen, mens VICO bliver den samlede samtalebaserede brugeroplevelse.
