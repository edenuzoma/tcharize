import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(config: ConfigService) {
    this.client = new Redis(config.get<string>("REDIS_URL", "redis://localhost:6379"), {
      lazyConnect: true,
      enableReadyCheck: true,
      maxRetriesPerRequest: 2,
      retryStrategy: (attempt) => Math.min(attempt * 200, 2_000),
    });
    this.client.on("error", (error) => this.logger.error(`Redis error: ${error.message}`));
  }

  async onModuleInit() {
    await this.client.connect();
    await this.client.ping();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async isHealthy() {
    try {
      return (await this.client.ping()) === "PONG";
    } catch {
      return false;
    }
  }

  get connection() {
    return this.client;
  }
}

