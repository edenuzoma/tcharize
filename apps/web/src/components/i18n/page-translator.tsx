"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "./language-context";
import { translations } from "./translations";
import { getStaticPageCopy } from "./page-copy";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
const protectedTags = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "SVG",
  "INPUT", "TEXTAREA", "SELECT", "OPTION",
]);
const brandNames = [
  "Awarri Technologies", "NITHUB-AI", "N-ATLaS", "TypeScript", "PostgreSQL",
  "Cloudflare", "LogoForge", "Tcharize", "Next.js", "NestJS", "Node.js",
  "Paystack", "FMCIDE", "React", "Redis", "GitHub", "API", "Git",
  "English", "Hausa", "Igbo", "Yorùbá", "Naijá", "Nigerian Pidgin",
] as const;
const brandCopy = new RegExp(`^(?:${brandNames.map(escapePattern).join("|")})$`, "u");
const brandInText = new RegExp(`(${brandNames.map(escapePattern).join("|")})`, "gu");
const unsafeProviderCopy = /translate\s+(?:the\s+following|from)|\buser\b\s*:|\bassistant\b\s*:|<\/?(?:system|user|assistant)>/iu;
const chunkSize = 40;

function escapePattern(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function protectBrands(value: string) {
  const brands: string[] = [];
  return {
    brands,
    value: value.replace(brandInText, (brand) => {
      const index = brands.push(brand) - 1;
      return `__TCHARIZE_BRAND_${index}__`;
    }),
  };
}

function restoreSafeTranslation(original: string, candidate: string, brands: string[]) {
  if (!candidate || unsafeProviderCopy.test(candidate) || candidate.length > Math.max(600, original.length * 5)) return original;
  let restored = candidate.trim();
  brands.forEach((brand, index) => {
    restored = restored.replace(new RegExp(`__TCHARIZE_BRAND_${index}__`, "giu"), brand);
  });
  if (brands.some((brand) => !restored.includes(brand))) return original;
  return restored;
}

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
  const attributeOriginals = useRef(new Map<Element, Map<string, string>>());
  const translatedValues = useRef(new WeakMap<Text, string>());
  const runId = useRef(0);

  useEffect(() => {
    const currentRun = ++runId.current;
    const pending = new Set<Text>();
    const cache = readCache(language, pathname);
    const staticCopy = getStaticPageCopy(language);
    const staticTranslations = new Set(Object.values(translations[language]));
    let timer: ReturnType<typeof setTimeout> | undefined;
    let flushing = false;
    let cancelled = false;

    for (const [node, original] of originals.current) {
      if (node.isConnected) node.nodeValue = original;
    }
    originals.current.clear();
    for (const [element, attributes] of attributeOriginals.current) {
      if (!element.isConnected) continue;
      attributes.forEach((value, name) => element.setAttribute(name, value));
    }
    attributeOriginals.current.clear();
    translatedValues.current = new WeakMap<Text, string>();
    document.documentElement.lang = language;
    document.documentElement.dataset.translationState = language === "en" ? "ready" : "loading";
    if (language === "en") return;

    function applyStaticText(textNode: Text) {
      const fullOriginal = originals.current.get(textNode) ?? textNode.nodeValue ?? "";
      const original = fullOriginal.trim();
      const replacement = staticCopy[original];
      if (!replacement) return false;
      originals.current.set(textNode, fullOriginal);
      textNode.nodeValue = fullOriginal.replace(original, replacement);
      translatedValues.current.set(textNode, textNode.nodeValue.trim());
      return true;
    }

    function applyStaticAttributes(root: Node) {
      const elements = root.nodeType === Node.ELEMENT_NODE
        ? [root as Element, ...(root as Element).querySelectorAll("[placeholder], [title], [aria-label]")]
        : [];
      for (const element of elements) {
        if (element.closest("[data-no-translate]")) continue;
        for (const name of ["placeholder", "title", "aria-label"]) {
          const value = element.getAttribute(name);
          const replacement = value ? staticCopy[value.trim()] : undefined;
          if (!value || !replacement) continue;
          const saved = attributeOriginals.current.get(element) ?? new Map<string, string>();
          if (!saved.has(name)) saved.set(name, value);
          attributeOriginals.current.set(element, saved);
          element.setAttribute(name, replacement);
        }
      }
    }

    function isEligible(textNode: Text) {
      const parent = textNode.parentElement;
      const value = textNode.nodeValue?.trim() ?? "";
      if (!parent || !value || value.length > 500 || !/\p{L}/u.test(value)) return false;
      if (protectedTags.has(parent.tagName) || parent.closest("[data-no-translate]")) return false;
      if (brandCopy.test(value) || staticTranslations.has(value)) return false;
      return translatedValues.current.get(textNode) !== value;
    }

    function collect(root: Node) {
      applyStaticAttributes(root);
      if (root.nodeType === Node.TEXT_NODE && !applyStaticText(root as Text) && isEligible(root as Text)) pending.add(root as Text);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const textNode = node as Text;
        if (!applyStaticText(textNode) && isEligible(textNode)) pending.add(textNode);
        node = walker.nextNode();
      }
      scheduleFlush();
    }

    function scheduleFlush() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void flush(), 40);
    }

    async function fetchTranslations(texts: string[]) {
      const protectedTexts = texts.map(protectBrands);
      const response = await fetch(`${apiUrl}/localization/page`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: protectedTexts.map((item) => item.value), targetLanguage: language }),
      });
      const body = await response.json().catch(() => ({})) as { translations?: string[]; message?: string };
      if (!response.ok || !body.translations || body.translations.length !== texts.length) {
        throw new Error(body.message || "This page could not be translated.");
      }
      return body.translations.map((translation, index) =>
        restoreSafeTranslation(texts[index] ?? "", translation, protectedTexts[index]?.brands ?? []),
      );
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
