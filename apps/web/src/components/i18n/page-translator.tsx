"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "./language-context";
import { translations } from "./translations";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
const protectedTags = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "SVG",
  "INPUT", "TEXTAREA", "SELECT", "OPTION",
]);
const brandCopy = /^(Tcharize|N-ATLaS|NITHUB-AI|Next\.js|React|NestJS|TypeScript|Node\.js|PostgreSQL|Redis|Cloudflare|GitHub|Paystack|LogoForge|FMCIDE|Awarri Technologies)$/u;
const chunkSize = 150;

function readCache(language: string, pathname: string) {
  try {
    const raw = sessionStorage.getItem(`tcharize-page-v2:${pathname}:${language}`);
    return raw ? new Map<string, string>(JSON.parse(raw) as Array<[string, string]>) : new Map<string, string>();
  } catch {
    return new Map<string, string>();
  }
}

export function PageTranslator() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const originals = useRef(new Map<Text, string>());
  const translatedValues = useRef(new WeakMap<Text, string>());
  const runId = useRef(0);

  useEffect(() => {
    const currentRun = ++runId.current;
    const pending = new Set<Text>();
    const cache = readCache(language, pathname);
    const staticTranslations = new Set(Object.values(translations[language]));
    let timer: ReturnType<typeof setTimeout> | undefined;
    let flushing = false;
    let cancelled = false;

    for (const [node, original] of originals.current) {
      if (node.isConnected) node.nodeValue = original;
    }
    originals.current.clear();
    translatedValues.current = new WeakMap<Text, string>();
    document.documentElement.lang = language;
    document.documentElement.dataset.translationState = language === "en" ? "ready" : "loading";
    if (language === "en") return;

    function isEligible(textNode: Text) {
      const parent = textNode.parentElement;
      const value = textNode.nodeValue?.trim() ?? "";
      if (!parent || !value || value.length > 500 || !/\p{L}/u.test(value)) return false;
      if (protectedTags.has(parent.tagName) || parent.closest("[data-no-translate]")) return false;
      if (brandCopy.test(value) || staticTranslations.has(value)) return false;
      return translatedValues.current.get(textNode) !== value;
    }

    function collect(root: Node) {
      if (root.nodeType === Node.TEXT_NODE && isEligible(root as Text)) pending.add(root as Text);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const textNode = node as Text;
        if (isEligible(textNode)) pending.add(textNode);
        node = walker.nextNode();
      }
      scheduleFlush();
    }

    function scheduleFlush() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void flush(), 40);
    }

    async function fetchTranslations(texts: string[]) {
      const response = await fetch(`${apiUrl}/localization/page`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts, targetLanguage: language }),
      });
      const body = await response.json().catch(() => ({})) as { translations?: string[]; message?: string };
      if (!response.ok || !body.translations || body.translations.length !== texts.length) {
        throw new Error(body.message || "This page could not be translated.");
      }
      return body.translations;
    }

    async function flush() {
      if (flushing || cancelled || currentRun !== runId.current) return;
      flushing = true;
      const nodes = [...pending].filter((node) => node.isConnected && isEligible(node));
      pending.clear();
      const byOriginal = new Map<string, Text[]>();
      for (const node of nodes) {
        const originalValue = originals.current.get(node) ?? node.nodeValue ?? "";
        originals.current.set(node, originalValue);
        const original = originalValue.trim();
        const list = byOriginal.get(original) ?? [];
        list.push(node);
        byOriginal.set(original, list);
      }

      const missing = [...byOriginal.keys()].filter((text) => !cache.has(text));
      try {
        for (let index = 0; index < missing.length; index += chunkSize) {
          const texts = missing.slice(index, index + chunkSize);
          const results = await fetchTranslations(texts);
          if (cancelled || currentRun !== runId.current) return;
          texts.forEach((text, itemIndex) => cache.set(text, results[itemIndex] ?? text));
        }

        for (const [original, textNodes] of byOriginal) {
          const replacement = cache.get(original);
          if (!replacement) continue;
          for (const node of textNodes) {
            if (!node.isConnected) continue;
            const fullOriginal = originals.current.get(node) ?? original;
            node.nodeValue = fullOriginal.replace(original, replacement);
            translatedValues.current.set(node, node.nodeValue.trim());
          }
        }
        sessionStorage.setItem(`tcharize-page-v2:${pathname}:${language}`, JSON.stringify([...cache]));
        document.documentElement.dataset.translationState = "ready";
      } catch (error) {
        document.documentElement.dataset.translationState = "error";
        if (process.env.NODE_ENV === "development") console.warn("Page translation failed", error);
      } finally {
        flushing = false;
        if (pending.size) scheduleFlush();
      }
    }

    collect(document.body);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          const textNode = mutation.target as Text;
          if (translatedValues.current.get(textNode) !== textNode.nodeValue?.trim()) collect(textNode);
          continue;
        }
        mutation.addedNodes.forEach(collect);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [language, pathname]);

  return null;
}
