import { RoleGuard } from "@/components/auth/RoleGuard";
import { ReportsView } from "@/components/ReportsView";

export default function ReportsPage() {
  return (
    <RoleGuard allowedRoles={["Fleet Manager", "Financial Analyst"]}>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-white">Operational Reports</h1>
        <ReportsView />
      </div>
    </RoleGuard>
  );
}
