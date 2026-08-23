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

# A. Samtale og AI-orkestrering

## UC-01 – Føre en naturlig AI-samtale

**Fase:** POC  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren får hjælp, viden eller selskab uden at lære bestemte kommandoer.

**Forudsætninger**

- VICO er tilgængelig gennem tekst eller senere tale.
- En AI-model er konfigureret.

**Hovedflow**

1. Chaufføren stiller et almindeligt spørgsmål med naturligt sprog.
2. VICO vurderer, at spørgsmålet kan besvares uden Roadcue-data.
3. VICO besvarer spørgsmålet direkte ved hjælp af almindelig AI-viden.
4. Svaret formuleres kort, naturligt og egnet til oplæsning.
5. Chaufføren kan stille et opfølgende spørgsmål.

**Eksempler**

- “Hvad betyder Umleitung?”
- “Quiz mig i tysk.”
- “Fortæl mig noget interessant.”
- “Fortæl en vittighed.”

**Alternative flows**

- Hvis spørgsmålet kræver aktuelle eller lokale data, fortsætter flowet i UC-03.
- Hvis VICO ikke kan besvare spørgsmålet sikkert, fortsætter flowet i UC-04.

**Resultat**

- Chaufføren har fået et direkte AI-svar eller er sendt videre til en relevant datakilde.

---

## UC-02 – Føre en sammenhængende samtale

**Fase:** POC  
**Primær aktør:** Chauffør  
**Mål:** VICO forstår opfølgende spørgsmål og sproglige henvisninger ud fra samtalekonteksten.

**Forudsætninger**

- Samtalen har et stabilt `thread_id`.
- Tidligere beskeder og tool-resultater findes i samtalens state.

**Hovedflow**

1. Chaufføren stiller et spørgsmål.
2. VICO besvarer spørgsmålet og gemmer den relevante kontekst.
3. Chaufføren stiller et opfølgende spørgsmål med en henvisning som “der”, “den” eller “ham”.
4. VICO forbinder henvisningen med det korrekte sted, objekt eller menneske fra samtalen.
5. VICO besvarer spørgsmålet uden at bede chaufføren gentage kendte oplysninger.

**Eksempel**

1. “Hvor langt er der til næste rasteplads?”
2. “Er der nogen, jeg kender der?”
3. VICO forstår, at “der” er den fundne rasteplads.

**Alternative flows**

- Hvis flere tidligere objekter kan matche henvisningen, beder VICO om præcisering.
- Hvis konteksten er udløbet eller mangler, forklarer VICO det kort.

**Resultat**

- Samtalen fortsætter sammenhængende med korrekt reference til tidligere information.

---

## UC-03 – Vælge datakilder og tools automatisk

**Fase:** POC  
**Primær aktør:** Chauffør  
**Støtteaktører:** Roadcue Backend, ekstern datatjeneste, senere community  
**Mål:** VICO finder selv den korrekte vej til et svar.

**Hovedflow**

1. Chaufføren formulerer et spørgsmål eller ønske.
2. VICO analyserer intention, kontekst og nødvendige oplysninger.
3. VICO vurderer, om svaret kræver:
   - almindelig AI-viden,
   - Roadcue-data,
   - en ekstern tjeneste,
   - eller senere et community-spørgsmål.
4. VICO vælger det relevante tool.
5. VICO kan bruge output fra ét tool som input til det næste.
6. VICO samler resultaterne til ét svar.
7. VICO angiver usikkerhed og kilde, når det er relevant.

**Alternative flows**

- Hvis et tool fejler, giver VICO en forståelig fejl og bruger kun en alternativ kilde, hvis den er godkendt.
- Hvis der mangler input, beder VICO om det nødvendige og intet mere.
- Hvis ingen kilde kan levere et sikkert svar, fortsætter flowet i UC-04.

**Resultat**

- Chaufføren får ét samlet svar, selvom flere services eller tools blev brugt.

---

## UC-04 – Håndtere manglende eller usikker viden

**Fase:** POC  
**Primær aktør:** Chauffør  
**Mål:** VICO undgår at gætte og tilbyder en relevant næste handling.

**Hovedflow**

1. VICO konstaterer, at de tilgængelige data ikke giver et sikkert svar.
2. VICO fortæller kort, hvad der mangler eller er usikkert.
3. VICO markerer eventuelle oplysninger som ubekræftede, sandsynlige eller bekræftede.
4. VICO tilbyder en relevant næste mulighed, eksempelvis at præcisere spørgsmålet eller senere spørge communityet.
5. Chaufføren vælger, om flowet skal fortsætte.

**Eksempel**

> “Jeg har ikke nok sikre oplysninger endnu. Jeg kan spørge chaufførerne foran dig.”

**Alternative flows**

- Hvis chaufføren afviser, afsluttes flowet uden handling.
- Hvis chaufføren accepterer et community-spørgsmål, fortsætter flowet i UC-16.

**Resultat**

- VICO har ikke opfundet et svar, og chaufføren kender mulighederne.

---

# B. Bruger- og kørselskontekst

## UC-05 – Etablere chaufførens sikre kontekst

**Fase:** POC/MVP  
**Primær aktør:** Chauffør  
**Støtteaktør:** Roadcue Backend  
**Mål:** VICO ved, hvem chaufføren er, og hvilken kørselskontekst der må anvendes.

