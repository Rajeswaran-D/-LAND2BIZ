from abc import ABC, abstractmethod

class AIProvider(ABC):
    @abstractmethod
    def generate_narrative(self, structured_data: dict) -> str:
        """Explain a DETERMINISTIC decision object in words. Must not alter numbers."""

    def guard(self, structured_data: dict) -> None:
        import copy
        before = copy.deepcopy(structured_data)
        text = self.generate_narrative(structured_data)
        assert structured_data == before, "AI layer mutated deterministic evidence — forbidden"
        assert any(w in text.lower() for w in ("verify", "estimate", "mapped", "preliminary", "ground")), \
            "AI narrative must carry uncertainty/verification language"
