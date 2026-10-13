import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from .errors import TcharizeError
from .models import Language, Translation


class Tcharize:
    """Typed client for the Tcharize API."""

    def __init__(self, api_key: str, *, base_url: str = "https://tcharizeapi-production.up.railway.app/api/v1", timeout: float = 60.0):
        if not api_key:
            raise ValueError("api_key is required")
        self.api_key, self.base_url, self.timeout = api_key, base_url.rstrip("/"), timeout

    def translate(self, text: str, *, source_language: Language | str, target_language: Language | str, explain: bool = False, project_id: str | None = None) -> Translation:
        payload = {"text": text, "sourceLanguage": _value(source_language), "targetLanguage": _value(target_language), "explain": explain}
        if project_id:
            payload["projectId"] = project_id
        data = self._post("/localization/translate", payload)
        return Translation(data["translation"], data.get("explanation"), data.get("provider"), data.get("model"))

    def _post(self, path: str, payload: dict) -> dict:
        request = Request(f"{self.base_url}{path}", data=json.dumps(payload).encode(), method="POST", headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json", "User-Agent": "tcharize-python/0.1.0"})
        try:
            with urlopen(request, timeout=self.timeout) as response:
                return json.loads(response.read().decode())
        except HTTPError as error:
            body = error.read().decode(errors="replace")
            try:
                message = json.loads(body).get("message", body)
            except json.JSONDecodeError:
                message = body
            raise TcharizeError(str(message), status_code=error.code) from error
        except URLError as error:
            raise TcharizeError(f"Could not reach Tcharize: {error.reason}") from error


def _value(language: Language | str) -> str:
    return language.value if isinstance(language, Language) else language
