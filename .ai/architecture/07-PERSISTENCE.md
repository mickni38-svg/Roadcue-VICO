# Roadcue Persistence

## Ownership

| Data | Planned owner | Notes |
|---|---|---|
| Drivers and authentication links | C# / SQL Server | Current `Drivers` data exists; identity model evolves for MVP |
| Friend relations and permissions | C# / SQL Server | Position visibility must be permission-aware |
| GPS samples and derived movement status | C# / SQL Server | Raw/retained data minimized; status calculated deterministically |
| Places referenced by Roadcue | C# / SQL Server or provider cache | External provider remains source where applicable |
| Messages and read/delivery state | C# / SQL Server | Consequential send operations use idempotency |
| Community observations and confidence | C# / SQL Server | Free text plus structured context/status; not one column per possible observation |
| Community questions and answers | C# / SQL Server | Durable recipients, permissions, timeouts and answers |
| Conversation/checkpoint state | LangGraph checkpointer | Storage implementation chosen per phase; linked by stable `thread_id` |
| Prompts | Git during POC/MVP | Database only after explicit managed prompt/versioning design |

## Database boundary

- EF Core/C# is the only Roadcue SQL access path.
- Python receives purpose-specific DTOs through approved HTTP APIs.
- The LLM cannot generate or execute SQL.
- API responses expose only fields required by the tool use case.
- Authorization is applied before data crosses from C# to Python.

## Location and movement data

- Collection requires consent and supports stopping or limiting sharing.
- Position access is evaluated for requester, relationship, purpose and freshness.
- Movement status is derived from multiple samples, time span and latest update; it is not guessed by VICO.
- Retention, precision and anonymization policies must be decided before real-driver pilot data is stored.

## Flexible community observations

Store common trusted context structurally: reporter, position/place, road/direction, timestamp, source, status, expiry and confidence. Preserve the free observation text and interpreted metadata flexibly so the schema does not require a column for every possible report.

Semantic search may be added later behind C# services. It does not give the LLM direct database access.

## Consistency and recovery

- Consequential operations use stable idempotency keys.
- C# transaction boundaries cover each durable business transition.
- LangGraph checkpoints reference durable C# operation IDs rather than duplicating business truth.
- Retry and resume behavior must tolerate a completed C# operation followed by a lost Python response.
- Migrations require compatibility, rollback and test data consideration.
