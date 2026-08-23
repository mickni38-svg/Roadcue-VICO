# Task: UC-03 – Vælge datakilder og tools automatisk

**Dato:** 2026-08-22
**Status:** Done
**Use case:** [.ai/features/conversation/UC-03-VAELGE-DATAKILDER-OG-TOOLS-AUTOMATISK.md](../features/conversation/UC-03-VAELGE-DATAKILDER-OG-TOOLS-AUTOMATISK.md)
**Type:** Feature

## Resultat

`vico_agent` vælger toolkilde ud fra intention: generel viden svares uden tool-kald, Roadcue-personlige spørgsmål bruger `get_drivers`/`get_driver_friends`, og svaret markerer kilde (modelviden vs. Roadcue-data). Toolfejl og manglende input resulterer i en forståelig dansk fejlbesked eller et målrettet afklaringsspørgsmål frem for opdigtet data. Tool-chaining (get_drivers → get_driver_friends) er dokumenteret bekræftet.

## Scope

**Med**

- Udvide `VICO_SYSTEM_PROMPT` med eksplicitte regler for kildevalg (modelviden vs. Roadcue-tool vs. ekstern), regler for kildeangivelse i svaret og regler for afklaringsspørgsmål ved manglende input.
- Wrappe `get_drivers` og `get_driver_friends` så `httpx`-fejl (timeout, HTTP 4xx/5xx, netværksfejl) returneres som en struktureret fejl-dict (`{"error": "...", "detail": "..."}`) i stedet for at kaste en uhåndteret exception i `ToolNode`.
- Nye pytest-tests i `vico/tests/test_uc03_source_routing.py`:
  - generelt tidsstabilt spørgsmål → ingen tool-kald.
  - "hvem er mine venner" med navn → `get_drivers` efterfulgt af `get_driver_friends` (chaining).
  - toolfejl → agenten returnerer forståelig dansk fejlbesked uden opdigtet data.
  - manglende input (navn ikke oplyst) → agenten stiller afklaringsspørgsmål uden tool-kald.
- Kort README-note eller kommentar i `vico_agent.py` der peger på hvor tools registreres til fremtidige domæner.

**Ikke med**

- Implementering af et eksternt-tjeneste-tool (fx trafik/vejr). UC-18/UC-21 ejer den arkitektur. UC-03s acceptkriterium om "aktuelt eksternt spørgsmål" verificeres først efter godkendt ekstern-tjeneste – noteres som åbent spørgsmål (se nedenfor).
- UC-04-flow ("ingen kilde kan levere sikkert svar") – ejes af separat task.
- Fjernelse eller omstrukturering af `friends_agent.py` (parallel graf – bruges ikke af `/agent/chat`).
- Ændring af `RoadcueApiClient`-signatur eller `/agent/chat`-kontrakten.
- Autentificeret `driverId` fra token (baseline-note fra `.ai/README.md`) – separat task.

## Verificeret udgangspunkt

- [vico/app/graphs/vico_agent.py](../../vico/app/graphs/vico_agent.py): `tools = [get_drivers, get_driver_friends]`, `SYSTEM_PROMPT = VICO_SYSTEM_PROMPT + FRIENDS_INSTRUCTIONS`, standard `ToolNode` + `tools_condition`. Ingen fejl-wrapper omkring tools.
- [vico/app/core/prompts/vico_system_prompt.py](../../vico/app/core/prompts/vico_system_prompt.py): Prompten instruerer allerede "Brug kun tools, når spørgsmålet kræver oplysninger fra Roadcue-systemet." – dækker delvist kriteriet om ingen unødige tools, men mangler regler for kildeangivelse og for "eksternt vs. modelviden".
- [vico/app/domains/friends/instructions.py](../../vico/app/domains/friends/instructions.py): Chaining `get_drivers → get_driver_friends` er allerede instrueret. Dækker UC-03s kriterium om struktureret output ført videre.
- [vico/app/tools/get_drivers.py](../../vico/app/tools/get_drivers.py) + [get_driver_friends.py](../../vico/app/tools/get_driver_friends.py): Kalder `RoadcueApiClient` direkte. `httpx.raise_for_status()` kaster ubearbejdede exceptions; `ToolNode` returnerer så en generisk fejlbesked som modellen kan opfinde svar på.
- [vico/app/main.py](../../vico/app/main.py): `/agent/chat` fanger `Exception` og returnerer HTTP 500. Fint til systemfejl, men toolfejl inde i grafen når ikke hertil.
- Eksisterende tests: `test_uc01_natural_conversation.py`, `test_uc02_conversation_thread.py`. Ingen tests dækker UC-03s routing- eller fejlkriterier.
- Dokumentationsafvigelse: UC-03 forventer "godkendt ekstern service" – repoet har ingen sådan endnu. UC-18 (trafik) findes som use case men er ikke implementeret.

