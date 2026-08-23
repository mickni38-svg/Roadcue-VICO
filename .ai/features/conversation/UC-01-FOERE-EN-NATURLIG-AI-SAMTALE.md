# UC-01 – Føre en naturlig AI-samtale

**Fase:** POC  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren får hjælp, viden eller selskab uden at lære bestemte kommandoer.

**Forudsætninger**

- VICO er tilgængelig gennem tekst eller senere tale.
- En AI-model er konfigureret.

**Hovedflow**

1. Chaufføren stiller et almindeligt spørgsmål med naturligt sprog.
2. VICO vurderer, at spørgsmålet kan besvares uden Roadcue-data.
3. VICO besvarer spørgsmålet direkte ved hjælp af almindelig AI-viden.
4. Svaret formuleres kort, naturligt og egnet til oplæsning.
5. Chaufføren kan stille et opfølgende spørgsmål.

**Eksempler**

- “Hvad betyder Umleitung?”
- “Quiz mig i tysk.”
- “Fortæl mig noget interessant.”
- “Fortæl en vittighed.”

**Alternative flows**

- Hvis spørgsmålet kræver aktuelle eller lokale data, fortsætter flowet i UC-03.
- Hvis VICO ikke kan besvare spørgsmålet sikkert, fortsætter flowet i UC-04.

**Resultat**

- Chaufføren har fået et direkte AI-svar eller er sendt videre til en relevant datakilde.
