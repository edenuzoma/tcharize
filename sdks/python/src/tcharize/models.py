from dataclasses import dataclass
from enum import Enum


class Language(str, Enum):
    ENGLISH = "en"
    HAUSA = "ha"
    IGBO = "ig"
    YORUBA = "yo"
    NIGERIAN_PIDGIN = "pcm"


@dataclass(frozen=True)
class Translation:
    text: str
    explanation: str | None = None
    provider: str | None = None
    model: str | None = None
