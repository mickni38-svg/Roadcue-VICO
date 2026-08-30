# Roadcue Code Inventory

This inventory separates verified current structure from planned architectural locations. Update exact paths from the repository before using them in an implementation task.

## Current verified capabilities

| Area | Known responsibility | Status |
|---|---|---|
| C# Roadcue API | Drivers/Friends endpoints, EF Core and SQL access | Working through Scalar |
| Python `app/main.py` | FastAPI composition and `/agent/chat` | Working through Swagger |
| Python API client | HTTP calls to Roadcue C# API | Working |
| `get_drivers` | Find a controlled simulated driver in the POC | Working, transitional |
| `get_driver_friends` | Retrieve a driver's friends through C# | Working |
| LangGraph VICO agent | General conversation and tool selection/execution | Working |
| Prompt composition | Core prompt plus currently implemented domain instructions are combined for model calls | Working, acceptable POC simplification |
| Configuration | Roadcue API base URL and model/provider settings through environment | Working |

## Target VICO structure

```text
vico/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── clients/
│   ├── core/
│   │   └── prompts/
│   │       ├── vico_system_prompt.py
│   │       └── prompt_composer.py       # target when selective composition is implemented
│   ├── graphs/
│   │   └── vico_agent.py
│   ├── models/
│   └── domains/
│       ├── friends/
│       │   └── instructions.py
│       ├── destination/
│       │   └── instructions.py
│       ├── context/
│       ├── places/
│       ├── messages/
│       ├── community/
│       ├── traffic/
│       └── voice/
├── tests/
├── .env
└── requirements.txt
```

`prompt_composer.py` is a target name, not a requirement to create the file before an approved implementation task. An equivalent clearly named module is acceptable.

Only create a domain directory when its first approved use case is implemented. Do not scaffold every future domain merely because it appears in this target map.

## Prompt composition target

The target implementation should provide one explicit composition boundary instead of manually growing a permanent expression such as:

```text
VICO_SYSTEM_PROMPT
+ FRIENDS_INSTRUCTIONS
+ DESTINATION_INSTRUCTIONS
+ TRAFFIC_INSTRUCTIONS
+ WEATHER_INSTRUCTIONS
+ ...
```

The composition boundary should:

- always include the global VICO prompt;
- register available domain instruction modules centrally or through simple domain metadata;
- include only relevant domain instructions for the current turn;
- support multiple relevant domains in one turn;
- keep domain-specific rules in each domain's `instructions.py`;
- make selected modules observable in unit tests;
- avoid live OpenAI calls in prompt-routing/composition tests;
- avoid duplicating C# authorization or business rules.

The current concatenate-all approach remains valid while only a small number of domains exist. Migration to selective composition should be performed as an explicit task rather than mixed into unrelated use cases.

## C# target areas

Map these to actual project namespaces and paths before implementation:

- API controllers/endpoints and authenticated request context.
- Driver/Friends application services and DTOs.
- Location sharing and movement-status services.
- Place, traffic, weather and routing provider interfaces/adapters.
- Messaging and community application services.
- EF Core context, entities, configurations and migrations.
- Deterministic geo/time/confidence calculations.
- Unit and integration tests.

## Dependency conventions

- Python domain tools depend on typed clients, not raw SQL or EF models.
- General prompt code does not import domain tool implementations.
- Domain instruction modules do not import the top-level graph.
- The top-level graph registers approved domain tools and invokes prompt composition.
- Prompt composition selects behavioral instructions; it does not authorize data access.
- C# provider-specific models are mapped to Roadcue-owned contracts before crossing the API boundary.
- Tests cover both deterministic C# behavior and VICO tool-routing/prompt-composition scenarios.

## Inventory maintenance

When the real repository disagrees with this target map, record the verified path in the active task. Update this inventory after implementation; do not move code solely to make the repository resemble documentation without an approved task.
