# Task: UC-04 – Håndtere manglende eller usikker viden

**Dato:** 2026-08-22
**Status:** Done
**Use case:** [.ai/features/conversation/UC-04-HAANDTERE-MANGLENDE-ELLER-USIKKER-VIDEN.md](../features/conversation/UC-04-HAANDTERE-MANGLENDE-ELLER-USIKKER-VIDEN.md)
**Type:** Feature

## Resultat

Når VICO ikke har tilstrækkeligt sikre oplysninger til at svare, gætter agenten ikke. I stedet forklarer den kort hvad der mangler eller er usikkert, markerer eksplicit oplysningers sikkerhedsniveau (**bekræftet / sandsynlig / ubekræftet / ukendt**) i sit svar, og tilbyder én relevant godkendt næste handling (fx præcisering af spørgsmålet, eller "jeg kan spørge communityet senere" – uden at oprette en communityforespørgsel, da UC-16 endnu ikke er implementeret). Hvis brugeren afviser, afsluttes flowet uden sideeffekter.

## Scope

**Med**

- Udvide `VICO_SYSTEM_PROMPT` med et **usikkerhedsafsnit** der definerer:
  - taksonomien `bekræftet` / `sandsynlig` / `ubekræftet` / `ukendt` og hvornår hver bruges,
  - at agenten aldrig præsenterer manglende, gammel eller ubekræftet info som sikker fakta,
  - at et modtaget sikkerhedsniveau (fx fra tool-output eller tidligere samtale) skal bevares i formuleringen,
  - at agenten kun tilbyder næste handlinger, der faktisk er tilgængelige (præcisering nu; "senere spørge communityet" må nævnes som fremtidig mulighed, men må ikke igangsættes),
  - at en communityforespørgsel eller anden vedvarende handling aldrig oprettes uden eksplicit brugeraccept,
  - at afvisning/annullering afslutter flowet uden sideeffekter.
- Ny pytest-fil `vico/tests/test_uc04_uncertain_knowledge.py` med tests der verificerer prompt-adfærden via mocked `ChatOpenAI` (side_effect-lister som i UC-03).

**Ikke med**

- Implementering af faktisk communityforespørgsel eller persistering af "spørg-community-senere"-intent (UC-16 er ikke leveret).
- Nye tools eller ændring af `safe_tool_call`-fejlkontrakten fra UC-03 (den er tilstrækkelig).
- Struktureret sikkerhedsfelt (`confidence`) på nuværende tool-outputs (`get_drivers`, `get_driver_friends` returnerer autoritative Roadcue-data → altid `bekræftet`, kræver ingen ny mekanik).
- Ekstern-tjeneste-scenarier (trafik/vejr) – afventer UC-18.
- Ændring af `/agent/chat`-kontrakten eller C#-lag.
- UI/stemme-håndtering af accept/afvis – forbliver ren tekst-samtale i POC.

## Verificeret udgangspunkt

- [vico/app/core/prompts/vico_system_prompt.py](../../vico/app/core/prompts/vico_system_prompt.py): efter UC-03 indeholder prompten regler for kildevalg, kildeangivelse, manglende input og toolfejl. **Mangler:** eksplicit sikkerhedstaksonomi, regel om at bevare modtaget sikkerhedsniveau, og regel om godkendte næste handlinger + accept før community.
- [vico/app/tools/_errors.py](../../vico/app/tools/_errors.py): returnerer `{"error", "detail"}` – dækker "tool ikke tilgængelig" som en form for `ukendt`, uden yderligere ændring.
- [vico/app/graphs/vico_agent.py](../../vico/app/graphs/vico_agent.py): agent-topologi uændret; ingen node- eller tool-ændringer nødvendige for UC-04.
- Ingen UC-16-community-tools eksisterer i repoet (`grep` på "UC-16" giver 0 hits) – bekræfter at community-handling kun må omtales som fremtidig mulighed.
- Eksisterende tests: UC-01 (7), UC-02 (2), UC-03 (4) – alle grønne. UC-04-tests skal følge samme mock-mønster (`_reload_agent_with_mocked_model` fra UC-03) uden at bryde UC-01s `importlib.reload`-afhængighed.

