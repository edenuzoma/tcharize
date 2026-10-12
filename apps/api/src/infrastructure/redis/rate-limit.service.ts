import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";
import { RedisService } from "./redis.service";

@Injectable()
export class RateLimitService {
  constructor(private readonly redis: RedisService) {}

  async consume(scope: string, identity: string, limit: number, windowSeconds: number) {
    const safeIdentity = createHash("sha256").update(identity || "unknown").digest("hex");
    const key = `rate:${scope}:${safeIdentity}`;
    const count = await this.redis.connection.incr(key);
    if (count === 1) await this.redis.connection.expire(key, windowSeconds);

    if (count > limit) {
      const retryAfter = Math.max(1, await this.redis.connection.ttl(key));
      throw new HttpException(
        { statusCode: HttpStatus.TOO_MANY_REQUESTS, message: "Too many tries. Wait a little, then try again.", retryAfter },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
