# Roadcue State and Lifecycles

This document distinguishes conversational workflow state from Roadcue business state. LangGraph may own orchestration checkpoints; C# owns durable business entities and their authorized transitions.

## Conversation thread

- Owner: VICO/LangGraph.
- Identity: stable `thread_id` supplied by the caller.
- Purpose: preserve dialogue context, referenced people/places and current orchestration step.

| Current state | Event | Next state | Notes |
|---|---|---|---|
| New | First user message | Active | Create or initialize thread state |
| Active | Direct answer | Active | Append conversational context |
| Active | Tool required | Awaiting tool | Store intended tool call and correlation |
| Awaiting tool | Tool result | Active | Validate result before response generation |
| Active | Clarification required | Awaiting user | Preserve unresolved reference/options |
| Awaiting user | Clarifying message | Active | Resume the same thread |
| Any | Expiry/deletion | Closed | Apply retention/privacy policy |

## Consequential action

Applies to sending messages, publishing observations, asking the community or activating an externally calculated route change.

| State | Meaning |
|---|---|
| Draft | VICO has interpreted the requested action |
| Awaiting confirmation | The recipient/content/effect has been read back |
| Confirmed | The driver explicitly approved the action |
| Executing | C# is processing the operation with an idempotency key |
| Completed | C# confirmed success |
| Failed | C# returned a safe failure result |
| Cancelled | The driver cancelled before completion |

VICO must not say an action succeeded until the C# backend confirms `Completed`.

## Community question: later phase

| State | Event | Next state |
|---|---|---|
| Draft | Driver confirms | Published |
| Published | Authorized recipients selected | Waiting |
| Waiting | One or more answers arrive | Partially answered |
| Waiting/Partially answered | Sufficiency rule met | Ready to summarize |
| Waiting/Partially answered | Timeout reached | Timed out |
| Ready to summarize | VICO delivers summary | Completed |
| Any open state | Driver cancels or policy invalidates | Cancelled |

C# persists the community question, recipients, permissions and answers. LangGraph persists the orchestration checkpoint needed to resume the conversation.

## Message queue: MVP

Messages are persisted by C# with sender, time and status. Playback/read state may include queued, presented, read, skipped and saved. VICO orchestrates commands such as read, pause, repeat and next, but the backend remains authoritative for durable delivery/read status.

## Invariants

- A `thread_id` does not grant access to a driver's data.
- `driverId` and permissions come from authenticated C# context in MVP.
- Retries cannot duplicate a consequential action.
- Conversation memory does not override current authorization or data freshness.
- Pending workflows have an expiry, cancellation path and stable correlation ID.
