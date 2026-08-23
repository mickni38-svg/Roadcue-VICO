## Teststrategi for AI

- Unit tests og automatiske CI-tests må aldrig foretage rigtige kald til OpenAI eller andre betalte AI-tjenester.
- Mock kun grænsen til AI-modellen – ikke Roadcues egen logik.
- Mocks skal repræsentere konkrete scenarier, herunder almindelige svar, tool-calls, fejl og ugyldige svar.
- Tests skal kontrollere inputtet til modellen, LangGraph-flowet, state, samtalehistorik, tool-routing og behandling af modelresultatet.
- En test, der alene returnerer et hardcoded AI-svar og derefter sammenligner med samme svar, er ikke tilstrækkelig.
- Faktisk sprogforståelse og modeladfærd testes gennem særskilte AI-evalueringer.
- Live AI-evalueringer skal være deaktiveret som standard og må kun startes manuelt med en eksplicit indstilling, eksempelvis `RUN_LIVE_AI_TESTS=true`.
- Live AI-evalueringer må aldrig køre automatisk under almindelig lokal test, build eller CI.