## Påvirkning

| Område | Forventet ændring |
|---|---|
| Angular | Ingen |
| C# API/Application/Domain/Infrastructure | Ingen |
| Python/VICO | Udvidet systemprompt; fejl-wrappet tool-svar i `get_drivers.py` + `get_driver_friends.py`; ingen ændring af agent-topologi |
| SQL/migration | Ingen |
| Kontrakter/config | Ingen (tool-return-typen bliver bagudkompatibelt `list[dict] \| dict[str, str]`; modellen tolker den strukturerede fejl) |
| Tests/dokumentation | Ny `vico/tests/test_uc03_source_routing.py` |

## Implementeringsplan

1. Opdater `vico_system_prompt.py`: tilføj eksplicitte regler om (a) svar generelt spørgsmål uden tool, (b) brug kun Roadcue-tools ved personlige Roadcue-data, (c) angiv kilde i svaret ("ifølge Roadcue" / "generel viden"), (d) hvis nødvendig oplysning mangler, stil ét målrettet afklaringsspørgsmål uden tool-kald, (e) hvis et tool returnerer `{"error": ...}`, forklar fejlen kort og opfind ikke data.
2. Introducer en lille intern hjælper (fx `_safe_tool_call` i hvert tool eller en delt `app/tools/_errors.py`) der fanger `httpx.HTTPStatusError`, `httpx.RequestError` og øvrige `Exception` og returnerer `{"error": "<kort dansk fejlkode>", "detail": str(exc)}`.
3. Anvend hjælperen i `get_drivers.py` og `get_driver_friends.py` – bevar signaturerne og docstrings; udvid return-typen til `list[dict[str, Any]] | dict[str, str]`.
4. Opret `vico/tests/test_uc03_source_routing.py` med fire tests:
   - `test_generelt_spoergsmaal_bruger_ikke_tools`
   - `test_personligt_roadcue_spoergsmaal_bruger_chained_tools`
   - `test_toolfejl_giver_forstaaelig_besked_uden_opdigtning` (monkeypatch `RoadcueApiClient.get_drivers` til at kaste `httpx.RequestError`)
   - `test_manglende_input_giver_afklaringsspoergsmaal` (bruger stiller "hvem er mine venner?" uden navn)
5. Kør `pytest tests/ -v` – alle nye tests grønne, UC-01 og UC-02 fortsat grønne.

## Implementeringsspecifikke acceptkriterier

- [ ] Test for tidsstabilt generelt spørgsmål viser tom `tool_calls`-liste i alle AIMessages.
- [ ] Test for personligt Roadcue-spørgsmål viser mindst ét `get_drivers`-kald efterfulgt af mindst ét `get_driver_friends`-kald i samme run.
- [ ] Test for toolfejl viser at slutsvaret indeholder en fejlangivelse (fx "kunne ikke", "fejl") og ikke opfindet chauffør-/vennedata.
- [ ] Test for manglende navn viser tom `tool_calls`-liste og et svar der beder om navnet.
- [ ] UC-01- og UC-02-tests forbliver grønne (ingen regression).

## Valideringsplan

