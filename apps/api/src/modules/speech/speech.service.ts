import { BadGatewayException, BadRequestException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { speechRequestSchema } from "@tcharize/contracts";

const modelByLanguage = {
  ha: "facebook/mms-tts-hau",
  ig: "Shinzmann/soro-tts-ibo",
  yo: "facebook/mms-tts-yor",
  pcm: "facebook/mms-tts-pcm",
} as const;

@Injectable()
export class SpeechService {
  async synthesize(input: unknown): Promise<{ audio: Buffer; contentType: string; model: string }> {
    const parsed = speechRequestSchema.safeParse(input);
    if (!parsed.success) throw new BadRequestException(parsed.error.issues.map((issue) => issue.message).join(" "));

    const baseUrl = process.env.TTS_BASE_URL || process.env.NATLAS_BASE_URL;
    if (!baseUrl) {
      throw new ServiceUnavailableException(
        "The Nigerian-language speech service is not configured. Add its endpoint, then try again.",
      );
    }

    const model =
      process.env[`TTS_MODEL_${parsed.data.language.toUpperCase()}`] ??
      modelByLanguage[parsed.data.language];
    const apiKey = process.env.TTS_API_KEY || process.env.NATLAS_API_KEY;

    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/audio/speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          model,
          input: parsed.data.text,
          voice: parsed.data.language,
          response_format: "wav",
        }),
        signal: AbortSignal.timeout(180_000),
      });
      if (!response.ok) {
        throw new BadGatewayException(`Speech provider returned ${response.status}.`);
      }
      return {
        audio: Buffer.from(await response.arrayBuffer()),
        contentType: response.headers.get("content-type") ?? "audio/wav",
        model,
      };
    } catch (error) {
      if (error instanceof BadGatewayException || error instanceof BadRequestException) {
        throw error;
      }
      throw new ServiceUnavailableException(
        "The Nigerian-language voice service is still starting. Wait a little, then try again.",
      );
    }
  }
}
