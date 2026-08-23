from typing import Any

from langchain.tools import tool

from app.clients.roadcue_api_client import RoadcueApiClient
from app.config import settings
from app.tools._errors import safe_tool_call


# Delt API-klient-instans for dette modul – oprettes én gang ved import.
roadcue_api_client = RoadcueApiClient(
    base_url=settings.roadcue_api_base_url
)


@tool("get_driver_friends")
async def get_driver_friends(
    driver_id: str,  # Type-annotering i Python – svarer til string-parameteren i C#
) -> list[dict[str, Any]] | dict[str, str]:
    """
    Henter en chaufførs venner fra Roadcue.

    Brug dette tool, når brugeren spørger om sine venner,
    hvilke venner der er tilgængelige, eller hvem der kan
    kontaktes under en køretur.

    Args:
        driver_id: ID'et på den chauffør, hvis venner skal hentes.

    Ved fejl returneres et objekt af formen
    ``{"error": "friends_utilgaengelige", "detail": "..."}``.
    Modellen skal så forklare brugeren, at oplysningen ikke
    kunne hentes, og må ikke opfinde venner.

    Docstringen her er det LLM-modellen læser for at forstå
    hvad tool'et gør og hvilke parametre det kræver.
    """
    return await safe_tool_call(
        lambda: roadcue_api_client.get_driver_friends(driver_id),
        fejlkode="friends_utilgaengelige",
    )
