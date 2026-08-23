# SUC-02 – Hent data leverandøruafhængigt

- VICO kalder et Roadcue-tool og ikke leverandøren direkte.
- C# vælger den konfigurerede leverandør bag et internt interface.
- Timeouts, caching og fejl håndteres i integrationen.
- Leverandøren kan senere udskiftes uden at ændre VICO's use cases.
