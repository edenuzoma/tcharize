import { UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { LocalizationController } from "./localization.controller";
import { LocalizationService } from "./localization.service";
import { AuthService } from "../auth/auth.service";
import { RateLimitService } from "../../infrastructure/redis/rate-limit.service";

describe("LocalizationController access", () => {
  const localization = {
    translatePage: jest.fn(),
  };
  const auth = {
    validateApiKey: jest.fn(),
    getDefaultOrganizationId: jest.fn(),
  };
  const rateLimit = { consume: jest.fn() };
  let controller: LocalizationController;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.WEB_ORIGIN = "https://tcharize.up.railway.app";
    localization.translatePage.mockResolvedValue(["Kaabo"]);
    controller = new LocalizationController(
      localization as unknown as LocalizationService,
      auth as unknown as AuthService,
      rateLimit as unknown as RateLimitService,
    );
  });

  function request(headers: Record<string, string> = {}) {
    return {
      headers,
      ip: "127.0.0.1",
      socket: { remoteAddress: "127.0.0.1" },
    } as unknown as Request;
  }

  it("allows the Tcharize website to translate its own page", async () => {
    await expect(controller.translatePage(
      { texts: ["Welcome"], targetLanguage: "yo" },
      request({ origin: "https://tcharize.up.railway.app" }),
    )).resolves.toEqual({ translations: ["Kaabo"] });
    expect(localization.translatePage).toHaveBeenCalledWith(["Welcome"], "yo", undefined);
  });

  it("requires an API key for another website", async () => {
    await expect(controller.translatePage(
      { texts: ["Welcome"], targetLanguage: "yo" },
      request({ origin: "https://example.com" }),
    )).rejects.toBeInstanceOf(UnauthorizedException);
    expect(localization.translatePage).not.toHaveBeenCalled();
  });

  it("meters an external website through its organization", async () => {
    auth.validateApiKey.mockResolvedValue({ id: "org-1" });
    await controller.translatePage(
      { texts: ["Welcome"], targetLanguage: "yo" },
      request({ authorization: "Bearer tch_live_test" }),
    );
    expect(localization.translatePage).toHaveBeenCalledWith(["Welcome"], "yo", "org-1");
    expect(rateLimit.consume).toHaveBeenCalledWith("workspace-page-translate", "tch_live_test", 120, 60);
  });
});
