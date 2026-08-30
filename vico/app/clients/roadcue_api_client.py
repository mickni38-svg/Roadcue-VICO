from typing import Any
import httpx

class RoadcueApiClient:
    def __init__(self, base_url: str) -> None:
        self._base_url = base_url.rstrip("/")

    async def get_drivers(self) -> list[dict[str, Any]]:
        async with httpx.AsyncClient(base_url=self._base_url, timeout=30.0) as client:
            response = await client.get("/api/drivers")
            response.raise_for_status()
            return response.json()

    async def get_driver_friends(self, driver_id: str) -> list[dict[str, Any]]:
        async with httpx.AsyncClient(base_url=self._base_url, timeout=30.0) as client:
            response = await client.get(f"/api/drivers/{driver_id}/friends")
            response.raise_for_status()
            return response.json()

    async def set_active_destination(self, driver_id: str, query: str, country: str | None = None) -> dict[str, Any]:
        payload: dict[str, Any] = {"query": query}
        if country:
            payload["country"] = country
        async with httpx.AsyncClient(base_url=self._base_url, timeout=30.0) as client:
            response = await client.put(f"/api/drivers/{driver_id}/destination", json=payload)
            if response.status_code == 200: return {"status": "set", "destination": response.json()}
            if response.status_code == 404: return {"status": "not_found"}
            if response.status_code == 409: return {"status": "ambiguous", "candidates": response.json().get("candidates", [])}
            if response.status_code == 502:
                body = response.json() if response.content else {}
                return {"status": "provider_unavailable", "detail": body.get("detail")}
            response.raise_for_status()
            return {"status": "unknown", "http_status": response.status_code}

    async def get_active_destination(self, driver_id: str) -> dict[str, Any] | None:
        async with httpx.AsyncClient(base_url=self._base_url, timeout=30.0) as client:
            response = await client.get(f"/api/drivers/{driver_id}/destination")
            if response.status_code == 404: return None
            response.raise_for_status()
            return response.json()

    async def get_active_trip(self) -> dict[str, Any] | None:
        """Hent den server-identificerede chaufførs aktive Trip."""
        async with httpx.AsyncClient(base_url=self._base_url, timeout=30.0) as client:
            response = await client.get("/api/trips/current")
            if response.status_code == 404: return None
            response.raise_for_status()
            return response.json()
