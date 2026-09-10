import json
import logging
import os
import time
import urllib.request
import urllib.error
from typing import Dict, Any, Optional
from ...core.config import settings
from .base import AIProvider

logger = logging.getLogger(__name__)

class GeminiRESTClient(AIProvider):
    # After repeated auth failures, skip AI calls entirely for a while —
    # deterministic fallbacks keep the API responses complete.
    AUTH_FAILURE_COOLDOWN_S = 600

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self._custom_key = api_key
        self._custom_model = model
        self._disabled_until: float = 0.0

    @property
    def api_key(self) -> str:
        return (self._custom_key or settings.get_api_key()).strip()

    @property
    def is_groq(self) -> bool:
        return self.api_key.startswith("gsk_")

    @property
    def model(self) -> str:
        if self._custom_model:
            return self._custom_model
        if self.is_groq:
            return "groq/compound-mini"
        return settings.GEMINI_MODEL

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def _is_disabled(self) -> bool:
        return time.time() < self._disabled_until

    def generate_json(self, prompt: str, schema_class: Optional[Any] = None) -> Optional[Dict[str, Any]]:
        """
        Send prompt to AI REST API (Groq or Gemini) expecting JSON output.
        Handles timeout, retries, and schema parsing safely.
        """
        if not self.is_configured():
            logger.info("AI API key not configured; skipping AI call.")
            return None

        if self._is_disabled():
            logger.info("AI provider in failure cooldown; using deterministic fallback.")
            return None

        if self.is_groq:
            return self._call_groq_api(prompt, schema_class)
        else:
            return self._call_gemini_api(prompt, schema_class)

    def _call_groq_api(self, prompt: str, schema_class: Optional[Any] = None) -> Optional[Dict[str, Any]]:
        url = "https://api.groq.com/openai/v1/chat/completions"
        candidate_models = [self.model, "groq/compound-mini", "qwen/qwen3.6-27b", "openai/gpt-oss-20b"]
        unique_models = []
        for m in candidate_models:
            if m not in unique_models:
                unique_models.append(m)

        for current_model in unique_models:
            payload = {
                "model": current_model,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": settings.GEMINI_TEMPERATURE,
                "max_tokens": settings.GEMINI_MAX_TOKENS,
                "response_format": {"type": "json_object"}
            }
            data_bytes = json.dumps(payload).encode("utf-8")
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) LAND2BIZ-AI/1.0"
            }

            try:
                start_t = time.time()
                req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
                with urllib.request.urlopen(req, timeout=settings.GEMINI_TIMEOUT_S) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))

                elapsed = round(time.time() - start_t, 3)
                logger.info(f"Groq API call ({current_model}) succeeded in {elapsed}s.")

                choices = resp_data.get("choices", [])
                if not choices:
                    continue

                raw_text = choices[0].get("message", {}).get("content", "").strip()
                if not raw_text:
                    continue

                if raw_text.startswith("```"):
                    lines = raw_text.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].strip() == "```":
                        lines = lines[:-1]
                    raw_text = "\n".join(lines).strip()

                parsed = json.loads(raw_text)
                if schema_class:
                    try:
                        validated = schema_class.model_validate(parsed)
                        return validated.model_dump()
                    except Exception as ve:
                        logger.warning(f"Schema validation failed: {ve}. Returning raw parsed JSON.")
                        return parsed
                return parsed

            except urllib.error.HTTPError as e:
                err_body = ""
                try:
                    err_body = e.read().decode("utf-8")
                except Exception:
                    pass
                logger.error(f"Groq HTTP error ({e.code}) for model {current_model}: {err_body[:200]}")
                if e.code in (401, 403):
                    self._disabled_until = time.time() + self.AUTH_FAILURE_COOLDOWN_S
                    return None
            except Exception as ex:
                logger.error(f"Groq call failed for model {current_model}: {ex}")

        return None

    def _call_gemini_api(self, prompt: str, schema_class: Optional[Any] = None) -> Optional[Dict[str, Any]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": settings.GEMINI_TEMPERATURE,
                "maxOutputTokens": settings.GEMINI_MAX_TOKENS,
                "responseMimeType": "application/json"
            }
        }

        data_bytes = json.dumps(payload).encode("utf-8")
        headers = {"Content-Type": "application/json"}

        for attempt in range(1, settings.GEMINI_MAX_RETRIES + 1):
            start_t = time.time()
            try:
                req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
                with urllib.request.urlopen(req, timeout=settings.GEMINI_TIMEOUT_S) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))

                elapsed = round(time.time() - start_t, 3)
                logger.info(f"Gemini API call succeeded in {elapsed}s (attempt {attempt}).")

                candidates = resp_data.get("candidates", [])
                if not candidates:
                    return None

                parts = candidates[0].get("content", {}).get("parts", [])
                if not parts:
                    return None

                raw_text = parts[0].get("text", "").strip()
                if not raw_text:
                    return None

                if raw_text.startswith("```"):
                    raw_text = raw_text.strip("`").replace("json\n", "", 1).strip()

                parsed = json.loads(raw_text)
                if schema_class:
                    try:
                        validated = schema_class.model_validate(parsed)
                        return validated.model_dump()
                    except Exception as ve:
                        logger.warning(f"Schema validation failed: {ve}. Returning raw parsed JSON.")
                        return parsed
                return parsed

            except urllib.error.HTTPError as e:
                err_body = ""
                try:
                    err_body = e.read().decode("utf-8")
                except Exception:
                    pass
                logger.error(f"Gemini HTTP error ({e.code}) on attempt {attempt}: {err_body[:200]}")
                if e.code in (401, 403):
                    self._disabled_until = time.time() + self.AUTH_FAILURE_COOLDOWN_S
                    return None
            except Exception as ex:
                logger.error(f"Gemini call failed on attempt {attempt}: {ex}")

            if attempt < settings.GEMINI_MAX_RETRIES:
                time.sleep(1.0 * attempt)

        return None

    def generate_narrative(self, data: dict) -> str:
        rec = (data or {}).get("recommendation", {})
        res = self.generate_json(
            f"Explain this business recommendation briefly for a rural micro-entrepreneur: {json.dumps(rec)}"
        )
        if res and isinstance(res, dict) and "explanation" in res:
            return str(res["explanation"])
        return (
            f"Preliminary read (estimates + mapped data, verify on ground): "
            f"{rec.get('business') or 'no scored candidate'} "
            f"scores {rec.get('overall_score')} with confidence {rec.get('confidence_score')}. "
            f"Mapped OSM counts are not total businesses; cost figures are typical ranges. "
            f"Complete M21 ground verification before investing."
        )

# Alias provider for backwards compatibility
GeminiProvider = GeminiRESTClient