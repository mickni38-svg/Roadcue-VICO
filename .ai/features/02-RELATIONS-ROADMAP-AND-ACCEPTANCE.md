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
