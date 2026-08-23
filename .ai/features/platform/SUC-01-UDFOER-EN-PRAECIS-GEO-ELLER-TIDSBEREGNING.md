# SUC-01 – Udfør en præcis geo- eller tidsberegning

- VICO sender strukturerede input til Roadcue Backend.
- C# beregner afstand, retning, tidsestimat eller geografisk match.
- LLM'en udfører ikke den præcise beregning.
- Resultatet returneres med enhed, grundlag og eventuel usikkerhed.

## Acceptkriterier

- [ ] Backend afviser manglende, ugyldige eller uautoriserede beregningsinput.
- [ ] Beregningen udføres deterministisk i C# eller en godkendt specialistservice og ikke af LLM’en.
- [ ] Samme valide input og beregningsversion giver samme resultat inden for dokumenteret tolerance.
- [ ] Resultatet indeholder relevante enheder, beregningstidspunkt og anvendt grundlag.
- [ ] Kendt usikkerhed eller tolerance returneres struktureret og bevares i VICO’s svar.

