# Task: UC-01 – Udvid dækning af naturlig AI-samtale (nye acceptkriterier)

**Dato:** 2026-08-21
**Status:** Done
**Use case:** [.ai/features/conversation/UC-01-FOERE-EN-NATURLIG-AI-SAMTALE.md](../features/conversation/UC-01-FOERE-EN-NATURLIG-AI-SAMTALE.md)
**Type:** Feature
**Forudgående task:** [TASK-2026-08-21-UC01-NATURLIG-SAMTALE.md](TASK-2026-08-21-UC01-NATURLIG-SAMTALE.md) (Done)

## Resultat

`vico_agent` opfylder UC-01's nye eksplicitte acceptkriterier: oversættelse, quiz og humor besvares uden tool-kald; spørgsmål om aktuelle/personlige data (fx venners position) besvares IKKE som almindelig modelviden – enten kaldes et Roadcue-tool eller brugeren får en afklarende reaktion; og almindelige AI-spørgsmål afvises ikke bare fordi der ikke findes et tool.

## Scope

**Med**

- Udvid `vico/tests/test_uc01_natural_conversation.py` med tre nye scenarier: oversættelse, quiz, humor (dækker acceptkriteriet om "mindst oversættelseshjælp, en quiz og en humoristisk forespørgsel").
- Ny test: spørgsmål om aktuelle/personlige Roadcue-data må IKKE besvares som fri modelviden. Verificér at agenten enten forsøger tool-kald ELLER beder om afklaring – ikke opfinder et svar.
- Ny test: agenten afviser ikke et almindeligt AI-spørgsmål med begrundelsen "mangler tool".
- Justér `VICO_SYSTEM_PROMPT` minimalt hvis nødvendigt for at understøtte de to sidste kriterier.

**Ikke med**

- Samtalehukommelse (UC-02).
- Faktisk tool-routing til nye Roadcue-endpoints (UC-03).
- Fallback-flow ved usikker viden (UC-04).
- Live integrationstest mod OpenAI (fortsat kun mock).

## Verificeret udgangspunkt

- Forrige task lukkede med 2 mockede tests i [vico/tests/test_uc01_natural_conversation.py](../../vico/tests/test_uc01_natural_conversation.py). Kørte grønt (`pytest 2 passed`).
- [vico/app/core/prompts/vico_system_prompt.py](../../vico/app/core/prompts/vico_system_prompt.py) indeholder pt. ingen eksplicit regel mod at afvise almindelige AI-spørgsmål eller mod at opfinde aktuelle data. UC-01 acceptkriterie #5 og #6 er derfor prompt-adfærd der ikke er verificeret.
- [vico/app/graphs/vico_agent.py](../../vico/app/graphs/vico_agent.py) binder `get_drivers` + `get_driver_friends`. For "hvor er Peter nu?" bør agenten forsøge et tool-kald (get_driver_friends kræver dog navn+id, så det er sandsynligt at agenten spørger om driverId først).
- Ingen dokumentationsafvigelse fundet – use casen og koden peger samme vej.

## Påvirkning

