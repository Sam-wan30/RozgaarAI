import json
import os
import re
from collections.abc import Awaitable, Callable
from typing import Any

import httpx


def _extract_json(text: str) -> Any | None:
    cleaned = text.strip()
    fenced = re.search(r"```(?:json)?\s*(.*?)```", cleaned, re.DOTALL)
    if fenced:
      cleaned = fenced.group(1).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start = min([idx for idx in [cleaned.find("{"), cleaned.find("[")] if idx != -1], default=-1)
        end = max(cleaned.rfind("}"), cleaned.rfind("]"))
        if start >= 0 and end > start:
            try:
                return json.loads(cleaned[start : end + 1])
            except json.JSONDecodeError:
                return None
    return None


async def _call_gemini(prompt: str) -> str:
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-1.5-flash:generateContent?key={gemini_key}"
    )
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
        response.raise_for_status()
    return response.json()["candidates"][0]["content"]["parts"][0]["text"]


async def _call_openai(prompt: str) -> str:
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            "https://api.openai.com/v1/responses",
            headers={"Authorization": f"Bearer {openai_key}"},
            json={
                "model": os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
                "input": prompt,
                "temperature": 0.25,
            },
        )
        response.raise_for_status()
    return response.json().get("output_text", "")


async def generate_json_or_fallback(
    prompt: str,
    fallback: Callable[[], Any],
    validator: Callable[[Any], bool],
) -> Any:
    """Use Gemini/OpenAI when configured; otherwise return deterministic demo logic."""
    provider_call: Callable[[str], Awaitable[str]] | None = None
    if os.getenv("GEMINI_API_KEY"):
        provider_call = _call_gemini
    elif os.getenv("OPENAI_API_KEY"):
        provider_call = _call_openai

    if provider_call is None:
        result = fallback()
        if isinstance(result, dict):
            return {**result, "aiProvider": "local-fallback"}
        return result

    try:
        parsed = _extract_json(await provider_call(prompt))
        if validator(parsed):
            if isinstance(parsed, dict):
                return {**parsed, "aiProvider": "live-ai"}
            return parsed
    except Exception:
        pass

    result = fallback()
    if isinstance(result, dict):
        return {**result, "aiProvider": "local-fallback"}
    return result
