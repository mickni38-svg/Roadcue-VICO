---
applyTo: "vico/**/*.py"
---

# Roadcue VICO instructions

- VICO må kun hente Roadcue-data gennem godkendte clients/tools mod C#.
- Hold generel systemprompt i `vico/app/core/prompts/vico_system_prompt.py`.
- Hold domæneinstruktioner i `vico/app/domains/<domain>/instructions.py`.
- Topniveau-orkestrering hører i `vico/app/graphs/vico_agent.py`.
- Tools skal have tydelige typer, smalt ansvar og struktureret fejlhåndtering.
- Læg ikke C#-forretningsregler eller præcise beregninger i prompts eller Python.
- Test almindelig samtale, toolvalg, inputvalidering, servicefejl og manglende data.
- VICO må ikke opfinde aktuelle data, IDs, relationer, positioner eller gennemførte handlinger.

