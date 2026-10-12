"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, CheckCircle2, LoaderCircle, UserRound } from "lucide-react";
import { Button } from "@tcharize/ui";
import { BrandLogo } from "@/components/brand-logo";

interface Auth05Props { mode: "login" | "signup" | "forgot-password" }
type AccountType = "individual" | "team";

export function Auth05({ mode }: Auth05Props) {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("individual");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function post(path: string, body: unknown) {
    const response = await fetch(`${apiUrl}${path}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({})) as { message?: string };
    if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(" ") : data.message || "Please try again.");
    return data;
  }

  async function run(action: () => Promise<void>) {
    setLoading(true); setError(""); setMessage("");
    try { await action(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Please try again."); }
    finally { setLoading(false); }
  }

  function handleLogin(event: FormEvent) {
    event.preventDefault();
    void run(async () => { await post("/auth/login", { email, password }); router.push("/dashboard"); router.refresh(); });
  }

  function handleSignup(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      const data = await post("/auth/signup", { email, password, displayName, organizationName: accountType === "team" ? organizationName : undefined, accountType });
      setMessage(data.message || "Check your email for a 6-digit code."); setCodeSent(true);
    });
  }

  function handleSignupVerification(event: FormEvent) {
    event.preventDefault();
    void run(async () => { await post("/auth/signup/verify", { email, code }); router.push("/dashboard"); router.refresh(); });
  }

  function handleReset(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      if (!codeSent) {
        const data = await post("/auth/otp/request", { email });
        setMessage(data.message || "Check your email for a reset code."); setCodeSent(true); return;
      }
      await post("/auth/reset-password", { email, code, newPassword });
      router.push("/dashboard"); router.refresh();
    });
  }

  const title = mode === "login" ? "Welcome back" : mode === "signup" ? (codeSent ? "Check your email" : "Make your account") : "Reset your password";
  const intro = mode === "login" ? "Use your email and password." : mode === "signup" ? (codeSent ? `We sent a 6-digit code to ${email}.` : "Choose what you need. You can invite people later.") : "We will email you a 6-digit reset code.";
  const inputClass = "mt-1.5 h-12 w-full rounded-2xl border-2 border-ink/10 bg-mist px-4 text-base text-ink outline-none transition placeholder:text-ink/40 focus:border-secondary focus-visible:ring-4 focus-visible:ring-secondary/15";

  return (
    <main className="flex min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,36rem)_1fr]">
      <section className="flex w-full flex-col px-5 py-6 sm:px-10 lg:px-14 lg:py-10">
        <BrandLogo />
        <div className="mx-auto my-auto w-full max-w-md py-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-secondary">{mode === "login" ? "Sign in" : mode === "signup" ? "Start free" : "Account help"}</p>
          <h1 className="mt-2 text-center font-display text-4xl text-ink">{title}</h1>
          <p className="mt-3 text-center leading-7 text-ink/65">{intro}</p>

          {error && <div role="alert" className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</div>}
          {message && <div role="status" className="mt-5 flex gap-2 rounded-2xl border border-primary/50 bg-primary/15 p-3 text-sm"><CheckCircle2 className="shrink-0 text-green-700 dark:text-primary" size={18} />{message}</div>}

          {mode === "signup" && !codeSent && (
            <div className="mt-7 grid grid-cols-2 gap-3" aria-label="Account type">
              {([{ id: "individual", label: "For me", icon: UserRound }, { id: "team", label: "For my team", icon: Building2 }] as const).map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => setAccountType(id)} aria-pressed={accountType === id} className={`min-h-24 rounded-3xl border-2 p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ${accountType === id ? "border-secondary bg-secondary text-white shadow-[0_5px_0_#4a079d]" : "border-ink/10 bg-surface text-ink hover:border-secondary/40"}`}>
                  <Icon size={21} /><span className="mt-3 block font-bold">{label}</span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={mode === "login" ? handleLogin : mode === "signup" ? (codeSent ? handleSignupVerification : handleSignup) : handleReset} className="mt-6 space-y-4">
            {mode === "signup" && !codeSent && <Field label="Your name"><input className={inputClass} value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="name" required placeholder="Your name" /></Field>}
            <Field label="Email"><input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" disabled={codeSent} required placeholder="you@company.com" /></Field>
            {mode === "signup" && !codeSent && accountType === "team" && <Field label="Team name"><input className={inputClass} value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} required placeholder="Your team" /></Field>}
            {(mode === "login" || (mode === "signup" && !codeSent)) && <Field label="Password"><input className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required placeholder="At least 8 characters" /></Field>}
            {codeSent && <Field label="6-digit code"><input className={`${inputClass} text-center font-mono text-xl tracking-[0.35em]`} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} required placeholder="000000" /></Field>}
            {mode === "forgot-password" && codeSent && <Field label="New password"><input className={inputClass} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" minLength={8} required placeholder="At least 8 characters" /></Field>}
            <Button type="submit" disabled={loading} className="h-12 w-full text-[#1d1427]">
              {loading ? <LoaderCircle className="animate-spin" size={18} /> : <>{mode === "login" ? "Sign in" : mode === "signup" ? (codeSent ? "Verify and continue" : "Sign up") : (codeSent ? "Save new password" : "Send reset code")}<ArrowRight size={17} /></>}
            </Button>
          </form>

          {mode === "login" && <p className="mt-5 text-center text-sm"><Link className="font-bold text-secondary hover:underline" href="/forgot-password">Forgot your password?</Link></p>}
          <p className="mt-7 text-center text-sm text-ink/65">{mode === "signup" ? "Already have an account?" : "New to Tcharize?"} <Link className="font-bold text-secondary hover:underline" href={mode === "signup" ? "/login" : "/signup"}>{mode === "signup" ? "Sign in" : "Create an account"}</Link></p>
        </div>
      </section>

      <aside className="relative m-4 hidden overflow-hidden rounded-[2.5rem] bg-[#1d1427] p-10 text-white shadow-2xl lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative"><span className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-[#1d1427]">Built for Nigeria. Ready for Africa.</span></div>
        <div className="relative max-w-2xl"><h2 className="font-display text-6xl leading-[1.05]">Your words,<br /><span className="text-primary">in our languages.</span></h2><p className="mt-6 max-w-xl text-lg leading-8 text-white/70">Translate and understand products in English, Hausa, Igbo, Yorùbá, and Nigerian Pidgin.</p></div>
        <p className="relative border-t border-white/10 pt-6 text-sm text-white/55">One account. A workspace for you or your whole team.</p>
      </aside>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-bold text-ink"><span>{label}</span>{children}</label>;
}
