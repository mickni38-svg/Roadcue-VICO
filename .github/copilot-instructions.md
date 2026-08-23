# Roadcue Copilot Instructions

`.ai/` er Roadcues autoritative udviklingskontekst.

Læs altid:

- [Roadcue router](../.ai/00-ROUTER.md)
- [Roadcue contract](../.ai/01-CONTRACT.md)

Følg derefter kun de filer, som routeren kræver for den konkrete opgave.

Alle filstier skal fortolkes relativt til Roadcue-mappen, som indeholder:

- `.ai`
- `.github`
- `src`
- `vico`

Hvis `00-ROUTER.md` findes i References, er mappen, der indeholder filen,
den korrekte `.ai`-mappe.

Vigtige regler:

- Det aktive dokument under `.ai/features/` er den aktuelle use case.
- Det aktive dokument under `.ai/tasks/` er den aktuelle task.
- `/start-task`, `/bugfix` og `/refactor` må kun analysere og planlægge.
- Kun `/continue` må implementere en godkendt task.
- C# ejer SQL, autorisation, forretningsregler og præcise beregninger.
- Python/VICO bruger kun godkendte C#-API'er og tools.
- VICO må aldrig tilgå SQL direkte eller opfinde aktuelle Roadcue-data.
- Læs kun relevante use cases, arkitekturfiler og domæneregler.
- Undersøg eksisterende kode og tests, før der foreslås ændringer.
- Stop og bed om afklaring, hvis use case, task eller scope ikke er entydigt.