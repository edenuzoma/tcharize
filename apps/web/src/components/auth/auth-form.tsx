"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, KeyRound, LoaderCircle, Mail } from "lucide-react";
import { Button, Card } from "@tcharize/ui";
import type { AuthResponse } from "@tcharize/contracts";
import { browserApiUrl } from "@/lib/api-url";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [previewCode, setPreviewCode] = useState<string | null>(null);

  const apiUrl = browserApiUrl;

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setPreviewCode(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/otp/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          displayName: mode === "signup" && displayName.trim() ? displayName.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Could not send verification code.");
      }

      setInfoMessage(data.message || "We sent a 6-digit code to your email.");
      if (data.previewCode) {
        setPreviewCode(data.previewCode);
      }
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (code.trim().length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
        }),
      });

      const data = (await res.json()) as AuthResponse & { message?: string };
      if (!res.ok) {
        throw new Error(data.message || "Verification code failed.");
      }

      // Store auth session
      if (typeof window !== "undefined") {
        localStorage.setItem("tcharize_token", data.token);
        localStorage.setItem("tcharize_user", JSON.stringify(data.user));
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-lg border-2 border-ink p-7 shadow-[10px_10px_0_#9eff1f]">
      {step === "email" ? (
        <form onSubmit={handleSendCode}>
          {mode === "signup" && (
            <div className="mb-4">
              <label htmlFor="displayName" className="text-sm font-bold">
                Your full name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ada Lovelace"
                className="mt-2 min-h-12 w-full rounded-2xl border-2 border-ink/10 bg-mist px-4 outline-none focus:border-secondary"
              />
            </div>
          )}

          <label htmlFor="email" className="text-sm font-bold">
            Your work or personal email
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border-2 border-ink/10 bg-mist px-4">
            <Mail size={18} className="text-secondary" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="min-h-14 flex-1 bg-transparent outline-none"
            />
          </div>

          <Button type="submit" disabled={loading} className="mt-6 w-full">
            {loading ? (
              <LoaderCircle className="animate-spin" size={18} />
            ) : (
              <>
                Send my 6-digit code <ArrowRight size={17} />
              </>
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode}>
          <div className="flex items-center gap-2 text-secondary font-bold text-sm">
            <CheckCircle2 size={16} /> Code sent to {email}
          </div>

          {previewCode && (
            <div className="mt-3 rounded-xl border border-primary/50 bg-primary/20 p-3 text-xs font-mono font-bold text-[#1d1427]">
              Developer Note: Test OTP is <strong>{previewCode}</strong>
            </div>
          )}

          <label htmlFor="code" className="mt-5 block text-sm font-bold">
            Enter the 6-digit code
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border-2 border-ink/10 bg-mist px-4">
            <KeyRound size={18} className="text-secondary" />
            <input
              id="code"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              autoFocus
              required
              className="min-h-14 flex-1 bg-transparent text-xl font-bold tracking-widest outline-none"
            />
          </div>

          <Button type="submit" disabled={loading} className="mt-6 w-full">
            {loading ? (
              <LoaderCircle className="animate-spin" size={18} />
            ) : (
              <>
                Verify and enter workspace <ArrowRight size={17} />
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={() => setStep("email")}
            className="mt-4 w-full text-center text-xs font-bold text-secondary underline"
          >
            Wrong email? Go back
          </button>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">
          {error}
        </p>
      )}
      {infoMessage && (
        <p className="mt-4 rounded-xl bg-green-50 p-3 text-xs font-bold text-green-800">
          {infoMessage}
        </p>
      )}
    </Card>
  );
}
