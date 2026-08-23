# UC-05 – Etablere chaufførens sikre kontekst

**Fase:** POC/MVP  
**Primær aktør:** Chauffør  
**Støtteaktør:** Roadcue Backend  
**Mål:** VICO ved, hvem chaufføren er, og hvilken kørselskontekst der må anvendes.

**Forudsætninger**

- I POC kan chaufføren og GPS-data være simuleret.
- I MVP er chaufføren autentificeret.

**Hovedflow**

1. Roadcue identificerer chaufføren gennem login eller token.
2. Roadcue stiller det autoriserede `driverId` til rådighed for VICO.
3. Roadcue leverer tilladt kontekst:
   - position,
   - kørselsretning,
   - hastighed,
   - tidspunkt,
   - og senere aktiv rute.
4. VICO bruger konteksten uden at bede om allerede kendte oplysninger.
5. Alle efterfølgende tool-kald udføres med den korrekte brugeridentitet.

**Alternative flows**

- Hvis identiteten mangler i POC, kan en kontrolleret simuleret bruger vælges.
- Hvis token er ugyldigt, foretages ingen brugerrelaterede tool-kald.
- Hvis lokationssamtykke mangler, anvendes positionen ikke.

## Acceptkriterier

- [ ] MVP-identiteten kommer fra en betroet login-/tokenkontekst og ikke fra et navn i brugerens prompt.
- [ ] POC-brugere og GPS-data er tydeligt markeret som simulerede.
- [ ] Ugyldig eller manglende identitet forhindrer personlige tool-kald.
- [ ] Position anvendes kun, når det nødvendige lokationssamtykke findes.
- [ ] Tilladt position, retning, hastighed og tidspunkt knyttes til den korrekte chauffør.
- [ ] VICO beder ikke om kontekst, som allerede er leveret og stadig er gyldig.
- [ ] Kontekst fra én chauffør kan ikke anvendes i en anden chaufførs session.

**Resultat**

- VICO har en autoriseret bruger- og kørselskontekst.
