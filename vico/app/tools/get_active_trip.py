from typing import Any
from langchain.tools import tool
from app.clients.roadcue_api_client import RoadcueApiClient
from app.config import settings
from app.tools._errors import safe_tool_call

roadcue_api_client = RoadcueApiClient(base_url=settings.roadcue_api_base_url)

@tool("get_active_trip")
async def get_active_trip() -> dict[str, Any] | None | dict[str, str]:
    """Hent den aktuelle chaufførs aktive Roadcue Trip.

    Brug tool'et når VICO skal kende den vedvarende aktuelle tur, destination
    eller GPS-kontekst. Chaufføren identificeres af Roadcue-backend; gæt eller
    send aldrig driver_id. Chat-historik er ikke datakilden for Trip-status.
    """
    return await safe_tool_call(
        lambda: roadcue_api_client.get_active_trip(),
        fejlkode="trip_utilgaengelig",
    )
