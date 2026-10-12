"use client";

import { useState } from "react";
import { Plus, Minus, HelpCircle, ShieldCheck, CreditCard, Code2, Globe2 } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  label: string;
  icon: typeof HelpCircle;
  items: FAQItem[];
}

const categories: FAQCategory[] = [
  {
    id: "general",
    label: "Languages & AI",
    icon: Globe2,
    items: [
      {
        question: "Which languages are fully supported?",
        answer:
          "Tcharize supports English, Hausa, Igbo, Yorùbá, and Nigerian Pidgin. N-ATLaS handles its listed languages. A separate NITHUB-AI model handles Pidgin, so we do not claim Pidgin as official N-ATLaS coverage.",
      },
      {
        question: "How is Nigerian Pidgin handled given it differs from standard English?",
        answer:
          "Nigerian Pidgin uses a separately validated conversational adapter with idiomatic glossaries. We preserve popular street parlance, syntax, and tonal markers so the translation sounds authentic and natural rather than robotic.",
      },
      {
        question: "What is 'Explainable AI' in Tcharize?",
        answer:
          "Every translation can return a plain-language explanation answering 'Why these words?'. This explains cultural nuances and dialect choices so product teams and users can understand and trust the localized text.",
      },
      {
        question: "How does the native voice audio work?",
        answer:
          "We use a language-specific research voice for Hausa, Igbo, Yorùbá, and Nigerian Pidgin. We do not switch to a generic foreign browser voice when the service is offline.",
      },
    ],
  },
  {
    id: "billing",
    label: "Billing & Naira",
    icon: CreditCard,
    items: [
      {
        question: "How are subscriptions billed?",
        answer:
          "All plans are billed transparently in Nigerian Naira (NGN) via Paystack. You can pay with local debit cards, bank transfers, or USSD without foreign currency exchange fees or FX limits.",
      },
      {
        question: "What happens when I exceed my monthly word limit?",
        answer:
          "You will receive an in-app notice when you reach 80% and 100% of your limit. Your app will never hard-crash—you can instantly top up word credits from the Billing tab or upgrade your plan with one click.",
      },
      {
        question: "Is there a free trial or free tier?",
        answer:
          "Yes! Our Free plan provides 10,000 words every month forever. No debit card is required to sign up and start experimenting in the Playground.",
      },
    ],
  },
  {
    id: "privacy",
    label: "Security & Privacy",
    icon: ShieldCheck,
    items: [
      {
        question: "Does the browser extension read my passwords or credit cards?",
        answer:
          "Never. The Tcharize extension has built-in DOM guardrails: it automatically ignores password fields, input boxes, textareas, hidden elements, authentication cookies, and script blocks. Only public content text is translated.",
      },
      {
        question: "Is client text stored or used to train models?",
        answer:
          "No. Enterprise and Builder translation payloads are processed in memory and never used to re-train foundational models without explicit customer agreement. We comply with the Nigeria Data Protection Regulation (NDPR).",
      },
      {
        question: "Can I restore a translated web page back to original English?",
        answer:
          "Yes. The browser extension preserves the original DOM tree in browser memory. Clicking 'Show original English' restores every single sentence instantly.",
      },
    ],
  },
  {
    id: "developers",
    label: "Developers & API",
    icon: Code2,
    items: [
      {
        question: "How do I integrate Tcharize into my Next.js / React / mobile app?",
        answer:
          "You can make a single POST request to `/api/v1/localization/translate` or `/api/v1/localization/batch` using your API key. We also support translation memory caching to deliver sub-50ms responses for repeated UI strings.",
      },
      {
        question: "Can I define terms that must never be translated?",
        answer:
          "Yes. Use our Brand Glossary feature to lock company names, brand slogans, currency tags, and technical acronyms. The translation engine respects these do-not-translate rules strictly.",
      },
      {
        question: "Can I deploy N-ATLaS on my own private cloud?",
        answer:
          "Yes! Enterprise customers can point `NATLAS_BASE_URL` to their own private vLLM or TGI container cluster. The Tcharize engine seamlessly routes all jobs to your dedicated infrastructure.",
      },
    ],
  },
];

export function Faq() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "general-0": true,
  });

  const currentCategory =
    (categories.find((c) => c.id === activeCategory) ?? categories[0])!;

  function toggleItem(id: string) {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Category Tabs (Watermelon faq-2 pattern) */}
      <div className="flex flex-wrap items-center justify-center gap-2 pb-8">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all ${
                isActive
                  ? "bg-secondary text-white shadow-sm"
                  : "border border-ink/10 bg-surface text-ink/70 hover:border-secondary/40 hover:text-ink"
              }`}
            >
              <Icon size={14} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Accordion List */}
      <div className="space-y-3.5">
        {currentCategory.items.map((item, index) => {
          const itemId = `${currentCategory.id}-${index}`;
          const isOpen = Boolean(openItems[itemId]);

          return (
            <div
              key={itemId}
              className={`overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                isOpen
                  ? "border-secondary/40 bg-surface shadow-sm"
                  : "border-ink/10 bg-surface/70 hover:border-ink/20"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(itemId)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition focus:outline-none sm:p-6"
              >
                <span className="font-display text-base font-bold text-ink sm:text-lg">
                  {item.question}
                </span>
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition-transform ${
                    isOpen
                      ? "bg-secondary text-white"
                      : "bg-ink/5 text-ink/70"
                  }`}
                >
                  {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-ink/5 px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
                  <p className="text-xs leading-relaxed text-ink/70 sm:text-sm">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
