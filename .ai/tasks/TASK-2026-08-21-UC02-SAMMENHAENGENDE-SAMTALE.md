# Task: UC-02 – Sammenhængende samtale med thread_id

**Dato:** 2026-08-21
**Status:** Done
**Use case:** [.ai/features/conversation/UC-02-FOERE-EN-SAMMENHAENGENDE-SAMTALE.md](../features/conversation/UC-02-FOERE-EN-SAMMENHAENGENDE-SAMTALE.md)
**Type:** Feature

## Resultat

`POST /agent/chat` accepterer et `thread_id`, og `vico_agent` gemmer og genbruger samtalehistorik pr. tråd. Opfølgende spørgsmål som "Er der nogen jeg kender der?" kan referere til tidligere svar i samme tråd. Beskeder med forskellige `thread_id` deler ikke kontekst.

## Scope

**Med**

- Tilføj `langgraph`-checkpointer (`MemorySaver` – in-memory er tilstrækkelig til POC) til `vico_agent`.
- Udvid `ChatRequest` med valgfrit `thread_id: str | None`.
- Videresend `thread_id` i `config={"configurable": {"thread_id": ...}}` ved `vico_agent.ainvoke`.
- Auto-generér et `thread_id` (UUID) hvis klienten ikke sender ét, og returnér det i responsen så klienten kan genbruge det.
- Pytest-tests der verificerer at samme `thread_id` deler historik og forskellige `thread_id` ikke gør.

**Ikke med**

- Persistent checkpointing (SQLite/Postgres) – kun in-memory til POC.
- TTL/udløb af tråde (UC-02's "udløbet historik"-kriterium udskydes til separat task).
- Frontend-integration af `thread_id`.
- Ændring af den underliggende agent-graf-topologi (assistant/tools-noder).

## Verificeret udgangspunkt

- [vico/app/graphs/vico_agent.py](../../vico/app/graphs/vico_agent.py): `vico_agent = builder.compile()` — **ingen checkpointer**. Al historik går tabt mellem requests.
- [vico/app/models/chat_request.py](../../vico/app/models/chat_request.py): `ChatRequest` har kun `message: str` — intet trådfelt.
- [vico/app/main.py](../../vico/app/main.py): `/agent/chat` kalder `vico_agent.ainvoke(..., config={"recursion_limit": 10})` — ingen `configurable.thread_id`.
- Ingen eksisterende tests dækker samtalehistorik.
- `langgraph` er allerede i `requirements.txt` og eksponerer `MemorySaver` via `langgraph.checkpoint.memory`.

## Påvirkning

| Område | Forventet ændring |
|---|---|
| Angular | Ingen (frontend integrerer i separat task) |
| C# API/Application/Domain/Infrastructure | Ingen |
| Python/VICO | `vico_agent.py`: import + `builder.compile(checkpointer=MemorySaver())`. `chat_request.py`: nyt `thread_id`-felt. `main.py`: generér/videresend `thread_id` og returnér det i response |
| SQL/migration | Ingen |
| Kontrakter/config | `/agent/chat`-response udvides med `thread_id`-felt (bagudkompatibel tilføjelse) |
| Tests/dokumentation | Nye pytest-tests i `vico/tests/test_uc02_conversation_thread.py` |

## Implementeringsplan

1. Opdater `vico_agent.py`: importer `MemorySaver` fra `langgraph.checkpoint.memory` og send den som `checkpointer=` til `builder.compile()`.
2. Opdater `chat_request.py`: tilføj `thread_id: str | None = None` med kort docstring.
3. Opdater `main.py` i `/agent/chat`:
   - Hvis `request.thread_id` er `None`, generér et nyt UUID.
   - Kald `vico_agent.ainvoke(..., config={"configurable": {"thread_id": thread_id}, "recursion_limit": 10})`.
   - Returnér `{"answer": ..., "thread_id": thread_id}`.
4. Opret `vico/tests/test_uc02_conversation_thread.py` med to tests:
   - `test_samme_thread_deler_historik`: send to `HumanMessage` med samme `thread_id`; verificér at state efter 2. kald indeholder begge brugerbeskeder.
   - `test_forskellige_threads_deler_ikke_historik`: send til to distinct thread_ids; verificér at hver state kun indeholder sin egen brugerbesked.
5. Kør `pytest tests/ -v` – alle nye tests grønne, eksisterende UC-01-tests fortsat grønne.

## Implementeringsspecifikke acceptkriterier

- [ ] `POST /agent/chat` uden `thread_id` returnerer et genereret `thread_id`.
- [ ] To sekventielle kald med samme `thread_id` viser at 2. kalds state indeholder 1. kalds `HumanMessage`.
- [ ] To kald med forskellige `thread_id` deler ikke `HumanMessage`-historik.
- [ ] Alle UC-01-tests er fortsat grønne (ingen regression).

## Valideringsplan

- [ ] pytest: `test_samme_thread_deler_historik`.
- [ ] pytest: `test_forskellige_threads_deler_ikke_historik`.
- [ ] pytest: hele suiten (`pytest tests/ -v`) grøn.
- [ ] Manuel kontrol (valgfri, live LLM): `POST /agent/chat` med `{"message":"Fortæl en vittighed"}`, kopiér returneret `thread_id`, send `{"message":"En til","thread_id":"..."}` og bekræft ny vittighed uden gentagelse.

## Risici og åbne spørgsmål

- **Risiko:** `MemorySaver` er ikke process-safe – flere uvicorn-workers deler ikke state. Acceptabelt for POC med 1 worker.
- **Åbent spørgsmål:** Skal `thread_id` valideres som UUID? Foreslås som simpel `str` uden validering i POC.
- **Dokumentationsafvigelse:** UC-02 kriteriet "undgår at gentage samme vittighed" verificeres ikke automatisk – kræver live LLM med reel historik og noteres som resterende begrænsning.

## Implementeringslog

- Ændrede filer:
  - `vico/app/graphs/vico_agent.py` – importeret `MemorySaver`, kompileret med `checkpointer=MemorySaver()`.
  - `vico/app/models/chat_request.py` – tilføjet valgfrit `thread_id: str | None`.
  - `vico/app/main.py` – auto-UUID for `thread_id`, videresendt via `configurable.thread_id`, returneres i response.
  - `vico/tests/test_uc01_natural_conversation.py` – UC-01-tests udvidet med `configurable.thread_id` (krævet når checkpointeren er aktiv).
  - `vico/tests/test_uc02_conversation_thread.py` – nye tests for delt/ikke-delt historik.
- Vigtige beslutninger:
  - Brugte neutral prompt („Husk tallet 42”) i historik-test for at undgå tool-routing og ekstern HTTP-afhængighed.
  - UC-01-testcalls skal medbringe et `thread_id` efter checkpointer er aktiv – valgt et statisk pr. test.
- Afvigelser fra planen: Ingen.

## Resultat af validering

- Automatiske tests: `pytest tests/ -v` → **9 passed in 22.50s** (7 UC-01 + 2 UC-02).
- Manuel kontrol: Ikke kørt – automatiske tests dækker acceptkriterierne for delt/ikke-delt historik.
- Resterende begrænsninger:
  - `MemorySaver` er in-memory og pr. proces – nulstilles ved restart, deles ikke mellem workers.
  - UC-02-kriteriet „undgår at gentage samme vittighed” verificeres ikke automatisk (kræver live LLM).
  - TTL/udløb af tråde er ikke implementeret – udskudt til separat task.
