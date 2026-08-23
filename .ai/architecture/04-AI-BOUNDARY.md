# Roadcue AI Boundary

## VICO's role

VICO is a conversational orchestrator and companion. It understands natural language, preserves relevant dialogue context, selects approved tools and composes short answers. It is not the source of current Roadcue facts or deterministic calculations.

## Authority by flow

| Flow | AI authority | Deterministic C# responsibility | Confirmation |
|---|---|---|---|
| General conversation | Generate a direct answer | None unless current/internal data is needed | Not normally required |
| Read Friends/place/traffic data | Select tools and summarize | Authorize, retrieve, filter and calculate | Not normally required |
| Interpret a free observation | Extract structured proposal | Add trusted context, validate and persist | Read-back and driver confirmation |
| Send a message | Resolve intent and draft | Authorize recipient and send operation | Driver confirmation before send |
| Ask the Road | Propose and orchestrate | Select authorized recipients and persist state | Driver approval before publishing |
| Route change | Explain an external route proposal | Provider calculation and controlled activation | Driver confirmation |
| Proactive advice | Select wording and summarize | Relevance, priority and safety gates | Governed by user settings |

## Prompt placement

- General VICO prompt: `app/core/prompts/vico_system_prompt.py`.
- Domain instructions: `app/domains/<domain>/instructions.py`.
- Top-level orchestration: `app/graphs/vico_agent.py`.

The general prompt defines VICO's identity, Danish default language, short speech-friendly style, uncertainty behavior and global tool rules. Friends-specific behavior belongs in Friends, not in the global prompt. The same separation applies to Messages, Places, Community and Traffic.

Prompts are version-controlled in Git during POC/MVP. Database storage is appropriate later only for managed/versioned runtime configuration with review, rollback and environment control; prompts are not casual content records.

## Inputs

- User message and stable `thread_id`.
- Authorized `driverId` in MVP; controlled simulated identity in POC.
- Consented position, direction, speed, time and later active route.
- Structured tool results with source, freshness and confidence metadata.

Do not provide the model with secrets, unrestricted personal data or positions that the requesting driver is not authorized to see.

## Outputs

- User-facing answer suitable for speech.
- Structured tool calls matching approved schemas.
- Explicit uncertainty and source wording for current/community information.
- Confirmation request for consequential writes.

VICO must never invent Roadcue entities or present stale, predicted or community data as confirmed official fact.

## Failure policy

- Unknown general fact: say that it is unknown or ask for clarification.
- Missing current data: explain the missing source/tool rather than guessing.
- Invalid tool arguments: request missing information or safely retry after validation.
- C# authorization failure: do not reveal protected data.
- Provider timeout: give a concise temporary-failure response and retain conversation context.
- Ambiguous person/place: ask the driver to choose.
- Low-confidence speech input: request repetition before acting.

## Evaluation

Maintain fixed scenarios for:

- direct AI answer versus tool selection;
- multi-tool sequencing;
- references such as “there”, “him” and “that place”;
- duplicate names and missing data;
- prompt injection in user/community content;
- unauthorized location requests;
- confirmation before writes;
- concise Danish responses and explicit uncertainty.
