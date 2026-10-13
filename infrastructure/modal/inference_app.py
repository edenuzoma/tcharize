"""Modal deployment for N-ATLaS translation and Nigerian-language speech.

Deploy with: modal deploy infrastructure/modal/inference_app.py
Secrets are read from the Modal secret named ``tcharize-inference``.
"""

import io
import json
import os
from typing import Any

import modal

app = modal.App("tcharize-inference")
model_volume = modal.Volume.from_name("tcharize-model-cache", create_if_missing=True)

image = (
    modal.Image.debian_slim(python_version="3.12")
    .pip_install(
        "accelerate==1.11.0",
        "bitsandbytes==0.48.1",
        "fastapi[standard]==0.119.1",
        "huggingface-hub==0.36.0",
        "scipy==1.16.2",
        "sentencepiece==0.2.1",
        "torch==2.8.0",
        "transformers==4.57.1",
    )
)

LANGUAGE_NAMES = {
    "en": "English",
    "ha": "Hausa",
    "ig": "Igbo",
    "yo": "Yoruba",
    "pcm": "Nigerian Pidgin",
}
TTS_MODELS = {
    "ha": "facebook/mms-tts-hau",
    "ig": "Shinzmann/soro-tts-ibo",
    "yo": "facebook/mms-tts-yor",
    "pcm": "facebook/mms-tts-pcm",
}
PIDGIN_MODELS = {
    ("en", "pcm"): "NITHUB-AI/marian-mt-bbc-en-pcm",
    ("pcm", "en"): "NITHUB-AI/marian-mt-bbc-pcm-en",
}


