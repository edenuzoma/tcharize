import { Body, Controller, Header, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { SpeechService } from "./speech.service";
import { RateLimitService } from "../../infrastructure/redis/rate-limit.service";

@Controller("speech")
export class SpeechController {
  constructor(
    private readonly speech: SpeechService,
    private readonly rateLimit: RateLimitService,
  ) {}

  @Post("synthesize")
  @Header("Cache-Control", "private, max-age=300")
  async synthesize(@Body() body: unknown, @Req() request: Request, @Res() response: Response) {
    await this.rateLimit.consume("public-speech", request.ip || request.socket.remoteAddress || "unknown", 12, 60);
    const result = await this.speech.synthesize(body);
    response.setHeader("Content-Type", result.contentType);
    response.setHeader("X-Tcharize-Voice-Model", result.model);
    response.send(result.audio);
  }
}
