# Bindende arbejdskontrakt

Disse regler gælder for alle Copilot-opgaver i Roadcue.

## Sandhedskilder

Prioritér modstridende information sådan:

1. Brugerens aktuelle instruktion.
2. Godkendt use case og aktiv task.
3. Accepterede ADR'er.
4. Arkitektur- og domæneregler.
5. Den eksisterende kode og tests som bevis for nuværende tilstand.

Hvis dokumentation og kode er uenige, må uenigheden ikke skjules. Registrér den i tasken og foreslå den mindste korrektion.

## To faser

- `/start-task`, `/bugfix` og `/refactor` analyserer, opretter/opdaterer en task og stopper før kodeændringer.
- Implementering må først begynde efter tydelig brugergodkendelse og `/continue`.
- `/continue` må kun implementere den godkendte plan. Nyt scope kræver ny godkendelse.

## Ændringsdisciplin

- Lav den mindste komplette ændring, som opfylder use casen.
- Bevar eksisterende brugerændringer og undgå uvedkommende oprydning.
- Opfind ikke endpoints, tabeller, DTO'er, filstier eller kontrakter; verificér dem i koden.
- Tilføj ikke fremtidige features som forberedelse uden et aktuelt krav.
- En ændring er ikke færdig, før relevante tests eller konkrete manuelle kontroller er udført.

## Roadcue-grænser

- C# ejer SQL, autorisation, forretningsregler, geoqueries og præcise beregninger.
- Python/LangChain/LangGraph ejer samtale, toolvalg og agentorkestrering gennem godkendte API'er.
- LLM'en må ikke tilgå SQL direkte, omgå C# eller opfinde aktuelle Roadcue-data.
- Eksterne udbydere skjules bag Roadcue-ejede C#-interfaces.
- VICO rådgiver og styrer aldrig køretøjet.

## Stopbetingelser

Stop og bed om afklaring, hvis:

- acceptkriterierne er indbyrdes modstridende;
- en sikkerheds-, privatlivs- eller autorisationsbeslutning mangler;
- planen kræver større arkitekturændringer uden accepteret ADR;
- den angivne use case eller task ikke findes;
- implementering kræver scope uden for den godkendte plan.