@app.function(
    image=image,
    gpu="A10",
    timeout=1_200,
    scaledown_window=300,
    volumes={"/models": model_volume},
    secrets=[modal.Secret.from_name("tcharize-inference")],
)
@modal.concurrent(max_inputs=4)
@modal.asgi_app()
def api():
    import numpy as np
    import torch
    from fastapi import FastAPI, Header, HTTPException
    from fastapi.responses import Response
    from pydantic import BaseModel, Field
    from scipy.io.wavfile import write as write_wav
    from transformers import AutoModelForCausalLM, AutoModelForSeq2SeqLM, AutoTokenizer, VitsModel

    os.environ["HF_HOME"] = "/models/huggingface"
    model_id = os.getenv("NATLAS_MODEL_ID", "NCAIR1/N-ATLaS")
    token = os.getenv("HF_TOKEN")
    tokenizer = AutoTokenizer.from_pretrained(model_id, token=token, trust_remote_code=True)
    translator = AutoModelForCausalLM.from_pretrained(
        model_id,
        token=token,
        trust_remote_code=True,
        device_map="auto",
        torch_dtype=torch.float16,
        load_in_8bit=True,
    )
    speech_models: dict[str, tuple[Any, Any]] = {}
    pidgin_models: dict[tuple[str, str], tuple[Any, Any]] = {}
    web = FastAPI(title="Tcharize inference", version="1.0.0")

    class Message(BaseModel):
        role: str
        content: str

    class ChatRequest(BaseModel):
        model: str | None = None
        messages: list[Message]
        max_tokens: int = Field(default=512, ge=1, le=2048)
        temperature: float = Field(default=0.1, ge=0, le=2)

    class SpeechRequest(BaseModel):
        input: str = Field(min_length=1, max_length=1_500)
        voice: str
        model: str | None = None
        response_format: str = "wav"

    class PidginRequest(BaseModel):
        text: str | None = Field(default=None, min_length=1, max_length=20_000)
        texts: list[str] | None = Field(default=None, min_length=1, max_length=150)
        source_language: str
        target_language: str

    class NatlasTranslationRequest(BaseModel):
        texts: list[str] = Field(min_length=1, max_length=50)
        source_language: str = "en"
        target_language: str

    def authorize(authorization: str | None):
        expected = os.getenv("NATLAS_API_KEY")
        if expected and authorization != f"Bearer {expected}":
            raise HTTPException(status_code=401, detail="Invalid API key")

    @web.get("/health")
    def health():
        return {"status": "ok", "translationModel": model_id, "speechLanguages": list(TTS_MODELS)}

    @web.post("/v1/chat/completions")
    def chat(body: ChatRequest, authorization: str | None = Header(default=None)):
        authorize(authorization)
        messages = [message.model_dump() for message in body.messages]
        prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        inputs = tokenizer(prompt, return_tensors="pt").to(translator.device)
        with torch.inference_mode():
            output = translator.generate(
                **inputs,
                max_new_tokens=body.max_tokens,
                do_sample=body.temperature > 0,
                temperature=max(body.temperature, 0.01),
                pad_token_id=tokenizer.eos_token_id,
            )
        generated = output[0][inputs.input_ids.shape[1]:]
        content = tokenizer.decode(generated, skip_special_tokens=True).strip()
        return {"model": model_id, "choices": [{"index": 0, "message": {"role": "assistant", "content": content}, "finish_reason": "stop"}]}

    @web.post("/v1/audio/speech")
    def speech(body: SpeechRequest, authorization: str | None = Header(default=None)):
        authorize(authorization)
        language = body.voice.lower()
        speech_model_id = TTS_MODELS.get(language)
        if not speech_model_id:
            raise HTTPException(status_code=400, detail="Speech supports Hausa, Igbo, Yoruba, and Nigerian Pidgin.")
        if language not in speech_models:
            speech_tokenizer = AutoTokenizer.from_pretrained(speech_model_id)
            speech_model = VitsModel.from_pretrained(speech_model_id).to("cuda")
            speech_models[language] = (speech_tokenizer, speech_model)
        speech_tokenizer, speech_model = speech_models[language]
        inputs = speech_tokenizer(body.input, return_tensors="pt").to("cuda")
        with torch.inference_mode():
            waveform = speech_model(**inputs).waveform[0].float().cpu().numpy()
        waveform = np.clip(waveform, -1, 1)
        buffer = io.BytesIO()
        write_wav(buffer, speech_model.config.sampling_rate, (waveform * 32767).astype(np.int16))
        return Response(buffer.getvalue(), media_type="audio/wav", headers={"X-Tcharize-Model": speech_model_id})

    @web.post("/v1/translations/natlas")
    def translate_natlas(body: NatlasTranslationRequest, authorization: str | None = Header(default=None)):
        authorize(authorization)
        source_name = LANGUAGE_NAMES.get(body.source_language.lower())
        target_name = LANGUAGE_NAMES.get(body.target_language.lower())
        if not source_name or not target_name or body.target_language.lower() == "pcm":
            raise HTTPException(status_code=400, detail="Choose a supported N-ATLaS language pair.")
        messages = [
            [
                {
                    "role": "system",
                    "content": "Translate website interface text accurately. Return only the translated text. Keep product names, URLs, code, numbers, and placeholders unchanged.",
                },
                {
                    "role": "user",
                    "content": f"Translate from {source_name} to {target_name}:\n\n{text}",
                },
            ]
            for text in body.texts
        ]
        prompts = [tokenizer.apply_chat_template(item, tokenize=False, add_generation_prompt=True) for item in messages]
        if tokenizer.pad_token_id is None:
            tokenizer.pad_token_id = tokenizer.eos_token_id
        inputs = tokenizer(prompts, return_tensors="pt", padding=True, truncation=True, max_length=1024).to(translator.device)
        with torch.inference_mode():
            output = translator.generate(
                **inputs,
                max_new_tokens=96,
                do_sample=False,
                pad_token_id=tokenizer.pad_token_id,
            )
        prompt_length = inputs.input_ids.shape[1]
        translations = [
            tokenizer.decode(item[prompt_length:], skip_special_tokens=True).strip().strip("\"'“”")
            for item in output
        ]
        return {"translations": translations, "model": model_id, "provider": "n-atlas"}

    @web.post("/v1/translations/pidgin")
    def translate_pidgin(body: PidginRequest, authorization: str | None = Header(default=None)):
        authorize(authorization)
        pair = (body.source_language.lower(), body.target_language.lower())
        pidgin_model_id = PIDGIN_MODELS.get(pair)
        if not pidgin_model_id:
            raise HTTPException(status_code=400, detail="Pidgin translation supports English to Pidgin and Pidgin to English.")
        if pair not in pidgin_models:
            pidgin_tokenizer = AutoTokenizer.from_pretrained(pidgin_model_id, token=token)
            pidgin_model = AutoModelForSeq2SeqLM.from_pretrained(pidgin_model_id, token=token).to("cuda")
            pidgin_model.eval()
            pidgin_models[pair] = (pidgin_tokenizer, pidgin_model)
        pidgin_tokenizer, pidgin_model = pidgin_models[pair]
        source_texts = body.texts or ([body.text] if body.text else [])
        if not source_texts:
            raise HTTPException(status_code=400, detail="Add text to translate.")
        inputs = pidgin_tokenizer(source_texts, return_tensors="pt", padding=True, truncation=True, max_length=512).to("cuda")
        with torch.inference_mode():
            generated = pidgin_model.generate(**inputs, max_new_tokens=512)
        translations = [item.strip() for item in pidgin_tokenizer.batch_decode(generated, skip_special_tokens=True)]
        return {
            "translation": translations[0] if body.texts is None else None,
            "translations": translations if body.texts is not None else None,
            "model": pidgin_model_id,
            "provider": "nithub-marian-pcm",
        }

    return web
