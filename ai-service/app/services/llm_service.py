import json
import logging
import urllib.request
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger("ai_service.llm")

def call_gemini_or_fallback(prompt: str, fallback_response: str) -> str:
    """
    Attempts to call Google Gemini API if GEMINI_API_KEY is configured.
    Otherwise gracefully falls back to deterministic local heuristic response.
    """
    if not settings.GEMINI_API_KEY:
        return fallback_response

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            generated_text = res_body["candidates"][0]["content"]["parts"][0]["text"]
            return generated_text.strip()
    except Exception as e:
        logger.warning(f"Gemini API request failed or timed out, falling back to local NLP heuristics: {e}")
        return fallback_response
