"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardView } from "@/components/DashboardView";

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={["FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"]}>
      <DashboardView />
    </RoleGuard>
  );
}
