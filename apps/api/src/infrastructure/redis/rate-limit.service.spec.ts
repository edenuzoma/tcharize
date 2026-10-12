import { HttpException, HttpStatus } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { RateLimitService } from "./rate-limit.service";

describe("RateLimitService", () => {
  it("starts a fixed window without storing the raw identity", async () => {
    const connection = {
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      ttl: jest.fn(),
    };
    const service = new RateLimitService({ connection } as unknown as RedisService);

    await service.consume("public-translate", "person@example.com", 30, 60);

    const key = connection.incr.mock.calls[0]?.[0] as string;
    expect(key).toMatch(/^rate:public-translate:[a-f0-9]{64}$/);
    expect(key).not.toContain("person@example.com");
    expect(connection.expire).toHaveBeenCalledWith(key, 60);
  });

  it("returns a clear 429 response after the limit", async () => {
    const connection = {
      incr: jest.fn().mockResolvedValue(31),
      expire: jest.fn(),
      ttl: jest.fn().mockResolvedValue(42),
    };
    const service = new RateLimitService({ connection } as unknown as RedisService);

    try {
      await service.consume("public-translate", "127.0.0.1", 30, 60);
      throw new Error("Expected consume to reject");
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      const response = error as HttpException;
      expect(response.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(response.getResponse()).toMatchObject({ retryAfter: 42 });
    }
    expect(connection.expire).not.toHaveBeenCalled();
  });
});
