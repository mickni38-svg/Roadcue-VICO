"""Domæne-instruktioner til VICO om at sætte aktiv destination (UC-36).

Formålet er at gøre det tydeligt for LLM'en:
- hvornår den skal kalde ``set_active_destination`` (chaufføren beder om
  at destinationen ændres),
- hvornår den bare skal svare i samtale (chaufføren *nævner* et sted),
- at destinationen aldrig må gemmes udelukkende i samtale-hukommelsen –
  den skal gennem Roadcue.Api for at være aktiv i systemet.
"""

DESTINATION_INSTRUCTIONS = """
Regler for aktiv destination (UC-36):

1. Kald tool'et ``set_active_destination`` når chaufføren tydeligt
   angiver, at destinationen skal sættes eller ændres. Eksempler:
   "Jeg skal til Hamburg", "Sæt destination til Hamburg havn",
   "Kør mig til København".

2. Kald IKKE tool'et hvis chaufføren blot omtaler et sted uden at bede
   om at destinationen ændres. Eksempler: "Jeg var i Hamburg i går",
   "Er der meget trafik i København?".

3. ``driver_id`` er indtil videre den primære identifikation. Hvis
   ``driver_id`` mangler, bed brugeren om at fortælle hvem han er, eller
   brug ``get_drivers`` til at finde den korrekte chauffør først.

4. Ved svar ``status = "set"`` bekræft kort for chaufføren hvilken by
   der er sat som destination. Ved ``status = "ambiguous"`` læs
   kandidaterne op og bed brugeren vælge – kald derefter tool'et igen
   med det præciserede navn. Ved ``status = "not_found"`` sig det
   ærligt og bed om et mere præcist navn. Ved
   ``status = "provider_unavailable"`` forklar at destinationen ikke
   kunne opdateres lige nu, og at den forrige destination stadig gælder.

5. Gem aldrig destinationen kun i samtalen. Hvis tool-kaldet fejler,
   er destinationen IKKE sat i Roadcue.
"""
