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

- EF Core/C# is the only Roadcue application access path to SQL data.
- Python receives purpose-specific DTOs through approved HTTP APIs.
- The LLM cannot generate or execute SQL.
- API responses expose only fields required by the tool use case.
- Authorization is applied before data crosses from C# to Python.
- CI/CD may execute reviewed EF migration SQL against the database as a deployment operation; this is infrastructure administration, not an application data-access path.

## Production database and migrations

Roadcue production currently uses SQL Server hosted by Simply.com while the API is deployed to Azure Container Apps.

Database schema changes are created locally with normal EF Core migrations and committed together with the application change. Production schema updates are not executed automatically from application startup.

The API deployment pipeline must use this order:

1. Restore and build the .NET solution.
2. Generate an idempotent EF Core SQL migration script with `dotnet ef migrations script --idempotent`.
3. Publish the generated SQL as a CI artifact so it can be inspected for the release.
4. On a production deployment, execute that exact artifact against the Simply.com SQL Server.
5. Stop the deployment if SQL execution returns an error.
6. Deploy the new Roadcue API container only after the database migration step succeeds.

The generated script relies on EF Core's migration history and therefore skips migrations that have already been applied. Re-running the same release is expected to be safe from duplicate migration application.

Production database credentials are GitHub Environment secrets and must never be committed. The workflow expects:

- `SIMPLY_SQL_SERVER`
- `SIMPLY_SQL_DATABASE`
- `SIMPLY_SQL_USER`
- `SIMPLY_SQL_PASSWORD`

Use the `azure-production` GitHub Environment for these secrets so production database access remains scoped to the production deployment job. Where practical, protect that environment with GitHub deployment approval.

### Migration design rules

- Prefer backward-compatible expand/contract changes when an old and new API revision may overlap during deployment.
- Do not remove or rename a column in the same release where currently running code still requires it.
- Review destructive SQL (`DROP`, irreversible data conversion, mass updates) explicitly before production execution.
- Take an appropriate backup before risky or irreversible schema/data migrations.
- A failed migration must block application deployment; do not deploy code that depends on a schema change that did not complete.
- Rollback planning is migration-specific. An idempotent forward script prevents duplicate application but does not make destructive changes reversible.

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
