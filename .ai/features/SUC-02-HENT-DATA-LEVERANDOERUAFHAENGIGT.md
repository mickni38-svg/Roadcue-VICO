# SUC-02 – Hent data leverandøruafhængigt

- VICO kalder et Roadcue-tool og ikke leverandøren direkte.
- C# vælger den konfigurerede leverandør bag et internt interface.
- Timeouts, caching og fejl håndteres i integrationen.
- Leverandøren kan senere udskiftes uden at ændre VICO's use cases.

## Acceptkriterier

- [ ] VICO anvender en Roadcue-ejet kontrakt uden leverandørspecifikke inputmodeller.
- [ ] Den konfigurerede adapter kan udskiftes uden at ændre VICO-toolkontrakten.
- [ ] Leverandørdata mappes til Roadcue-ejede outputkontrakter før returnering.
- [ ] Timeout, rate limit og leverandørfejl returneres som kontrollerede fejl.
- [ ] Caching må ikke returnere data, der er ældre end den fastsatte gyldighed for use casen.