**Forudsætninger**

- I POC kan chaufføren og GPS-data være simuleret.
- I MVP er chaufføren autentificeret.

**Hovedflow**

1. Roadcue identificerer chaufføren gennem login eller token.
2. Roadcue stiller det autoriserede `driverId` til rådighed for VICO.
3. Roadcue leverer tilladt kontekst:
   - position,
   - kørselsretning,
   - hastighed,
   - tidspunkt,
   - og senere aktiv rute.
4. VICO bruger konteksten uden at bede om allerede kendte oplysninger.
5. Alle efterfølgende tool-kald udføres med den korrekte brugeridentitet.

**Alternative flows**

- Hvis identiteten mangler i POC, kan en kontrolleret simuleret bruger vælges.
- Hvis token er ugyldigt, foretages ingen brugerrelaterede tool-kald.
- Hvis lokationssamtykke mangler, anvendes positionen ikke.

**Resultat**

- VICO har en autoriseret bruger- og kørselskontekst.

---

## UC-06 – Besvare et aktuelt kontekstafhængigt spørgsmål

**Fase:** MVP  
**Primær aktør:** Chauffør  
**Støtteaktører:** Roadcue Backend, ekstern datatjeneste  
**Mål:** Chaufføren får et korrekt svar, som kræver tid, position eller eksterne data.

**Hovedflow**

1. Chaufføren stiller eksempelvis spørgsmålet “Hvornår går solen ned?” eller “Hvordan er vejret her?”.
2. VICO konstaterer, at almindelig modelviden ikke er tilstrækkelig.
3. VICO henter den tilladte position og det aktuelle tidspunkt.
4. VICO kalder den relevante C#-service.
5. C#-servicen kalder om nødvendigt en ekstern leverandør.
6. VICO formulerer det beregnede eller hentede resultat.

**Alternative flows**

- Hvis position ikke er tilgængelig, beder VICO om en by eller et område.
- Hvis den eksterne tjeneste fejler, oplyser VICO, at aktuelle data ikke kan hentes.

**Resultat**

- Chaufføren får et aktuelt og kontekstbaseret svar uden at VICO gætter.

---

# C. Steder, truck stops og kombinerede ønsker

## UC-07 – Find næste relevante sted

**Fase:** MVP  
**Primær aktør:** Chauffør  
**Støtteaktører:** Roadcue Backend, ekstern stedtjeneste  
**Mål:** Chaufføren finder et sted foran sig, som matcher et eller flere behov.

**Trigger**

> “Hvor langt er der til næste sted, hvor jeg kan tanke og spise?”

**Hovedflow**

1. VICO udleder de ønskede faciliteter og eventuel tidshorisont.
2. VICO henter chaufførens position og retning.
3. VICO kalder `FindNextTruckStop` eller tilsvarende Roadcue-tool.
4. C#-servicen henter relevante steder fra en ekstern datakilde.
5. C#-servicen filtrerer på retning og faciliteter.
6. C#-servicen beregner afstand og forventet ankomsttid.
7. VICO præsenterer det bedste match og de relevante faciliteter.

**Faciliteter kan omfatte**

- mad,
- tank,
- toilet,
- bad,
- parkering,
- og relevante sikkerhedsoplysninger.

**Alternative flows**

- Hvis intet sted matcher alle krav, tilbyder VICO det nærmeste relevante alternativ.
- Hvis steddata er ufuldstændige, siger VICO præcist, hvilke faciliteter der ikke kan bekræftes.

**Resultat**

- Et relevant sted, afstand, forventet tid og bekræftede faciliteter er fundet.

---

## UC-08 – Find et sted med flere datakrav

**Fase:** MVP/Senere  
**Primær aktør:** Chauffør  
**Mål:** VICO kombinerer steddata, beregninger, venner og community-viden i ét svar.

**Trigger**

> “Find et sted, hvor jeg kan tanke, spise og måske møde nogen, jeg kender.”

**Hovedflow**

1. VICO opdeler ønsket i faciliteter, placering og relationer.
2. VICO inkluderer UC-07 for at finde relevante steder.
3. VICO inkluderer UC-10 for at finde venner ved kandidaterne.
4. Senere inkluderer VICO UC-15 for at hente relevante observationer.
5. VICO sammenligner de samlede resultater.
6. VICO giver ét kort svar med det bedste match og tydelige forbehold.

**Alternative flows**

- Hvis ingen venner deler position, præsenteres kun stedresultatet.
- Hvis community-oplysninger er ubekræftede, fremgår det eksplicit.

**Resultat**

- Chaufføren får et samlet forslag baseret på flere kontrollerede datakilder.

---

## UC-09 – Hent detaljer og community-status for et sted

**Fase:** MVP/Senere  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren får både officielle steddata og relevante nyere observationer.

**Trigger**

> “Er der noget, jeg bør vide om den rasteplads?”

**Hovedflow**

1. VICO identificerer stedet fra samtalen eller brugerens formulering.
2. VICO henter registrerede faciliteter gennem Roadcue Backend.
3. VICO henter aktive community-observationer for stedet.
4. Backend filtrerer observationer efter placering, alder og gyldighed.
5. VICO skelner mellem officielle data og community-oplysninger.
6. VICO opsummerer kun det relevante.

