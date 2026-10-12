import json
from unittest.mock import patch

from tcharize import Language, Tcharize


class Response:
    def __enter__(self): return self
    def __exit__(self, *_args): return None
    def read(self): return json.dumps({"translation": "Ẹ káàbọ̀", "provider": "n-atlas"}).encode()


def test_translate_maps_public_names_to_api_fields():
    client = Tcharize("test-key", base_url="https://example.test")
    with patch("tcharize.client.urlopen", return_value=Response()) as send:
        result = client.translate("Welcome", source_language=Language.ENGLISH, target_language=Language.YORUBA)
    assert json.loads(send.call_args.args[0].data) == {"text": "Welcome", "sourceLanguage": "en", "targetLanguage": "yo", "explain": False}
    assert result.text == "Ẹ káàbọ̀"
