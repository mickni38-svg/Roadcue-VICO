"""Tests for UC-36 - saet aktiv destination via VICO-tool."""

from unittest.mock import AsyncMock, patch

import pytest


@pytest.mark.asyncio
async def test_set_active_destination_returnerer_ok_ved_success():
    fake_response = {
        "status": "set",
        "destination": {
            "tripId": "00000000-0000-0000-0000-000000000001",
            "driverId": "11111111-1111-1111-1111-111111111111",
            "name": "Hamburg",
            "latitude": 53.55,
            "longitude": 9.99,
            "address": "Hamburg, DE",
            "providerPlaceId": "here:1",
            "setAt": "2026-08-25T12:00:00Z",
        },
    }

    with patch(
        "app.tools.set_active_destination.roadcue_api_client.set_active_destination",
        new=AsyncMock(return_value=fake_response),
    ) as mocked:
        from app.tools.set_active_destination import set_active_destination

        result = await set_active_destination.ainvoke(
            {
                "driver_id": "11111111-1111-1111-1111-111111111111",
                "destination_text": "Hamburg",
            }
        )

    assert result["status"] == "set"
    assert result["destination"]["name"] == "Hamburg"
    mocked.assert_awaited_once()


@pytest.mark.asyncio
async def test_set_active_destination_returnerer_ambiguous_kandidater():
    fake_response = {
        "status": "ambiguous",
        "candidates": [
            {"name": "Koebenhavn", "latitude": 55.6, "longitude": 12.5},
            {"name": "Koebenhavns Lufthavn", "latitude": 55.6, "longitude": 12.6},
        ],
    }

    with patch(
        "app.tools.set_active_destination.roadcue_api_client.set_active_destination",
        new=AsyncMock(return_value=fake_response),
    ):
        from app.tools.set_active_destination import set_active_destination

        result = await set_active_destination.ainvoke(
            {
                "driver_id": "11111111-1111-1111-1111-111111111111",
                "destination_text": "Koebenhavn",
            }
        )

    assert result["status"] == "ambiguous"
    assert len(result["candidates"]) == 2


@pytest.mark.asyncio
async def test_set_active_destination_wraps_http_fejl_som_struktureret_error():
    import httpx

    request = httpx.Request("PUT", "http://localhost/api/drivers/x/destination")
    response = httpx.Response(500, request=request)

    async def raise_error(*args, **kwargs):
        raise httpx.HTTPStatusError(
            "boom", request=request, response=response
        )

    with patch(
        "app.tools.set_active_destination.roadcue_api_client.set_active_destination",
        new=raise_error,
    ):
        from app.tools.set_active_destination import set_active_destination

        result = await set_active_destination.ainvoke(
            {
                "driver_id": "11111111-1111-1111-1111-111111111111",
                "destination_text": "Hamburg",
            }
        )

    assert result["error"] == "destination_utilgaengelig"
