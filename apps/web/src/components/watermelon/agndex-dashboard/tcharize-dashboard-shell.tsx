"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  BookA,
  ChevronsUpDown,
  CreditCard,
  FileText,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "T";

  return (
    <SidebarProvider
      className="agndex-dashboard min-h-svh bg-mist text-ink dark:bg-[#130d1a] dark:text-white"
      style={{ "--sidebar-width": "15.75rem" } as React.CSSProperties}
    >
      <Sidebar className="border-none">
        <SidebarHeader className="px-4 pb-2 pt-5">
          <button
            type="button"
            onClick={() => window.location.reload()}
            aria-label="Refresh dashboard"
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl pr-2 text-sidebar-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
          >
            <Image
              src="/brand/tcharize-icon.png"
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-xl object-contain"
              priority
            />
            <span className="font-display text-2xl leading-none">tcharize</span>
          </button>
          <div className="mt-3 rounded-xl border border-sidebar-border bg-sidebar-accent/70 p-3">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{organizationName}</p>
            <p className="mt-1 truncate text-xs text-sidebar-foreground/60">{projectName}</p>
          </div>
        </SidebarHeader>

        <SidebarContent className="gap-5 px-3 pt-3">
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

        <SidebarFooter className="px-3 pb-5">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/60 px-3 py-2 text-left transition hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-white">
                      {initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{userName}</span>
                      <span className="block truncate text-xs text-sidebar-foreground/60">{email}</span>
                    </span>
                    <ChevronsUpDown className="size-4 shrink-0 text-sidebar-foreground/50" aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" sideOffset={8} className="agndex-dashboard w-[min(18rem,calc(100vw-2rem))] rounded-2xl p-2">
                  <DropdownMenuLabel className="p-3 font-normal">
                    <span className="flex items-center justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">Account settings</span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{organizationName} · {projectName}</span>
                      </span>
                      <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-[#1d1427]">{planName}</span>
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => onTabChange("infrastructure")} className="rounded-xl">
                      <KeyRound aria-hidden="true" /> API keys
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onTabChange("billing")} className="rounded-xl">
                      <CreditCard aria-hidden="true" /> Plan and billing
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl">
                      <Link href="/docs"><FileText aria-hidden="true" /> Help and docs</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={onLogout} className="rounded-xl">
                    <LogOut aria-hidden="true" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <main className="min-w-0 flex-1 overflow-y-auto md:bg-sidebar md:p-2">
        <div className="min-h-svh overflow-hidden bg-background md:min-h-[calc(100svh-1rem)] md:rounded-2xl">
          <header className="sticky top-0 z-40 flex min-h-14 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-5">
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
