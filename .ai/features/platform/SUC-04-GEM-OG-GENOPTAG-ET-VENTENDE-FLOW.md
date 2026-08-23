# SUC-04 – Gem og genoptag et ventende flow

- LangGraph-flowets state gemmes med et stabilt ID.
- Flowet kan vente på et event, et community-svar eller timeout.
- Flowet kan genoptages efter genstart.
- Dublerede events må ikke udføre samme handling to gange.
