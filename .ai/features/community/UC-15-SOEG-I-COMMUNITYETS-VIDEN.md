# UC-15 – Søg i communityets viden

**Fase:** MVP/Senere  
**Primær aktør:** Chauffør  
**Mål:** Chaufføren får relevante tidligere observationer uden at høre irrelevante eller forældede meldinger.

**Hovedflow**

1. Chaufføren stiller et spørgsmål om et sted eller forhold.
2. VICO udleder det semantiske emne.
3. Backend filtrerer på position, sted, tidspunkt, alder og gyldighed.
4. Senere kombineres filtrene med semantisk søgning i friteksten.
5. Backend returnerer relevante observationer og sikkerhedsstatus.
6. VICO opsummerer resultatet og oplyser graden af sikkerhed.

**Alternative flows**

- Hvis observationerne er modstridende, siger VICO det.
- Hvis der ikke findes aktuelle observationer, tilbyder VICO senere UC-16.

**Resultat**

- Chaufføren får relevant community-viden med kilde, alder og usikkerhed.
