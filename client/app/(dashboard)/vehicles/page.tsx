import { RoleGuard } from "@/components/auth/RoleGuard";

export default function VehiclesPage() {
  return (
    <RoleGuard allowedRoles={["Fleet Manager", "Dispatcher"]}>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-white">Vehicles</h1>
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400">
          This is a placeholder page for the vehicles module. 
          You have access to this page because your role matches the required permissions.
        </div>
      </div>
    </RoleGuard>
  );
}
