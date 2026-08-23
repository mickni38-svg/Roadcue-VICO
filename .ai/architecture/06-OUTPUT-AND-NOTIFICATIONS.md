# Roadcue Output, Voice and Notifications

## Output types

| Output | Source of truth | Delivery | Timing |
|---|---|---|---|
| General AI answer | VICO/model within global rules | Text, later speech | Immediate |
| Roadcue data answer | Structured C# tool result | VICO summary in text/speech | Immediate |
| Community information | Persisted reports plus credibility/freshness metadata | VICO qualified summary | Immediate or resumed |
| Message | Roadcue messaging state | Queue/menu, text and speech | User-controlled by default |
| Consequential confirmation | C# operation contract plus VICO interpretation | Read-back and explicit confirm/cancel | Before execution |
| Proactive advice | Later relevance/priority decision plus source data | Text/speech notification | Only when policy allows |

## VICO response contract

Responses should be:

- Danish by default, with language switching on request;
- short, natural and suitable for speech;
- explicit about missing, stale, predicted or unconfirmed data;
- summarized before offering detail for long lists;
- clear about whether information is general AI knowledge, official/provider data or community input.

## Message and speech behavior

- Incoming messages enter a queue instead of always interrupting the driver.
- The driver can ask for the next message, a specific sender or a summary.
- Playback supports pause, continue, repeat, skip and save.
- The driver can interrupt VICO.
- Low-confidence speech recognition never triggers a consequential action without clarification.
- Recipient and content are read back before sending.

## Proactive output: not POC

Proactive delivery is introduced only after reactive flows work. A deterministic relevance/priority layer considers position, direction, route, time, urgency, freshness, user settings and driving context before VICO formulates an interruption.

VICO's proactivity, humor, answer length and coach behavior are adjustable. It must not become a continuously talking backseat driver.

## Failure behavior

- Tool/provider errors become concise user-facing explanations without internal stack traces.
- Failed send/publish operations remain visibly failed or retryable; they are not reported as delivered.
- If the source or age cannot support a confident statement, VICO says so.
- Non-urgent content may remain queued until requested.