**Alternative flows**

- Hvis stedet er tvetydigt, beder VICO om præcisering.
- Hvis der ikke findes aktuelle observationer, siger VICO det.
- VICO kan senere tilbyde at starte UC-14.

**Resultat**

- Chaufføren har en samlet, kildeopdelt status for stedet.

---

# D. Venner, chauffører og sociale møder

## UC-10 – Find chaufførens venner

**Fase:** POC/MVP  
**Primær aktør:** Chauffør  
**Støtteaktør:** Roadcue Backend  
**Mål:** Chaufføren får oplyst relevante venner uden at VICO opfinder personer eller relationer.

**Hovedflow**

1. VICO modtager chaufførens autoriserede `driverId`.
2. VICO kalder `GetDriverFriends`.
3. Roadcue Backend returnerer chaufførens venner.
4. VICO filtrerer eller opsummerer efter spørgsmålet.
5. VICO præsenterer resultatet kort.

**Eksempler**

- “Hvem er mine venner?”
- “Er Peter en af mine venner?”

**Alternative flows**

- I POC kan VICO først bruge `GetDrivers` til at finde en simuleret bruger.
- Hvis flere personer har samme navn, beder VICO om præcisering.

**Resultat**

- Chaufføren har fået korrekte oplysninger om egne relationer.

---

## UC-11 – Find venner nær chaufføren eller et sted

**Fase:** MVP  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren finder venner, som har delt en relevant position.

**Trigger-eksempler**

- “Er der nogen, jeg kender i nærheden?”
- “Er der nogen, jeg kender på næste rasteplads?”

**Hovedflow**

1. VICO identificerer søgeområdet fra chaufførens position eller samtalekonteksten.
2. VICO henter chaufførens venner.
3. Backend finder venner, som har givet tilladelse til lokationsdeling.
4. Backend udfører den geografiske beregning.
5. VICO præsenterer kun autoriserede matches.

**Alternative flows**

- Venner uden aktiv deling vises ikke som placeret.
- Hvis ingen matches findes, siger VICO det uden at afsløre skjulte positioner.

**Resultat**

- Chaufføren får en privatlivssikker liste over relevante venner.

---

## UC-33 – Fortæl om en vens bevægelsesstatus

**Fase:** MVP  
**Prioritet:** Must Have  
**Primær aktør:** Chauffør  
**Støtteaktør:** Roadcue Backend  
**Mål:** Chaufføren kan få at vide, om en ven kører eller sandsynligvis holder stille, når vennen har givet tilladelse til lokationsdeling.

**Trigger**

> “Hvor er Peter, og holder han stille?”

**Hovedflow**

1. VICO identificerer den ønskede ven.
2. Backend kontrollerer, at vennen har tilladt lokationsdeling med chaufføren.
3. Backend analyserer flere GPS-målinger, hastighed og tidspunktet for seneste opdatering.
4. Backend beregner bevægelsesstatus deterministisk.
5. Backend undersøger, om positionen matcher et kendt sted som en rasteplads eller et truck stop.
6. VICO formulerer resultatet med tidspunkt og passende usikkerhed.

**Eksempel**

> “Peter har holdt stille ved Autohof Soltau i cirka 18 minutter. Hans position blev senest opdateret for to minutter siden.”

**Alternative flows**

- Hvis vennen ikke deler sin position, afslører VICO ingen lokationsoplysninger.
- Hvis GPS-opdateringen er gammel, oplyser VICO, at status ikke længere er sikker.
- Hvis bevægelsesstatus ikke kan bestemmes, siger VICO det frem for at gætte.

**Resultat**

- Chaufføren får en autoriseret og deterministisk beregnet bevægelsesstatus.

---

## UC-12 – Find chauffører ved fremtidig position og tid

**Fase:** Senere  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren finder personer, som forventes at være et bestemt sted omkring et tidspunkt.

**Trigger**

> “Er der nogen danskere på rasteplads 47 omkring klokken 20?”

**Hovedflow**

1. VICO udleder sted, tidspunkt og ønsket relation eller sproggruppe.
2. Backend beregner chaufførens forventede ankomst eller validerer det angivne tidspunkt.
3. Backend finder chauffører, som har tilladt at indgå i denne type søgning.
4. Backend sammenligner forventede positioner inden for en tidsmæssig tolerance.
5. VICO præsenterer matches som forventede og ikke sikre.

**Alternative flows**

- Hvis ingen har delt fremtidig tilgængelighed, gives intet match.
- Hvis prognosen er for usikker, forklarer VICO det.

**Resultat**

- Chaufføren får mulige fremtidige matches med tydelig usikkerhed.

---

## UC-13 – Opret et socialt møde eller en samtalekontakt

**Fase:** Senere  
**Primær aktør:** Chauffør  
**Støtteaktør:** Community-chauffør  
**Mål:** Chauffører kan etablere frivillig kontakt uden at Roadcue bliver et socialt medie.

**Trigger-eksempler**

- “Er der nogen, der vil spise omkring klokken 19?”
- “Er der nogen, der har lyst til at snakke?”

**Hovedflow**

