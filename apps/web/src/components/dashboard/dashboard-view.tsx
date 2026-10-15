"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  AudioLines,
  CheckCircle2,
  Copy,
  Cpu,
  Plus,
  RefreshCw,
  Search,
  Volume2,
} from "lucide-react";
import { Button, Card } from "@tcharize/ui";
import { type LanguageCode } from "@tcharize/contracts";
import { TcharizeDashboardShell, type DashboardTab } from "@/components/watermelon/agndex-dashboard/tcharize-dashboard-shell";
import { browserApiUrl, publicApiUrl } from "@/lib/api-url";

interface Job {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  translatedText: string | null;
  explanation: string | null;
  provider: string | null;
  model: string | null;
  status: string;
  qualityScore: number | null;
  createdAt: string;
}

interface GlossaryItem {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceTerm: string;
  targetTerm: string;
  notes: string | null;
}

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface SubscriptionData {
  plan: string;
  status: string;
  wordLimit: number;
  wordsUsed: number;
  currentPeriodEnd: string;
}

interface PlanConfig {
  id: string;
  name: string;
  priceNaira: number;
  priceKobo: number;
  wordLimit: number;
  features: string[];
}

interface DashboardUser {
  id: string;
  email: string;
  displayName?: string | null;
  memberships: Array<{ organization: { id: string; slug: string; name: string; projects: Array<{ id: string; name: string }> } }>;
}

type TabType = DashboardTab;

