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

**Resultat**

- Chaufføren får en samlet, sporbar og korrekt usikkerhedsmarkeret status.
