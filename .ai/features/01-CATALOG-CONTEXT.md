# Roadcue VICO – Prioriteret Use Case-katalog

## 1. Formål

Dette dokument omdanner Roadcues funktionskrav til egentlige use cases. Kravene er ikke oversat én til én. Relaterede krav er samlet i de brugerforløb, hvor de naturligt indgår.

Roadcues kerne er:

> VICO er en kontekstbevidst AI-copilot, som chaufføren kan tale naturligt med, og som selv afgør, om svaret skal findes via almindelig AI, Roadcue-data, eksterne services eller andre chauffører.

## 2. Afgrænsning

- Roadcue er ikke en komplet navigations- eller routingmotor.
- Eksterne tjenester leverer rute-, sted-, vejr- og trafikdata bag Roadcues C#-services.
- Roadcue er ikke et flådestyrings-, ERP-, tachograf- eller autonomt køresystem.
- Første løsning er Angular, .NET, SQL Server og Python/LangChain/LangGraph.
- .NET/C# ejer forretningslogik, SQL, autorisation, geoqueries og præcise beregninger.
- Python ejer AI- og agentorkestreringen og kalder C# gennem kontrollerede tools.
- Første POC er tekstbaseret og reaktiv. Voice og proaktivitet lægges ovenpå senere.
- POC'en skal kunne gennemføres med simulerede chauffører og GPS-positioner.

## 3. Aktører

| Aktør | Rolle |
|---|---|
| Chauffør | Primær bruger, som taler eller skriver til VICO |
| VICO | AI-copilot, som forstår intentionen og orkestrerer funktioner |
| Roadcue Backend | C#-API, der ejer data, regler, beregninger og autorisation |
| Ekstern datatjeneste | Leverer eksempelvis sted-, vejr- eller trafikdata |
| Community-chauffør | Modtager og besvarer relevante spørgsmål |
| Baggrundsprocessor | Behandler ventende flows, GPS-signaler og nye hændelser |

## 4. Faser

| Fase | Betydning |
|---|---|
| POC | Første tekstbaserede bevis af agent-flowet |
| MVP | Første brugbare voice-first version |
| Senere | Udvidelse efter validering af kernefunktionerne |
| Vision | Datakrævende analyse og prognoser |

## 5. Prioriteringsprincip

Use cases prioriteres efter, hvor meget de gør chaufførens almindelige arbejdsdag lettere og sikrere. Teknisk fundament bygges først, men det er ikke i sig selv produktets værdi.

Der skelnes mellem to forskellige typer community-funktioner:

- **Aktuelle community-meldinger og advarsler er Must Have.** Det gælder eksempelvis nyligt rapporteret kø, lukkede spor, problemer på en rasteplads og aktuelle parkeringsforhold.
- **Avancerede prognoser er senere funktioner.** Det gælder eksempelvis beregning af, hvor lang køen forventes at være ved ankomst, eller om en parkeringsplads sandsynligvis er fuld om 45 minutter.

Sociale møder er heller ikke blot pynt. At kunne opdage, at venner holder samme sted, eller planlægge en fælles pause, er en vigtig del af Roadcues sociale kerne. Den funktion placeres derfor efter det basale driver-flow, men før egentlige nice-to-have-funktioner.

## 6. Prioriteret roadmap

### MUST HAVE 1 – Teknisk fundament og første tekst-POC

Disse use cases beviser, at VICO kan forstå chaufføren, bevare kontekst og bruge Roadcues funktioner korrekt:

1. **UC-01 – Føre en naturlig AI-samtale.**
2. **UC-02 – Føre en sammenhængende samtale.**
3. **UC-03 – Vælge datakilder og tools automatisk.**
4. **UC-04 – Håndtere manglende eller usikker viden.**
5. **UC-05 – Etablere chaufførens sikre kontekst** med simuleret bruger og GPS i POC'en.
6. **UC-10 – Find chaufførens venner**, som allerede er det første fungerende Roadcue-tool-flow.
7. **SUC-01 til SUC-03** – præcise beregninger, leverandøruafhængige integrationer og autorisation.