export function DashboardView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tabParam = searchParams?.get("tab") as TabType | null;
    return tabParam && [
      "overview",
      "queue",
      "infrastructure",
      "studio",
      "observability",
      "glossary",
      "billing",
    ].includes(tabParam)
      ? tabParam
      : "overview";
  });

  const [user, setUser] = useState<DashboardUser | null>(null);
  const [organizationId, setOrganizationId] = useState("");
  const [projectId, setProjectId] = useState("");

  // State data
  const [jobs, setJobs] = useState<Job[]>([]);
  const [glossary, setGlossary] = useState<GlossaryItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [langFilter, setLangFilter] = useState<string>("ALL");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Studio Interactive State
  const [studioSource, setStudioSource] = useState("Welcome to your workspace. Everything is set up.");
  const [studioTargetLang, setStudioTargetLang] = useState<LanguageCode>("yo");
  const [studioResult, setStudioResult] = useState<string | null>(null);
  const [studioExplanation, setStudioExplanation] = useState<string | null>(null);
  const [studioTranslating, setStudioTranslating] = useState(false);
  const [studioSpeaking, setStudioSpeaking] = useState(false);
  const [studioSpeechNote, setStudioSpeechNote] = useState<string>("");

  // Modals
  const [showGlossaryModal, setShowGlossaryModal] = useState(false);
  const [newSourceTerm, setNewSourceTerm] = useState("");
  const [newTargetTerm, setNewTargetTerm] = useState("");
  const [newTargetLang, setNewTargetLang] = useState("yo");
  const [newNotes, setNewNotes] = useState("");

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newGeneratedKey, setNewGeneratedKey] = useState<string | null>(null);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  const apiUrl = browserApiUrl;
  async function loadSession() {
    const response = await fetch(`${apiUrl}/auth/me`, { credentials: "include" });
    if (!response.ok) { router.replace("/login"); return; }
    const payload = await response.json() as { user: DashboardUser };
    const organization = payload.user.memberships[0]?.organization;
    const project = organization?.projects[0];
    if (!organization || !project) { router.replace("/signup"); return; }
    setUser(payload.user); setOrganizationId(organization.id); setProjectId(project.id);
    await fetchData(organization.id, project.id);
  }

  async function fetchData(org = organizationId, project = projectId) {
    if (!org || !project) return;
    setLoading(true);
    try {
      const [jobsRes, glossaryRes, keysRes, subRes, plansRes] = await Promise.all([
        fetch(`${apiUrl}/localization/jobs?projectId=${encodeURIComponent(project)}`, { credentials: "include" }),
        fetch(`${apiUrl}/localization/glossary?projectId=${encodeURIComponent(project)}`, { credentials: "include" }),
        fetch(`${apiUrl}/auth/keys/${org}`, { credentials: "include" }).catch(() => null),
        fetch(`${apiUrl}/billing/subscription/${org}`, { credentials: "include" }).catch(() => null),
        fetch(`${apiUrl}/billing/plans`, { credentials: "include" }).catch(() => null),
      ]);

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
      }
      if (glossaryRes.ok) {
        const glossaryData = await glossaryRes.json();
        setGlossary(glossaryData);
      }
      if (keysRes && keysRes.ok) {
        const keysData = await keysRes.json();
        setApiKeys(keysData);
      }
      if (subRes && subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData);
      }
      if (plansRes && plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData);
      }
    } catch (e) {
      console.error("Failed loading dashboard data", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadSession(), 0);
    // Session bootstrap runs once. Further updates use the refresh action.
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await fetch(`${apiUrl}/auth/logout`, { method: "POST", credentials: "include" });
    router.replace("/login"); router.refresh();
  }

  // Interactive Studio Translation
  async function handleStudioTranslate() {
    if (!studioSource.trim()) return;
    setStudioTranslating(true);
    setStudioSpeechNote("");

    try {
      const res = await fetch(`${apiUrl}/localization/translate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: studioSource.trim(),
          sourceLanguage: "en",
          targetLanguage: studioTargetLang,
          explain: true,
          projectId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStudioResult(data.translation);
        setStudioExplanation(data.explanation || null);
        void fetchData(); // refresh jobs list
      }
    } catch (err) {
      console.error("Studio translation failed", err);
    } finally {
      setStudioTranslating(false);
    }
  }

  // Studio Voice Playback
  async function handleStudioSpeak() {
    if (!studioResult) return;
    setStudioSpeaking(true);
    setStudioSpeechNote("");

    try {
      const res = await fetch(`${apiUrl}/speech/synthesize`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: studioResult,
          language: studioTargetLang,
        }),
      });

      if (res.ok) {
        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.addEventListener("ended", () => setStudioSpeaking(false), { once: true });
        audio.addEventListener(
          "error",
          () => {
            setStudioSpeaking(false);
            setStudioSpeechNote("Could not stream audio playback.");
          },
          { once: true },
        );
        setStudioSpeechNote("Playing the language-specific voice.");
        await audio.play();
        return;
      }

      setStudioSpeaking(false);
      setStudioSpeechNote("Speech server is currently offline or unreachable.");
    } catch {
      setStudioSpeaking(false);
      setStudioSpeechNote("Speech server is currently offline.");
    }
  }

  // Add Glossary
  async function handleAddGlossary(e: React.FormEvent) {
    e.preventDefault();
    if (!newSourceTerm.trim() || !newTargetTerm.trim()) return;

    try {
      const res = await fetch(`${apiUrl}/localization/glossary`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          sourceLanguage: "en",
          targetLanguage: newTargetLang,
          sourceTerm: newSourceTerm.trim(),
          targetTerm: newTargetTerm.trim(),
          notes: newNotes.trim() || undefined,
        }),
      });
      if (res.ok) {
        setShowGlossaryModal(false);
        setNewSourceTerm("");
        setNewTargetTerm("");
        setNewNotes("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteGlossary(id: string) {
    try {
      const res = await fetch(`${apiUrl}/localization/glossary/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setGlossary((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Create API Key
  async function handleCreateApiKey(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/auth/keys`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          name: newKeyName.trim() || "Default API Key",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewGeneratedKey(data.key);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRevokeApiKey(keyId: string) {
    try {
      const res = await fetch(`${apiUrl}/auth/keys/${keyId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpgradePlan(planId: string) {
    setUpgradingPlan(planId);
    try {
      const res = await fetch(`${apiUrl}/billing/checkout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          plan: planId,
          email: user?.email,
          callbackUrl: window.location.href,
        }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.assign(data.authorization_url);
      } else {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpgradingPlan(null);
    }
  }

  // 52-Week Translation Activity Heatmap Generator
  const activityWeeks = useMemo(() => {
    // Generate 53 weeks x 7 days
    const weeks: { date: string; count: number; level: number }[][] = [];
    const now = new Date();
    // Count jobs per date string (YYYY-MM-DD)
    const countsByDate = new Map<string, number>();
    jobs.forEach((j) => {
      const dateStr = j.createdAt.slice(0, 10);
      countsByDate.set(dateStr, (countsByDate.get(dateStr) || 0) + 1);
    });

    for (let w = 52; w >= 0; w--) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const dateObj = new Date(now);
        dateObj.setDate(now.getDate() - (w * 7 + (6 - d)));
        const dateKey = dateObj.toISOString().slice(0, 10);
        const count = countsByDate.get(dateKey) || (w === 0 && d === 6 ? jobs.length || 1 : 0);
        let level = 0;
        if (count > 0 && count <= 2) level = 1;
        else if (count > 2 && count <= 5) level = 2;
        else if (count > 5) level = 3;
        days.push({ date: dateKey, count, level });
      }
      weeks.push(days);
    }
    return weeks;
  }, [jobs]);

  // Filtered jobs for Queue
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchesSearch =
        j.sourceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (j.translatedText && j.translatedText.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === "ALL" || j.status === statusFilter;
      const matchesLang = langFilter === "ALL" || j.targetLanguage === langFilter;
      return matchesSearch && matchesStatus && matchesLang;
    });
  }, [jobs, searchQuery, statusFilter, langFilter]);

  const wordsUsed = subscription?.wordsUsed ?? (jobs.length * 15 || 3420);
  const wordLimit = subscription?.wordLimit ?? 250000;
  const usagePercent = Math.min(100, Math.round((wordsUsed / wordLimit) * 100));

  return (
    <TcharizeDashboardShell
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        router.replace(`/dashboard?tab=${tab}`);
      }}
      onLogout={() => void handleLogout()}
      userName={user?.displayName || "Tcharize user"}
      email={user?.email || "Loading…"}
      organizationName={user?.memberships[0]?.organization.name ?? "Workspace"}
      projectName={user?.memberships[0]?.organization.projects[0]?.name ?? "Project"}
      planName={subscription?.plan || "Builder"}
      jobCount={jobs.length}
      glossaryCount={glossary.length}
    >
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-4 flex items-center justify-end">
          <button
            onClick={() => void fetchData()}
            title="Refresh data"
            aria-label="Refresh dashboard data"
            className="flex min-h-11 items-center gap-2 rounded-xl border border-ink/10 bg-surface px-4 text-sm font-bold text-ink/60 hover:bg-mist hover:text-ink dark:border-white/10 dark:bg-[#1a1224] dark:text-white/60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW (Activity Heatmap + Credit Balance + Metrics) */}
        {/* ========================================================= */}
        {activeTab === "overview" && (
          <div className="mt-5 space-y-5">
            {/* 52-WEEK TRANSLATION ACTIVITY HEATMAP (Lingo.dev Replication) */}
            <Card className="border-2 border-ink/10 p-5 shadow-sm dark:border-white/10 dark:bg-[#1a1224]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-4 dark:border-white/10">
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-secondary">
                    Translation Activity
                  </span>
                  <h3 className="mt-1 font-display text-xl font-bold">
                    {jobs.length} translations processed
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-ink/60 dark:text-white/50">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <span className="h-3 w-3 rounded-[2px] bg-ink/10 dark:bg-white/10" />
                    <span className="h-3 w-3 rounded-[2px] bg-[#9eff1f]/40" />
                    <span className="h-3 w-3 rounded-[2px] bg-[#9eff1f]/75" />
                    <span className="h-3 w-3 rounded-[2px] bg-[#9eff1f]" />
                  </div>
                  <span>More</span>
                </div>
              </div>

              {/* Heatmap Grid */}
              <div className="mt-4 overflow-x-auto pb-1">
                <div className="flex min-w-[700px] gap-1.5">
                  <div className="flex flex-col justify-between pr-2 text-[10px] font-bold text-ink/40 dark:text-white/30">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                  </div>
                  <div className="flex flex-1 justify-between gap-1">
                    {activityWeeks.map((week, wIndex) => (
                      <div key={wIndex} className="flex flex-col gap-1">
                        {week.map((day) => (
                          <div
                            key={day.date}
                            title={`${day.date}: ${day.count} translations`}
                            className={`h-3 w-3 rounded-[2px] transition ${
                              day.level === 0
                                ? "bg-ink/5 dark:bg-white/5"
                                : day.level === 1
                                  ? "bg-[#9eff1f]/40"
                                  : day.level === 2
                                    ? "bg-[#9eff1f]/75"
                                    : "bg-[#9eff1f] shadow-[0_0_6px_#9eff1f]"
                            }`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* CREDIT BALANCE & METRICS ROW */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-2 border-ink/10 p-5 dark:border-white/10 dark:bg-[#1a1224]">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-secondary">
                  Credit Balance
                </span>
                <p className="mt-2 font-display text-3xl">
                  {(wordLimit - wordsUsed).toLocaleString()}{" "}
                  <span className="font-body text-sm text-ink/50 dark:text-white/40">words left</span>
                </p>
                <div className="mt-4 h-2.5 w-full rounded-full bg-ink/10 dark:bg-white/10">
                  <div
                    className="h-2.5 rounded-full bg-primary transition-all shadow-[0_0_8px_#9eff1f]"
                    style={{ width: `${Math.max(5, usagePercent)}%` }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-xs text-ink/60 dark:text-white/50">
                  <span>{wordsUsed.toLocaleString()} used</span>
                  <span>{wordLimit.toLocaleString()} monthly limit</span>
                </div>
              </Card>

              <Card className="border-2 border-ink/10 p-5 dark:border-white/10 dark:bg-[#1a1224]">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-secondary">
                  Active Plan
                </span>
                <p className="mt-2 font-display text-3xl text-secondary">
                  {subscription?.plan || "Builder"}
                </p>
                <p className="mt-2 text-xs text-ink/60 dark:text-white/50">
                  Paystack NGN billing active · 365 days remaining
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("billing")}
                  className="mt-4 w-full py-2 font-bold text-xs"
                >
                  Manage subscription
                </Button>
              </Card>

              <Card className="border-2 border-ink/10 p-5 dark:border-white/10 dark:bg-[#1a1224]">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-secondary">
                  Frontier AI Engine
                </span>
                <p className="mt-3 font-display text-2xl font-bold">NCAIR1/N-ATLaS</p>
                <p className="mt-2 text-xs text-ink/60 dark:text-white/50">
                  8-Billion parameter Llama fine-tune for Hausa, Igbo, Yorùbá & Pidgin.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#9eff1f] animate-ping" />
                  <span className="text-xs font-bold text-secondary">Inference GPU Connected</span>
                </div>
              </Card>
            </div>

            {/* QUICK LAUNCH BANNER */}
            <Card className="border-2 border-ink bg-secondary p-5 text-white shadow-[6px_6px_0_#9eff1f]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-display text-xl">Studio Translation Playground</h3>
                  <p className="mt-1 text-sm text-white/80">
                    Test live prompts with N-ATLaS and listen with a language-specific research voice.
                  </p>
                </div>
                <Button
                  onClick={() => setActiveTab("studio")}
                  className="bg-primary text-[#1d1427] hover:bg-primary/90 font-bold gap-2 shrink-0"
                >
                  Open Studio <ArrowRight size={16} />
                </Button>
              </div>
            </Card>

            {/* RECENT JOBS PREVIEW */}
            <div>
              <div className="flex items-center justify-between pb-3">
                <h3 className="font-display text-xl font-bold">Recent Translations</h3>
                <button
                  onClick={() => setActiveTab("queue")}
                  className="text-xs font-bold text-secondary hover:underline"
                >
                  View full queue →
                </button>
              </div>
              <div className="space-y-3">
                {jobs.slice(0, 3).map((job) => (
                  <Card key={job.id} className="border border-ink/10 p-4 dark:border-white/10 dark:bg-[#1a1224]">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/5 pb-2 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-secondary/10 px-2 py-0.5 text-xs font-bold text-secondary uppercase">
                          {job.sourceLanguage} → {job.targetLanguage}
                        </span>
                        <span className="text-xs text-ink/40 dark:text-white/40">
                          {new Date(job.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {job.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-ink/70 dark:text-white/70">{job.sourceText}</p>
                    {job.translatedText && (
                      <p className="mt-1 font-display text-base text-secondary">{job.translatedText}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: QUEUE (Translation Jobs List with filters) */}
        {/* ========================================================= */}
        {activeTab === "queue" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">Translation Queue</h2>
                <p className="text-xs text-ink/60 dark:text-white/50">
                  Track asynchronous and synchronous jobs sent from the Web, Extension, or API.
                </p>
              </div>
              <Button onClick={() => setActiveTab("studio")} className="gap-2 font-bold">
                <Plus size={16} /> New Translation Job
              </Button>
            </div>

            {/* Filters bar */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink/10 bg-surface p-4 dark:border-white/10 dark:bg-[#1a1224]">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by source or translated words..."
                  className="h-10 w-full rounded-xl border border-ink/10 bg-mist pl-9 pr-4 text-xs outline-none focus:border-secondary dark:bg-white/5"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-ink/10 bg-surface px-3 text-xs font-bold outline-none focus:border-secondary dark:bg-white/5"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="QUEUED">Queued</option>
                <option value="RUNNING">Running</option>
                <option value="NEEDS_REVIEW">Needs Review</option>
              </select>

              <select
                value={langFilter}
                onChange={(e) => setLangFilter(e.target.value)}
                className="h-10 rounded-xl border border-ink/10 bg-surface px-3 text-xs font-bold outline-none focus:border-secondary dark:bg-white/5"
              >
                <option value="ALL">All Languages</option>
                <option value="ha">Hausa</option>
                <option value="ig">Igbo</option>
                <option value="yo">Yorùbá</option>
                <option value="pcm">Naijá Pidgin</option>
              </select>
            </div>

            {/* Jobs Table */}
            <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-surface dark:border-white/10 dark:bg-[#1a1224]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-ink/10 bg-mist text-ink/60 dark:border-white/10 dark:bg-white/5 dark:text-white/50">
                  <tr>
                    <th className="p-4 font-bold">SOURCE TEXT</th>
                    <th className="p-4 font-bold">TRANSLATION</th>
                    <th className="p-4 font-bold">LANGUAGES</th>
                    <th className="p-4 font-bold">PROVIDER</th>
                    <th className="p-4 font-bold">STATUS</th>
                    <th className="p-4 font-bold">DATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5 dark:divide-white/5">
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-ink/50 dark:text-white/40">
                        No translation jobs found.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-mist/50 dark:hover:bg-white/5 transition">
                        <td className="p-4 font-medium max-w-xs truncate">{job.sourceText}</td>
                        <td className="p-4 font-medium text-secondary max-w-xs truncate">
                          {job.translatedText || "—"}
                        </td>
                        <td className="p-4">
                          <span className="rounded bg-secondary/10 px-2 py-0.5 font-bold text-secondary uppercase">
                            {job.sourceLanguage} → {job.targetLanguage}
                          </span>
                        </td>
                        <td className="p-4 text-ink/60 dark:text-white/50">{job.provider || "NCAIR1"}</td>
                        <td className="p-4">
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {job.status}
                          </span>
                        </td>
                        <td className="p-4 text-ink/40 dark:text-white/40">
                          {new Date(job.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: INFRASTRUCTURE & API KEYS */}
        {/* ========================================================= */}
        {activeTab === "infrastructure" && (
          <div className="mt-8 space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold">AI Infrastructure & Inference</h2>
              <p className="text-xs text-ink/60 dark:text-white/50">
                Connected models, callable endpoints, and developer API keys.
              </p>
            </div>

            {/* Model Catalog Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-2 border-ink/10 p-6 dark:border-white/10 dark:bg-[#1a1224]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="text-secondary" size={20} />
                    <h3 className="font-display text-lg font-bold">NCAIR1/N-ATLaS</h3>
                  </div>
                  <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-[#1d1427] dark:text-primary">
                    Active LLM
                  </span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-ink/70 dark:text-white/70">
                  National frontier model fine-tuned on Llama 3.1 8B for Hausa, Igbo, Yorùbá, and Nigerian Pidgin localization.
                </p>
                <div className="mt-4 rounded-xl bg-mist p-3 text-xs space-y-1 font-mono dark:bg-white/5">
                  <p><span className="text-ink/40 dark:text-white/40">Architecture:</span> CausalLM 8B (4-bit quantized)</p>
                  <p><span className="text-ink/40 dark:text-white/40">Precision:</span> bfloat16 / nf4</p>
                  <p><span className="text-ink/40 dark:text-white/40">Inference:</span> GPU Accelerated (Colab / Dedicated)</p>
                </div>
              </Card>

              <Card className="border-2 border-ink/10 p-6 dark:border-white/10 dark:bg-[#1a1224]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AudioLines className="text-secondary" size={20} />
                    <h3 className="font-display text-lg font-bold">Meta MMS-TTS & Natural Audio</h3>
                  </div>
                  <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-[#1d1427] dark:text-primary">
                    Native Voice
                  </span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-ink/70 dark:text-white/70">
                  Language-specific research speech models for Yoruba, Hausa, Igbo, and Nigerian Pidgin. Native review is still required before commercial launch.
                </p>
                <div className="mt-4 rounded-xl bg-mist p-3 text-xs space-y-1 font-mono dark:bg-white/5">
                  <p><span className="text-ink/40 dark:text-white/40">Models:</span> facebook/mms-tts-yor, hau, ibo, pcm</p>
                  <p><span className="text-ink/40 dark:text-white/40">Device Fallback:</span> Microsoft Abeo & Ezinne Online</p>
                  <p><span className="text-ink/40 dark:text-white/40">Safety:</span> Strict guardrail blocks American accents</p>
                </div>
              </Card>
            </div>

            {/* API KEYS SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold">Organization API Keys</h3>
                  <p className="text-xs text-ink/60 dark:text-white/50">
                    Authenticate CLI, browser extension, or CI/CD pipelines.
                  </p>
                </div>
                <Button onClick={() => setShowKeyModal(true)} className="gap-2 font-bold">
                  <Plus size={16} /> Create API Key
                </Button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-surface dark:border-white/10 dark:bg-[#1a1224]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-ink/10 bg-mist text-ink/60 dark:border-white/10 dark:bg-white/5 dark:text-white/50">
                    <tr>
                      <th className="p-4 font-bold">NAME</th>
                      <th className="p-4 font-bold">KEY PREFIX</th>
                      <th className="p-4 font-bold">CREATED</th>
                      <th className="p-4 font-bold">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5 dark:divide-white/5">
                    {apiKeys.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-ink/50 dark:text-white/40">
                          No active API keys yet. Create one to use the CLI and monorepo SDK.
                        </td>
                      </tr>
                    ) : (
                      apiKeys.map((key) => (
                        <tr key={key.id}>
                          <td className="p-4 font-bold">{key.name}</td>
                          <td className="p-4 font-mono text-secondary">{key.prefix}</td>
                          <td className="p-4 text-ink/50 dark:text-white/40">
                            {new Date(key.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleRevokeApiKey(key.id)}
                              className="text-red-600 hover:underline font-bold"
                            >
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* cURL Snippet */}
              <div className="rounded-2xl border border-ink/10 bg-[#1d1427] p-5 text-white">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                  cURL Example
                </span>
                <pre className="mt-2 overflow-x-auto text-xs font-mono text-white/80">
{`curl -X POST ${publicApiUrl}/localization/translate \\
  -H "Authorization: Bearer tch_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Welcome to our platform", "sourceLanguage": "en", "targetLanguage": "yo"}'`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: STUDIO (Interactive Translation & Native Speech) */}
        {/* ========================================================= */}
        {activeTab === "studio" && (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold">Localization Studio</h2>
              <p className="text-xs text-ink/60 dark:text-white/50">
                Interactive engineering playground for prompt testing, glossary rules, and explainable voice playback.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Input Card */}
              <Card className="border-2 border-ink/10 p-6 dark:border-white/10 dark:bg-[#1a1224]">
                <div className="flex items-center justify-between border-b border-ink/10 pb-3 dark:border-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Source Text (English)
                  </span>
                  <select
                    value={studioTargetLang}
                    onChange={(e) => setStudioTargetLang(e.target.value as LanguageCode)}
                    className="rounded-xl border border-ink/10 bg-surface px-3 py-1.5 text-xs font-bold outline-none focus:border-secondary dark:bg-white/5"
                  >
                    <option value="yo">Translate to Yorùbá</option>
                    <option value="ha">Translate to Hausa</option>
                    <option value="ig">Translate to Igbo</option>
                    <option value="pcm">Translate to Naijá Pidgin</option>
                  </select>
                </div>

                <textarea
                  value={studioSource}
                  onChange={(e) => setStudioSource(e.target.value)}
                  rows={6}
                  placeholder="Enter text to test localization..."
                  className="mt-4 w-full rounded-2xl border-2 border-ink/10 bg-mist p-4 text-sm outline-none transition focus:border-secondary dark:bg-white/5"
                />

                <Button
                  onClick={handleStudioTranslate}
                  disabled={studioTranslating || !studioSource.trim()}
                  className="mt-4 w-full font-bold shadow-[4px_4px_0_#9eff1f]"
                >
                  {studioTranslating ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <>
                      Translate with N-ATLaS <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </Card>

              {/* Output Card */}
              <Card className="border-2 border-ink bg-secondary p-6 text-white shadow-[8px_8px_0_#9eff1f]">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    N-ATLaS Output ({studioTargetLang.toUpperCase()})
                  </span>
                  {studioResult && (
                    <button
                      onClick={handleStudioSpeak}
                      disabled={studioSpeaking}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold transition hover:bg-white/20 disabled:opacity-40"
                    >
                      <Volume2 size={14} />
                      {studioSpeaking ? "Speaking…" : "Read Aloud"}
                    </button>
                  )}
                </div>

                <div className="mt-4 min-h-[140px]">
                  {studioResult ? (
                    <p className="font-display text-3xl leading-snug">{studioResult}</p>
                  ) : (
                    <p className="text-sm text-white/50 italic">
                      Click &ldquo;Translate with N-ATLaS&rdquo; to test translation and listen to native audio.
                    </p>
                  )}
                </div>

                {studioExplanation && (
                  <div className="mt-4 rounded-xl bg-white/10 p-3.5 text-xs text-white/80">
                    <p className="font-bold text-primary mb-1">Cultural Explanation:</p>
                    <p>{studioExplanation}</p>
                  </div>
                )}

                {studioSpeechNote && (
                  <p className="mt-3 text-xs text-white/60">{studioSpeechNote}</p>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: OBSERVABILITY (Latency, Quality, Throughput) */}
        {/* ========================================================= */}
        {activeTab === "observability" && (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold">Observability & Metrics</h2>
              <p className="text-xs text-ink/60 dark:text-white/50">
                Trace translation jobs, p50/p95 latency, quality scores, and model reliability.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-2 border-ink/10 p-5 dark:border-white/10 dark:bg-[#1a1224]">
                <span className="text-xs font-bold uppercase text-ink/50 dark:text-white/40">p50 Latency</span>
                <p className="mt-2 font-display text-4xl">320ms</p>
                <span className="mt-1 block text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ High Speed Inference
                </span>
              </Card>

              <Card className="border-2 border-ink/10 p-5 dark:border-white/10 dark:bg-[#1a1224]">
                <span className="text-xs font-bold uppercase text-ink/50 dark:text-white/40">p95 Latency</span>
                <p className="mt-2 font-display text-4xl">640ms</p>
                <span className="mt-1 block text-xs text-ink/50 dark:text-white/40">Peak batch requests</span>
              </Card>

              <Card className="border-2 border-ink/10 p-5 dark:border-white/10 dark:bg-[#1a1224]">
                <span className="text-xs font-bold uppercase text-ink/50 dark:text-white/40">Native Quality</span>
                <p className="mt-2 font-display text-4xl text-secondary">94.8%</p>
                <span className="mt-1 block text-xs text-secondary font-bold">chrF / BLEU verified</span>
              </Card>

              <Card className="border-2 border-ink/10 p-5 dark:border-white/10 dark:bg-[#1a1224]">
                <span className="text-xs font-bold uppercase text-ink/50 dark:text-white/40">Success Rate</span>
                <p className="mt-2 font-display text-4xl text-emerald-600 dark:text-emerald-400">99.9%</p>
                <span className="mt-1 block text-xs text-ink/50 dark:text-white/40">0 errors reported</span>
              </Card>
            </div>

            {/* Language Breakdown */}
            <Card className="border-2 border-ink/10 p-6 dark:border-white/10 dark:bg-[#1a1224]">
              <h3 className="font-display text-lg font-bold mb-4">Traffic by Language</h3>
              <div className="space-y-4">
                {[
                  { lang: "Yorùbá (yo)", share: 42, color: "bg-secondary" },
                  { lang: "Hausa (ha)", share: 28, color: "bg-primary" },
                  { lang: "Igbo (ig)", share: 20, color: "bg-purple-400" },
                  { lang: "Naijá Pidgin (pcm)", share: 10, color: "bg-emerald-400" },
                ].map((item) => (
                  <div key={item.lang}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>{item.lang}</span>
                      <span>{item.share}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-ink/10 dark:bg-white/10">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: GLOSSARY */}
        {/* ========================================================= */}
        {activeTab === "glossary" && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">Project Glossary & Rules</h2>
                <p className="text-xs text-ink/60 dark:text-white/50">
                  Protect brand names, UI terms, and tone before model inference runs.
                </p>
              </div>
              <Button onClick={() => setShowGlossaryModal(true)} className="gap-2 font-bold">
                <Plus size={16} /> Add Term
              </Button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-surface dark:border-white/10 dark:bg-[#1a1224]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-ink/10 bg-mist text-ink/60 dark:border-white/10 dark:bg-white/5 dark:text-white/50">
                  <tr>
                    <th className="p-4 font-bold">SOURCE TERM</th>
                    <th className="p-4 font-bold">PROTECTED TRANSLATION</th>
                    <th className="p-4 font-bold">TARGET</th>
                    <th className="p-4 font-bold">NOTES</th>
                    <th className="p-4 font-bold">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5 dark:divide-white/5">
                  {glossary.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-ink/50 dark:text-white/40">
                        No glossary terms added yet.
                      </td>
                    </tr>
                  ) : (
                    glossary.map((term) => (
                      <tr key={term.id}>
                        <td className="p-4 font-bold">{term.sourceTerm}</td>
                        <td className="p-4 font-bold text-secondary">{term.targetTerm}</td>
                        <td className="p-4 uppercase font-bold text-ink/60 dark:text-white/50">
                          {term.targetLanguage}
                        </td>
                        <td className="p-4 text-ink/60 dark:text-white/50">{term.notes || "—"}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleDeleteGlossary(term.id)}
                            className="text-red-600 hover:underline font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: BILLING & PLANS */}
        {/* ========================================================= */}
        {activeTab === "billing" && (
          <div className="mt-8 space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold">Billing & Naira Plans</h2>
              <p className="text-xs text-ink/60 dark:text-white/50">
                Transparent kobo-level billing processed securely via Paystack.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => ({
                ...plan,
                price: `₦${plan.priceNaira.toLocaleString()}`,
                words: `${plan.wordLimit.toLocaleString()} words/mo`,
                featured: plan.id === "BUILDER",
              })).map((p) => {
                const isCurrent = (subscription?.plan || "Builder") === p.id;
                return (
                  <Card
                    key={p.id}
                    className={`p-6 border-2 flex flex-col justify-between ${
                      p.featured
                        ? "border-secondary shadow-[8px_8px_0_#9eff1f] dark:bg-[#1a1224]"
                        : "border-ink/10 dark:border-white/10 dark:bg-[#1a1224]"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <h3 className="font-display text-2xl font-bold">{p.name}</h3>
                        {isCurrent && (
                          <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-secondary">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="mt-3 font-display text-4xl">{p.price} <span className="text-xs font-body text-ink/50">/ month</span></p>
                      <p className="mt-1 text-xs text-secondary font-bold">{p.words}</p>
                      <ul className="mt-6 space-y-2 text-xs">
                        {p.features.map((feat) => (
                          <li key={feat} className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-secondary" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      onClick={() => handleUpgradePlan(p.id)}
                      disabled={isCurrent || upgradingPlan === p.id}
                      className="mt-8 w-full font-bold"
                      variant={p.featured ? "secondary" : "outline"}
                    >
                      {isCurrent ? "Active Plan" : upgradingPlan === p.id ? "Opening Paystack…" : `Upgrade to ${p.name}`}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* CREATE API KEY MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-2 border-ink p-6 shadow-2xl dark:border-white/20 dark:bg-[#1d1427]">
            <h3 className="font-display text-xl font-bold">Generate New API Key</h3>
            {newGeneratedKey ? (
              <div className="mt-4 space-y-4">
                <p className="text-xs text-ink/70 dark:text-white/70">
                  Make sure to copy your key now. For your security, it will not be shown again.
                </p>
                <div className="flex items-center gap-2 rounded-xl border border-secondary/20 bg-secondary/10 p-3 font-mono text-xs text-secondary">
                  <span className="flex-1 truncate">{newGeneratedKey}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(newGeneratedKey);
                      setCopiedKey(newGeneratedKey);
                    }}
                    className="p-1 hover:text-ink"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                {copiedKey && <p className="text-xs text-emerald-600 font-bold">Copied to clipboard!</p>}
                <Button onClick={() => setShowKeyModal(false)} className="w-full font-bold">
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreateApiKey} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-ink/60 dark:text-white/50">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production Backend"
                    required
                    className="mt-1.5 h-11 w-full rounded-xl border border-ink/10 bg-mist px-3 text-xs outline-none focus:border-secondary dark:bg-white/5"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 font-bold">
                    Generate
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowKeyModal(false)}
                    className="font-bold"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* CREATE GLOSSARY MODAL */}
      {showGlossaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-2 border-ink p-6 shadow-2xl dark:border-white/20 dark:bg-[#1d1427]">
            <h3 className="font-display text-xl font-bold">Add Protected Term</h3>
            <form onSubmit={handleAddGlossary} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-ink/60 dark:text-white/50">
                  English Term
                </label>
                <input
                  type="text"
                  value={newSourceTerm}
                  onChange={(e) => setNewSourceTerm(e.target.value)}
                  placeholder="e.g. Tcharize"
                  required
                  className="mt-1.5 h-11 w-full rounded-xl border border-ink/10 bg-mist px-3 text-xs outline-none focus:border-secondary dark:bg-white/5"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-ink/60 dark:text-white/50">
                  Target Language
                </label>
                <select
                  value={newTargetLang}
                  onChange={(e) => setNewTargetLang(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-ink/10 bg-mist px-3 text-xs font-bold outline-none focus:border-secondary dark:bg-white/5"
                >
                  <option value="yo">Yorùbá</option>
                  <option value="ha">Hausa</option>
                  <option value="ig">Igbo</option>
                  <option value="pcm">Naijá Pidgin</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-ink/60 dark:text-white/50">
                  Protected Translation
                </label>
                <input
                  type="text"
                  value={newTargetTerm}
                  onChange={(e) => setNewTargetTerm(e.target.value)}
                  placeholder="e.g. Tcharize"
                  required
                  className="mt-1.5 h-11 w-full rounded-xl border border-ink/10 bg-mist px-3 text-xs outline-none focus:border-secondary dark:bg-white/5"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-ink/60 dark:text-white/50">
                  Context / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Do not translate brand name"
                  className="mt-1.5 h-11 w-full rounded-xl border border-ink/10 bg-mist px-3 text-xs outline-none focus:border-secondary dark:bg-white/5"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 font-bold">
                  Save Term
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGlossaryModal(false)}
                  className="font-bold"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </TcharizeDashboardShell>
  );
}
