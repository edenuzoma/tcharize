import { ConfigService } from "@nestjs/config";
import { ServiceUnavailableException } from "@nestjs/common";
import { NatlasAdapter } from "./natlas.adapter";

describe("NatlasAdapter", () => {
  let adapter: NatlasAdapter;
  const originalFetch = global.fetch;

  beforeEach(() => {
    const mockConfig = { get: jest.fn().mockReturnValue(undefined) } as unknown as ConfigService;
    adapter = new NatlasAdapter(mockConfig);
    delete process.env.NATLAS_BASE_URL;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("fails clearly when no inference URL is set", async () => {
    await expect(adapter.translate({
      text: "Welcome home",
      sourceLanguage: "en",
      targetLanguage: "yo",
      explain: true,
    })).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it("does not return fake Igbo text when configuration is missing", async () => {
    await expect(adapter.translate({
      text: "Welcome",
      sourceLanguage: "en",
      targetLanguage: "ig",
      explain: false,
    })).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it("routes English-to-Pidgin through the separate adapter and removes wrapper quotes", async () => {
    const mockConfig = {
      get: jest.fn((key: string) => key === "NATLAS_BASE_URL" ? "https://inference.example" : undefined),
    } as unknown as ConfigService;
    adapter = new NatlasAdapter(mockConfig);
    global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({
      translation: "\"Make una come tomorrow\"",
      provider: "nithub-marian-pcm",
      model: "NITHUB-AI/marian-mt-bbc-en-pcm",
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    await expect(adapter.translate({
      text: "Please come tomorrow",
      sourceLanguage: "en",
      targetLanguage: "pcm",
      explain: true,
    })).resolves.toMatchObject({
      translation: "Make una come tomorrow",
      provider: "nithub-marian-pcm",
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "https://inference.example/v1/translations/pidgin",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("rejects unsupported Pidgin pairs instead of misrouting them", async () => {
    const mockConfig = {
      get: jest.fn((key: string) => key === "NATLAS_BASE_URL" ? "https://inference.example" : undefined),
    } as unknown as ConfigService;
    adapter = new NatlasAdapter(mockConfig);

    await expect(adapter.translate({
      text: "Bịa echi",
      sourceLanguage: "ig",
      targetLanguage: "pcm",
      explain: false,
    })).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
