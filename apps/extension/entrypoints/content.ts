import { browser } from "wxt/browser";
import type { BatchTranslateResponse, LanguageCode } from "@tcharize/contracts";

const originalText = new Map<Node, string>();
let translatedNodes = new WeakSet<Node>();

const BLOCKED_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "CODE",
  "PRE",
  "TEXTAREA",
  "INPUT",
  "SELECT",
  "OPTION",
  "SVG",
  "CANVAS",
  "AUDIO",
  "VIDEO",
]);

let isAutoObserving = false;
let currentLanguage: LanguageCode = "yo";
let mutationTimeout: NodeJS.Timeout | null = null;
let observer: MutationObserver | null = null;

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    browser.runtime.onMessage.addListener(async (message: unknown) => {
      if (!isPageCommand(message)) return;

      if (message.type === "RESTORE_PAGE") {
        stopObserver();
        for (const [node, text] of originalText) {
          node.textContent = text;
        }
        originalText.clear();
        translatedNodes = new WeakSet<Node>();
        return { changed: 0 };
      }

      currentLanguage = message.language;
      const changed = await translatePage(message.language);
      startObserver();
      return { changed };
    });
  },
});

function getTextNodes(root: Node): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;

      const tag = parent.tagName.toUpperCase();
      if (BLOCKED_TAGS.has(tag)) return NodeFilter.FILTER_REJECT;
      if (parent.isContentEditable || parent.closest("[data-tcharize-ignore]")) {
        return NodeFilter.FILTER_REJECT;
      }
      if (translatedNodes.has(node)) return NodeFilter.FILTER_REJECT;

      const text = node.textContent?.trim() ?? "";
      if (text.length < 2 || text.length > 1000) return NodeFilter.FILTER_REJECT;

      // Skip pure numbers, symbols, and URLs
      if (/^[\d\s.,\-+%$€£¥()[\]{}|/\\#@!?:;]+$/.test(text)) return NodeFilter.FILTER_REJECT;
      if (/^https?:\/\//i.test(text)) return NodeFilter.FILTER_REJECT;

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode as Text);
  }
  return nodes;
}

async function translatePage(targetLanguage: LanguageCode): Promise<number> {
  const nodes = getTextNodes(document.body);
  if (nodes.length === 0) return 0;

  let totalChanged = 0;
  const CHUNK_SIZE = 25;

  for (let i = 0; i < nodes.length; i += CHUNK_SIZE) {
    const chunkNodes = nodes.slice(i, i + CHUNK_SIZE);
    const textsToTranslate: string[] = [];
    const validNodes: Text[] = [];

    for (const node of chunkNodes) {
      const trimmed = node.textContent?.trim();
      if (trimmed) {
        textsToTranslate.push(trimmed);
        validNodes.push(node);
        if (!originalText.has(node)) {
          originalText.set(node, node.textContent ?? "");
        }
      }
    }

    if (textsToTranslate.length === 0) continue;

    try {
      const response = (await browser.runtime.sendMessage({
        type: "TRANSLATE_BATCH",
        payload: {
          texts: textsToTranslate,
          sourceLanguage: "en",
          targetLanguage,
          explain: false,
        },
      })) as BatchTranslateResponse;

      if (response && response.translations) {
        for (let idx = 0; idx < validNodes.length; idx++) {
          const targetNode = validNodes[idx];
          const translationResult = response.translations[idx];
          if (targetNode && translationResult) {
            const original = targetNode.textContent ?? "";
            const trimmed = textsToTranslate[idx] ?? "";
            targetNode.textContent = original.replace(trimmed, translationResult.translation);
            translatedNodes.add(targetNode);
            totalChanged += 1;
          }
        }
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error("Tcharize could not translate this page.");
    }
  }

  return totalChanged;
}

function startObserver() {
  if (isAutoObserving || typeof MutationObserver === "undefined") return;
  isAutoObserving = true;

  observer = new MutationObserver((mutations) => {
    let hasNewText = false;
    for (const m of mutations) {
      if (m.addedNodes.length > 0) {
        hasNewText = true;
        break;
      }
    }

    if (hasNewText) {
      if (mutationTimeout) clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(() => {
        void translatePage(currentLanguage);
      }, 600);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (mutationTimeout) {
    clearTimeout(mutationTimeout);
    mutationTimeout = null;
  }
  isAutoObserving = false;
}

function isPageCommand(
  value: unknown,
): value is
  | { type: "TRANSLATE_PAGE"; language: LanguageCode }
  | { type: "RESTORE_PAGE" } {
  if (typeof value !== "object" || value === null || !("type" in value)) return false;
  return value.type === "TRANSLATE_PAGE" || value.type === "RESTORE_PAGE";
}
