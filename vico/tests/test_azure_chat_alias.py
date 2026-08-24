"""Azure-routing tests that never call a live model or backend."""

import importlib
from unittest.mock import AsyncMock, patch


def test_chat_routes_share_the_same_handler():
    with patch("langchain_openai.ChatOpenAI") as chat_openai_cls:
        model = AsyncMock()
        model.bind_tools = lambda _tools: model
        chat_openai_cls.return_value = model

        from app import main as main_module
        importlib.reload(main_module)

    endpoints = {
        route.path: route.endpoint
        for route in main_module.app.routes
        if route.path in {"/agent/chat", "/api/agent/chat"}
    }

    assert endpoints.keys() == {"/agent/chat", "/api/agent/chat"}
    assert endpoints["/agent/chat"] is endpoints["/api/agent/chat"]
