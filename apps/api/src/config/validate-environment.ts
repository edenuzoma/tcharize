const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEnvironment(config: Record<string, unknown>) {
  if (config.NODE_ENV !== "production") return config;

  const errors: string[] = [];
  requireValue(config, "DATABASE_URL", errors);
  requireValue(config, "REDIS_URL", errors);
  requireValue(config, "WEB_ORIGIN", errors);

  const jwtSecret = readValue(config, "JWT_SECRET");
  if (!jwtSecret || jwtSecret.length < 32) errors.push("JWT_SECRET must contain at least 32 characters.");

  const brevoApiKey = readValue(config, "BREVO_API_KEY");
  if (!brevoApiKey?.startsWith("xkeysib-")) errors.push("BREVO_API_KEY must be a Brevo API key.");

  const senderEmail = readValue(config, "BREVO_SENDER_EMAIL");
  if (!senderEmail || !emailPattern.test(senderEmail)) errors.push("BREVO_SENDER_EMAIL must be a valid email address.");

  if (errors.length > 0) throw new Error(`Invalid production configuration: ${errors.join(" ")}`);
  return config;
}

function requireValue(config: Record<string, unknown>, name: string, errors: string[]) {
  if (!readValue(config, name)) errors.push(`${name} is required.`);
}

function readValue(config: Record<string, unknown>, name: string) {
  const value = config[name];
  return typeof value === "string" ? value.trim() : "";
}
