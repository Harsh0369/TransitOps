import { RoleGuard } from "@/components/auth/RoleGuard";
import { AuditLogsView } from "@/components/AuditLogsView";

export default function AuditLogsPage() {
  return (
    <RoleGuard allowedRoles={["FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"]}>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
        <AuditLogsView />
      </div>
    </RoleGuard>
  );
}
