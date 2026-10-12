"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Clock, Sparkles } from "lucide-react";
import { PageShell } from "@/components/marketing/page-shell";

interface BlogPost {
  id: string;
  category: string;
  readingTime: string;
  title: string;
  description: string;
  date: string;
  author: {
    name: string;
    role: string;
  };
  cardCtaLabel: string;
  href: string;
}

const posts: BlogPost[] = [
  {
    id: "foundation-models-africa",
    category: "AI Research",
    readingTime: "5 min read",
    title: "Why African Languages Need Dedicated Foundation Models, Not Just Prompt Wrappers",
    description:
      "Generic global models struggle with tonal marks (diacritics), low-resource subword fragmentation, and cultural idioms. How fine-tuning N-ATLaS 8B transforms Nigerian digital accessibility.",
    date: "October 2026",
    author: {
      name: "Eden Uzoma",
      role: "Founder & Lead Researcher",
    },
    cardCtaLabel: "Read research note",
    href: "/docs#overview",
  },
  {
    id: "explainable-ai-fintech",
    category: "Product & Trust",
    readingTime: "4 min read",
    title: "Building an Explainable AI Layer for Financial and Healthcare Inclusion",
    description:
      "When a banking app translates an alert into Hausa or Igbo, a bad translation can cost real money. Why Tcharize provides 'Why these words?' plain-language rationales alongside every translation.",
    date: "September 2026",
    author: {
      name: "Tcharize Team",
      role: "Engineering & Safety",
    },
    cardCtaLabel: "Explore case study",
    href: "/docs#api",
  },
  {
    id: "native-speech-preservation",
    category: "Voice Studio",
    readingTime: "6 min read",
    title: "Authentic Native Voices: Preserving Cultural Tones in Speech Synthesis",
    description:
      "Synthetic voices often sound like foreign tourists mispronouncing native syllables. How we route Yoruba, Igbo, and Hausa to speech engines that respect authentic native acoustic models.",
    date: "September 2026",
    author: {
      name: "Chukwudi N.",
      role: "Audio Systems Lead",
    },
    cardCtaLabel: "Listen in Studio",
    href: "/playground",
  },
  {
    id: "extension-privacy-architecture",
    category: "Security & Web",
    readingTime: "3 min read",
    title: "The Zero-Leak Browser Extension: Non-Destructive DOM Translation",
    description:
      "How Tcharize translates live web pages safely: automatically excluding passwords, code snippets, payment inputs, and preserving original DOM trees with instantaneous one-click restore.",
    date: "August 2026",
    author: {
      name: "Amina B.",
      role: "Web & Extension Engineer",
    },
    cardCtaLabel: "Review architecture",
    href: "/docs#extension",
  },
];

export default function BlogPage() {
  return (
    <PageShell
      eyebrow="Tcharize Stories"
      title="Words about words. Notes from the frontier."
      intro="Technical insights, language preservation, and engineering updates from building Nigeria's localization AI."
    >
      {/* Featured Header Pill */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1.5 text-xs font-bold text-secondary">
          <Sparkles size={14} /> Engineering Dispatch & Field Notes
        </span>
      </div>

      {/* Blog-3 Card Grid */}
      <div className="mt-10 flex flex-col gap-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group flex flex-col overflow-hidden rounded-[2.5rem] border-2 border-ink/10 bg-surface transition-all duration-300 hover:border-secondary hover:shadow-[8px_8px_0_#9eff1f] md:flex-row"
          >
            {/* Left Content Column */}
            <div className="flex flex-1 flex-col justify-between p-7 sm:p-9">
              <div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-primary/20 px-3 py-1 font-black text-ink">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-ink/50">
                    <Clock size={12} /> {post.readingTime}
                  </span>
                  <span className="text-ink/30">·</span>
                  <span className="text-ink/50">{post.date}</span>
                </div>

                <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink transition-colors group-hover:text-secondary sm:text-3xl">
                  {post.title}
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-ink/70">
                  {post.description}
                </p>
              </div>

              {/* Author & CTA Row */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink/5 pt-5">
                <div>
                  <p className="text-xs font-bold text-ink">{post.author.name}</p>
                  <p className="text-[11px] text-ink/50">{post.author.role}</p>
                </div>

                <Link
                  href={post.href}
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/10 bg-mist px-4 py-2 text-xs font-bold text-ink transition hover:border-secondary hover:bg-secondary hover:text-white"
                >
                  <span>{post.cardCtaLabel}</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* Right Visual Accent Column */}
            <div className="flex items-center justify-center bg-mist p-8 md:w-56 lg:w-64">
              <div className="grid h-24 w-24 place-items-center rounded-3xl border-2 border-ink/10 bg-surface text-secondary shadow-sm transition group-hover:scale-105 group-hover:bg-primary group-hover:text-ink">
                <BookOpen size={36} />
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Footer CTA Link */}
      <div className="mt-14 flex items-center justify-center">
        <Link
          href="/docs"
          className="group inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-6 py-3 text-xs font-bold text-ink transition hover:border-secondary hover:shadow-[4px_4px_0_#801fff]"
        >
          <span>Looking for code examples and API specs? Read the Documentation</span>
          <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </PageShell>
  );
}
