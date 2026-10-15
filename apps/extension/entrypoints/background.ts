import { browser } from "wxt/browser";
import type {
  BatchTranslateRequest,
  BatchTranslateResponse,
  TranslateRequest,
  TranslateResponse,
} from "@tcharize/contracts";

const apiUrl = import.meta.env.WXT_API_URL
  || (import.meta.env.DEV
    ? "http://localhost:4000/api/v1"
    : "https://tcharizeapi-production.up.railway.app/api/v1");

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message: unknown) => {
    if (isBatchMessage(message)) {
      return getApiKey().then((apiKey) => fetch(`${apiUrl}/localization/page`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          texts: message.payload.texts,
          targetLanguage: message.payload.targetLanguage,
          mode: "fast",
        }),
      })).then(async (response) => {
        const body = (await response.json()) as { translations?: string[]; message?: string };
        if (!response.ok) throw new Error(body.message ?? "Batch translation failed.");
        return {
          translations: (body.translations ?? []).map((translation) => ({ translation, provider: "tcharize-page", model: "routed" })),
          totalChanged: body.translations?.length ?? 0,
          targetLanguage: message.payload.targetLanguage,
        } satisfies BatchTranslateResponse;
      });
    }

    if (isTranslateMessage(message)) {
      return getApiKey().then((apiKey) => fetch(`${apiUrl}/localization/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(message.payload),
      })).then(async (response) => {
        const body = (await response.json()) as TranslateResponse & { message?: string };
        if (!response.ok) throw new Error(body.message ?? "Translation failed.");
        return body;
      });
    }
  });
});

async function getApiKey() {
  const stored = await browser.storage.local.get("tcharizeApiKey");
  const apiKey = typeof stored.tcharizeApiKey === "string" ? stored.tcharizeApiKey.trim() : "";
  if (!apiKey) throw new Error("Add your Tcharize API key in the extension first.");
  return apiKey;
}

function isTranslateMessage(value: unknown): value is { type: "TRANSLATE_TEXT"; payload: TranslateRequest } {
  return typeof value === "object" && value !== null && "type" in value && value.type === "TRANSLATE_TEXT" && "payload" in value;
}

function isBatchMessage(value: unknown): value is { type: "TRANSLATE_BATCH"; payload: BatchTranslateRequest } {
  return typeof value === "object" && value !== null && "type" in value && value.type === "TRANSLATE_BATCH" && "payload" in value;
}
