# Roadcue Runtime and Data Flows

## Flow 1: General conversation

1. The driver sends text to `/agent/chat` through the client or Swagger during the POC.
2. FastAPI validates the chat request and supplies a stable `thread_id`.
3. LangGraph restores the conversation state.
4. VICO determines that no Roadcue or external data is required.
5. The model creates a short, natural answer in Danish by default.
6. LangGraph stores the updated conversational state.
7. FastAPI returns the answer; later the client may read it aloud.

No dedicated tool is required for ordinary questions such as language help, quizzes or general knowledge. Time-sensitive facts still require an approved current-data tool.

## Flow 2: Get the current driver's friends

### Current POC

1. The driver asks a Friends question.
2. VICO selects `get_drivers` when it must resolve the controlled simulated driver.
3. The tool calls the C# Drivers endpoint.
4. VICO identifies an unambiguous simulated driver; it asks for clarification on duplicates.
5. VICO selects `get_driver_friends` with the resolved `driverId`.
6. The tool calls the C# Friends endpoint.
7. C# uses EF Core/SQL Server and returns authorized data.
8. VICO summarizes the result without inventing missing information.

### MVP target

The authenticated request context supplies an authorized `driverId`; `get_drivers` is no longer used to establish the current identity.

## Flow 3: Find a relevant place and combine friend context

1. VICO receives the driver's authorized identity plus position, direction, speed and time context.
2. VICO extracts facilities and time horizon from the natural-language request.
3. VICO calls an approved Roadcue place tool.
4. C# calls the configured place/routing provider behind an interface.
5. C# filters candidates and calculates distance and expected arrival time.
6. If requested, VICO calls a Friends tool for the selected place.
7. C# applies position-sharing authorization and geo matching.
8. VICO combines the two structured results into one short answer and states uncertainty.

## Flow 4: Later Ask the Road

1. VICO cannot obtain a sufficiently reliable answer from available data.
2. With driver approval, VICO calls a C# operation to create a community question.
3. C# authorizes recipients and persists the question.
4. LangGraph stores a resumable workflow with stable ID and timeout.
5. Responses arrive asynchronously through Roadcue.
6. The workflow resumes, validates available answers and requests deterministic credibility metadata.
7. VICO summarizes the answers, source count, age and confidence for the driver.

## Cross-cutting guarantees

- Every conversation has a stable `thread_id`.
- Every write or consequential action has a stable operation/correlation ID.
- Tool calls are schema-validated and authorized by C#.
- Timeouts and upstream errors become understandable VICO responses.
- Retries must not duplicate messages, observations or community questions.
- Source type, timestamp and uncertainty survive the tool boundary.
