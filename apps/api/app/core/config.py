import os
from pydantic_settings import BaseSettings

from pathlib import Path

_env_file = Path(__file__).resolve().parents[2] / ".env"

class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_TIMEOUT_S: int = 15
    GEMINI_MAX_RETRIES: int = 2
    GEMINI_TEMPERATURE: float = 0.2
    GEMINI_MAX_TOKENS: int = 2048

    def get_api_key(self) -> str:
        key = (
            self.GROQ_API_KEY
            or os.getenv("GROQ_API_KEY", "")
            or self.GEMINI_API_KEY
            or os.getenv("GEMINI_API_KEY", "")
            or os.getenv("GOOGLE_PLACES_API_KEY", "")
            or os.getenv("GOOGLE_MAPS_API_KEY", "")
        )
        return key.strip()

    class Config:
        env_file = str(_env_file) if _env_file.exists() else ".env"
        extra = "ignore"

settings = Settings()