1. VICO udleder formål, tidsrum og eventuelt sted.
2. Chaufføren bekræfter forespørgslen.
3. Backend finder relevante og tilgængelige modtagere.
4. Modtagerne kan acceptere, afvise eller ignorere.
5. Kontakt etableres kun efter accept fra begge parter.
6. Kun nødvendige kontaktoplysninger deles.

**Alternative flows**

- Forespørgslen udløber automatisk.
- Chaufføren kan annullere den.
- Hvis ingen accepterer, fortæller VICO det uden gentagne afbrydelser.

**Resultat**

- En frivillig kontakt er etableret eller afsluttet uden match.

---

# E. Community og observationer

## UC-14 – Rapportér en fri observation

**Fase:** MVP  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren rapporterer en hændelse naturligt uden at udfylde en kategoriformular.

**Trigger-eksempler**

- “Der er en væltet lastbil her. To spor er lukket.”
- “Toilettet er lukket.”
- “Der er kun tre pladser tilbage.”
- “Der ligger noget i højre spor.”

**Hovedflow**

1. Chaufføren beskriver observationen frit.
2. VICO udtrækker det faktiske observationsindhold.
3. Backend tilføjer position, vej/område, retning og tidspunkt.
4. Observationen gemmes som fritekst med fleksible metadata.
5. VICO læser fortolkningen tilbage.
6. Chaufføren bekræfter eller retter observationen.
7. Backend publicerer observationen som ubekræftet.

**Alternative flows**

- Hvis position eller vej ikke kan bestemmes, beder VICO om den nødvendige præcisering.
- Chaufføren kan annullere før publicering.

**Resultat**

- En kontekstberiget observation er gemt med tydelig sikkerhedsstatus.

---

## UC-15 – Søg i communityets viden

**Fase:** MVP/Senere  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren får relevante tidligere observationer uden at høre irrelevante eller forældede meldinger.

**Hovedflow**

1. Chaufføren stiller et spørgsmål om et sted eller forhold.
2. VICO udleder det semantiske emne.
3. Backend filtrerer på position, sted, tidspunkt, alder og gyldighed.
4. Senere kombineres filtrene med semantisk søgning i friteksten.
5. Backend returnerer relevante observationer og sikkerhedsstatus.
6. VICO opsummerer resultatet og oplyser graden af sikkerhed.

**Alternative flows**

- Hvis observationerne er modstridende, siger VICO det.
- Hvis der ikke findes aktuelle observationer, tilbyder VICO senere UC-16.

**Resultat**

- Chaufføren får relevant community-viden med kilde, alder og usikkerhed.

---

## UC-16 – Spørg communityet og vent på svar

**Fase:** Senere  
**Primær aktør:** Chauffør  
**Støtteaktører:** Community-chauffører, baggrundsprocessor  
**Mål:** VICO kan hente ny viden fra relevante chauffører, når eksisterende data ikke er nok.

**Hovedflow**

1. VICO konstaterer, at der mangler et sikkert svar.
2. VICO foreslår at spørge relevante chauffører.
3. Chaufføren accepterer.
4. Backend udvælger modtagere efter position, retning, tidspunkt, relation og tilladelser.
5. LangGraph opretter et ventende flow med et stabilt ID og timeout.
6. Modtagerne kan svare eller ignorere.
7. Flowet gemmer svarene og kan fortsætte efter en servicegenstart.
8. Når der er tilstrækkelige svar eller timeout, genoptages flowet.
9. UC-17 opsummerer svarene.
10. VICO vender tilbage til chaufføren med resultatet.

**Alternative flows**

- Chaufføren kan annullere det ventende spørgsmål.
- Chaufføren kan spørge efter status.
- Hvis ingen svarer, fortæller VICO det.
- For gamle svar bruges ikke som aktuelle oplysninger.

**Resultat**

- Et asynkront community-spørgsmål er afsluttet, annulleret eller udløbet.

---

## UC-17 – Opsummér flere community-svar

**Fase:** Senere  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren får én forståelig status frem for mange individuelle svar.

**Hovedflow**

1. Backend grupperer svar om samme forhold.
2. Backend beregner antal svar, alder, geografisk relevans og enighed.
3. Backend fastsætter sikkerhedsstatus uden at overlade beregningen til LLM'en.
4. VICO formulerer én kort opsummering.
5. VICO oplyser antal svar og eventuel uenighed.

**Eksempler**

- “Tre chauffører har bekræftet, at der stadig er ledige pladser.”
- “Svarene er modstridende, så jeg kan ikke bekræfte situationen.”

**Resultat**

- Chaufføren får en samlet, sporbar og korrekt usikkerhedsmarkeret status.

---

# F. Trafik og parkering som informationskontekst

## UC-18 – Få relevante trafikoplysninger

**Fase:** MVP  
**Primær aktør:** Chauffør  
**Støtteaktører:** Roadcue Backend, ekstern trafiktjeneste  
**Mål:** Chaufføren får relevante trafikoplysninger uden at Roadcue bliver en navigationsapp.

**Hovedflow**

1. Chaufføren spørger til forhold foran sig eller ved et sted.
2. VICO henter position og retning.
3. Backend henter eksterne trafikdata og relevante community-observationer.
4. Backend filtrerer og sammenholder oplysningerne.
5. VICO skelner mellem officielle og ubekræftede oplysninger.
6. VICO opsummerer relevante ulykker, kø, lukkede spor, vejarbejde, vejproblemer eller vejrforhold.