### MUST HAVE 2 – Funktioner der straks letter chaufførens hverdag

Dette er den første version, som en chauffør skal kunne opleve som reelt nyttig:

1. **UC-26 – Betjen VICO med stemmen.**
2. **UC-27 – Få relevante dele af appen læst op.**
3. **UC-07 – Find næste relevante sted** med eksempelvis mad, tank, toilet, bad eller parkering.
4. **UC-06 – Besvare et aktuelt kontekstafhængigt spørgsmål** som vejr eller solnedgang.
5. **UC-18 – Få relevante trafikoplysninger.**
6. **UC-32 – Håndtér en forhindring og skift den aktive rute** gennem en ekstern routing- og navigationstjeneste.
7. **UC-23 – Håndtér ventende beskeder.**
8. **UC-24 – Besvar eller send en besked.**
9. **UC-11 – Find venner nær chaufføren eller et sted.**
10. **UC-33 – Fortæl om en vens bevægelsesstatus.**
11. **UC-08 – Find et sted med flere datakrav**, eksempelvis mad, parkering og venner i samme spørgsmål.

### MUST HAVE 3 – Roadcues community- og sociale kerne

Disse use cases kommer efter det stabile driver-flow, men de er nødvendige for at gøre Roadcue væsentligt anderledes end eksisterende apps:

1. **UC-14 – Rapportér en fri observation** med automatisk position, retning og tidspunkt.
2. **UC-15 – Søg i communityets viden.**
3. **UC-09 – Hent detaljer og community-status for et sted.**
4. **UC-19 – Undersøg aktuel parkeringssituation.**
5. **UC-16 – Spørg communityet og vent på svar – Ask the Road.**
6. **UC-17 – Opsummér flere community-svar.**
7. **UC-13 – Opret et socialt møde eller en samtalekontakt.**
8. **UC-25 – Oversæt en samtale mellem chauffører.**
9. **UC-30 – Giv en relevant proaktiv meddelelse** om en aktuel og relevant hændelse.
10. **SUC-04 til SUC-06** – ventende flows, fleksible observationer og troværdighed.

Aktuelle community-advarsler i denne gruppe skal altså ikke vente på de avancerede prognoser. Roadcue skal kunne advare om en nyligt rapporteret hændelse, selv om systemet endnu ikke kan forudsige dens fremtidige udvikling.

### NICE TO HAVE – Personalisering og ekstra oplevelse

Disse funktioner er værdifulde, men Roadcue kan gøre chaufførens kernearbejdsdag lettere uden dem i den første version:

1. **UC-28 – Brug VICO som companion** med udvidet quiz, humor og selskab.
2. **UC-29 – Tilpas VICO's personlighed og adfærd** ud over de nødvendige grundindstillinger.
3. **UC-31 – Modtag rådgivning fra Driving Coach.**
4. Udvidede sociale præferencer og mere avancerede kontaktforslag.

### SENERE – Fremtidig koordinering

Disse funktioner bygger videre på GPS-kontekst og sociale møder, men kræver mere stabil positionsdeling og forventede ankomsttider:

1. **UC-12 – Find chauffører ved fremtidig position og tid.**
2. Udvid UC-13 med planlagte møder mellem chauffører, som endnu ikke er ankommet.
3. Beregn forventede mødepunkter og tidsvinduer deterministisk i C#.

### VISION – Datakrævende prognoser

Disse funktioner kræver store mængder valide GPS-, hastigheds-, historik- og community-data:

1. **UC-20 – Detektér et muligt trafikproblem automatisk.**
2. **UC-21 – Beregn trafikforhold ved chaufførens ankomst.**
3. **UC-22 – Forudsig parkeringsforhold ved ankomst.**

UC-20 kan eventuelt rykkes frem før UC-21 og UC-22, når Roadcue har tilstrækkeligt mange aktive chauffører. Automatisk registrering af et aktuelt hastighedsfald er enklere end en egentlig prognose for fremtiden.

---
