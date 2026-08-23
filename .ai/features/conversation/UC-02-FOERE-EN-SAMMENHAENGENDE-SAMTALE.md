# UC-02 – Føre en sammenhængende samtale

**Fase:** POC  
**Primær aktør:** Chauffør  
**Mål:** VICO forstår opfølgende spørgsmål og sproglige henvisninger ud fra samtalekonteksten.

**Forudsætninger**

- Samtalen har et stabilt `thread_id`.
- Tidligere beskeder og tool-resultater findes i samtalens state.

**Hovedflow**

1. Chaufføren stiller et spørgsmål.
2. VICO besvarer spørgsmålet og gemmer den relevante kontekst.
3. Chaufføren stiller et opfølgende spørgsmål med en henvisning som “der”, “den” eller “ham”.
4. VICO forbinder henvisningen med det korrekte sted, objekt eller menneske fra samtalen.
5. VICO besvarer spørgsmålet uden at bede chaufføren gentage kendte oplysninger.

**Eksempel**

1. “Hvor langt er der til næste rasteplads?”
2. “Er der nogen, jeg kender der?”
3. VICO forstår, at “der” er den fundne rasteplads.

**Alternative flows**

- Hvis flere tidligere objekter kan matche henvisningen, beder VICO om præcisering.
- Hvis konteksten er udløbet eller mangler, forklarer VICO det kort.

**Resultat**

- Samtalen fortsætter sammenhængende med korrekt reference til tidligere information.
