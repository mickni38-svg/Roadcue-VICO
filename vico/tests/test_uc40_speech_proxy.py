"""UC-40 TTS-proxy: VICO forwarder til Roadcue.Api uden at kalde Azure."""

import importlib
from unittest.mock import AsyncMock, patch

import httpx
from fastapi.testclient import TestClient


def _load_app():
    with patch("langchain_openai.ChatOpenAI") as chat_openai_cls:
        model = AsyncMock()
        model.bind_tools = lambda _tools: model
        chat_openai_cls.return_value = model

        from app import main as main_module
        importlib.reload(main_module)
    return main_module.app


def test_speech_tts_forwards_body_and_returns_audio():
    app = _load_app()
    client = TestClient(app)

    captured: dict = {}

    class FakeAsyncClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        async def post(self, url, content, headers):
            captured["url"] = url
            captured["content"] = content
            captured["headers"] = headers
            request = httpx.Request("POST", url)
            return httpx.Response(
                200,
                content=b"\xff\xfb\x90d",
                headers={"Content-Type": "audio/mpeg"},
                request=request,
            )

    with patch("app.main.httpx.AsyncClient", FakeAsyncClient):
        response = client.post(
            "/api/speech/tts",
            json={"text": "Hej"},
            headers={"Content-Type": "application/json"},
        )

    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/mpeg"
    assert response.content == b"\xff\xfb\x90d"
    assert captured["url"].endswith("/api/speech/tts")
    assert b'"text"' in captured["content"]


def test_speech_tts_returns_502_when_upstream_unreachable():
    app = _load_app()
    client = TestClient(app)

    class BrokenAsyncClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        async def post(self, *args, **kwargs):
            raise httpx.ConnectError("simuleret netværksfejl")

    with patch("app.main.httpx.AsyncClient", BrokenAsyncClient):
        response = client.post("/api/speech/tts", json={"text": "Hej"})

    assert response.status_code == 502
    assert "speech_upstream_unreachable" in response.text