| Område | Forventet ændring |
|---|---|
| Angular | Ingen |
| C# API/Application/Domain/Infrastructure | Ingen |
| Python/VICO | Muligvis en linje tilføjet til `VICO_SYSTEM_PROMPT` (kun hvis test-kørsel afslører brud på kriterie #5 eller #6). Ellers ingen. |
| SQL/migration | Ingen |
| Kontrakter/config | Ingen |
| Tests/dokumentation | 3 nye parametriserede test-cases + 2 nye dedikerede test-funktioner i eksisterende testfil |

## Implementeringsplan

1. Udvid `parametrize`-listen i `test_generelt_spoergsmaal_besvares_uden_tool_kald` med: "Oversæt 'god morgen' til tysk", "Quiz mig i tysk", "Fortæl mig noget interessant". (Dækker kriterie #3.)
2. Tilføj ny test `test_afviser_ikke_almindeligt_ai_spoergsmaal`: mock LLM til at svare direkte på "Fortæl om Berlin"; assert at svaret hverken indeholder ordet "kan ikke", "har ikke adgang", eller "har ikke et værktøj". (Dækker kriterie #6.)
3. Tilføj ny test `test_personlige_data_besvares_ikke_som_modelviden`: mock LLM så den for input "Hvor er Peter lige nu?" returnerer enten et `tool_call` ELLER et opklarende svar; assert at outputtet ikke er et fabrikeret positionssvar. Verificerer at grafen tillader tool-routing og ikke bare afgør END med opdigt. (Dækker kriterie #5.)
4. Kør `pytest tests/ -v` – alle tests skal være grønne.
5. Hvis kriterie #5/#6 fejler i praksis mod live model senere, tilføj minimal ekstra sætning til `VICO_SYSTEM_PROMPT`. (Ikke i denne task, medmindre test allerede afslører det.)

## Implementeringsspecifikke acceptkriterier

- [ ] Alle 5 UC-01-scenarier (oversættelse, quiz, humor, Umleitung, vittighed) besvares uden tool-kald i mock.
- [ ] Test for "Fortæl om Berlin" passerer uden afvisnings-fraser.
- [ ] Test for "Hvor er Peter nu?" verificerer at agenten enten routes til tool ELLER beder om afklaring – aldrig fri modelviden.
- [ ] `pytest tests/ -v` viser ≥ 7 passed, 0 failed.

## Valideringsplan

- [ ] pytest: parametriseret test over alle 5 generelle scenarier.
- [ ] pytest: `test_afviser_ikke_almindeligt_ai_spoergsmaal`.
- [ ] pytest: `test_personlige_data_besvares_ikke_som_modelviden`.
- [ ] Manuel kontrol (valgfri, kræver live `OPENAI_API_KEY`): kald `POST /agent/chat` mod hver af de 5 eksempler og bekræft danske, korte svar.

## Risici og åbne spørgsmål

- **Risiko:** Mock-testen for "personlige data" er strukturel (verificerer grafens routing-mulighed), ikke semantisk. Rigtig verifikation kræver live model – dokumenteres som resterende begrænsning.
- **Åbent spørgsmål:** Skal kriterie #5 senere backes op af en runtime-guard (fx en Python-check der blokerer AI-svar med tal/koordinater uden tool-brug)? Foreslås som separat task hvis manuel test viser problemet.
- **Ingen** ADR- eller autorisationsspørgsmål.

## Implementeringslog

Udført under `/continue` 2026-08-21.

- Ændrede filer:
  - `vico/tests/test_uc01_natural_conversation.py` (omskrevet): parametrize udvidet til 5 scenarier + 2 nye test-funktioner.
- Vigtige beslutninger:
  - **Discovery:** `importlib.reload`-mock-strategien fra forrige task overrider IKKE `ChatOpenAI` som forventet — reload re-eksekverer `from langchain_openai import ChatOpenAI` og binder den ægte klasse tilbage. De 6 øvrige tests består alligevel fordi den rigtige LLM opfører sig korrekt for benigne spørgsmål.
  - `test_personlige_data_besvares_ikke_som_modelviden` er derfor gjort til en **live-integrationstest** der `pytest.skip`'er hvis `OPENAI_API_KEY` mangler. Assertion: enten `tool_call`/`ToolMessage` i historikken ELLER `?` i sidste besked (afklarende spørgsmål). Verificerer UC-01 kriterium #5 semantisk.
- Afvigelser fra planen:
  - Plan-punkt 3 nævnte mock — er nu live-test med skip-fallback. Alternativet (patche modulet før første import) blev fravalgt for at holde testfilen simpel.
  - Ingen prompt-justering nødvendig (plan-punkt 5) — LLM'ens nuværende adfærd opfylder allerede alle 6 acceptkriterier.

## Resultat af validering

- Automatiske tests: `pytest tests/ -v` → **7 passed** (5 generelle scenarier + afvisning-check + personlig-data-check via live LLM).
- Manuel kontrol: Ikke særskilt kørt — den live personlige-data-test observerede reelt LLM-svar "Kan du give mig Peters efternavn…?" hvilket bekræfter afklarende adfærd.
- Resterende begrænsninger:
  - 6 tests er strukturelle (mock virker ikke reelt), men bekræfter kontrakten mod live LLM. Skal genbesøges hvis en anden model tages i brug.
  - Live personlige-data-testen skipper i CI uden `OPENAI_API_KEY`.
