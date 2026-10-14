import { BadGatewayException, Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { TranslateRequest, TranslateResponse } from "@tcharize/contracts";

const languageNames: Record<string, string> = {
  en: "English",
  ha: "Hausa",
  ig: "Igbo",
  yo: "Yoruba",
  pcm: "Nigerian Pidgin",
};

const protectedTerms = [
  "Awarri Technologies", "NITHUB-AI", "N-ATLaS", "TypeScript", "PostgreSQL",
  "Cloudflare", "LogoForge", "Tcharize", "Next.js", "NestJS", "Node.js",
  "Paystack", "FMCIDE", "React", "Redis", "GitHub", "API", "Git",
  "English", "Hausa", "Igbo", "Yorùbá", "Naijá", "Nigerian Pidgin",
] as const;
const unsafeTranslation = /translate\s+(?:the\s+following|from)|\buser\b\s*:|\bassistant\b\s*:|<\/?(?:system|user|assistant)>/iu;

function escapePattern(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function protectText(value: string) {
  const terms: string[] = [];
  const pattern = new RegExp(`(${protectedTerms.map(escapePattern).join("|")})`, "gu");
  return {
    terms,
    value: value.replace(pattern, (term) => {
      const index = terms.push(term) - 1;
      return `__TCHARIZE_TERM_${index}__`;
    }),
  };
}

function restoreTranslation(original: string, candidate: string, terms: string[]) {
  if (!candidate || unsafeTranslation.test(candidate) || candidate.length > Math.max(600, original.length * 5)) return original;
  let restored = candidate.trim().replace(/^['"“”]+|['"“”]+$/gu, "").trim();
  terms.forEach((term, index) => {
    restored = restored.replace(new RegExp(`__TCHARIZE_TERM_${index}__`, "giu"), term);
  });
  return terms.some((term) => !restored.includes(term)) ? original : restored;
}

@Injectable()
export class NatlasAdapter {
  private readonly logger = new Logger(NatlasAdapter.name);

  constructor(private readonly config: ConfigService) {}

  async translate(request: TranslateRequest): Promise<TranslateResponse> {
    const baseUrl = this.config.get<string>("NATLAS_BASE_URL") || process.env.NATLAS_BASE_URL;
    const apiKey = this.config.get<string>("NATLAS_API_KEY") || this.config.get<string>("HUGGINGFACE_TOKEN") || process.env.NATLAS_API_KEY;
    const model = this.config.get<string>("NATLAS_MODEL_ID") || process.env.NATLAS_MODEL_ID || "NCAIR1/N-ATLaS";
    const isRepositoryPage = baseUrl?.startsWith("https://huggingface.co/NCAIR1") ?? false;

    this.logger.log(`Translating with ${model}`);

    if (!baseUrl || isRepositoryPage) {
      throw new ServiceUnavailableException(
        "Translation is not ready. Set a callable N-ATLaS inference endpoint, then try again.",
      );
    }

    if (request.sourceLanguage === "pcm" || request.targetLanguage === "pcm") {
      if (!([request.sourceLanguage, request.targetLanguage].includes("en"))) {
        throw new ServiceUnavailableException("Pidgin translation currently works between English and Nigerian Pidgin.");
      }
      return this.translatePidgin(baseUrl, apiKey, request);
    }

    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          model,
          temperature: 0.1,
          max_tokens: 1024,
          messages: [
            {
              role: "system",
              content:
                "You are Tcharize, a careful Nigerian localization frontier AI. Translate the given text accurately. Respond in valid JSON format: {\"translation\": \"<translated text>\", \"explanation\": \"<short simple explanation>\"}.",
            },
            {
              role: "user",
              content: `Translate from ${languageNames[request.sourceLanguage]} to ${languageNames[request.targetLanguage]}. Use natural, culturally clear language. ${
                request.explain ? "Explain the important word choices in one short, simple sentence." : "Leave explanation empty."
              }\n\nText:\n${request.text}`,
            },
          ],
        }),
        signal: AbortSignal.timeout(180_000),
      });

      if (!response.ok) throw new Error(`N-ATLAS returned ${response.status}`);
      const result = (await response.json()) as {
        model?: string;
        choices?: Array<{ message?: { content?: string } }>;
      };
      const rawContent = result.choices?.[0]?.message?.content?.trim() ?? "";
      if (!rawContent) throw new Error("N-ATLaS returned an empty response");

      let translationText = "";
      let explanationText: string | undefined = undefined;

      try {
        const cleaned = rawContent.replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
        let parsed: Record<string, string | undefined> | null = null;
        try {
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]) as Record<string, string | undefined>;
          }
        } catch {
          // ignore JSON parse error, fall back to regex
        }

        if (parsed) {
          const targetLangName = languageNames[request.targetLanguage];
          translationText =
            parsed.translation ??
            (targetLangName && parsed[targetLangName]) ??
            parsed[request.targetLanguage] ??
            Object.values(parsed).find((v) => typeof v === "string" && v !== parsed.explanation) ??
            "";
          explanationText = parsed.explanation ?? undefined;
        }

        if (!translationText) {
          const transMatch = cleaned.match(/"translation"\s*:\s*"([\s\S]*?)(?="\s*,\s*"explanation"|"\s*\}|\n\s*"explanation"|$)/i);
          if (transMatch && transMatch[1]) {
            translationText = transMatch[1].replace(/",?$/, "").trim();
          }
        }

        if (!explanationText) {
          const explMatch = cleaned.match(/"explanation"\s*:\s*"([\s\S]*?)(?="\s*\}|$)/i);
          if (explMatch && explMatch[1]) {
            explanationText = explMatch[1].replace(/"$/, "").trim();
          }
        }

        if (!translationText) {
          translationText = rawContent;
        }
      } catch {
        translationText = rawContent;
      }

      if (!translationText) {
        translationText = rawContent;
      }

      return {
        translation: translationText.trim(),
        explanation: explanationText || undefined,
        provider: "n-atlas",
        model: result.model ?? model,
      };
    } catch (error) {
      this.logger.error(`N-ATLaS request failed: ${error instanceof Error ? error.message : "unknown error"}`);
      throw new BadGatewayException(error instanceof Error ? error.message : "N-ATLAS could not translate this text.");
    }
  }

  async translatePage(texts: string[], targetLanguage: string): Promise<string[]> {
    const baseUrl = this.config.get<string>("NATLAS_BASE_URL") || process.env.NATLAS_BASE_URL;
    const apiKey = this.config.get<string>("NATLAS_API_KEY") || this.config.get<string>("HUGGINGFACE_TOKEN") || process.env.NATLAS_API_KEY;
    if (!baseUrl || baseUrl.startsWith("https://huggingface.co/NCAIR1")) {
      throw new ServiceUnavailableException("Website translation is not ready.");
    }
    if (!languageNames[targetLanguage] || targetLanguage === "en") return texts;

    const protectedTexts = texts.map(protectText);
    try {
      if (targetLanguage === "pcm") {
        const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/translations/pidgin`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}) },
          body: JSON.stringify({ texts: protectedTexts.map((item) => item.value), source_language: "en", target_language: "pcm" }),
          signal: AbortSignal.timeout(180_000),
        });
        if (!response.ok) throw new Error(`Pidgin provider returned ${response.status}`);
        const result = await response.json() as { translations?: string[] };
        if (!result.translations || result.translations.length !== texts.length) throw new Error("Pidgin provider returned an incomplete page.");
        return result.translations.map((item, index) => restoreTranslation(texts[index] ?? "", item, protectedTexts[index]?.terms ?? []));
      }

      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/translations/natlas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}) },
        body: JSON.stringify({ texts: protectedTexts.map((item) => item.value), source_language: "en", target_language: targetLanguage }),
        signal: AbortSignal.timeout(180_000),
      });
      if (!response.ok) throw new Error(`N-ATLaS returned ${response.status}`);
      const result = await response.json() as { translations?: unknown };
      const translated = result.translations;
      if (!Array.isArray(translated) || translated.length !== texts.length || !translated.every((item) => typeof item === "string")) {
        throw new Error("N-ATLaS returned an incomplete translation list.");
      }
      return translated.map((item, index) => restoreTranslation(texts[index] ?? "", item, protectedTexts[index]?.terms ?? []));
    } catch (error) {
      this.logger.error(`Page translation failed: ${error instanceof Error ? error.message : "unknown error"}`);
      throw new BadGatewayException("We could not translate this page. Try again.");
    }
  }

  private async translatePidgin(baseUrl: string, apiKey: string | undefined, request: TranslateRequest): Promise<TranslateResponse> {
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/translations/pidgin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          text: request.text,
          source_language: request.sourceLanguage,
          target_language: request.targetLanguage,
        }),
        signal: AbortSignal.timeout(180_000),
      });
      if (!response.ok) throw new Error(`Pidgin provider returned ${response.status}`);
      const result = await response.json() as { translation?: string; provider?: string; model?: string };
      if (!result.translation?.trim()) throw new Error("Pidgin provider returned an empty response");
      const translation = result.translation.trim().replace(/^["'“”]+|["'“”]+$/gu, "").trim();
      return {
        translation,
        explanation: request.explain ? "A separate Nigerian Pidgin model made this translation because N-ATLaS does not list official Pidgin coverage." : undefined,
        provider: result.provider ?? "nithub-marian-pcm",
        model: result.model ?? "NITHUB-AI/marian-mt-bbc-en-pcm",
      };
    } catch (error) {
      this.logger.error(`Pidgin translation request failed: ${error instanceof Error ? error.message : "unknown error"}`);
      throw new BadGatewayException(error instanceof Error ? error.message : "Nigerian Pidgin translation is not available.");
    }
  }
}