**Alternative flows**

- Hvis kilderne er uenige, forklarer VICO det.
- Hvis chaufføren spørger, om en reaktion kan betale sig, kan en ekstern routingservice senere beregne et forslag.

**Resultat**

- Chaufføren har fået rådgivende trafikstatus, men Roadcue styrer ikke køretøjet eller leverer fuld navigation.

---

## UC-32 – Håndtér en forhindring og skift den aktive rute

**Fase:** MVP  
**Prioritet:** Must Have  
**Primær aktør:** Chauffør  
**Støtteaktører:** Roadcue Backend, ekstern trafik-, routing- og navigationstjeneste  
**Mål:** Chaufføren kan få undersøgt og aktivere en alternativ rute, når en relevant forhindring opdages.

**Forudsætninger**

- Roadcue har chaufførens aktuelle position, retning og aktive rutekontekst.
- Den aktuelle rute leveres af en ekstern navigationstjeneste.

**Hovedflow**

1. Roadcue modtager information om en forhindring fra en ekstern kilde eller en aktuel community-melding.
2. Backend vurderer deterministisk, om hændelsen er relevant for chaufførens aktive rute.
3. Backend beder en ekstern routingservice beregne et alternativ.
4. Routingservicen returnerer forskelle i afstand og forventet tid.
5. VICO forklarer forhindringen, datakildens sikkerhed og forskellen mellem ruterne.
6. VICO spørger chaufføren, om den alternative rute skal aktiveres.
7. Chaufføren accepterer.
8. Roadcue sender den valgte rute til navigationstjenesten.
9. VICO bekræfter først ændringen, når navigationstjenesten har accepteret den.

**Eksempel**

> “To chauffører har meldt et lukket spor 24 kilometer foran dig. En alternativ rute er 18 kilometer længere, men forventes at spare cirka 22 minutter. Skal jeg skifte?”

**Alternative flows**

- Chaufføren afviser, og den eksisterende rute bevares.
- Hvis hændelsen er ubekræftet, fremgår usikkerheden tydeligt.
- Hvis routingservicen ikke kan beregne et alternativ, ændres ruten ikke.
- Hvis navigationstjenesten afviser ændringen, må VICO ikke sige, at ruten er skiftet.

**Resultat**

- Den eksterne navigation har enten aktiveret den godkendte rute, eller den oprindelige rute er bevaret.

---

## UC-19 – Undersøg aktuel parkeringssituation

**Fase:** MVP/Senere  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren får den bedst tilgængelige status for parkering ved et valgt sted.

**Hovedflow**

1. Chaufføren spørger til parkering ved et identificeret sted.
2. Backend henter registrerede parkeringsfaciliteter.
3. Backend henter nyere community-observationer.
4. VICO oplyser tidspunkt og sikkerhedsstatus for oplysningerne.
5. Hvis status ikke er tilstrækkelig, tilbyder VICO at inkludere UC-16 og spørge chauffører på stedet.

**Alternative flows**

- Hvis ingen aktuelle oplysninger findes, siger VICO det.
- VICO lover aldrig, at en plads stadig er ledig ved ankomst.

**Resultat**

- Chaufføren får aktuel parkeringsviden eller et tilbud om at spørge stedet.

---

## UC-20 – Detektér et muligt trafikproblem automatisk

**Fase:** Vision  
**Primær aktør:** Baggrundsprocessor  
**Støtteaktør:** Community-chauffør  
**Mål:** Roadcue bruger anonymiserede GPS- og hastighedssignaler til at opdage mulige hændelser.

**Hovedflow**

1. Systemet modtager GPS- og hastighedsdata med samtykke.
2. En deterministisk service registrerer et fælles og markant hastighedsfald.
3. Signalet knyttes til et område, retning og tidspunkt.
4. Systemet opretter en ubekræftet hændelseskandidat.
5. Systemet sammenholder kandidaten med eksterne og eksisterende data.
6. Systemet kan starte et målrettet community-spørgsmål.

**Alternative flows**

- Hvis signalet ikke kan bekræftes, udløber kandidaten.
- Brugere uden samtykke indgår ikke i datagrundlaget.

**Resultat**

- Et muligt trafikproblem er registreret uden at blive præsenteret som et sikkert faktum.

---

## UC-21 – Beregn trafikforhold ved chaufførens ankomst

**Fase:** Vision  
**Primær aktør:** Chauffør  
**Støtteaktører:** Roadcue Backend, ekstern routingservice  
**Mål:** Chaufføren får en datadrevet prognose og et rådgivende forslag.

**Hovedflow**

1. Backend estimerer køens begyndelse, slutning og længde.
2. Backend vurderer, om køen vokser eller falder.
3. Backend beregner chaufførens forventede ankomst til området.
4. Backend estimerer situationen ved ankomst.
5. En ekstern routingservice kan beregne virkningen af et alternativ.
6. VICO præsenterer prognose, usikkerhed og et rådgivende forslag.

**Eksempel**

> “Når du når frem, forventes køen at være cirka 14 kilometer. En ekstern beregning viser, at næste afkørsel muligvis sparer tid.”

**Alternative flows**

