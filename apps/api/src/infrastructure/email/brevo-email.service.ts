import { Injectable, Logger } from "@nestjs/common";
interface BrevoErrorBody {
  code?: unknown;
}

export interface EmailMessage {
  subject: string;
  html: string;
  text: string;
  senderName: string;
}

@Injectable()
export class BrevoEmailService {
  private readonly logger = new Logger(BrevoEmailService.name);
  private readonly endpoint = "https://api.brevo.com/v3/smtp/email";

  async send(to: string, email: EmailMessage): Promise<boolean> {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    if (!apiKey || !senderEmail) {
      this.logger.error("Brevo API email is not configured.");
      return false;
    }

    const attempts = 3;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const response = await fetch(this.endpoint, {
          method: "POST",
          headers: {
            accept: "application/json",
            "api-key": apiKey,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            sender: { name: email.senderName, email: senderEmail },
            to: [{ email: to }],
            subject: email.subject,
            htmlContent: email.html,
            textContent: email.text,
          }),
          signal: AbortSignal.timeout(8_000),
        });

        if (response.ok) return true;

        const providerCode = await this.readProviderCode(response);
        this.logger.error(
          `Brevo API email failed with status ${response.status}${providerCode ? ` (${providerCode})` : ""}.`,
        );
        if (!this.isRetryable(response.status) || attempt === attempts) return false;
        await this.wait(attempt, response.headers.get("retry-after"));
      } catch (error) {
        this.logger.error(`Brevo API email failed: ${error instanceof Error ? error.message : "unknown error"}`);
        if (attempt === attempts) return false;
        await this.wait(attempt);
      }
    }
    return false;
  }

  private isRetryable(status: number) {
    return status === 408 || status === 429 || status >= 500;
  }

  private async readProviderCode(response: Response) {
    try {
      const body = await response.json() as BrevoErrorBody;
      return typeof body.code === "string" && /^[a-z0-9_-]{1,60}$/i.test(body.code) ? body.code : undefined;
    } catch {
      return undefined;
    }
  }

  private async wait(attempt: number, retryAfter?: string | null) {
    const retrySeconds = retryAfter && /^\d+$/.test(retryAfter) ? Number(retryAfter) : undefined;
    const baseMs = Number(process.env.BREVO_RETRY_BASE_MS ?? 250);
    const delayMs = retrySeconds !== undefined
      ? Math.min(retrySeconds * 1_000, 5_000)
      : Math.min(Math.max(baseMs, 0) * (2 ** (attempt - 1)), 2_000);
    if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}
