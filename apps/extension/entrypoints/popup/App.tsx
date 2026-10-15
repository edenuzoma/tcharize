import { useEffect, useState } from "react";
import { browser } from "wxt/browser";
import { languages, type LanguageCode } from "@tcharize/contracts";

const apiUrl = import.meta.env.WXT_API_URL
  || (import.meta.env.DEV
    ? "http://localhost:4000/api/v1"
    : "https://tcharizeapi-production.up.railway.app/api/v1");

export function App() {
  const [language, setLanguage] = useState<LanguageCode>("yo");
  const [status, setStatus] = useState("Pick a language, then tap the green button.");
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    void browser.storage.local.get("tcharizeApiKey").then((stored) => {
      if (typeof stored.tcharizeApiKey === "string") setApiKey(stored.tcharizeApiKey);
    });
  }, []);

  async function saveApiKey() {
    const trimmed = apiKey.trim();
    if (!trimmed.startsWith("tch_live_")) {
      setStatus("Paste a valid Tcharize API key.");
      return;
    }
    await browser.storage.local.set({ tcharizeApiKey: trimmed });
    setStatus("Your API key is saved on this device.");
  }

  async function sendToPage(message: unknown) {
    setBusy(true);
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error("Open a web page first.");
      if (!tab.url || !/^(https?|file):/i.test(tab.url)) {
        throw new Error("Open a normal website, then try again.");
      }
      const result = await sendPageMessage(tab.id, message);
      setStatus(
        result.changed
          ? `🎉 ${result.changed} phrases translated!`
          : "The original words are back.",
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "This page cannot be changed.");
    } finally {
      setBusy(false);
    }
  }

  async function sendPageMessage(tabId: number, message: unknown) {
    try {
      return (await browser.tabs.sendMessage(tabId, message)) as { changed: number };
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      if (!/receiving end does not exist|could not establish connection/i.test(detail)) throw error;

      await browser.scripting.executeScript({
        target: { tabId },
        files: ["/content-scripts/content.js"],
      });
      return (await browser.tabs.sendMessage(tabId, message)) as { changed: number };
    }
  }

  async function testVoice() {
    const savedKey = apiKey.trim();
    if (!savedKey.startsWith("tch_live_")) {
      setStatus("Add your Tcharize API key first.");
      return;
    }
    setSpeaking(true);
    const phrases: Record<LanguageCode, string> = {
      yo: "Ẹ káàbọ̀. Inú wa dùn pé ẹ wà níbí.",
      ig: "Nnọọ. Obi dị anyị ụtọ na ị nọ ebe a.",
      ha: "Barka da zuwa. Muna farin cikin kana nan.",
      pcm: "Welcome. We happy say you dey here.",
      en: "Welcome to Tcharize.",
    };
    try {
      const response = await fetch(`${apiUrl}/speech/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${savedKey}` },
        body: JSON.stringify({ text: phrases[language], language }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(body.message || "Voice is not ready yet.");
      }
      const audioUrl = URL.createObjectURL(await response.blob());
      const audio = new Audio(audioUrl);
      audio.addEventListener("ended", () => {
        URL.revokeObjectURL(audioUrl);
        setSpeaking(false);
      }, { once: true });
      audio.addEventListener("error", () => {
        URL.revokeObjectURL(audioUrl);
        setSpeaking(false);
        setStatus("This voice could not play.");
      }, { once: true });
      setStatus(`Playing the ${languages.find((item) => item.code === language)?.name} voice.`);
      await audio.play();
    } catch (error) {
      setSpeaking(false);
      setStatus(error instanceof Error ? error.message : "Voice is not ready yet.");
    }
  }

  return (
    <main>
      <div className="brand">
        <img src="/icon.png" alt="" />
        <div>
          <strong>tcharize</strong>
          <span>Read the web your way</span>
        </div>
      </div>

      <label htmlFor="api-key">Your Tcharize API key</label>
      <div className="secret-field">
        <input
          id="api-key"
          type={showApiKey ? "text" : "password"}
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          autoComplete="off"
          placeholder="tch_live_…"
        />
        <button type="button" className="secret-toggle" onClick={() => setShowApiKey((value) => !value)} aria-label={showApiKey ? "Hide API key" : "Show API key"} aria-pressed={showApiKey}>
          {showApiKey ? "◉" : "◌"}
        </button>
      </div>
      <button className="key-button" type="button" onClick={saveApiKey}>
        Save API key
      </button>

      <label htmlFor="language">Translate this page into</label>
      <select
        id="language"
        value={language}
        onChange={(event) => setLanguage(event.target.value as LanguageCode)}
      >
        {languages
          .filter((item) => item.code !== "en")
          .map((item) => (
            <option key={item.code} value={item.code}>
              {item.name} ({item.localName})
            </option>
          ))}
      </select>

      <button
        className="primary"
        disabled={busy}
        onClick={() => sendToPage({ type: "TRANSLATE_PAGE", language })}
      >
        {busy ? "Translating page..." : "Translate this page"}
      </button>

      <button
        className="secondary"
        disabled={busy}
        onClick={() => sendToPage({ type: "RESTORE_PAGE" })}
      >
        Show original English
      </button>

      <button
        type="button"
        disabled={speaking}
        onClick={testVoice}
        style={{
          marginTop: "12px",
          background: "#ffffff",
          border: "2px solid #801fff",
          color: "#801fff",
        }}
      >
        {speaking ? "Speaking..." : "🔊 Test Nigerian Voice"}
      </button>

      <p className="status" aria-live="polite">
        {status}
      </p>

      <p className="privacy">
        🔒 Safe & Private: Tcharize skips passwords, forms, and code.
      </p>
    </main>
  );
}
