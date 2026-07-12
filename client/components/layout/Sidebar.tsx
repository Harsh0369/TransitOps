"use client";

import { useAuth } from "@/hooks/useAuth";
import { NavItem } from "@/types/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Route, 
  Wrench, 
  Droplet, 
  DollarSign, 
  PieChart, 
  Settings,
  ShieldAlert,
  FileCheck2,
  Activity
} from "lucide-react";
import { clsx } from "clsx";

const navConfig: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", roles: ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"] },
  { name: "Vehicles", href: "/vehicles", icon: "Truck", roles: ["Fleet Manager", "Dispatcher"] },
  { name: "Drivers", href: "/drivers", icon: "Users", roles: ["Dispatcher", "Safety Officer"] },
  { name: "Trips", href: "/trips", icon: "Route", roles: ["Dispatcher"] },
  { name: "Maintenance", href: "/maintenance", icon: "Wrench", roles: ["Fleet Manager"] },
  { name: "Fuel Logs", href: "/fuel", icon: "Droplet", roles: ["Financial Analyst"] },
  { name: "Expenses", href: "/expenses", icon: "DollarSign", roles: ["Financial Analyst"] },
  { name: "Analytics", href: "/analytics", icon: "PieChart", roles: ["Financial Analyst"] },
  { name: "Reports", href: "/reports", icon: "FileCheck2", roles: ["Fleet Manager", "Financial Analyst"] },
  { name: "Settings", href: "/settings", icon: "Settings", roles: ["Fleet Manager"] },
  { name: "Compliance", href: "/compliance", icon: "ShieldAlert", roles: ["Safety Officer"] },
  { name: "License Expiry", href: "/license-expiry", icon: "FileCheck2", roles: ["Safety Officer"] },
  { name: "Safety Scores", href: "/safety-scores", icon: "Activity", roles: ["Safety Officer"] }
];

const icons: Record<string, React.ElementType> = {
  LayoutDashboard, Truck, Users, Route, Wrench, Droplet, DollarSign, PieChart, Settings, ShieldAlert, FileCheck2, Activity
};

export function Sidebar() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading || !user) return null;

  const allowedNavItems = navConfig.filter(item => item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-[#09090b] border-r border-zinc-800 flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-zinc-800">
        <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center mr-3">
          <Truck className="w-5 h-5 text-black" />
        </div>
        <span className="font-bold text-white text-lg tracking-tight">TransitOps</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="mb-4 px-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{user.role}</p>
        </div>
        {allowedNavItems.map((item) => {
          const Icon = icons[item.icon];
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent"
              )}
            >
              {Icon && <Icon className={clsx("w-4 h-4", isActive ? "text-amber-500" : "text-zinc-500")} />}
              {item.name}
              
              {user.role === "Dispatcher" && (item.name === "Vehicles" || item.name === "Drivers") && (
                <span className="ml-auto text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">R/O</span>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
