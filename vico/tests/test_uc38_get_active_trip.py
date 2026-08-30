from unittest.mock import AsyncMock, patch
import pytest

@pytest.mark.asyncio
async def test_get_active_trip_returns_backend_trip():
    fake = {"id": "trip-1", "status": "active", "destination": {"name": "Hamburg"}}
    with patch("app.tools.get_active_trip.roadcue_api_client.get_active_trip", new=AsyncMock(return_value=fake)):
        from app.tools.get_active_trip import get_active_trip
        result = await get_active_trip.ainvoke({})
    assert result["status"] == "active"
    assert result["destination"]["name"] == "Hamburg"

@pytest.mark.asyncio
async def test_get_active_trip_returns_none_when_no_active_trip():
    with patch("app.tools.get_active_trip.roadcue_api_client.get_active_trip", new=AsyncMock(return_value=None)):
        from app.tools.get_active_trip import get_active_trip
        result = await get_active_trip.ainvoke({})
    assert result is None

@pytest.mark.asyncio
async def test_get_active_trip_wraps_http_error():
    import httpx
    request = httpx.Request("GET", "http://localhost/api/trips/current")
    response = httpx.Response(500, request=request)
    async def fail():
        raise httpx.HTTPStatusError("boom", request=request, response=response)
    with patch("app.tools.get_active_trip.roadcue_api_client.get_active_trip", new=fail):
        from app.tools.get_active_trip import get_active_trip
        result = await get_active_trip.ainvoke({})
    assert result["error"] == "trip_utilgaengelig"
