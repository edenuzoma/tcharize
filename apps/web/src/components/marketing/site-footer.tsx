"use client";

import Link from "next/link";
import { Linkedin } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

const groups = [
  {
    title: "Product",
    links: [
      ["Playground", "/playground"],
      ["Browser extension", "/#extension"],
      ["Pricing", "/pricing"],
      ["Languages", "/#languages"],
    ],
  },
  {
    title: "Build",
    links: [
      ["Documentation", "/docs"],
      ["API reference", "/docs#api"],
      ["Dashboard", "/dashboard"],
      ["Create account", "/signup"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Blog", "/blog"],
      ["Careers", "/careers"],
      ["Contact", "/contact"],
      ["Privacy", "/privacy"],
    ],
  },
] as const;

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-current"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer id="company" className="px-4 pb-5 sm:px-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-ink/10 bg-mist">
        <div className="m-1 rounded-[1.7rem] bg-surface p-7 sm:p-12">
          <div className="grid gap-12 md:grid-cols-[1.25fr_2fr]">
            <div>
              <BrandLogo />
              <p className="mt-5 max-w-sm leading-7 text-ink/60">
                Nigeria&apos;s localization engineering and translation frontier
                AI. Built so every person can use the internet in words that
                feel like home.
              </p>
              <div className="mt-6 flex gap-3">
                <a
                  href="https://linkedin.com/in/edenuzoma"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Eden Uzoma on LinkedIn"
                  className="grid h-11 w-11 place-items-center rounded-xl border border-ink/10 bg-mist transition hover:-translate-y-1 hover:text-secondary"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href="https://twitter.com/edenuzoma"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Eden Uzoma on X"
                  className="grid h-11 w-11 place-items-center rounded-xl border border-ink/10 bg-mist transition hover:-translate-y-1 hover:text-secondary"
                >
                  <XIcon />
                </a>
              </div>
              <p className="mt-6 text-sm font-bold text-secondary">
                Built in Nigeria. Ready for Africa.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {groups.map((group) => (
                <div key={group.title}>
                  <h3 className="font-display text-lg">{group.title}</h3>
                  <ul className="mt-4 space-y-3 text-sm text-ink/60">
                    {group.links.map(([label, href]) => (
                      <li key={label}>
                        <Link className="hover:text-secondary" href={href}>
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 px-7 py-5 text-center text-xs text-ink/50 sm:flex-row sm:text-left">
          <span>© 2026 Tcharize. All rights reserved.</span>
          <span>N-ATLaS attribution: FMCIDE · Awarri Technologies</span>
        </div>
      </div>
    </footer>
  );
}
