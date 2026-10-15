const extensionOrigin = /^(?:chrome|moz|edge)-extension:\/\/[a-z0-9-]+$/i;

export function createCorsOriginValidator(configuredOrigins?: string) {
  const allowedOrigins = new Set(
    (configuredOrigins ?? "http://localhost:3000")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

  return (origin: string | undefined, callback: (error: Error | null, allowed?: boolean) => void) => {
    if (!origin || allowedOrigins.has(origin) || extensionOrigin.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("This origin is not allowed."), false);
  };
}
