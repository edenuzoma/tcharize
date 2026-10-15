import { BadGatewayException } from "@nestjs/common";
import { ContactController } from "./contact.controller";

const body = {
  fullName: "Ada Okafor",
  email: "ada@example.com",
  company: "Ada Labs",
  projectType: "web-localization",
  budget: "builder",
  message: "We need our product translated into Hausa and Igbo.",
};

describe("ContactController", () => {
  const rateLimit = { consume: jest.fn().mockResolvedValue(undefined) };

  beforeEach(() => jest.clearAllMocks());

  it("sends a validated inquiry to the configured inbox", async () => {
    const email = { send: jest.fn().mockResolvedValue(true) };
    const controller = new ContactController(email as never, rateLimit as never);
    await expect(controller.submit(body, { ip: "127.0.0.1", socket: {} } as never)).resolves.toEqual({ sent: true });
    expect(email.send).toHaveBeenCalledWith("rivetalsglobal@gmail.com", expect.objectContaining({
      subject: expect.stringContaining("Web and app localization"),
    }));
  });

  it("does not report success when Brevo fails", async () => {
    const controller = new ContactController({ send: jest.fn().mockResolvedValue(false) } as never, rateLimit as never);
    await expect(controller.submit(body, { ip: "127.0.0.1", socket: {} } as never)).rejects.toBeInstanceOf(BadGatewayException);
  });
});
