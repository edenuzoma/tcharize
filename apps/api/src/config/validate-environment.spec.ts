import { validateEnvironment } from "./validate-environment";

const validProduction = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://example",
  REDIS_URL: "redis://example",
  WEB_ORIGIN: "https://example.com",
  JWT_SECRET: "a-secure-secret-that-is-at-least-32-characters",
  BREVO_API_KEY: "xkeysib-example",
  BREVO_SENDER_EMAIL: "hello@example.com",
};

describe("validateEnvironment", () => {
  it("accepts complete production configuration", () => {
    expect(validateEnvironment({ ...validProduction })).toMatchObject(validProduction);
  });

  it("fails production startup when the Brevo API key is missing", () => {
    expect(() => validateEnvironment({ ...validProduction, BREVO_API_KEY: "" }))
      .toThrow("BREVO_API_KEY must be a Brevo API key");
  });

  it("allows local development defaults", () => {
    expect(validateEnvironment({ NODE_ENV: "development" })).toEqual({ NODE_ENV: "development" });
  });
});
