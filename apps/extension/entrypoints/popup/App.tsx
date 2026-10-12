import { useState } from "react";
import { browser } from "wxt/browser";
import { languages, type LanguageCode } from "@tcharize/contracts";

export function App() {
  const [language, setLanguage] = useState<LanguageCode>("yo");
  const [status, setStatus] = useState("Pick a language, then tap the green button.");
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  async function sendToPage(message: unknown) {
    setBusy(true);
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error("Open a web page first.");
      const result = (await browser.tabs.sendMessage(tab.id, message)) as { changed: number };
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

  function testVoice() {
    if (!("speechSynthesis" in window)) {
      setStatus("Voice is not supported on this device.");
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
    const utterance = new SpeechSynthesisUtterance(phrases[language]);
    utterance.lang = language === "pcm" ? "en-NG" : `${language}-NG`;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setStatus(`Playing authentic ${languages.find((l) => l.code === language)?.name} voice...`);
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
