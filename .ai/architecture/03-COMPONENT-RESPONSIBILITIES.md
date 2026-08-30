# Roadcue Component Responsibilities

| Component/domain | Must do | Must not do | Authoritative for |
|---|---|---|---|
| Angular/PWA | Capture text/voice, show menus, play responses, collect confirmations | Infer business eligibility or call SQL | Client interaction |
| Roadcue API | Validate identity, permissions and operations; coordinate domain services | Delegate hard rules to the LLM | Roadcue application behavior |
| C# domain/application services | Execute rules, geo/time calculations and provider policies | Depend on prompt wording | Deterministic results |
| EF Core repositories/data layer | Persist and query through controlled interfaces | Expose unrestricted query access to Python | SQL access |
| VICO graph | Route conversation, choose tools, select relevant prompt modules, maintain conversational state | Reimplement C# domain rules | Agent orchestration |
| VICO core prompt | Define general identity, language, tone and global safety | Contain Friends/place/community implementation rules | Cross-domain conversational behavior |
| Prompt composition/router | Build the system instructions for the current turn from the core prompt plus relevant domain modules | Become a second business-rules engine or infer protected facts | Prompt selection and composition |
| VICO domain modules | Supply domain tools and focused instructions | Become independent top-level agents without need | Domain-facing AI behavior |
| LangChain tools | Provide small typed calls to approved capabilities | Contain SQL or duplicated business logic | AI-to-service contracts |
| C# provider adapters | Normalize external services | Leak vendor-specific models across Roadcue | Provider independence |

## Dependency rules

- Angular may call the Roadcue API and VICO endpoints through authenticated application boundaries.
- VICO may call only approved Roadcue C# APIs through typed clients/tools.
- C# may call SQL Server and configured external providers.
- The LLM, prompts and LangGraph nodes may not call SQL Server directly.
- Domain instructions may depend on global VICO behavior; the global prompt must not absorb every domain rule.
- Prompt composition may depend on domain metadata/instruction registrations, but domain prompt modules must not import the top-level graph.
- The prompt router selects instructions and capabilities; it does not authorize data access or decide deterministic business outcomes.
- A new domain is added inside the VICO modular structure before considering a new service.

## Prompt responsibility rules

- The core prompt is always present and remains small enough to describe only cross-domain behavior.
- Domain-specific rules live with their domain, for example Friends and Destination.
- The current POC may concatenate all implemented domain instructions while the number of domains is small.
- The target architecture selectively composes only the domain instructions relevant to the current turn.
- General conversation should not carry unrelated Friends, Destination, Traffic, Weather or other domain instructions once selective composition is implemented.
- A turn that genuinely spans multiple capabilities may compose multiple domain instruction sets.
- Domain selection must be testable without calling live OpenAI; routing and prompt-composition tests use mocks/fakes.

## Single-source rules

- Driver identity comes from authenticated context in MVP, never from model inference.
- Position visibility comes from C# authorization.
- Movement status, distance and ETA come from deterministic C# calculations.
- Tool schemas define the AI boundary; C# response contracts define Roadcue truth.
- Prompt modules define model behavior, not Roadcue truth.
- VICO formats and explains results but does not recalculate them.