## Påvirkning

| Område | Forventet ændring |
|---|---|
| Angular | Ingen |
| C# API/Application/Domain/Infrastructure | Ingen |
| Python/VICO | Kun `vico_system_prompt.py` udvides med usikkerhedsafsnit |
| SQL/migration | Ingen |
| Kontrakter/config | Ingen |
| Tests/dokumentation | Ny `vico/tests/test_uc04_uncertain_knowledge.py` |

## Implementeringsplan

1. Udvid `VICO_SYSTEM_PROMPT` med afsnittet "Regler for usikker eller manglende viden":
   - taksonomi `bekræftet` / `sandsynlig` / `ubekræftet` / `ukendt`,
   - forbud mod at præsentere ubekræftet info som fakta,
   - regel om at bevare modtaget sikkerhedsniveau ordret eller synonymt,
   - regel om at tilbyde præcisering som konkret næste handling; community nævnes ikke (afventer UC-16),
   - regel om at afvisning afslutter flowet uden sideeffekter.
2. Opret `vico/tests/test_uc04_uncertain_knowledge.py` med fire tests (alle mocker `ChatOpenAI` via `side_effect`):
   - `test_usikker_viden_praesenteres_ikke_som_fakta` – mock returnerer et svar som "Jeg ved det ikke med sikkerhed …" og testen verificerer at ord som "bekræftet"/"med sikkerhed" ikke fremstilles for ubekræftet indhold; verificeres ved at prompten er sendt til modellen som `SystemMessage` (dvs. `mock_model.ainvoke` er kaldt med en `SystemMessage` der indeholder taksonomi-nøgleordet "ubekræftet").
   - `test_svar_indeholder_sikkerhedsmarkoer_naar_relevant` – mock returnerer svar med "ubekræftet" og testen sikrer at det når frem uændret gennem grafen.
   - `test_tilbyder_naeste_handling_uden_at_igangsaette_community` – mock returnerer svar der nævner "Vil du præcisere …?" som konkret næste handling; testen verificerer at der ikke er nogen `tool_calls` og ingen `ToolMessage` (dvs. ingen community-handling igangsat). Community nævnes ikke i prompt eller test.
   - `test_afvisning_afslutter_uden_sideeffekt` – to-turns samtale: mock returnerer først et tilbud, derefter (efter brugerens "Nej tak") et neutralt afslutningssvar; testen verificerer at ingen `tool_calls` er udført i hele forløbet.
3. Kør `pytest tests/ -v` – alle nye tests grønne, ingen regression i UC-01/02/03.

## Implementeringsspecifikke acceptkriterier

- [ ] `VICO_SYSTEM_PROMPT` indeholder ordene "bekræftet", "sandsynlig", "ubekræftet" og "ukendt" som eksplicit taksonomi.
- [ ] Test bekræfter at prompten indeholder regel om at bevare modtaget sikkerhedsstatus.
- [ ] Test for "tilbyd næste handling" viser 0 `tool_calls` og 0 `ToolMessage` i result-messages.
- [ ] Test for afvisning viser 0 `tool_calls` over begge turns.
- [ ] UC-01/02/03-tests forbliver grønne.

## Valideringsplan

- [ ] pytest: `test_usikker_viden_praesenteres_ikke_som_fakta`
- [ ] pytest: `test_svar_indeholder_sikkerhedsmarkoer_naar_relevant`
- [ ] pytest: `test_tilbyder_naeste_handling_uden_at_igangsaette_community`
- [ ] pytest: `test_afvisning_afslutter_uden_sideeffekt`
- [ ] pytest: hele suiten (`pytest tests/ -v`) grøn
- [ ] Manuel kontrol (valgfri, live LLM, kræver `OPENAI_API_KEY`): `POST /agent/chat` med "Hvor tæt er nærmeste ledige parkeringsplads?" → svar der markerer info som `ukendt`/`ubekræftet` og tilbyder præcisering, uden at opfinde afstand.

