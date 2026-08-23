# Roadcue Project Context

## Identity

- Project: `Roadcue`
- AI copilot: `VICO`
- Purpose: A context-aware, voice-first copilot that gives truck drivers one natural interface to general AI, Roadcue data, external services and later the driver community.
- Primary users: Truck drivers.
- Current lifecycle stage: Text-based POC.

## Outcomes and boundaries

### Main outcomes

- The driver speaks or writes naturally without memorizing commands.
- VICO decides whether to answer directly or use approved internal/external data tools.
- VICO combines results into one short, trustworthy answer suitable for speech.
- The finished product reduces the need to switch between separate apps while driving.

### In scope by phase

- POC: general conversation, conversational context, automatic tool selection, safe uncertainty handling, simulated driver/GPS context, friends, next relevant place and combined place/friend questions.
- MVP: authenticated driver context, phone/tablet GPS, voice, messages, places, traffic, weather, friend location/movement and community observations.
- Later: Ask the Road, resumable flows, translation, social coordination, proactivity and external route changes.
- Vision: traffic and parking detection/prognosis based on sufficient consented data.

### Explicitly out of scope

- A complete navigation or European truck-routing engine.
- Fleet management, dispatch, ERP, freight, invoicing or tachograph compliance.
- Direct CAN-bus integration in the POC.
- Autonomous vehicle control.
- A large social-media platform.
- Kubernetes or unnecessary microservices in the first solution.
- Direct LLM access to SQL or LLM-based precise geo/time/traffic/parking calculations.
- Proactive interruptions in the first POC.

## Technical context

- Client: Angular mobile web/PWA; voice is added after the text flow is stable.
- Main backend: .NET/C# Web API with EF Core.
- Structured store: SQL Server.
- AI service: Python with FastAPI.
- Model/tool layer: LangChain.
- Agent/state layer: LangGraph.
- External systems: replaceable place, weather, traffic, map/routing and speech providers behind owned interfaces.

## Current verified state

- C# API works through Scalar.
- FastAPI works through Swagger.
- Python can call the C# API.
- `get_drivers` and `get_driver_friends` exist as LangChain tools.
- LangGraph can select and execute tools.
- VICO is the top-level agent and can answer general AI questions.
- General system behavior and Friends instructions are separated.
- `/agent/chat` is the current agent entry point.

## Commands

Discover and verify exact repository paths before updating these examples.

- Run C# locally: `dotnet run --launch-profile http`
- C# local API: `http://localhost:5041`
- Run Python locally: `uvicorn app.main:app --reload --port 8000`
- Python local API: `http://127.0.0.1:8000`
- Build/test commands: Record from the actual solution and Python test setup when added.

## Risk profile

- Location, movement, identity, relationships and messages are personal data.
- Location use requires consent and enforceable sharing rules.
- VICO must distinguish model knowledge, official sources, community reports and predictions.
- Write/send actions require validation and confirmation.
- Voice responses must be brief and minimize distraction while driving.

## Known transitional decisions

- POC driver lookup by name is temporary and controlled.
- MVP identity comes from login/token and supplies an authorized `driverId`.
- Simulated GPS is permitted for POC testing; real GPS comes later with consent.
- POC is reactive; proactive behavior is a later phase.
