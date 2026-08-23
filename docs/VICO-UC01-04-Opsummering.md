# VICO POC – Opsummering af UC-01 til UC-04

Denne opsummering samler status, adfærd og teknisk implementering af de fire første use cases i Roadcue VICO. Alle fire er implementeret og valideret automatisk. Live-verificeret manuelt via `POST /agent/chat`.

## Overblik

| UC | Titel | Hovedansvar | Status |
|----|-------|-------------|--------|
| UC-01 | Føre en naturlig AI-samtale | Almindelig AI-viden uden Roadcue-tools | Done |
| UC-02 | Føre en sammenhængende samtale | Kontekst pr. `thread_id` via LangGraph-checkpointer | Done |
| UC-03 | Vælge datakilder og tools automatisk | Kilderouting: modelviden vs. Roadcue-tools; toolfejl-håndtering | Done |
| UC-04 | Håndtere manglende eller usikker viden | Sikkerhedstaksonomi og præcisering som næste handling | Done |

Alle fire tasks findes under [.ai/tasks/](../.ai/tasks/).

## Arkitektur

```
┌──────────────────┐          ┌────────────────────────────┐
│ Klient (Angular) │  HTTPS   │ Python FastAPI (VICO)      │
│ POST /agent/chat │─────────▶│ app/main.py                │
└──────────────────┘          │  ├─ ChatRequest (Pydantic) │
							  │  └─ vico_agent.ainvoke()   │
							  │        │                    │
							  │        ▼                    │
							  │ LangGraph (StateGraph)      │
							  │  assistant ⇄ tools          │
							  │  MemorySaver (thread_id)    │
							  └───────┬────────────────────┘
									  │ tools
									  ▼
							  ┌────────────────────────────┐
							  │ RoadcueApiClient (httpx)   │
							  │  → C# API /api/drivers     │
							  │  → C# API /api/.../friends │
							  └────────────────────────────┘
```

**Ansvarsfordeling** (jf. `.ai/01-CONTRACT.md`):
- **C#** ejer SQL, autorisation, forretningsregler, geoqueries.
- **Python/LangChain/LangGraph** ejer samtale, tool-valg og orkestrering.
- **LLM'en** må aldrig gå uden om C# eller opfinde Roadcue-data.

---

## UC-01 – Føre en naturlig AI-samtale

### Adfærd
Chaufføren stiller almindelige, tidsstabile spørgsmål (oversættelser, quiz, vittigheder). VICO svarer direkte på dansk uden at kalde tools. Personlige eller aktuelle data besvares ikke som modelviden.

### Teknisk implementering
- **`vico/app/graphs/vico_agent.py`** – `StateGraph(MessagesState)` med noderne `assistant` (kalder `ChatOpenAI`) og `tools` (`ToolNode`). `tools_condition` router til tools kun hvis modellen udsteder et `tool_call`.
- **`vico/app/core/prompts/vico_system_prompt.py`** – `VICO_SYSTEM_PROMPT` definerer VICOs identitet: dansk, kort, egnet til oplæsning, "brug kun tools ved Roadcue-oplysninger".
- **`vico/app/main.py`** – `POST /agent/chat` modtager `ChatRequest`, wrapper brugerens tekst i `HumanMessage`, kalder `vico_agent.ainvoke`, returnerer sidste `AIMessage.content`.

### Tests
`vico/tests/test_uc01_natural_conversation.py` (7 tests, inkl. parametriserede):
- Generelle spørgsmål → tom `tool_calls`-liste, ingen `ToolMessage`.
- Ikke-afvisning af almindelige AI-spørgsmål.
- Personlige data må ikke besvares som modelviden (kræver live LLM).

---

## UC-02 – Føre en sammenhængende samtale

### Adfærd
To sekventielle kald med samme `thread_id` deler historik ("Hvilket tal bad jeg dig huske?"). Forskellige `thread_id` deler ikke historik. Klienten kan enten sende `thread_id` eller få et auto-genereret UUID tilbage i responsen.