- Hvis datagrundlaget er utilstrækkeligt, gives ingen præcis prognose.
- Chaufføren træffer altid selv beslutningen.

**Resultat**

- Chaufføren har fået en usikkerhedsmarkeret prognose, ikke en autonom beslutning.

---

## UC-22 – Forudsig parkeringsforhold ved ankomst

**Fase:** Vision  
**Primær aktør:** Chauffør  
**Mål:** VICO giver et sandsynlighedsbaseret estimat for parkering på ankomsttidspunktet.

**Hovedflow**

1. Chaufføren vælger et sted eller beder VICO finde et.
2. Backend beregner forventet ankomsttid.
3. Backend kombinerer historiske data, aktuelle observationer og relevante signaler.
4. Backend beregner en sandsynlighed eller kvalitativ vurdering.
5. VICO præsenterer estimatet med tydelig usikkerhed.

**Alternative flows**

- Hvis der ikke findes nok data, siger VICO det og kan tilbyde UC-16.
- VICO lover aldrig, at en plads er tilgængelig.

**Resultat**

- Chaufføren har fået en prognose, som kan indgå i egen beslutning.

---

# G. Beskeder, oplæsning og oversættelse

## UC-23 – Håndtér ventende beskeder

**Fase:** MVP  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren kan få overblik over og høre beskeder på et valgt tidspunkt.

**Hovedflow**

1. En besked modtages og gemmes med afsender, tidspunkt og status.
2. Beskeden placeres i kø frem for automatisk at blive afspillet.
3. VICO fortæller, hvor mange ulæste beskeder der findes, når det er relevant.
4. Chaufføren beder om næste besked, en bestemt afsender eller en kort opsummering.
5. VICO oplyser afsender og tidspunkt.
6. VICO læser den relevante besked eller opsummering.
7. Chaufføren kan pause, fortsætte, springe over, gentage eller gemme til senere.
8. Beskedens status opdateres.

**Alternative flows**

- Ikke-vigtige beskeder forbliver i kø.
- Kritiske Roadcue-oplysninger kan have højere prioritet end almindelige beskeder.

**Resultat**

- Beskeden er håndteret uden at kræve skærmbetjening eller unødvendig afbrydelse.

---

## UC-24 – Besvar eller send en besked

**Fase:** MVP  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren sender en besked gennem et kontrolleret og bekræftet flow.

**Hovedflow**

1. Chaufføren vælger modtager og dikterer eller skriver beskeden.
2. VICO gengiver modtager og indhold.
3. Chaufføren bekræfter afsendelsen.
4. Backend kontrollerer rettigheder og sender beskeden.
5. Backend bekræfter succes.
6. Først derefter fortæller VICO, at beskeden er sendt.

**Alternative flows**

- Chaufføren retter eller annullerer beskeden.
- Ved tvetydig modtager beder VICO om præcisering.
- Ved fejl forbliver beskeden usendt eller får tydelig fejlstatus.

**Resultat**

- Beskeden er sendt præcis én gang eller tydeligt markeret som ikke sendt.

---

## UC-25 – Oversæt en samtale mellem chauffører

**Fase:** Senere  
**Primær aktør:** Chauffør  
**Støtteaktør:** Community-chauffør  
**Mål:** Chauffører med forskellige sprog kan udveksle forståelige beskeder.

**Hovedflow**

1. Chaufføren formulerer en besked på sit eget sprog.
2. Systemet oversætter til modtagerens foretrukne sprog.
3. Modtageren hører eller læser oversættelsen.
4. Modtageren svarer på sit eget sprog.
5. Svaret oversættes tilbage.
6. VICO læser det oversatte svar op.

**Alternative flows**

- Brugeren kan bede om originalteksten.
- Usikre oversættelser markeres.
- Navne, stednavne og vejnumre bevares.

**Resultat**

- En flersproget udveksling er gennemført uden at ændre fakta eller sikkerhedsstatus.

---

# H. Voice-first app og companion

## UC-26 – Betjen VICO med stemmen

**Fase:** MVP efter tekst-POC  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren kan bruge Roadcues kernefunktioner uden at være afhængig af skærmen.

**Hovedflow**

1. Chaufføren aktiverer VICO.
2. Tale konverteres til tekst.
3. VICO gennemfører den relevante use case.
4. Svaret konverteres til tale.
5. Chaufføren kan afbryde, stoppe, gentage eller fortsætte.

**Alternative flows**

- Ved lav talegenkendelsessikkerhed beder VICO om gentagelse.
- Handlinger med konsekvens læses tilbage og bekræftes.
- Brugeren kan altid anvende tekst eller manuel betjening som alternativ.

**Resultat**

- Use casen er gennemført voice-first uden faste kommandoer.

---

## UC-27 – Få relevante dele af appen læst op

**Fase:** MVP  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren får det ønskede appindhold uden at navigere i nummererede talemenuer.

**Trigger-eksempler**

- “Læs mine beskeder.”
- “Læs trafik.”
- “Hvad er der under parkering?”

**Hovedflow**

1. VICO forstår intentionen frem for en menukommando.
2. VICO kalder de relevante Roadcue-tools.
3. VICO prioriterer og opsummerer indholdet.
4. VICO læser det vigtigste op først.
5. Chaufføren kan bede om detaljer, springe over eller stoppe.

