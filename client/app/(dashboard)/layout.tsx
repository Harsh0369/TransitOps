import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { AppProvider } from "@/providers/AppProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-[240px]">
          <TopNavbar />
          <div className="p-6">{children}</div>
        </main>
      </div>
    </AppProvider>
  );
}
