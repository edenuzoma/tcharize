"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Mail, MapPin, Send, Building2 } from "lucide-react";
import { PageShell } from "@/components/marketing/page-shell";
import { Button } from "@tcharize/ui";

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    company: "",
    projectType: "web-localization",
    budget: "builder",
    message: "",
    website: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/backend/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(result.message || "We could not send your message. Try again.");
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We could not send your message. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      eyebrow="Contact & Consultation"
      title="Start your localization journey."
      intro="Tell us about your digital product. A Nigerian localization specialist will review your project and get back to you within 4 hours."
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Form Column (Left - 7 cols) */}
        <div className="lg:col-span-7">
          {submitted ? (
            <div className="rounded-[2.5rem] border-2 border-secondary bg-surface p-10 text-center shadow-[10px_10px_0_#9eff1f]">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary text-ink">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="mt-5 font-display text-3xl font-bold text-ink">
                Ẹ seun! Message received.
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink/70">
                We have received your project details. An engineering advisor will reach out to <strong className="text-ink">{form.email}</strong> shortly.
              </p>
              <Button
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="mt-6 text-xs font-bold"
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-[2.5rem] border-2 border-ink/10 bg-surface p-8 shadow-sm sm:p-10"
            >
              <h2 className="font-display text-2xl font-bold text-ink">
                Tell us about your project
              </h2>
              <p className="mt-1 text-xs text-ink/60">
                Fill in the details below to receive architectural advice or dedicated enterprise pricing.
              </p>

              {error ? (
                <p role="alert" className="mt-5 rounded-2xl border border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">
                  {error}
                </p>
              ) : null}

              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(event) => setForm({ ...form, website: event.target.value })}
                />
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="block text-xs font-bold text-ink">
                    Full name *
                  </label>
                  <input
                    id="fullName"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="e.g. Babatunde Adeyemi"
                    className="mt-2 h-12 w-full rounded-2xl border border-ink/15 bg-mist px-4 text-xs font-medium text-ink outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-ink">
                    Work email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="babatunde@yourcompany.ng"
                    className="mt-2 h-12 w-full rounded-2xl border border-ink/15 bg-mist px-4 text-xs font-medium text-ink outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-xs font-bold text-ink">
                    Company / Organization *
                  </label>
                  <input
                    id="company"
                    required
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="e.g. Sterling Tech NG"
                    className="mt-2 h-12 w-full rounded-2xl border border-ink/15 bg-mist px-4 text-xs font-medium text-ink outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </div>

                <div>
                  <label htmlFor="projectType" className="block text-xs font-bold text-ink">
                    Service of interest
                  </label>
                  <select
                    id="projectType"
                    value={form.projectType}
                    onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                    className="mt-2 h-12 w-full rounded-2xl border border-ink/15 bg-mist px-4 text-xs font-medium text-ink outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  >
                    <option value="web-localization">Web & App UI Localization</option>
                    <option value="voice-tts">Native Voice TTS & Audio Synthesis</option>
                    <option value="dedicated-natlas">Dedicated Private N-ATLaS Inference</option>
                    <option value="browser-plugin">Custom Browser Extension Deployment</option>
                    <option value="glossary-consulting">Brand Terminology & Glossary Engineering</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="budget" className="block text-xs font-bold text-ink">
                    Estimated Monthly Volume / Budget
                  </label>
                  <select
                    id="budget"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className="mt-2 h-12 w-full rounded-2xl border border-ink/15 bg-mist px-4 text-xs font-medium text-ink outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  >
                    <option value="starter">Starter (&lt; 50,000 words/mo)</option>
                    <option value="builder">Builder (50,000 – 500,000 words/mo)</option>
                    <option value="enterprise">Enterprise (1,000,000+ words / Custom SLA)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="message" className="block text-xs font-bold text-ink">
                    Project details & target languages *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about the product you're building, target user demographics (Hausa, Igbo, Yoruba, Pidgin), and timeline..."
                    className="mt-2 w-full rounded-2xl border border-ink/15 bg-mist p-4 text-xs font-medium text-ink outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
              </div>

              <div className="mt-8">
                <Button
                  variant="primary"
                  type="submit"
                  className="w-full text-xs font-bold sm:w-auto"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Submit project inquiry"} <Send size={14} />
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar Info Column (Right - 5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Response Time Card */}
          <div className="rounded-[2.5rem] border-2 border-secondary bg-surface p-7 shadow-[8px_8px_0_#801fff]">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-ink">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                  Guaranteed SLA
                </p>
                <h3 className="font-display text-2xl font-bold text-ink">
                  Under 4 Hours
                </h3>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink/70">
              Every inquiry is reviewed directly by our founding engineering and linguistic team in Nigeria.
            </p>
          </div>

          {/* Value Props Card */}
          <div className="rounded-[2.5rem] border-2 border-ink/10 bg-mist p-7">
            <h4 className="font-display text-lg font-bold text-ink">
              Why partner with Tcharize?
            </h4>
            <ul className="mt-4 space-y-3.5">
              {[
                "Certified native Hausa, Igbo, and Yorùbá linguist audits",
                "Self-hosted & on-premise N-ATLaS inference options",
                "Full NDPR data privacy compliance & zero training on client text",
                "Billed transparently in Nigerian Naira via Paystack",
              ].map((point, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-ink/80">
                  <div className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-secondary text-white">
                    <CheckCircle2 size={11} strokeWidth={3} />
                  </div>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="rounded-[2.5rem] border-2 border-ink/10 bg-surface p-7">
            <h4 className="font-display text-base font-bold text-ink">
              Direct Channels
            </h4>
            <div className="mt-4 space-y-3 text-xs text-ink/70">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-secondary" />
                <a href="mailto:support@tcharize.com" className="font-bold text-ink hover:underline">
                  support@tcharize.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Building2 size={16} className="text-secondary" />
                <span>Enterprise: enterprise@tcharize.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-secondary" />
                <span>Lagos & Abuja, Nigeria</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
