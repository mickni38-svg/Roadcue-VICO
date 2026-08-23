from typing import Any

from langchain.tools import tool

from app.clients.roadcue_api_client import RoadcueApiClient
from app.config import settings


# Delt API-klient-instans for dette modul – oprettes én gang ved import.
roadcue_api_client = RoadcueApiClient(
    base_url=settings.roadcue_api_base_url
)


@tool("get_driver_friends")
async def get_driver_friends(
    driver_id: str,  # Type-annotering i Python – svarer til string-parameteren i C#
) -> list[dict[str, Any]]:
    """
    Henter en chaufførs venner fra Roadcue.

    Brug dette tool, når brugeren spørger om sine venner,
    hvilke venner der er tilgængelige, eller hvem der kan
    kontaktes under en køretur.

    Args:
        driver_id: ID'et på den chauffør, hvis venner skal hentes.

    Docstringen her er det LLM-modellen læser for at forstå
    hvad tool'et gør og hvilke parametre det kræver.
    """
    return await roadcue_api_client.get_driver_friends(driver_id)