- [ ] pytest: `test_generelt_spoergsmaal_bruger_ikke_tools`
- [ ] pytest: `test_personligt_roadcue_spoergsmaal_bruger_chained_tools`
- [ ] pytest: `test_toolfejl_giver_forstaaelig_besked_uden_opdigtning`
- [ ] pytest: `test_manglende_input_giver_afklaringsspoergsmaal`
- [ ] pytest: hele suiten (`pytest tests/ -v`) grøn
- [ ] Manuel kontrol (valgfri, live LLM): `POST /agent/chat` med "Hvor mange minutter er der i en time?" → svar uden tool-kald; derefter "Hvem er mine venner? Jeg hedder <navn>" → svar med kildeangivelse.

## Risici og åbne spørgsmål

- **Afklaret (bruger, 2026-08-22):** UC-03s kriterium om "aktuelt eksternt spørgsmål via godkendt service" markeres som **udskudt indtil UC-18 (trafik) leveres**. Ingen eksternt-tjeneste-tool tilføjes i denne task. Kriteriet noteres som resterende begrænsning ved `/continue`-validering.
- **Afklaret (bruger, 2026-08-22):** Test-determinisme håndteres ved (i) `temperature=0`, (ii) assertions på `tool_calls`-strukturen frem for eksakt svartekst, (iii) korte, entydige prompts.
- **Afklaret (bruger, 2026-08-22):** Øvrige mindre valg (fejl-hjælperens placering, prompt-formulering, testnavne) træffes af udførende agent efter bedste faglige vurdering inden for planen.
- **Risiko:** Strukturerede fejl-dicts skal parses fornuftigt af modellen. Systemprompten instrueres eksplicit i formatet.
- **Dokumentationsafvigelse:** UC-03s kriterium om "skelne mellem modelviden, Roadcue-data, eksterne data og communitydata" verificeres i denne task kun for modelviden og Roadcue-data. Eksternt og community udskydes (jf. beslutning ovenfor).

## Implementeringslog

- Ændrede filer:
  - `vico/app/core/prompts/vico_system_prompt.py` – udvidet med regler for kildevalg, kildeangivelse, afklaringsspørgsmål og toolfejl-håndtering.
  - `vico/app/tools/_errors.py` – ny fælles `safe_tool_call`-hjælper der pakker `httpx.HTTPStatusError`, `httpx.RequestError` og øvrige `Exception` ind i `{"error", "detail"}`.
  - `vico/app/tools/get_drivers.py` – bruger `safe_tool_call` med fejlkoden `drivers_utilgaengelige`; return-type udvidet til `list[dict[str, Any]] | dict[str, str]`; docstring udvidet med fejlformat.
  - `vico/app/tools/get_driver_friends.py` – tilsvarende med fejlkoden `friends_utilgaengelige`.
  - `vico/tests/test_uc03_source_routing.py` – fire nye tests der dækker generel viden, tool-chaining, toolfejl og manglende input.
- Vigtige beslutninger:
  - Delt hjælper (`_errors.py`) frem for per-tool try/except – ensarter fejlkontrakten og gør det trivielt at tilføje nye tools.
  - Chaining-testen mocker `model.ainvoke` med `side_effect`-liste og monkeypatcher `RoadcueApiClient` – ingen live LLM eller HTTP kaldes.
  - Toolfejl-testen kalder `get_drivers.ainvoke({})` direkte for at verificere fejl-kontrakten uafhængigt af LLM-adfærd.
  - `friends_agent.py` (parallel graf) blev ikke rørt – den er ikke koblet på `/agent/chat`.
- Afvigelser fra planen: Ingen.

## Resultat af validering

- Automatiske tests: `pytest tests/ -v` → **13 passed in 27.11s** (7 UC-01 + 2 UC-02 + 4 UC-03).
- Manuel kontrol: Ikke krævet – automatiske tests dækker de fire implementerings-acceptkriterier.
- Resterende begrænsninger:
  - UC-03s acceptkriterium om "aktuelt eksternt spørgsmål via godkendt service" er **udskudt indtil UC-18 (trafik) leveres** (jf. bruger-beslutning).
  - UC-03s community-datakilde er ikke dækket – planlagt til senere fase.
  - "Skelne mellem kilder"-kriteriet er kun verificeret for modelviden og Roadcue-data.
  - Test-determinisme afhænger af at `ChatOpenAI` mockes; ægte LLM-adfærd kan variere og kræver manuel spot-check ved prompt-ændringer.