### Teknisk implementering
- **`vico/app/graphs/vico_agent.py`** – `builder.compile(checkpointer=MemorySaver())`. `MemorySaver` er in-memory og pr. proces (POC-niveau).
- **`vico/app/models/chat_request.py`** – `thread_id: str | None = None`.
- **`vico/app/main.py`** – hvis `request.thread_id is None`, generer `str(uuid.uuid4())`. Videresend som `config={"configurable": {"thread_id": ...}}` og returner i JSON-svaret.

### Tests
`vico/tests/test_uc02_conversation_thread.py` (2 tests):
- Samme `thread_id` → 2. kalds state indeholder 1. kalds `HumanMessage`.
- Forskellige `thread_id` → historik lækker ikke på tværs.

### Kendte begrænsninger
- `MemorySaver` deler ikke state mellem uvicorn-workers; skift til persistent checkpointer (SQLite/Postgres) kræves før produktion.
- Ingen TTL på tråde endnu.

---

## UC-03 – Vælge datakilder og tools automatisk

### Adfærd
- **Generelt spørgsmål** → svar uden tool-kald.
- **Personligt Roadcue-spørgsmål** ("hvem er mine venner? Jeg hedder Peter") → `get_drivers` → `get_driver_friends` kædet, svar med "ifølge Roadcue".
- **Aktuel ekstern data** (trafik, vejr) → VICO siger ærligt at det ikke kan besvares endnu.
- **Manglende input** ("hvem er mine venner?") → ét afklaringsspørgsmål, intet tool-kald.
- **Toolfejl** (C#-API nede) → struktureret fejl-dict oversat til dansk brugerbesked uden opdigtning.

### Teknisk implementering
- **`vico/app/core/prompts/vico_system_prompt.py`** – udvidet med regelsæt for kildevalg, kildeangivelse, manglende input og toolfejl-fortolkning.
- **`vico/app/tools/_errors.py`** – `safe_tool_call(call, *, fejlkode)` fanger `httpx.HTTPStatusError`, `httpx.RequestError` og øvrige `Exception` → returnerer `{"error": <kode>, "detail": <kort beskrivelse>}`.
- **`vico/app/tools/get_drivers.py`** og **`get_driver_friends.py`** – wrappet med `safe_tool_call`; docstrings udvidet så LLM'en ved hvordan fejl-dict skal fortolkes. Return-type: `list[dict[str, Any]] | dict[str, str]`.
- Ingen ændring af `vico_agent`-topologi eller `/agent/chat`-kontrakten.

### Fejlkontrakt
```json
{ "error": "drivers_utilgaengelige", "detail": "Kunne ikke nå Roadcue-API: ConnectError." }
{ "error": "friends_utilgaengelige", "detail": "HTTP 404 fra Roadcue-API." }
```
Systemprompten instruerer modellen i at forklare fejlen kort på dansk og aldrig opfinde data.

### Tests
`vico/tests/test_uc03_source_routing.py` (4 tests):
- Generelt spørgsmål → ingen tool-kald.
- Personligt spørgsmål → `get_drivers` før `get_driver_friends`.
- `httpx.ConnectError` → struktureret fejl-dict returneres (unit-test direkte på `get_drivers.ainvoke`).
- Manglende navn → afklaringsspørgsmål uden tool-kald.

### Kendte begrænsninger
- "Aktuelt eksternt spørgsmål via godkendt service" udskudt indtil UC-18 (trafik) leveres.
- Community-datakilde ikke dækket (UC-16 er ikke leveret).

---

## UC-04 – Håndtere manglende eller usikker viden

### Adfærd
Når VICO ikke kan svare sikkert:
1. Gætter aldrig navne, tal, tider eller placeringer.
2. Kan markere oplysninger med sikkerhedstaksonomien **`bekræftet` / `sandsynlig` / `ubekræftet` / `ukendt`**.
3. Bevarer et modtaget sikkerhedsniveau i sin formulering (nedgraderer ikke `ubekræftet` til `bekræftet`).
4. Tilbyder præcisering som konkret næste handling.
5. Igangsætter aldrig vedvarende handlinger (fx notering, deling) uden brugerens accept. Afvisning afslutter flowet uden sideeffekter.

### Teknisk implementering
- **`vico/app/core/prompts/vico_system_prompt.py`** – nyt afsnit "Regler for usikker eller manglende viden" med taksonomi, bevaringsregel, forbud mod pseudo-fakta og accept-krav før vedvarende handling.
- Ingen tool-, graf- eller kontraktændringer. UC-04 er en ren promptudvidelse oven på UC-03.
- Community-formuleringer er **helt udeladt** af prompten indtil UC-16 er leveret.

### Tests
`vico/tests/test_uc04_uncertain_knowledge.py` (4 tests):
- Direkte assertion på `VICO_SYSTEM_PROMPT`: indeholder de fire taksonomi-ord + "bevare"; indeholder ikke "community".
- Forceret "ubekræftet"-svar bevares uændret gennem grafen.
- Ved usikker viden: ingen `tool_calls`, ingen `ToolMessage`, svaret indeholder `?` (præcisering).
- To-turns "Nej tak"-afvisning: ingen `tool_calls` i hele forløbet.

### Ny mocking-strategi (relevant for kommende tests)
UC-01/UC-03 patcher `app.graphs.vico_agent.ChatOpenAI`, men `importlib.reload` re-eksekverer `from langchain_openai import ChatOpenAI` og overskriver patchen. UC-04 patcher i stedet **ved kilden** (`langchain_openai.ChatOpenAI`) FØR `reload`, så mocken plukkes korrekt op. Anbefalet mønster for fremtidige tests.

---

## Samlet valideringsstatus

`pytest tests/ -v` → **17 passed** (7 UC-01 + 2 UC-02 + 4 UC-03 + 4 UC-04).

**Live-verificeret manuelt** via `POST /agent/chat` med scenarier for hver UC.

## Kildeoversigt

| Fil | UC | Formål |
|-----|----|--------|
| `vico/app/main.py` | 01, 02 | FastAPI endpoints, `thread_id`-håndtering |
| `vico/app/models/chat_request.py` | 02 | `message` + valgfrit `thread_id` |
| `vico/app/graphs/vico_agent.py` | 01, 02, 03 | LangGraph, checkpointer, tool-binding |
| `vico/app/core/prompts/vico_system_prompt.py` | 01, 03, 04 | Systemprompt: identitet, kildevalg, taksonomi |
| `vico/app/domains/friends/instructions.py` | 03 | Chaining `get_drivers` → `get_driver_friends` |
| `vico/app/tools/get_drivers.py` | 03 | Roadcue-tool, fejl-wrappet |
| `vico/app/tools/get_driver_friends.py` | 03 | Roadcue-tool, fejl-wrappet |
| `vico/app/tools/_errors.py` | 03 | Fælles `safe_tool_call` |
| `vico/app/clients/roadcue_api_client.py` | 03 | HTTP-klient til C#-API |
| `vico/tests/test_uc01_*.py` … `test_uc04_*.py` | 01–04 | Automatiske tests |

## Åbne emner til senere use cases

- **UC-16** (community): communityforespørgsel og accept-flow. UC-04-prompten udvides når dette leveres.
- **UC-18** (trafik): første godkendte eksterne C#-interface. Verificerer UC-03s eksternt-kriterium.
- **Persistent checkpointer** til UC-02 (SQLite/Postgres) før multi-worker/produktion.
- **Autentificeret `driverId`** fra login/token-kontekst i stedet for LLM-baseret navnematch.
- **Deterministisk mock-strategi** i UC-01/UC-03-tests (skift til kilde-patch som i UC-04).
