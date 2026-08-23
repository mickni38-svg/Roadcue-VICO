# Roadcue project context

Roadcue er en voice-first, kontekstbevidst copilot til lastbilchauffører. VICO samler almindelig AI, Roadcue-data, eksterne tjenester og communityets viden i korte, troværdige svar.

## Teknisk retning

- Angular mobile web/PWA er klienten.
- .NET/C# er hovedplatform og ejer Roadcue-domænet.
- EF Core og SQL Server gemmer strukturerede data.
- FastAPI er VICO-servicegrænsen.
- LangChain definerer godkendte tools og modelintegration.
- LangGraph håndterer samtaletilstand, orkestrering og senere ventende flows.

## Nuværende POC

- C# Drivers/Friends-endpoints virker gennem Scalar.
- FastAPI virker gennem Swagger.
- Python kan kalde C#.
- `get_drivers` og `get_driver_friends` virker som tools.
- LangGraph kan vælge tools og føre almindelig AI-samtale via `/agent/chat`.
- POC-opslag af driver efter navn er midlertidigt; MVP skal bruge login/token og autoriseret driver-ID.
- Første flows er tekstbaserede, reaktive og kan bruge simuleret driver/GPS.

## Produktgrænse

Roadcue er ikke en komplet navigations- eller routingmotor, et flådestyrings-/ERP-system, et tachografsystem, autonom kørsel eller et stort socialt medie. POC'en omfatter ikke CAN-bus, microservices/Kubernetes eller proaktive afbrydelser. Routing-, sted-, vejr- og trafikdata kan leveres af eksterne services bag Roadcues interfaces.

## VICO-kodestruktur

- Generel systemprompt: `vico/app/core/prompts/vico_system_prompt.py`.
- Domæneinstruktioner: `vico/app/domains/<domain>/instructions.py`.
- Topgraf: `vico/app/graphs/vico_agent.py`.
- Generel prompt må ikke placeres under Friends eller et andet domæne.

