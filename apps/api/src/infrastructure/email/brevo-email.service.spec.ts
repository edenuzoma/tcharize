import { BrevoEmailService } from "./brevo-email.service";
import type { AuthEmail } from "../../modules/auth/auth-emails";

const email: AuthEmail = {
  subject: "Your code",
  html: "<p>123456</p>",
  text: "123456",
  senderName: "Tcharize",
};

describe("BrevoEmailService", () => {
  const originalApiKey = process.env.BREVO_API_KEY;
  const originalSender = process.env.BREVO_SENDER_EMAIL;
  const originalRetry = process.env.BREVO_RETRY_BASE_MS;

  beforeEach(() => {
    process.env.BREVO_API_KEY = "xkeysib-test";
    process.env.BREVO_SENDER_EMAIL = "hello@example.com";
    process.env.BREVO_RETRY_BASE_MS = "0";
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env.BREVO_API_KEY = originalApiKey;
    process.env.BREVO_SENDER_EMAIL = originalSender;
    process.env.BREVO_RETRY_BASE_MS = originalRetry;
  });

  it("sends through the Brevo HTTPS API", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue(new Response(null, { status: 201 }));
    await expect(new BrevoEmailService().send("person@example.com", email)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.brevo.com/v3/smtp/email");
  });

  it("does not retry an authorization failure", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ code: "unauthorized" }), { status: 401 }),
    );
    await expect(new BrevoEmailService().send("person@example.com", email)).resolves.toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries a temporary provider failure", async () => {
    const fetchMock = jest.spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: "rate_limit" }), { status: 429 }))
      .mockResolvedValueOnce(new Response(null, { status: 201 }));
    await expect(new BrevoEmailService().send("person@example.com", email)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
