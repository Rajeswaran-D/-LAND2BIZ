from abc import ABC, abstractmethod

class AIProvider(ABC):
    @abstractmethod
    def generate_narrative(self, structured_data: dict) -> str:
        pass
