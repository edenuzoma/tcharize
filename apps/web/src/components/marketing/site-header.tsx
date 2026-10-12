"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Languages,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@tcharize/ui";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useLanguage } from "@/components/i18n/language-context";
import type { LanguageCode } from "@tcharize/contracts";

const siteLanguages = [
  { code: "en" as LanguageCode, label: "English" },
  { code: "ha" as LanguageCode, label: "Hausa" },
  { code: "ig" as LanguageCode, label: "Igbo" },
  { code: "yo" as LanguageCode, label: "Yorùbá" },
  { code: "pcm" as LanguageCode, label: "Naijá" },
] as const;

export function SiteHeader() {
  const { language, setLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageMenu = useRef<HTMLDivElement>(null);

  const links = [
    [t("navProduct"), "/#product"],
    [t("navLanguages"), "/#languages"],
    [t("navDevelopers"), "/docs"],
    [t("navPricing"), "/pricing"],
    [t("navCompany"), "/#company"],
  ] as const;

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!languageMenu.current?.contains(event.target as Node))
        setLanguageOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  function chooseLanguage(code: LanguageCode) {
    setLanguage(code);
    setLanguageOpen(false);
  }

  const selected =
    siteLanguages.find((item) => item.code === language) ?? siteLanguages[0];

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between rounded-3xl border border-ink/10 bg-background/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <BrandLogo />
        <nav
          className="hidden items-center gap-6 text-sm font-bold lg:flex"
          aria-label="Main navigation"
        >
          {links.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="transition hover:text-secondary"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div ref={languageMenu} className="relative" data-no-translate>
            <button
              onClick={() => setLanguageOpen((value) => !value)}
              className="flex min-h-11 items-center gap-1 rounded-full border border-ink/10 bg-surface px-3 text-sm font-bold"
              aria-label="Change website language"
              aria-expanded={languageOpen}
            >
              <Languages size={18} />
              <span className="hidden xl:inline">{selected.label}</span>
              <ChevronDown size={14} />
            </button>
            {languageOpen && (
              <div className="absolute right-0 top-13 w-48 rounded-2xl border border-ink/10 bg-surface p-2 shadow-xl">
                {siteLanguages.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => chooseLanguage(item.code)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-mist"
                  >
                    <span>{item.label}</span>
                    {language === item.code && (
                      <Check size={15} className="text-secondary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ThemeToggle />
          <Button asChild variant="outline" className="hidden lg:inline-flex">
            <Link href="/login">{t("navSignIn")}</Link>
          </Button>
          <Button asChild variant="secondary" className="hidden sm:inline-flex">
            <Link href="/signup">
              {t("navCreateAccount")} <ArrowRight size={16} />
            </Link>
          </Button>
          <button
            onClick={() => setMobileOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-full border border-ink/10 lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%+.6rem)] rounded-3xl border border-ink/10 bg-surface p-4 shadow-xl lg:hidden">
            <nav className="grid gap-1">
              {links.map(([label, href]) => (
                <Link
                  key={label}
                  onClick={() => setMobileOpen(false)}
                  href={href}
                  className="rounded-2xl px-4 py-3 font-bold hover:bg-mist"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button asChild variant="outline">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/signup">Join free</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
