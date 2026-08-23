# Any bruges som type når den præcise struktur ikke kendes på forhånd
# – svarer til object eller dynamic i C#.
from typing import Any

# httpx er en asynkron HTTP-klient – svarer til HttpClient i .NET.
import httpx


# HTTP-klient til Roadcue's backend-API.
# Al kommunikation med Roadcue er samlet her, så tools ikke kalder API'et direkte.
class RoadcueApiClient:
    def __init__(self, base_url: str) -> None:
        # rstrip("/") fjerner eventuel afsluttende skråstreg fra URL'en
        # så vi undgår dobbelt skråstreg når stier sammensættes.
        self._base_url = base_url.rstrip("/")

    async def get_drivers(self) -> list[dict[str, Any]]:
        # "async with" opretter klienten og lukker den automatisk bagefter
        # – svarer til "using" i C#.
        async with httpx.AsyncClient(
            base_url=self._base_url,
            timeout=10.0,  # Sekunder før kaldet opgives
        ) as client:
            response = await client.get("/api/drivers")
            # raise_for_status kaster en exception ved HTTP 4xx/5xx
            # – svarer til response.EnsureSuccessStatusCode() i .NET.
            response.raise_for_status()

            # Deserialiser JSON-svaret til en Python-liste af dicts.
            return response.json()

    async def get_driver_friends(
        self,
        driver_id: str,
    ) -> list[dict[str, Any]]:
        async with httpx.AsyncClient(
            base_url=self._base_url,
            timeout=10.0,
        ) as client:
            # f-string interpolation – svarer til $"-strenge i C#.
            response = await client.get(
                f"/api/drivers/{driver_id}/friends"
            )
            response.raise_for_status()

            return response.json()