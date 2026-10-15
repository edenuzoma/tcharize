"use client";

import { useState } from "react";
import {
  languages,
  type LanguageCode,
  type TranslateResponse,
} from "@tcharize/contracts";
import { Button, Card } from "@tcharize/ui";
import { ArrowRight, LoaderCircle, Volume2 } from "lucide-react";
import { browserApiUrl } from "@/lib/api-url";

export function TranslationPlayground() {
  const [text, setText] = useState("Welcome. We are glad you are here.");
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>("yo");
  const [result, setResult] = useState<TranslateResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechNote, setSpeechNote] = useState("");

  async function translate() {
    setError("");
    setLoading(true);
    try {
      const response = await fetch(
        `${browserApiUrl}/localization/translate`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            sourceLanguage: "en",
            targetLanguage,
            explain: true,
          }),
        },
      );
      const body = (await response.json()) as TranslateResponse & {
        message?: string;
      };
      if (!response.ok)
        throw new Error(body.message ?? "Translation did not work yet.");
      setResult(body);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Translation did not work yet.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function speak() {
    if (!result) return;
    setError("");
    setSpeechNote("");
    setSpeaking(true);

    const langObj = languages.find((item) => item.code === targetLanguage);
    const langName = langObj?.name ?? "Nigerian language";

    try {
      const response = await fetch(
        `${browserApiUrl}/speech/synthesize`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: result.translation,
            language: targetLanguage,
          }),
        },
      );

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.addEventListener("ended", () => setSpeaking(false), { once: true });
        audio.addEventListener(
          "error",
          () => {
            setSpeaking(false);
            setSpeechNote("Could not stream audio playback.");
          },
          { once: true },
        );
        setSpeechNote(`Playing the language-specific ${langName} voice.`);
        await audio.play();
        return;
      }

      // If backend TTS is not available, check for a VERIFIED native device voice
      speakOnDevice(result.translation, targetLanguage, langName);
    } catch {
      speakOnDevice(result.translation, targetLanguage, langName);
    }
  }

  function speakOnDevice(words: string, language: LanguageCode, langName: string) {
    if (!("speechSynthesis" in window)) {
      setSpeechNote("Audio speech synthesis is not supported in this browser.");
      setSpeaking(false);
      return;
    }

    const voices = window.speechSynthesis.getVoices();

    // Strictly check for verified native accents; never fall back silently to American/British voices
    const nativeVoice = voices.find((item) => {
      const l = item.lang.toLowerCase();
      const n = item.name.toLowerCase();
      if (language === "yo") {
        return l.startsWith("yo") || n.includes("yoruba") || n.includes("yorùbá") || n.includes("abeo");
      }
      if (language === "ha") {
        return l.startsWith("ha") || n.includes("hausa") || n.includes("mufeed");
      }
      if (language === "ig") {
        return l.startsWith("ig") || n.includes("igbo") || n.includes("ezinne");
      }
      if (language === "pcm" || language === "en") {
        return (
          l.includes("en-ng") ||
          l.includes("en_ng") ||
          n.includes("nigeria") ||
          n.includes("ezinne") ||
          n.includes("abeo")
        );
      }
      return false;
    });

    if (!nativeVoice) {
      setSpeaking(false);
      setSpeechNote(
        `Speech server is not connected, and this browser has no verified native ${langName} voice installed. Tcharize strictly avoids non-native generic voices to protect authentic pronunciation.`,
      );
      return;
    }

    const utterance = new SpeechSynthesisUtterance(words);
    utterance.voice = nativeVoice;
    utterance.lang = nativeVoice.lang;
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeechNote("This device could not play that voice.");
      setSpeaking(false);
    };
    setSpeechNote(`Using verified ${langName} voice: ${nativeVoice.name}.`);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <Card className="mt-10 grid gap-6 border-2 border-ink p-4 shadow-[10px_10px_0_#9eff1f] sm:p-7 md:grid-cols-2">
      <div>
        <label htmlFor="source" className="text-sm font-bold">
          Your English words
        </label>
        <textarea
          id="source"
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={20_000}
          className="mt-3 min-h-64 w-full resize-y rounded-2xl border-2 border-ink/10 bg-mist p-5 text-lg outline-none focus:border-secondary"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={targetLanguage}
            onChange={(event) =>
              setTargetLanguage(event.target.value as LanguageCode)
            }
            className="rounded-full border-2 border-ink/10 bg-surface px-4 py-3 font-bold outline-none focus:border-secondary"
            aria-label="Target language"
          >
            {languages
              .filter((language) => language.code !== "en")
              .map((language) => (
                <option key={language.code} value={language.code}>
                  {language.localName}
                </option>
              ))}
          </select>
          <Button onClick={translate} disabled={loading || !text.trim()}>
            {loading ? (
              <LoaderCircle className="animate-spin" size={17} />
            ) : (
              <>
                Translate <ArrowRight size={17} />
              </>
            )}
          </Button>
        </div>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700"
          >
            {error}
          </p>
        )}
      </div>
      <div className="rounded-[1.5rem] bg-secondary p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Your translation
        </p>
        {loading ? (
          <div className="mt-6 space-y-3" aria-label="Translating">
            <div className="h-8 w-4/5 animate-pulse rounded-lg bg-white/20" />
            <div className="h-8 w-2/3 animate-pulse rounded-lg bg-white/15" />
            <div className="mt-8 h-24 animate-pulse rounded-2xl bg-white/10" />
          </div>
        ) : (
          <>
            <p className="mt-5 min-h-28 font-display text-3xl leading-snug">
              {result?.translation ?? "Your new words will show here."}
            </p>
            {result?.explanation && (
              <div className="mt-7 rounded-2xl bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  Why these words?
                </p>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  {result.explanation}
                </p>
              </div>
            )}
          </>
        )}
        <button
          onClick={speak}
          disabled={!result || speaking || loading}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-bold disabled:opacity-40"
        >
          <Volume2 size={17} />{" "}
          {speaking
            ? "Speaking…"
            : `Read in ${languages.find((language) => language.code === targetLanguage)?.localName}`}
        </button>
        <p className="mt-3 text-xs text-white/55">
          {speechNote ||
            "Uses a language-specific Nigerian voice. It will not switch to a generic foreign voice."}
        </p>
      </div>
    </Card>
  );
}
