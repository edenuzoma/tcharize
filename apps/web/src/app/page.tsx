"use client";

import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  Check,
  Chrome,
  Code2,
  Globe2,
  Headphones,
  Languages,
  LockKeyhole,
  MessageSquareText,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";
import { Button, Card } from "@tcharize/ui";
import { languages } from "@tcharize/contracts";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { Faq } from "@/components/marketing/faq";
import { IntegrationCloud } from "@/components/marketing/integration-cloud";
import { Reveal } from "@/components/motion/reveal";
import { useLanguage } from "@/components/i18n/language-context";

export default function HomePage() {
  const { t } = useLanguage();

  const products = [
    {
      icon: Languages,
      label: t("prodEngineLabel"),
      title: t("prodEngineTitle"),
      text: t("prodEngineText"),
      link: t("prodEngineLink"),
      href: "/playground",
    },
    {
      icon: Chrome,
      label: t("prodExtLabel"),
      title: t("prodExtTitle"),
      text: t("prodExtText"),
      link: t("prodExtLink"),
      href: "#extension",
    },
    {
      icon: Headphones,
      label: t("prodVoiceLabel"),
      title: t("prodVoiceTitle"),
      text: t("prodVoiceText"),
      link: t("prodVoiceLink"),
      href: "/docs#voice",
    },
  ];

  const plans = [
    {
      name: t("planFreeName"),
      price: "₦0",
      text: t("planFreeDesc"),
      features: [
        "1 project",
        "10,000 words each month",
        "4 Nigerian languages",
        "Playground and extension",
      ],
    },
    {
      name: t("planBuilderName"),
      price: "₦15,000",
      text: t("planBuilderDesc"),
      featured: true,
      features: [
        "5 projects",
        "250,000 words each month",
        "API and webhooks",
        "Glossary and translation memory",
      ],
    },
    {
      name: t("planTeamName"),
      price: "₦60,000",
      text: t("planTeamDesc"),
      features: [
        "Unlimited projects",
        "1.5 million words",
        "Review workflow",
        "Priority support",
      ],
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="relative mx-auto flex min-h-[78svh] max-w-7xl flex-col items-center justify-center overflow-hidden px-5 py-20 text-center lg:px-8">
        <div className="absolute left-[5%] top-[18%] h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute right-[5%] top-[14%] h-64 w-64 rounded-full bg-secondary/15 blur-3xl" />
        <Reveal className="relative z-10 flex flex-col items-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-4 py-2 text-sm font-bold text-secondary">
            <Sparkles size={16} /> {t("heroBadge")}
          </div>
          <h1 className="mx-auto max-w-5xl font-display text-4xl leading-[1.02] tracking-tight min-[380px]:text-5xl sm:text-7xl lg:text-[6.2rem]">
            {t("heroH1Lead")}{" "}
            <span className="relative inline-block text-secondary">
              {t("heroH1Accent")}
              <span className="absolute -bottom-2 left-0 -z-10 h-3 w-full -rotate-1 rounded-full bg-primary" />
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-ink/70 sm:text-xl">
            {t("heroDesc")}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Button asChild>
              <Link href="/signup">
                {t("heroCtaSignup")} <ArrowRight size={17} />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/docs">
                {t("heroCtaExplore")} <Code2 size={17} />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid w-full max-w-3xl grid-cols-3 divide-x divide-ink/10 border-y border-ink/10 py-5">
            {[
              ["4", t("statLanguages")],
              ["1", t("statEngine")],
              ["24/7", t("statBrowser")],
            ].map(([value, label]) => (
              <div key={label} className="px-2">
                <strong className="font-display text-2xl text-secondary sm:text-3xl">
                  {value}
                </strong>
                <p className="mt-1 text-xs text-ink/50 sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
        <Reveal className="text-center lg:text-left">
          <p className="font-bold text-secondary">{t("seeItEyebrow")}</p>
          <h2 className="mt-3 font-display text-4xl leading-tight sm:text-6xl">
            {t("seeItTitle")}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-ink/65 lg:mx-0">
            {t("seeItDesc")}
          </p>
          <Button asChild variant="outline" className="mt-7">
            <Link href="/playground">
              {t("seeItTry")} <ArrowRight size={16} />
            </Link>
          </Button>
        </Reveal>
        <Reveal delay={120} className="relative mx-auto w-full max-w-xl">
          <div className="absolute -left-10 -top-12 h-36 w-36 rounded-full bg-primary/70 blur-3xl" />
          <Card className="relative rotate-1 border-2 border-ink p-3 shadow-[12px_12px_0_#801fff]">
            <div className="rounded-[1.45rem] bg-mist p-5 sm:p-7">
              <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                <span className="font-display text-xl">{t("liveCardHeader")}</span>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-[#1d1427]">
                  N-ATLaS
                </span>
              </div>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-surface p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-ink/45">
                    {t("liveCardEnglish")}
                  </p>
                  <p className="mt-3 text-lg">
                    {t("liveCardSampleEn")}
                  </p>
                </div>
                <div className="rounded-2xl bg-secondary p-5 text-white">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">
                      {t("liveCardYoruba")}
                    </p>
                    <AudioLines size={18} />
                  </div>
                  <p className="mt-3 text-lg">
                    {t("liveCardSampleYo")}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-secondary/15 bg-surface p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-[#1d1427]">
                  <WandSparkles size={19} />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary">
                    {t("liveCardWhyWords")}
                  </p>
                  <p className="mt-1 text-sm text-ink/60">
                    {t("liveCardWhyExplanation")}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </Reveal>
      </section>

      <section
        id="languages"
        className="mx-auto max-w-7xl px-5 py-8 text-white lg:px-8"
      >
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#1d1427] p-5 shadow-[0_8px_0_#801fff] sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">We speak your language</p><p className="mt-1 text-sm text-white/55">Four Nigerian languages today. More are next.</p></div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {languages.filter((language) => language.code !== "en").map((language) => (
                <span key={language.code} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-center text-sm font-bold">{language.localName}</span>
              ))}
              <span className="rounded-full bg-primary px-4 py-2 text-center text-sm font-bold text-[#1d1427]">Africa is next →</span>
            </div>
          </div>
        </div>
      </section>
      <Reveal>
        <IntegrationCloud />
      </Reveal>

      <section id="product" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-bold text-secondary">{t("prodHeadingEyebrow")}</p>
            <h2 className="mt-3 font-display text-4xl leading-tight sm:text-6xl">
              {t("prodHeadingTitle")}
            </h2>
            <p className="mt-5 text-lg leading-8 text-ink/65">
              {t("prodHeadingDesc")}
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {products.map(
            ({ icon: Icon, label, title, text, link, href }, index) => (
              <Reveal key={label} delay={index * 90} className="h-full">
                <Card
                  className={`group flex h-full min-h-[25rem] flex-col border-2 p-7 transition hover:-translate-y-2 ${index === 1 ? "border-secondary bg-secondary text-white" : "border-ink/10"}`}
                >
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/80 text-[#1d1427]">
                    <Icon size={27} />
                  </div>
                  <p
                    className={`mt-8 text-sm font-bold ${index === 1 ? "text-primary" : "text-secondary"}`}
                  >
                    {label}
                  </p>
                  <h3 className="mt-3 font-display text-3xl">{title}</h3>
                  <p
                    className={`mt-4 leading-7 ${index === 1 ? "text-white/70" : "text-ink/60"}`}
                  >
                    {text}
                  </p>
                  <Link
                    href={href}
                    className="mt-auto flex items-center gap-2 pt-8 font-bold"
                  >
                    {link}
                    <ArrowRight size={16} />
                  </Link>
                </Card>
              </Reveal>
            ),
          )}
        </div>
      </section>

      <section id="extension" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="dot-grid grid overflow-hidden rounded-[2.5rem] bg-secondary p-8 text-white sm:p-12 lg:grid-cols-[.85fr_1.15fr] lg:p-16">
          <Reveal className="text-left">
            <p className="font-bold text-primary">The web, your way</p>
            <h2 className="mt-3 font-display text-4xl leading-tight sm:text-6xl">
              A little button for the whole internet.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/75">
              Open a page. Pick your language. Tap translate. Tcharize changes
              the useful words and remembers the original.
            </p>
            <div className="mt-7 max-w-md space-y-3 text-left text-sm font-bold">
              {[
                "Skips passwords and form fields",
                "Restores the original in one tap",
                "Explains difficult words out loud",
              ].map((item) => (
                <p key={item} className="flex items-center gap-2">
                  <Check className="text-primary" size={18} />
                  {item}
                </p>
              ))}
            </div>
            <Button asChild className="mt-9">
              <Link href="/docs#extension">
                See how it works <ArrowRight size={17} />
              </Link>
            </Button>
          </Reveal>
          <Reveal delay={120} className="mt-12 self-center lg:mt-0 lg:pl-14">
            <div className="rounded-[2rem] border border-white/20 bg-[#1d1427] p-5 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <i className="h-3 w-3 rounded-full bg-red-400" />
                <i className="h-3 w-3 rounded-full bg-amber-400" />
                <i className="h-3 w-3 rounded-full bg-primary" />
                <span className="ml-3 rounded-full bg-white/10 px-4 py-2 text-xs text-white/50">
                  your-favourite-site.ng
                </span>
              </div>
              <div className="mt-5 rounded-2xl bg-white p-6 text-[#1d1427]">
                <p className="text-xs font-bold uppercase tracking-widest text-secondary">
                  Tcharize extension
                </p>
                <h3 className="mt-2 font-display text-2xl">
                  I want this page in…
                </h3>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {["Hausa", "Igbo", "Yorùbá", "Naijá"].map((item, i) => (
                    <span
                      key={item}
                      className={`rounded-xl border-2 p-3 text-sm font-bold ${i === 2 ? "border-secondary bg-secondary/10" : "border-black/10"}`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-primary p-4 text-center font-bold">
                  Translate this page
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 lg:grid-cols-[.82fr_1.18fr] lg:px-8">
        <Reveal>
          <div className="text-left">
            <p className="font-bold text-secondary">A proper workspace</p>
            <h2 className="mt-3 font-display text-4xl leading-tight sm:text-6xl">
              Every word has a home.
            </h2>
            <p className="mt-5 text-lg leading-8 text-ink/65">
              See what changed, keep special words consistent, ask a native
              speaker to review, and ship when it feels right.
            </p>
          </div>
          <div className="mt-7 grid max-w-xl gap-4">
            {[
              [
                MessageSquareText,
                "Simple explanations",
                "Know why each word was chosen.",
              ],
              [LockKeyhole, "Safe by design", "Private fields stay private."],
              [Zap, "Built to ship", "API, webhooks, Git, and edge delivery."],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof Zap;
              return (
                <div key={String(title)} className="flex gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/70 text-[#1d1427]">
                    <I size={20} />
                  </div>
                  <div>
                    <p className="font-bold">{String(title)}</p>
                    <p className="mt-1 text-sm text-ink/55">{String(text)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
        <Reveal delay={120}>
          <DashboardPreview />
        </Reveal>
      </section>

      <section className="bg-mist py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="text-center">
            <p className="font-bold text-secondary">{t("pricingEyebrow")}</p>
            <h2 className="mt-3 font-display text-4xl sm:text-6xl">
              {t("pricingTitle")}
            </h2>
            <Button asChild variant="outline" className="mt-7">
              <Link href="/pricing">
                See all pricing <ArrowRight size={16} />
              </Link>
            </Button>
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <Reveal key={plan.name} delay={index * 90}>
                <Card
                  className={`relative h-full p-7 ${"featured" in plan && plan.featured ? "border-2 border-secondary shadow-[8px_8px_0_#801fff]" : "border border-ink/10"}`}
                >
                  {"featured" in plan && plan.featured && (
                    <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-xs font-bold text-[#1d1427]">
                      Most loved
                    </span>
                  )}
                  <p className="font-bold text-secondary">{plan.name}</p>
                  <p className="mt-5 font-display text-4xl">
                    {plan.price}
                    <span className="font-body text-sm text-ink/45">
                      {" "}
                      / month
                    </span>
                  </p>
                  <p className="mt-3 text-sm text-ink/55">{plan.text}</p>
                  <ul className="mt-7 space-y-3 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <Check size={17} className="text-secondary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    variant={
                      "featured" in plan && plan.featured
                        ? "secondary"
                        : "outline"
                    }
                    className="mt-8 w-full"
                  >
                    <Link href="/signup">Choose {plan.name}</Link>
                  </Button>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="font-bold text-secondary">Small questions</p>
          <h2 className="mt-3 font-display text-4xl sm:text-6xl">
            Clear answers.
          </h2>
          <p className="mt-5 leading-7 text-ink/60">
            No big grammar. No hidden surprises. If you still need help, talk to
            a real person.
          </p>
          <Button asChild variant="outline" className="mt-7">
            <Link href="/contact">Ask us anything</Link>
          </Button>
        </Reveal>
        <Reveal className="mx-auto mt-12 max-w-4xl">
          <Faq />
        </Reveal>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1d1427] px-7 py-14 text-center text-white sm:px-14">
          <Globe2 className="mx-auto text-primary" size={34} />
          <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl sm:text-6xl">
            Help us build an internet that sounds like home.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-white/65">
            Get product notes, language stories, and early access. One useful
            email at a time.
          </p>
          <form className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="you@example.com"
              className="min-h-12 flex-1 rounded-full border border-white/15 bg-white/10 px-5 outline-none placeholder:text-white/35 focus:border-primary"
            />
            <button className="rounded-full bg-primary px-6 py-3 font-bold text-[#1d1427]">
              Keep me close
            </button>
          </form>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
