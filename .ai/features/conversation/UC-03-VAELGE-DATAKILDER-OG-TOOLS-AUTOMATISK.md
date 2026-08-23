# UC-03 – Vælge datakilder og tools automatisk

**Fase:** POC  
**Primær aktør:** Chauffør  
**Støtteaktører:** Roadcue Backend, ekstern datatjeneste, senere community  
**Mål:** VICO finder selv den korrekte vej til et svar.

**Hovedflow**

1. Chaufføren formulerer et spørgsmål eller ønske.
2. VICO analyserer intention, kontekst og nødvendige oplysninger.
3. VICO vurderer, om svaret kræver:
   - almindelig AI-viden,
   - Roadcue-data,
   - en ekstern tjeneste,
   - eller senere et community-spørgsmål.
4. VICO vælger det relevante tool.
5. VICO kan bruge output fra ét tool som input til det næste.
6. VICO samler resultaterne til ét svar.
7. VICO angiver usikkerhed og kilde, når det er relevant.

**Alternative flows**

- Hvis et tool fejler, giver VICO en forståelig fejl og bruger kun en alternativ kilde, hvis den er godkendt.
- Hvis der mangler input, beder VICO om det nødvendige og intet mere.
- Hvis ingen kilde kan levere et sikkert svar, fortsætter flowet i UC-04.

**Resultat**

- Chaufføren får ét samlet svar, selvom flere services eller tools blev brugt.
