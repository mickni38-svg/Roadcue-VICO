# Roadcue Copilot entrypoint

`.ai/` er repositoryets autoritative AI-udviklingskontekst.

For enhver opgave:

1. Læs `.ai/00-ROUTER.md` og `.ai/01-CONTRACT.md`.
2. Følg den valgte prompt under `.ai/prompts/`.
3. Læs kun den kontekst, routeren kræver.
4. Inspicér eksisterende kode og tests før forslag eller ændringer.

Vigtige grænser:

- C# ejer SQL, autorisation, forretningsregler og præcise beregninger.
- Python/VICO bruger godkendte C#-API'er/tools og tilgår aldrig SQL direkte.
- `/start-task`, `/bugfix` og `/refactor` stopper efter analyse og plan.
- Kun `/continue` efter udtrykkelig godkendelse implementerer.

Du må ikke oprette konkurrerende workflowregler i `.github/`; filerne her er kun indgange til `.ai/`.

