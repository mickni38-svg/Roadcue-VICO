# SUC-04 – Gem og genoptag et ventende flow

- LangGraph-flowets state gemmes med et stabilt ID.
- Flowet kan vente på et event, et community-svar eller timeout.
- Flowet kan genoptages efter genstart.
- Dublerede events må ikke udføre samme handling to gange.

## Acceptkriterier

- [ ] Hvert ventende flow gemmes med stabilt ID, ejer, status, timeout og nødvendig state.
- [ ] Et autoriseret event kan genoptage det korrekte flow efter en servicegenstart.
- [ ] Events til et afsluttet, annulleret eller udløbet flow udfører ingen ny handling.
- [ ] Dublerede events behandles idempotent.
- [ ] Kun den autoriserede bruger eller proces kan læse, annullere eller genoptage flowet.
- [ ] Statusovergange kan spores uden at gemme hele modelprompten som forretningsstate.

