"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { PageShell } from "@/components/marketing/page-shell";
import { Button } from "@tcharize/ui";

interface PricingFeature {
  name: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: PricingFeature[];
  buttonText: string;
  isPopular?: boolean;
  badge?: string;
}

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "For individuals, students, and hobbyists exploring Nigerian language AI.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: "₦",
    buttonText: "Start for free",
    features: [
      { name: "10,000 translation words / month" },
      { name: "1 workspace project" },
      { name: "Full interactive Playground" },
      { name: "Chrome & Edge browser extension" },
      { name: "Hausa, Igbo, Yorùbá, and Nigerian Pidgin" },
      { name: "Community support" },
    ],
  },
  {
    id: "builder",
    name: "Builder",
    description: "For developers and growing startups localizing apps and websites for Nigeria.",
    monthlyPrice: 15000,
    yearlyPrice: 150000,
    currency: "₦",
    buttonText: "Get Builder Plan",
    isPopular: true,
    badge: "Most Popular",
    features: [
      { name: "250,000 translation words / month" },
      { name: "5 workspace projects" },
      { name: "Full N-ATLaS 8B inference API access" },
      { name: "Authentic native voice TTS synthesis" },
      { name: "Brand glossary & do-not-translate rules" },
      { name: "Translation Memory caching" },
      { name: "Paystack Naira debit/credit card billing" },
      { name: "Priority developer email support" },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For banks, fintechs, government agencies, and high-volume digital products.",
    monthlyPrice: 60000,
    yearlyPrice: 600000,
    currency: "₦",
    buttonText: "Contact Sales",
    badge: "Scale & Security",
    features: [
      { name: "1,500,000+ words / month included" },
      { name: "Unlimited projects & team members" },
      { name: "Dedicated N-ATLaS high-throughput endpoint" },
      { name: "Human-in-the-loop linguist review workflow" },
      { name: "Custom domain glossaries & terminology" },
      { name: "99.9% uptime SLA & dedicated account manager" },
      { name: "NDPR & enterprise data compliance" },
      { name: "Custom on-premise / private cloud deploy" },
    ],
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <PageShell
      eyebrow="Pricing & Plans"
      title="Transparent Naira pricing. Zero FX surprises."
      intro="Start for free. Scale as your African user base expands. Billed transparently in Nigerian Naira via Paystack."
    >
      {/* Billing interval switch */}
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border-2 border-ink/10 bg-surface p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setIsYearly(false)}
            className={`rounded-full px-5 py-2 text-xs font-bold transition ${
              !isYearly
                ? "bg-secondary text-white shadow-sm"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            Bill Monthly
          </button>
          <button
            type="button"
            onClick={() => setIsYearly(true)}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition ${
              isYearly
                ? "bg-secondary text-white shadow-sm"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            <span>Bill Yearly</span>
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-ink">
              SAVE 17%
            </span>
          </button>
        </div>
        <p className="mt-3 text-xs text-ink/50">
          Annual billing includes 2 months free + higher rate limit tiers.
        </p>
      </div>

      {/* Pricing Cards Grid (Watermelon pricing-5 pattern) */}
      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const formattedPrice = price.toLocaleString();

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-[2.5rem] p-3 transition-all duration-300 ${
                plan.isPopular
                  ? "border-2 border-secondary bg-surface shadow-[10px_10px_0_#801fff]"
                  : "border-2 border-ink/10 bg-surface hover:border-ink/20"
              }`}
            >
              {/* Header */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold text-ink">
                    {plan.name}
                  </h3>
                  {plan.badge && (
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${
                        plan.isPopular
                          ? "bg-primary text-ink"
                          : "bg-ink/5 text-ink/70"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ink/60">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-black text-ink">
                    {plan.currency}
                    {formattedPrice}
                  </span>
                  <span className="text-xs font-bold text-ink/50">
                    / {isYearly ? "year" : "month"}
                  </span>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="flex flex-1 flex-col rounded-[2rem] bg-mist/60 p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-ink/40">
                  What&apos;s included:
                </p>
                <ul className="mt-4 flex-1 space-y-3.5">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs leading-5 text-ink/80">
                      <div
                        className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${
                          plan.isPopular
                            ? "bg-secondary text-white"
                            : "bg-ink/10 text-ink"
                        }`}
                      >
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span>{feature.name}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <div className="mt-8">
                  <Button
                    asChild
                    variant={plan.isPopular ? "primary" : "outline"}
                    className="w-full text-xs font-bold"
                  >
                    <Link href={plan.id === "enterprise" ? "/contact" : "/login"}>
                      {plan.buttonText} <ArrowRight size={14} />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="mt-16 rounded-[2rem] border-2 border-ink/10 bg-mist p-8 sm:p-10">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-ink">
              <Zap size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Instant Activation</p>
              <p className="mt-0.5 text-xs text-ink/60">
                Word credits and API keys available immediately upon checkout.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary text-white">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Paystack Protected</p>
              <p className="mt-0.5 text-xs text-ink/60">
                Processed via CBN-licensed payment gateway with 256-bit SSL.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-ink">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Cancel Anytime</p>
              <p className="mt-0.5 text-xs text-ink/60">
                Pause or downgrade with one click right inside your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
