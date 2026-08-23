# UC-30 – Giv en relevant proaktiv meddelelse

**Fase:** Senere  
**Primær aktør:** VICO  
**Sekundær aktør:** Chauffør  
**Mål:** Chaufføren bliver gjort opmærksom på en relevant ændring uden at VICO konstant afbryder.

**Hovedflow**

1. En ny hændelse eller opdatering registreres.
2. Backend beregner relevans ud fra position, retning, tidspunkt, relation, sikkerhed og brugerindstillinger.
3. Systemet beregner prioritet og tidskritikalitet.
4. Højprioritetsinformation kan afbryde.
5. Lavere prioritet placeres i kø.
6. VICO forklarer kort, hvorfor informationen er relevant.
7. Chaufføren kan høre mere, afvise eller dæmpe kategorien.

**Alternative flows**

- Stille tilstand udsætter ikke-kritiske oplysninger.
- Gentagne meddelelser om samme hændelse samles.
- Usikre data markeres tydeligt.

**Resultat**

- Chaufføren har modtaget eller fået gemt en relevant meddelelse efter egne præferencer.
