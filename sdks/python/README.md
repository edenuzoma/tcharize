# Tcharize Python

The official Python SDK for Tcharize.

```bash
pip install tcharize
```

```python
from tcharize import Language, Tcharize

client = Tcharize("tch_live_your_key")
result = client.translate("Welcome", source_language=Language.ENGLISH, target_language=Language.YORUBA, explain=True)
print(result.text)
```

Use BCP 47 tags `en`, `ha`, `ig`, `yo`, and `pcm`. Nigerian Pidgin quality depends on the validated provider configured by your workspace. Never put a secret API key in browser code or a public repository.
