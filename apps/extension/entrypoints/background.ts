import { browser } from "wxt/browser";
import type {
  BatchTranslateRequest,
  BatchTranslateResponse,
  TranslateRequest,
  TranslateResponse,
} from "@tcharize/contracts";

const apiUrl = import.meta.env.WXT_API_URL || "http://localhost:4000/api/v1";

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message: unknown) => {
    if (isBatchMessage(message)) {
      return fetch(`${apiUrl}/localization/page`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: message.payload.texts, targetLanguage: message.payload.targetLanguage }),
      }).then(async (response) => {
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
      return fetch(`${apiUrl}/localization/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message.payload),
      }).then(async (response) => {
        const body = (await response.json()) as TranslateResponse & { message?: string };
        if (!response.ok) throw new Error(body.message ?? "Translation failed.");
        return body;
      });
    }
  });
});

function isTranslateMessage(value: unknown): value is { type: "TRANSLATE_TEXT"; payload: TranslateRequest } {
  return typeof value === "object" && value !== null && "type" in value && value.type === "TRANSLATE_TEXT" && "payload" in value;
}

function isBatchMessage(value: unknown): value is { type: "TRANSLATE_BATCH"; payload: BatchTranslateRequest } {
  return typeof value === "object" && value !== null && "type" in value && value.type === "TRANSLATE_BATCH" && "payload" in value;
}
