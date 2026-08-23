# UC-21 – Beregn trafikforhold ved chaufførens ankomst

**Fase:** Vision  
**Primær aktør:** Chauffør  
**Støtteaktører:** Roadcue Backend, ekstern routingservice  
**Mål:** Chaufføren får en datadrevet prognose og et rådgivende forslag.

**Hovedflow**

1. Backend estimerer køens begyndelse, slutning og længde.
2. Backend vurderer, om køen vokser eller falder.
3. Backend beregner chaufførens forventede ankomst til området.
4. Backend estimerer situationen ved ankomst.
5. En ekstern routingservice kan beregne virkningen af et alternativ.
6. VICO præsenterer prognose, usikkerhed og et rådgivende forslag.

**Eksempel**

> “Når du når frem, forventes køen at være cirka 14 kilometer. En ekstern beregning viser, at næste afkørsel muligvis sparer tid.”

**Alternative flows**

- Hvis datagrundlaget er utilstrækkeligt, gives ingen præcis prognose.
- Chaufføren træffer altid selv beslutningen.

**Resultat**

- Chaufføren har fået en usikkerhedsmarkeret prognose, ikke en autonom beslutning.
