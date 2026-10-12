"use client";

import { useState, useSyncExternalStore } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const choices = [
  { value: "system", label: "System", Icon: Laptop },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
] as const;

const emptySubscribe = () => () => undefined;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const current = choices.find((choice) => choice.value === theme) ?? choices[0];
  const CurrentIcon = current.Icon;

  if (!mounted) return <div className="h-11 w-11 rounded-full border-2 border-ink/10" aria-hidden="true" />;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Color mode: ${current.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink/10 bg-surface text-ink transition hover:border-secondary/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
      >
        <CurrentIcon size={18} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-13 z-50 w-40 rounded-2xl border border-ink/10 bg-surface p-2 shadow-2xl">
          {choices.map(({ value, label, Icon }) => (
            <button
              key={value}
              role="menuitemradio"
              aria-checked={theme === value}
              onClick={() => { setTheme(value); setOpen(false); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold hover:bg-mist"
            >
              <Icon size={16} className={theme === value ? "text-secondary" : "text-ink/50"} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