## Risici og åbne spørgsmål

- **Afklaret (bruger, 2026-08-22):** Taksonomien er **`bekræftet` / `sandsynlig` / `ubekræftet` / `ukendt`**.
- **Afklaret (bruger, 2026-08-22):** "Spørg communityet senere" **udelades helt** af systemprompten indtil UC-16 er leveret. Prompten må kun tilbyde præcisering som konkret næste handling. Hvis brugeren selv nævner community, må VICO forklare at det ikke er tilgængeligt endnu.
- **Konsekvens for plan:** Tests der tidligere refererede til "community senere"-formulering justeres til kun at teste præcisering som næste handling.
- **Risiko (accepteret):** LLM-tests holder sig til struktur (`tool_calls`/`ToolMessage`-fravær) og taksonomi-nøgleord i prompten, ikke eksakt svartekst.
- **Dokumentationsafvigelse (accepteret):** UC-04s kobling til UC-16 verificeres først når UC-16 leveres. Noteres som resterende begrænsning.

## Implementeringslog

- Ændrede filer:
  - `vico/app/core/prompts/vico_system_prompt.py` – nyt afsnit "Regler for usikker eller manglende viden" med taksonomi (`bekræftet` / `sandsynlig` / `ubekræftet` / `ukendt`), bevaringsregel, forbud mod at præsentere ubekræftet info som fakta, kun præcisering som konkret næste handling, og accept-krav før vedvarende handlinger.
  - `vico/tests/test_uc04_uncertain_knowledge.py` – fire nye tests (én ren prompt-assertion, tre agent-adfærdstests via mocked model).
- Vigtige beslutninger:
  - Prompt-taksonomi-testen læser `VICO_SYSTEM_PROMPT` direkte i stedet for at inspicere modelkald – deterministisk og uafhængig af mocking-strategi.
  - **Ny mocking-strategi:** UC-01/03 patchede `app.graphs.vico_agent.ChatOpenAI`, men `importlib.reload` overskriver denne binding via `from langchain_openai import ChatOpenAI`. UC-04 patcher i stedet `langchain_openai.ChatOpenAI` ved kilden FØR reload, så mocken plukkes op korrekt. Test 2 (bevare-status) kræver dette for at være deterministisk.
  - Community-relaterede formuleringer holdt helt ude af prompten – testen asserterer eksplicit at ordet "community" ikke forekommer.
- Afvigelser fra planen:
  - Test 1 blev omlagt fra "inspicér SystemMessage sendt til modellen" til "læs `VICO_SYSTEM_PROMPT` direkte" – bedre robusthed uden funktionel forskel.

## Resultat af validering

- Automatiske tests: `pytest tests/ -v` → **17 passed in 26.59s** (7 UC-01 + 2 UC-02 + 4 UC-03 + 4 UC-04).
- Manuel kontrol: Ikke krævet – automatiske tests dækker de fire implementerings-acceptkriterier.
- Resterende begrænsninger:
  - UC-04-koblingen til UC-16 (community-flow) kan først verificeres når UC-16 leveres.
  - "Skelne mellem sikkerhedsniveauer i faktiske svar" afhænger af LLM-formulering ved live-kald; automatiske tests bekræfter prompt-indhold og struktur, ikke frit formuleret adfærd.
  - UC-01/UC-03s eksisterende mock-strategi patcher stadig i `vico_agent`-modulet; den er ikke deterministisk (falder tilbage til live LLM), men de eksisterende tests passer alligevel og er ikke omfattet af denne task.
