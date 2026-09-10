from .base import AIProvider

class GeminiProvider(AIProvider):
    def generate_narrative(self, data: dict) -> str:
        rec = (data or {}).get("recommendation", {})
        return (
            f"Preliminary read (estimates + mapped data, verify on ground): "
            f"{rec.get('business') or 'no scored candidate'} "
            f"scores {rec.get('overall_score')} with confidence {rec.get('confidence')} "
            f"— status {rec.get('status')}. Mapped OSM counts are not total businesses; "
            f"cost figures are typical ranges. Complete M21 ground verification before investing."
        )