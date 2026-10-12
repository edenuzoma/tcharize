import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { RedisService } from "../../infrastructure/redis/redis.service";
import { DatabaseService } from "../../infrastructure/database/database.service";

@Controller("health")
export class HealthController {
  constructor(
    private readonly redis: RedisService,
    private readonly database: DatabaseService,
  ) {}

  @Get()
  async check() {
    const redis = await this.redis.isHealthy();
    return {
      status: redis ? "ok" : "degraded",
      service: "tcharize-api",
      dependencies: { redis: redis ? "up" : "down" },
      time: new Date().toISOString(),
    };
  }

  @Get("ready")
  async ready() {
    const redis = await this.redis.isHealthy();
    let database = false;
    try {
      await this.database.$queryRaw`SELECT 1`;
      database = true;
    } catch {
      database = false;
    }

    if (!redis || !database) {
      throw new ServiceUnavailableException({
        status: "not-ready",
        dependencies: { redis: redis ? "up" : "down", database: database ? "up" : "down" },
      });
    }

    return { status: "ready", dependencies: { redis: "up", database: "up" } };
  }
}

