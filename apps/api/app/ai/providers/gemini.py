from .base import AIProvider

class GeminiProvider(AIProvider):
    def generate_narrative(self, data: dict) -> str:
        return "Gemini narrative"