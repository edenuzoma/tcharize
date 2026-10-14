import { Body, Controller, Header, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import type { Request, Response } from "express";
import { SpeechService } from "./speech.service";
import { RateLimitService } from "../../infrastructure/redis/rate-limit.service";
import { AuthService } from "../auth/auth.service";
import { LocalizationService } from "../localization/localization.service";

@Controller("speech")
export class SpeechController {
  constructor(
    private readonly speech: SpeechService,
    private readonly rateLimit: RateLimitService,
    private readonly auth: AuthService,
    private readonly localization: LocalizationService,
  ) {}

  @Post("synthesize")
  @Header("Cache-Control", "private, max-age=300")
  async synthesize(@Body() body: unknown, @Req() request: Request, @Res() response: Response) {
    const authorization = request.headers.authorization;
    const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : undefined;
    let organizationId: string | undefined;
    if (bearer?.startsWith("tch_live_")) {
      const organization = await this.auth.validateApiKey(bearer);
      if (!organization) throw new UnauthorizedException("That API key is not valid.");
      organizationId = organization.id;
    } else if (!this.isFirstPartyRequest(request)) {
      throw new UnauthorizedException("Use a Tcharize API key for product speech.");
    }
    await this.rateLimit.consume(organizationId ? "workspace-speech" : "public-speech", bearer || request.ip || request.socket.remoteAddress || "unknown", organizationId ? 60 : 12, 60);
    const result = await this.speech.synthesize(body);
    if (organizationId && typeof body === "object" && body !== null && "text" in body && typeof body.text === "string") {
      await this.localization.chargeExternalUsage(organizationId, [body.text]);
    }
    response.setHeader("Content-Type", result.contentType);
    response.setHeader("X-Tcharize-Voice-Model", result.model);
    response.send(result.audio);
  }

  private isFirstPartyRequest(request: Request) {
    const origin = request.headers.origin;
    if (!origin) return false;
    return (process.env.WEB_ORIGIN ?? "http://localhost:3000")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .includes(origin);
  }
}
