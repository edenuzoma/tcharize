"use client";

import { useState } from "react";
import { MapPin, Banknote, ArrowRight, Sparkles, Send } from "lucide-react";
import { PageShell } from "@/components/marketing/page-shell";
import { Button } from "@tcharize/ui";

interface CareerCategory {
  label: string;
  value: string;
}

interface CareerJob {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  locationFlag: string;
  type: "Full-time" | "Part-time" | "Contract";
  salaryRange: string;
  href: string;
}

const categories: CareerCategory[] = [
  { label: "All Openings", value: "all" },
  { label: "AI & NLP Research", value: "ai" },
  { label: "Platform Engineering", value: "engineering" },
  { label: "Linguistics & Safety", value: "linguistics" },
];

const jobs: CareerJob[] = [
  {
    id: "hausa-nlp-researcher",
    title: "Senior Hausa / Chadic NLP Research Scientist",
    description: "Advance evaluation benchmarks and fine-tuning pipelines for N-ATLaS 8B on low-resource Hausa dialects and orthography.",
    category: "ai",
    location: "Abuja / Remote (Nigeria)",
    locationFlag: "🇳🇬",
    type: "Full-time",
    salaryRange: "₦18M – ₦26M / year",
    href: "mailto:careers@tcharize.com?subject=Application: Senior Hausa NLP Research Scientist",
  },
  {
    id: "voice-tts-engineer",
    title: "Audio & Speech Synthesis Engineer",
    description: "Design acoustic alignment and authentic native tone synthesis for Yorùbá, Igbo, and Hausa using MMS-TTS and neural vocoders.",
    category: "ai",
    location: "Lagos / Remote (Nigeria)",
    locationFlag: "🇳🇬",
    type: "Full-time",
    salaryRange: "₦16M – ₦24M / year",
    href: "mailto:careers@tcharize.com?subject=Application: Audio & Speech Synthesis Engineer",
  },
  {
    id: "fullstack-platform-engineer",
    title: "Full-Stack Distributed Systems Engineer",
    description: "Scale our NestJS modular monolith, PostgreSQL multi-tenant database, Redis queue workers, and Turborepo monorepo.",
    category: "engineering",
    location: "Lagos / Remote (Nigeria)",
    locationFlag: "🇳🇬",
    type: "Full-time",
    salaryRange: "₦14M – ₦22M / year",
    href: "mailto:careers@tcharize.com?subject=Application: Full-Stack Distributed Systems Engineer",
  },
  {
    id: "extension-systems-engineer",
    title: "Browser Extension & DOM Security Specialist",
    description: "Maintain high-speed non-destructive DOM translation engines for Chrome, Firefox, and Safari with zero-leak data privacy.",
    category: "engineering",
    location: "Remote (Nigeria)",
    locationFlag: "🌍",
    type: "Full-time",
    salaryRange: "₦12M – ₦18M / year",
    href: "mailto:careers@tcharize.com?subject=Application: Browser Extension Engineer",
  },
  {
    id: "yoruba-cultural-linguist",
    title: "Lead Yorùbá Computational Linguist",
    description: "Curate verified glossary sets, diacritic standards, and human-in-the-loop tone evaluation benchmarks for modern fintech and healthcare applications.",
    category: "linguistics",
    location: "Ibadan / Lagos (Nigeria)",
    locationFlag: "🇳🇬",
    type: "Contract",
    salaryRange: "₦8M – ₦14M / year",
    href: "mailto:careers@tcharize.com?subject=Application: Lead Yoruba Computational Linguist",
  },
  {
    id: "igbo-language-specialist",
    title: "Igbo Translation Memory & Safety Auditor",
    description: "Evaluate machine translation accuracy, idioms, and tonal preservation across Central Igbo and regional variants.",
    category: "linguistics",
    location: "Enugu / Remote (Nigeria)",
    locationFlag: "🇳🇬",
    type: "Contract",
    salaryRange: "₦8M – ₦14M / year",
    href: "mailto:careers@tcharize.com?subject=Application: Igbo Language Specialist",
  },
];

export default function CareersPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredJobs =
    activeCategory === "all"
      ? jobs
      : jobs.filter((job) => job.category === activeCategory);

  return (
    <PageShell
      eyebrow="Join Tcharize"
      title="Build Africa's localization frontier AI."
      intro="Help 200+ million people access the digital world in their native tongues. We build with care, dignity, and deep cultural reverence."
    >
      {/* Category Filter Tabs (Watermelon career-2 pattern) */}
      <div className="flex justify-center">
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-ink/10 bg-mist p-1.5 shadow-sm">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  isActive
                    ? "bg-secondary text-white shadow-sm"
                    : "text-ink/60 hover:text-ink"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Job Openings List */}
      <div className="mt-10 flex flex-col gap-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="group flex flex-col justify-between gap-5 rounded-[2rem] border-2 border-ink/10 bg-surface p-6 transition-all duration-200 hover:border-secondary hover:shadow-[6px_6px_0_#9eff1f] sm:flex-row sm:items-center sm:p-7"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl font-bold text-ink group-hover:text-secondary sm:text-2xl">
                    {job.title}
                  </h3>
                  <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[11px] font-black text-ink">
                    {job.type}
                  </span>
                </div>

                <p className="max-w-2xl text-xs leading-relaxed text-ink/70">
                  {job.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-ink/60">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <span className="text-sm">{job.locationFlag}</span>
                    <MapPin size={13} className="text-secondary" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Banknote size={13} className="text-primary-dark" />
                    {job.salaryRange}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <Button asChild variant="outline" className="w-full text-xs font-bold sm:w-auto">
                  <a href={job.href}>
                    Apply now <ArrowRight size={14} />
                  </a>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[2rem] border-2 border-dashed border-ink/15 p-12 text-center">
            <p className="font-display text-lg font-bold text-ink">No current openings in this category</p>
            <p className="mt-1 text-xs text-ink/60">Check back soon or send us a spontaneous application below.</p>
          </div>
        )}
      </div>

      {/* Spontaneous Application Banner */}
      <div className="mt-16 rounded-[2.5rem] border-2 border-secondary bg-surface p-8 shadow-[8px_8px_0_#801fff] sm:p-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary">
              <Sparkles size={14} /> Don&apos;t see an exact match?
            </span>
            <h3 className="mt-1 font-display text-2xl font-bold text-ink">
              Send an open application
            </h3>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-ink/70">
              We are constantly looking for passionate Nigerian linguists, engineers, and machine learning practitioners who care about language dignity.
            </p>
          </div>
          <Button asChild variant="primary" className="text-xs font-bold">
            <a href="mailto:careers@tcharize.com?subject=Spontaneous Application: Tcharize">
              <Send size={14} /> Email the founders
            </a>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
