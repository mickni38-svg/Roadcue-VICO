"""Fælles fejlhåndtering for Roadcue-tools.

Tools må ikke lade httpx-exceptions boble op i ToolNode uden struktur:
LLM'en får ellers kun en rå fejlbesked og kan finde på at opfinde data.
I stedet returnerer vi et lille dict med nøglerne ``error`` og ``detail``,
som systemprompten instruerer modellen i at oversætte til en dansk
brugerbesked uden opdigtning.
"""
from typing import Any, Awaitable, Callable, TypeVar

import httpx

T = TypeVar("T")


async def safe_tool_call(
    call: Callable[[], Awaitable[T]],
    *,
    fejlkode: str,
) -> T | dict[str, str]:
    """Kør et asynkront tool-kald og pak fejl ind i en struktureret dict.

    Args:
        call: parameter-løs async-funktion der udfører selve tool-arbejdet.
        fejlkode: kort dansk kode (fx ``"drivers_utilgaengelige"``) der
            fortæller modellen hvilken slags fejl der skete.

    Returns:
        Det oprindelige resultat ved succes, ellers
        ``{"error": <fejlkode>, "detail": <kort beskrivelse>}``.
    """
    try:
        return await call()
    except httpx.HTTPStatusError as exc:
        return {
            "error": fejlkode,
            "detail": f"HTTP {exc.response.status_code} fra Roadcue-API.",
        }
    except httpx.RequestError as exc:
        return {
            "error": fejlkode,
            "detail": f"Kunne ikke nå Roadcue-API: {type(exc).__name__}.",
        }
    except Exception as exc:  # noqa: BLE001 - sidste værn mod tool-nedbrud
        return {
            "error": fejlkode,
            "detail": f"Uventet fejl: {type(exc).__name__}.",
        }


__all__ = ["safe_tool_call"]