**Resultat**

- Chaufføren har fået det relevante appindhold uden at kigge på skærmen.

---

## UC-28 – Brug VICO som companion

**Fase:** POC/MVP  
**Primær aktør:** Chauffør  
**Mål:** VICO giver frivilligt selskab, læring eller underholdning på lange ture.

**Hovedflow**

1. Chaufføren starter en almindelig samtale, quiz, sprogøvelse eller humoristisk aktivitet.
2. VICO tilpasser indholdet til brugerens valgte niveau og svarlængde.
3. Samtalen fortsætter kontekstbevidst.
4. Vigtige Roadcue-oplysninger kan prioriteres over companion-samtalen.
5. Chaufføren kan stoppe eller skifte emne.

**Alternative flows**

- Companion-funktionen kan slås fra.
- VICO starter ikke selv uformelle samtaler, medmindre brugeren senere har tilladt det.

**Resultat**

- Chaufføren har fået frivilligt selskab uden at blokere vigtig information.

---

## UC-29 – Tilpas VICO’s personlighed og adfærd

**Fase:** MVP/Senere  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren bestemmer, hvordan og hvor meget VICO kommunikerer.

**Hovedflow**

1. Chaufføren åbner indstillinger eller beder VICO ændre en præference.
2. Brugeren vælger eksempelvis:
   - svarlængde,
   - oplæsningshastighed,
   - sprog,
   - humor,
   - snakkelyst,
   - proaktivitet,
   - Driving Coach-niveau,
   - tilladte afbrydelseskategorier.
3. VICO læser ændringen tilbage ved stemmebetjening.
4. Chaufføren bekræfter relevante ændringer.
5. Indstillingen gemmes på brugerprofilen.

**Alternative flows**

- Brugeren kan aktivere stille tilstand.
- Personlighedsindstillinger kan aldrig tilsidesætte sikkerhed, autorisation eller sandhedskrav.

**Resultat**

- VICO kommunikerer efter brugerens præferencer inden for faste sikkerhedsrammer.

---

# I. Proaktivitet og rådgivning

## UC-30 – Giv en relevant proaktiv meddelelse

**Fase:** Senere  
**Primær aktør:** VICO  
**Sekundær aktør:** Chauffør  
**Mål:** Chaufføren bliver gjort opmærksom på en relevant ændring uden at VICO konstant afbryder.

**Hovedflow**

1. En ny hændelse eller opdatering registreres.
2. Backend beregner relevans ud fra position, retning, tidspunkt, relation, sikkerhed og brugerindstillinger.
3. Systemet beregner prioritet og tidskritikalitet.
4. Højprioritetsinformation kan afbryde.
5. Lavere prioritet placeres i kø.
6. VICO forklarer kort, hvorfor informationen er relevant.
7. Chaufføren kan høre mere, afvise eller dæmpe kategorien.

**Alternative flows**

- Stille tilstand udsætter ikke-kritiske oplysninger.
- Gentagne meddelelser om samme hændelse samles.
- Usikre data markeres tydeligt.

**Resultat**

- Chaufføren har modtaget eller fået gemt en relevant meddelelse efter egne præferencer.

---

## UC-31 – Modtag rådgivning fra Driving Coach

**Fase:** Senere  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren får kort, valgfri og rådgivende information ud fra tilgængelige data.

**Hovedflow**

1. Driving Coach er aktiveret på et valgt niveau.
2. Backend registrerer et relevant, ikke-autonomt rådgivningssignal.
3. VICO formulerer et kort råd og forklarer grundlaget.
4. Chaufføren vælger selv, om rådet følges.
5. Brugeren kan dæmpe eller slå rådstypen fra.

**Eksempel**

> “Trafikken foran bremser ofte. Overvej at holde lidt ekstra afstand.”

**Alternative flows**

- Ved utilstrækkelige data gives intet skråsikkert råd.
- Driving Coach kan slås helt fra.

**Resultat**

- Chaufføren har fået valgfri rådgivning; VICO har ikke styret køretøjet.

---

# J. Understøttende system-use-cases

Disse use cases udløses normalt som en del af en bruger-use-case og er ikke selvstændige menupunkter.

## SUC-01 – Udfør en præcis geo- eller tidsberegning

- VICO sender strukturerede input til Roadcue Backend.
- C# beregner afstand, retning, tidsestimat eller geografisk match.
- LLM'en udfører ikke den præcise beregning.
- Resultatet returneres med enhed, grundlag og eventuel usikkerhed.

## SUC-02 – Hent data leverandøruafhængigt

- VICO kalder et Roadcue-tool og ikke leverandøren direkte.
- C# vælger den konfigurerede leverandør bag et internt interface.
- Timeouts, caching og fejl håndteres i integrationen.
- Leverandøren kan senere udskiftes uden at ændre VICO's use cases.

## SUC-03 – Autorisér et tool-kald

- Brugeridentiteten kommer fra en betroet kontekst.
- Backend kontrollerer adgang til data og handling.
- VICO kan ikke tilsidesætte autorisationen.
- Afviste handlinger returneres uden følsomme oplysninger.

## SUC-04 – Gem og genoptag et ventende flow

