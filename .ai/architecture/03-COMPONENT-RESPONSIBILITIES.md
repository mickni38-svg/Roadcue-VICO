# Roadcue Component Responsibilities

| Component/domain | Must do | Must not do | Authoritative for |
|---|---|---|---|
| Angular/PWA | Capture text/voice, show menus, play responses, collect confirmations | Infer business eligibility or call SQL | Client interaction |
| Roadcue API | Validate identity, permissions and operations; coordinate domain services | Delegate hard rules to the LLM | Roadcue application behavior |
| C# domain/application services | Execute rules, geo/time calculations and provider policies | Depend on prompt wording | Deterministic results |
| EF Core repositories/data layer | Persist and query through controlled interfaces | Expose unrestricted query access to Python | SQL access |
| VICO graph | Route conversation, choose tools, maintain conversational state | Reimplement C# domain rules | Agent orchestration |
| VICO core prompt | Define general identity, language, tone and global safety | Contain Friends/place/community implementation rules | Cross-domain conversational behavior |
| VICO domain modules | Supply domain tools and focused instructions | Become independent top-level agents without need | Domain-facing AI behavior |
| LangChain tools | Provide small typed calls to approved capabilities | Contain SQL or duplicated business logic | AI-to-service contracts |
| C# provider adapters | Normalize external services | Leak vendor-specific models across Roadcue | Provider independence |

## Dependency rules

- Angular may call the Roadcue API and VICO endpoints through authenticated application boundaries.
- VICO may call only approved Roadcue C# APIs through typed clients/tools.
- C# may call SQL Server and configured external providers.
- The LLM, prompts and LangGraph nodes may not call SQL Server directly.
- Domain instructions may depend on global VICO behavior; the global prompt must not absorb every domain rule.
- A new domain is added inside the VICO modular structure before considering a new service.

## Single-source rules

- Driver identity comes from authenticated context in MVP, never from model inference.
- Position visibility comes from C# authorization.
- Movement status, distance and ETA come from deterministic C# calculations.
- Tool schemas define the AI boundary; C# response contracts define Roadcue truth.
- VICO formats and explains results but does not recalculate them.
