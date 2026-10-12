import { Suspense } from "react";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-mist p-8">Loading dashboard…</div>}>
      <DashboardView />
    </Suspense>
  );
}