- LangGraph-flowets state gemmes med et stabilt ID.
- Flowet kan vente på et event, et community-svar eller timeout.
- Flowet kan genoptages efter genstart.
- Dublerede events må ikke udføre samme handling to gange.

## SUC-05 – Gem en fleksibel observation

- Fritekst gemmes uden en databasekolonne for hver mulig observationstype.
- Position, tidspunkt, retning, kilde, sikkerhedsstatus og gyldighed gemmes struktureret.
- Semantisk repræsentation kan tilføjes senere.
- Autorisation og geografisk relevans udføres fortsat deterministisk.

## SUC-06 – Beregn og formidl troværdighed

- Backend beregner sikkerhedsstatus ud fra kilder, alder, antal bekræftelser og modstridende oplysninger.
- VICO modtager status som strukturerede data.
- VICO formulerer status uden at ændre den beregnede betydning.
- Ubefæstede oplysninger præsenteres aldrig som sikre fakta.

---

# 7. Relationer mellem use cases

| Overordnet use case | Inkluderer eller udvider |
|---|---|
| UC-06 Aktuelt spørgsmål | UC-03, UC-05, SUC-01, SUC-02 |
| UC-07 Find næste sted | UC-03, UC-05, SUC-01, SUC-02 |
| UC-08 Kombinér flere krav | UC-07, UC-10, UC-11 og senere UC-15 |
| UC-09 Steddetaljer | UC-03, UC-15 og eventuelt UC-16 |
| UC-11 Venner nær sted | UC-05, UC-10, SUC-01, SUC-03 |
| UC-33 Venners bevægelsesstatus | UC-05, UC-10, SUC-01, SUC-03 |
| UC-12 Fremtidige chauffører | UC-05, SUC-01, SUC-03 |
| UC-14 Rapportér observation | UC-05, SUC-03, SUC-05 |
| UC-15 Søg community | SUC-01, SUC-05, SUC-06 |
| UC-16 Ask the Road | UC-04, SUC-03, SUC-04 |
| UC-17 Opsummér svar | UC-16, SUC-06 |
| UC-18 Trafikstatus | UC-03, UC-05, UC-15, SUC-02, SUC-06 |
| UC-32 Ruteændring ved forhindring | UC-05, UC-18, SUC-01, SUC-02, SUC-03, SUC-06 |
| UC-19 Parkeringsstatus | UC-09, UC-15 og eventuelt UC-16 |
| UC-21 Trafikprognose | UC-05, SUC-01, SUC-02, SUC-06 |
| UC-22 Parkeringsprognose | UC-05, UC-15, SUC-01, SUC-06 |
| UC-23 Ventende beskeder | UC-27 og senere UC-30 |
| UC-25 Oversættelse | UC-24 eller UC-16 |
| UC-26 Stemmebetjening | Kan omslutte alle bruger-use-cases |
| UC-27 Læs appindhold | UC-23, UC-18, UC-19 eller andre læse-use-cases |
| UC-30 Proaktiv meddelelse | UC-18, UC-19, UC-20, UC-23 eller UC-22 |

---

# 8. Implementeringsrækkefølge

Det prioriterede roadmap i afsnit 6 er styrende. Arbejdet gennemføres som fem leverancer:

1. **Tekst-POC:** Bevis samtale, kontekst, tool-valg og eksisterende Friends-integration.
2. **Nyttig chauffør-MVP:** Tilføj voice, steder, trafik, ruteændring, beskeder og vennernes aktuelle kontekst.
3. **Community-kerne:** Tilføj frie observationer, aktuelle advarsler, Ask the Road, sociale pauser, oversættelse og proaktive hændelser.
4. **Nice to have:** Tilføj udvidet companion, personlighed og Driving Coach.
5. **Datavision:** Tilføj automatisk registrering og egentlige trafik- og parkeringsprognoser, når datagrundlaget findes.

En use case flyttes ikke frem, alene fordi den er teknisk spændende. Den flyttes frem, hvis den dokumenteret sparer chaufføren tid, reducerer skærmbrug eller giver bedre aktuelle beslutninger.

---

# 9. Tværgående acceptkriterier

Disse gælder alle relevante use cases:

- VICO skal forstå naturligt sprog og må ikke kræve faste kommandoer.
- VICO skal bevare relevant samtalekontekst.
- VICO skal vælge tools automatisk, men må kun bruge godkendte tools.
- VICO må ikke tilgå databasen direkte.
- C# ejer SQL, forretningsregler, autorisation, geoqueries og præcise beregninger.
- VICO må ikke opfinde Roadcue-data eller aktuelle realtidsoplysninger.
- Community-oplysninger skal have synlig sikkerhedsstatus.
- Skrivehandlinger skal valideres og bekræftes.
- Resultater skal være korte og egnede til oplæsning.
- Centrale funktioner skal senere kunne gennemføres uden skærmbetjening.
- Brugeren skal kunne afbryde, stoppe eller annullere.
- Lokationsbrug kræver samtykke og skal følge brugerens delingsregler.
- Roadcue rådgiver chaufføren og styrer aldrig køretøjet.
- POC'en skal kunne testes med simulerede chauffører og positioner.
- Eksterne leverandører skal ligge bag udskiftelige C#-interfaces.
- Første POC er reaktiv; proaktivitet implementeres først senere.
