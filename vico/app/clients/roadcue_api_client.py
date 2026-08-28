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
            timeout=30.0,  # Sekunder før kaldet opgives (tåler cold start af C#-API'et)
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
            timeout=30.0,  # Sekunder før kaldet opgives (tåler cold start af C#-API'et)
        ) as client:
            # f-string interpolation – svarer til $"-strenge i C#.
            response = await client.get(
                f"/api/drivers/{driver_id}/friends"
            )
            response.raise_for_status()

            return response.json()

    async def set_active_destination(
        self,
        driver_id: str,
        query: str,
        country: str | None = None,
    ) -> dict[str, Any]:
        # Bygger payload til PUT /api/drivers/{driverId}/destination.
        # None-felter udelades så backend kan bruge standardværdier.
        payload: dict[str, Any] = {"query": query}
        if country:
            payload["country"] = country

        async with httpx.AsyncClient(
            base_url=self._base_url,
            timeout=30.0,
        ) as client:
            response = await client.put(
                f"/api/drivers/{driver_id}/destination",
                json=payload,
            )

            # 200 = destination sat. 404 = ikke fundet. 409 = tvetydig.
            # 502 = geocoder-fejl. Vi returnerer struktureret status
            # i stedet for at kaste, så LLM'en kan svare på dansk.
            if response.status_code == 200:
                return {"status": "set", "destination": response.json()}
            if response.status_code == 404:
                return {"status": "not_found"}
            if response.status_code == 409:
                body = response.json()
                return {
                    "status": "ambiguous",
                    "candidates": body.get("candidates", []),
                }
            if response.status_code == 502:
                body = response.json() if response.content else {}
                return {
                    "status": "provider_unavailable",
                    "detail": body.get("detail"),
                }

            response.raise_for_status()
            return {"status": "unknown", "http_status": response.status_code}

    async def get_active_destination(
        self,
        driver_id: str,
    ) -> dict[str, Any] | None:
        async with httpx.AsyncClient(
            base_url=self._base_url,
            timeout=30.0,
        ) as client:
            response = await client.get(
                f"/api/drivers/{driver_id}/destination",
            )
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()