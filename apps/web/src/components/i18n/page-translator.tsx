"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "./language-context";
import { translations } from "./translations";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
const protectedTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "SVG"]);
const brandCopy = /^(Tcharize|N-ATLaS|NITHUB-AI|Next\.js|React|NestJS|TypeScript|Node\.js|PostgreSQL|Redis|Cloudflare|GitHub|Paystack|LogoForge|FMCIDE|Awarri Technologies)$/u;

export function PageTranslator() {
  const { language } = useLanguage();
  const originals = useRef(new Map<Text, string>());
  const runId = useRef(0);

  useEffect(() => {
    const currentRun = ++runId.current;
    for (const [node, original] of originals.current) {
      if (node.isConnected) node.nodeValue = original;
    }
    originals.current.clear();
    document.documentElement.lang = language;
    if (language === "en") return;

    const translatedStatic = new Set(Object.values(translations[language]));
    const nodes: Text[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const textNode = node as Text;
      const parent = textNode.parentElement;
      const value = textNode.nodeValue?.trim() ?? "";
      if (parent && value && /\p{L}/u.test(value) && !protectedTags.has(parent.tagName) &&
        !parent.closest("[data-no-translate]") && !translatedStatic.has(value) && !brandCopy.test(value)) {
        originals.current.set(textNode, textNode.nodeValue ?? value);
        nodes.push(textNode);
      }
      node = walker.nextNode();
    }

    const unique = [...new Set(nodes.map((item) => item.nodeValue?.trim() ?? ""))];
    if (!unique.length) return;
    const cacheKey = `tcharize-page:${location.pathname}:${language}:${JSON.stringify(unique)}`;

    async function apply() {
      let translated: string[] | undefined;
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) translated = JSON.parse(cached) as string[];
        if (!translated) {
          const chunks = Array.from({ length: Math.ceil(unique.length / 10) }, (_, index) => unique.slice(index * 10, index * 10 + 10));
          const results = await Promise.all(chunks.map(async (texts) => {
            const response = await fetch(`${apiUrl}/localization/page`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ texts, targetLanguage: language }),
            });
            if (!response.ok) throw new Error("Page translation failed");
            const body = await response.json() as { translations?: string[] };
            if (!body.translations || body.translations.length !== texts.length) throw new Error("Page translation was incomplete");
            return body.translations;
          }));
          translated = results.flat();
          if (translated) sessionStorage.setItem(cacheKey, JSON.stringify(translated));
        }
        if (currentRun !== runId.current || !translated || translated.length !== unique.length) return;
        const lookup = new Map(unique.map((item, index) => [item, translated?.[index] ?? item]));
        for (const textNode of nodes) {
          if (!textNode.isConnected) continue;
          const original = textNode.nodeValue?.trim() ?? "";
          const replacement = lookup.get(original);
          if (replacement) textNode.nodeValue = (textNode.nodeValue ?? "").replace(original, replacement);
        }
      } catch {
        // Existing hand-written translations stay visible if live page translation is unavailable.
      }
    }

    void apply();
  }, [language]);

  return null;
}
