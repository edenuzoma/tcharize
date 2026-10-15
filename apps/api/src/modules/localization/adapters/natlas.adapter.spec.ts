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

  it("keeps product names unchanged in page translations", async () => {
    const mockConfig = {
      get: jest.fn((key: string) => key === "NATLAS_BASE_URL" ? "https://inference.example" : undefined),
    } as unknown as ConfigService;
    adapter = new NatlasAdapter(mockConfig);
    global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({
      translations: ["Jiri __TCHARIZE_TERM_0__ rụọ ọrụ na __TCHARIZE_TERM_1__"],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    await expect(adapter.translatePage(["Build with Tcharize and N-ATLaS"], "ig"))
      .resolves.toEqual(["Jiri Tcharize rụọ ọrụ na N-ATLaS"]);
    const request = (global.fetch as jest.Mock).mock.calls[0]?.[1] as RequestInit;
    expect(String(request.body)).not.toContain("Build with Tcharize and N-ATLaS");
  });

  it("drops leaked model prompts instead of putting them in the page", async () => {
    const mockConfig = {
      get: jest.fn((key: string) => key === "NATLAS_BASE_URL" ? "https://inference.example" : undefined),
    } as unknown as ConfigService;
    adapter = new NatlasAdapter(mockConfig);
    global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({
      translations: ["USER: Translate from English to Igbo: Welcome back"],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    await expect(adapter.translatePage(["Welcome back"], "ig")).resolves.toEqual(["Welcome back"]);
  });

  it("drops leaked role prefixes even when the model omits a colon", async () => {
    const mockConfig = {
      get: jest.fn((key: string) => key === "NATLAS_BASE_URL" ? "https://inference.example" : undefined),
    } as unknown as ConfigService;
    adapter = new NatlasAdapter(mockConfig);
    global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({
      translations: ["user Amsa tambaya game da aikace-aikacen software."],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    await expect(adapter.translatePage(["How it works"], "ha")).resolves.toEqual(["How it works"]);
  });

  it("retries page text that the batch model leaves in English", async () => {
    const mockConfig = {
      get: jest.fn((key: string) => key === "NATLAS_BASE_URL" ? "https://inference.example" : undefined),
    } as unknown as ConfigService;
    adapter = new NatlasAdapter(mockConfig);
    global.fetch = jest.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ translations: ["How it works"] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        choices: [{ message: { content: '{"translation":"Otu o si arụ ọrụ","explanation":""}' } }],
      }), { status: 200, headers: { "Content-Type": "application/json" } }));

    await expect(adapter.translatePage(["How it works"], "ig")).resolves.toEqual(["Otu o si arụ ọrụ"]);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("skips expensive quality retries in fast mode", async () => {
    const mockConfig = {
      get: jest.fn((key: string) => key === "NATLAS_BASE_URL" ? "https://inference.example" : undefined),
    } as unknown as ConfigService;
    adapter = new NatlasAdapter(mockConfig);
    global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({
      translations: ["How it works"],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    await expect(adapter.translatePage(["How it works"], "ig", "fast")).resolves.toEqual(["How it works"]);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("caps page-quality retries so a slow model cannot hold the whole page open", async () => {
    const mockConfig = {
      get: jest.fn((key: string) => key === "NATLAS_BASE_URL" ? "https://inference.example" : undefined),
    } as unknown as ConfigService;
    adapter = new NatlasAdapter(mockConfig);
    const texts = ["One", "Two", "Three", "Four", "Five", "Six", "Seven"];
    global.fetch = jest.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ translations: texts }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }))
      .mockResolvedValue(new Response(JSON.stringify({
        choices: [{ message: { content: '{"translation":"translated","explanation":""}' } }],
      }), { status: 200, headers: { "Content-Type": "application/json" } }));

    await adapter.translatePage(texts, "ig");

    expect(global.fetch).toHaveBeenCalledTimes(6);
  });
});
