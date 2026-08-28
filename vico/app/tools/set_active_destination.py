from typing import Any

from langchain.tools import tool

from app.clients.roadcue_api_client import RoadcueApiClient
from app.config import settings
from app.tools._errors import safe_tool_call


# Delt API-klient-instans for dette modul – oprettes én gang ved import.
roadcue_api_client = RoadcueApiClient(
    base_url=settings.roadcue_api_base_url
)


@tool("set_active_destination")
async def set_active_destination(
    driver_id: str,
    destination_text: str,
    country: str | None = None,
) -> dict[str, Any] | dict[str, str]:
    """
    Sætter chaufførens aktive destination i Roadcue.

    Brug dette tool når chaufføren tydeligt beder om at destinationen
    skal sættes eller ændres, fx "Jeg skal til Hamburg" eller
    "Sæt destination til Hamburg havn". Brug det IKKE hvis stedet
    kun nævnes i samtalen uden at chaufføren vil ændre destination.

    Args:
        driver_id: Chaufførens id i Roadcue. Skal være kendt før kaldet
            (fx via get_drivers).
        destination_text: Rå fritekst som chaufføren har sagt om
            destinationen, fx "Hamburg" eller "Hamburg havn".
        country: Valgfrit ISO-landekode-hint, fx "DE" eller "DK",
            hvis konteksten gør landet entydigt.

    Returværdi:
        - {"status": "set", "destination": {...}} ved succes.
        - {"status": "ambiguous", "candidates": [...]} hvis der er
          flere mulige destinationer – bed chaufføren vælge og kald
          tool'et igen med det præciserede navn.
        - {"status": "not_found"} hvis stedet ikke kunne findes.
        - {"status": "provider_unavailable", "detail": "..."} hvis
          geocoder er nede – den forrige destination gælder stadig.
        - {"error": "destination_utilgaengelig", "detail": "..."} ved
          uventet HTTP-fejl. Modellen må ikke opfinde en destination.
    """
    return await safe_tool_call(
        lambda: roadcue_api_client.set_active_destination(
            driver_id=driver_id,
            query=destination_text,
            country=country,
        ),
        fejlkode="destination_utilgaengelig",
    )
