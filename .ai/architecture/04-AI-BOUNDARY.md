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
- Prompt composition/router: target location under `app/core/prompts/` or an equivalent orchestration helper.
- Top-level orchestration: `app/graphs/vico_agent.py`.

The general prompt defines VICO's identity, Danish default language, short speech-friendly style, uncertainty behavior and global tool rules. Friends-specific behavior belongs in Friends, not in the global prompt. The same separation applies to Destination, Messages, Places, Community and Traffic.

Prompts are version-controlled in Git during POC/MVP. Database storage is appropriate later only for managed/versioned runtime configuration with review, rollback and environment control; prompts are not casual content records.

## Prompt composition boundary

The prompt architecture follows two layers:

1. **Core instructions** — always supplied to the model and limited to cross-domain identity, language, safety, uncertainty and general tool behavior.
2. **Domain instructions** — supplied only when the current turn requires that capability once selective prompt composition is implemented.

The current small POC may concatenate all implemented domain instructions into one `SYSTEM_PROMPT`. That is accepted as a temporary simplification, not the long-term scaling model.

As VICO gains more domains, the target behavior is:

```text
current message + conversation state
        |
        v
prompt/tool routing context
        |
        +--> core prompt (always)
        +--> relevant domain instruction(s)
        +--> relevant approved tool schemas
        |
        v
LLM call
```

A general question such as a joke, language explanation or stable fact must not require unrelated Friends, Destination, Traffic or Weather instructions once selective routing exists. A genuine cross-domain request may activate more than one domain module.

The routing/composition layer is not an authorization boundary. It may decide which instructions and tools are candidates for a turn, but C# still validates identity, permissions, writes and authoritative data access.

Prompt selection must be observable and testable. Tests should be able to assert which domain modules were included without making a live OpenAI call.

## Inputs

- User message and stable `thread_id`.
- Authorized `driverId` in MVP; controlled simulated identity in POC.
- Consented position, direction, speed, time and later active route.
- Structured tool results with source, freshness and confidence metadata.
- Selected prompt modules and tool schemas relevant to the current turn.

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
- Ambiguous domain routing: prefer a safe broader candidate set or clarification; never compensate by inventing data.

## Evaluation

Maintain fixed scenarios for:

- direct AI answer versus tool selection;
- selective prompt composition for general, single-domain and multi-domain turns;
- multi-tool sequencing;
- references such as “there”, “him” and “that place”;
- duplicate names and missing data;
- prompt injection in user/community content;
- unauthorized location requests;
- confirmation before writes;
- concise Danish responses and explicit uncertainty.
