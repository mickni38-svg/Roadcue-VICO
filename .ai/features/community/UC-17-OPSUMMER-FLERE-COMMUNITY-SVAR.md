# UC-17 – Opsummér flere community-svar

**Fase:** Senere  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren får én forståelig status frem for mange individuelle svar.

**Hovedflow**

1. Backend grupperer svar om samme forhold.
2. Backend beregner antal svar, alder, geografisk relevans og enighed.
3. Backend fastsætter sikkerhedsstatus uden at overlade beregningen til LLM'en.
4. VICO formulerer én kort opsummering.
5. VICO oplyser antal svar og eventuel uenighed.

**Eksempler**

- “Tre chauffører har bekræftet, at der stadig er ledige pladser.”
- “Svarene er modstridende, så jeg kan ikke bekræfte situationen.”

## Acceptkriterier

- [ ] Kun svar, der tilhører samme autoriserede communityspørgsmål, indgår i opsummeringen.
- [ ] Backend leverer antal, alder, geografisk relevans, enighed og sikkerhedsstatus som strukturerede data.
- [ ] VICO ændrer ikke backendens beregnede sikkerhedsstatus.
- [ ] Enighed og uenighed mellem svar beskrives tydeligt.
- [ ] Opsummeringen indeholder ikke unødvendige personoplysninger om svarpersonerne.
- [ ] Resultatet er én kort opsummering og ikke en ukontrolleret oplæsning af alle svar.

**Resultat**

- Chaufføren får en samlet, sporbar og korrekt usikkerhedsmarkeret status.
