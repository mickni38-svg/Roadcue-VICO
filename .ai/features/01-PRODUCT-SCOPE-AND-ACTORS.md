# Produktkontekst for use cases

## Formål

Roadcues funktionskrav er samlet i egentlige brugerforløb og ikke oversat én til én.

> VICO er en kontekstbevidst AI-copilot, som chaufføren kan tale naturligt med, og som selv afgør, om svaret skal findes via almindelig AI, Roadcue-data, eksterne services eller andre chauffører.

## Afgrænsning

- Roadcue er ikke en komplet navigations- eller routingmotor.
- Eksterne tjenester leverer rute-, sted-, vejr- og trafikdata bag Roadcues C#-services.
- Roadcue er ikke et flådestyrings-, ERP-, tachograf- eller autonomt køresystem.
- Første løsning er Angular, .NET, SQL Server og Python/LangChain/LangGraph.
- .NET/C# ejer forretningslogik, SQL, autorisation, geoqueries og præcise beregninger.
- Python ejer AI- og agentorkestreringen og kalder C# gennem kontrollerede tools.
- Første POC er tekstbaseret og reaktiv. Voice og proaktivitet lægges ovenpå senere.
- POC'en skal kunne gennemføres med simulerede chauffører og GPS-positioner.

## Aktører

| Aktør | Rolle |
|---|---|
| Chauffør | Primær bruger, som taler eller skriver til VICO |
| VICO | AI-copilot, som forstår intentionen og orkestrerer funktioner |
| Roadcue Backend | C#-API, der ejer data, regler, beregninger og autorisation |
| Ekstern datatjeneste | Leverer eksempelvis sted-, vejr- eller trafikdata |
| Community-chauffør | Modtager og besvarer relevante spørgsmål |
| Baggrundsprocessor | Behandler ventende flows, GPS-signaler og nye hændelser |

## Faser

| Fase | Betydning |
|---|---|
| POC | Første tekstbaserede bevis af agent-flowet |
| MVP | Første brugbare voice-first version |
| Senere | Udvidelse efter validering af kernefunktionerne |
| Vision | Datakrævende analyse og prognoser |

