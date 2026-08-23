from typing import Any

# @tool-dekoratoren registrerer funktionen som et LangChain-tool.
# Det betyder at LLM-modellen kan vælge at kalde den som en funktion.
from langchain.tools import tool

from app.clients.roadcue_api_client import RoadcueApiClient
from app.config import settings
from app.tools._errors import safe_tool_call


# Delt API-klient-instans for dette modul – oprettes én gang ved import.
roadcue_api_client = RoadcueApiClient(
    base_url=settings.roadcue_api_base_url
)


# "get_drivers" er tool-navnet som LLM-modellen ser og bruger til at beslutte
# hvornår den skal kalde dette tool.
@tool("get_drivers")
async def get_drivers() -> list[dict[str, Any]] | dict[str, str]:
    """
    Henter alle chauffører fra Roadcue.

    Brug dette tool til at finde en chaufførs driverId,
    før chaufførens venner hentes.

    Ved fejl returneres et objekt af formen
    ``{"error": "drivers_utilgaengelige", "detail": "..."}``.
    Modellen skal så forklare brugeren, at oplysningen ikke
    kunne hentes, og må ikke opfinde chauffør-data.

    Docstringen her er det LLM-modellen læser for at forstå
    hvad tool'et gør – skriv den som en instruktion til modellen.
    """
    return await safe_tool_call(
        roadcue_api_client.get_drivers,
        fejlkode="drivers_utilgaengelige",
    )
