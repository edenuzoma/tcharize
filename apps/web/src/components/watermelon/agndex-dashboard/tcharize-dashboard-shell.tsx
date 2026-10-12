"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  BookA,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import "./dashboard.css";

export type DashboardTab =
  | "overview"
  | "queue"
  | "infrastructure"
  | "studio"
  | "observability"
  | "glossary"
  | "billing";

type Props = {
  children: React.ReactNode;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onLogout: () => void;
  userName: string;
  email: string;
  organizationName: string;
  projectName: string;
  planName: string;
  jobCount: number;
  glossaryCount: number;
};

export function TcharizeDashboardShell({
  children,
  activeTab,
  onTabChange,
  onLogout,
  userName,
  email,
  organizationName,
  projectName,
  planName,
  jobCount,
  glossaryCount,
}: Props) {
  const groups = [
    {
      label: "Workspace",
      items: [
        { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
        { id: "queue" as const, label: `Jobs (${jobCount})`, icon: ListOrdered },
        { id: "studio" as const, label: "Playground", icon: Sparkles },
        { id: "glossary" as const, label: `Glossary (${glossaryCount})`, icon: BookA },
      ],
    },
    {
      label: "Build",
      items: [
        { id: "infrastructure" as const, label: "API keys", icon: KeyRound },
        { id: "observability" as const, label: "Usage", icon: BarChart3 },
        { id: "billing" as const, label: "Billing", icon: CreditCard },
      ],
    },
  ];

  return (
    <SidebarProvider
      className="agndex-dashboard min-h-svh bg-mist text-ink dark:bg-[#130d1a] dark:text-white"
      style={{ "--sidebar-width": "17.25rem" } as React.CSSProperties}
    >
      <Sidebar className="border-none">
        <SidebarHeader className="px-5 pb-2 pt-6">
          <Link href="/" aria-label="Tcharize home" className="inline-flex w-fit items-center">
            <Image
              src="/brand/tcharize-logo-transparent.png"
              alt="Tcharize"
              width={156}
              height={44}
              className="h-9 w-auto object-contain dark:brightness-0 dark:invert"
              priority
            />
          </Link>
          <div className="mt-5 rounded-xl border border-sidebar-border bg-sidebar-accent/70 p-3">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{organizationName}</p>
            <p className="mt-1 truncate text-xs text-sidebar-foreground/60">{projectName}</p>
          </div>
        </SidebarHeader>

        <SidebarContent className="gap-6 px-4 pt-4">
          {groups.map((group) => (
            <SidebarGroup key={group.label} className="p-0">
              <SidebarGroupLabel className="mb-1 px-2 text-xs uppercase tracking-[0.16em] text-sidebar-foreground/50">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {group.items.map(({ id, label, icon: Icon }) => (
                    <SidebarMenuItem key={id}>
                      <SidebarMenuButton
                        type="button"
                        isActive={activeTab === id}
                        onClick={() => onTabChange(id)}
                        className="h-11 rounded-xl px-3 text-sm data-[active=true]:bg-secondary data-[active=true]:text-white data-[active=true]:shadow-[3px_3px_0_#9eff1f]"
                      >
                        <Icon aria-hidden="true" />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="px-4 pb-6">
          <div className="mb-3 rounded-xl border border-sidebar-border px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-semibold">{userName}</span>
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-[#1d1427]">{planName}</span>
            </div>
            <p className="mt-1 truncate text-xs text-sidebar-foreground/55">{email}</p>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                type="button"
                onClick={onLogout}
                className="h-11 rounded-xl px-3 text-sm hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut aria-hidden="true" />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <main className="min-w-0 flex-1 overflow-y-auto md:bg-sidebar md:p-2">
        <div className="min-h-svh overflow-hidden bg-background md:min-h-[calc(100svh-1rem)] md:rounded-2xl">
          <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger className="size-11 md:hidden" aria-label="Open workspace menu" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold capitalize">{activeTab}</p>
                <p className="hidden truncate text-xs text-muted-foreground sm:block">{organizationName} · {projectName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/docs" className="hidden min-h-11 items-center rounded-xl px-3 text-sm font-semibold hover:bg-muted sm:inline-flex">
                Docs
              </Link>
              <ThemeToggle />
            </div>
          </header>
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
