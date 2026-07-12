"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardView } from "@/components/DashboardView";

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"]}>
      <DashboardView />
    </RoleGuard>
  );
}
