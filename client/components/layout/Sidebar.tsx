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
  Wallet,
  BarChart3,
  Settings,
  LucideIcon,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";

interface NavConfig extends NavItem {
  IconComponent: LucideIcon;
}

const navConfig: NavConfig[] = [
  { name: "Dashboard",      href: "/dashboard",   icon: "dashboard",      IconComponent: LayoutDashboard, roles: ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"] },
  { name: "Fleet",          href: "/vehicles",    icon: "fleet",          IconComponent: Truck,           roles: ["Fleet Manager", "Dispatcher"] },
  { name: "Drivers",        href: "/drivers",     icon: "drivers",        IconComponent: Users,           roles: ["Fleet Manager", "Dispatcher", "Safety Officer"] },
  { name: "Trips",          href: "/trips",       icon: "trips",          IconComponent: Route,           roles: ["Fleet Manager", "Dispatcher"] },
  { name: "Maintenance",    href: "/maintenance", icon: "maintenance",    IconComponent: Wrench,          roles: ["Fleet Manager"] },
  { name: "Fuel & Expenses",href: "/fuel",        icon: "fuel",           IconComponent: Wallet,          roles: ["Fleet Manager", "Financial Analyst"] },
  { name: "Analytics",      href: "/analytics",   icon: "analytics",      IconComponent: BarChart3,       roles: ["Fleet Manager", "Financial Analyst"] },
  { name: "Settings",       href: "/settings",    icon: "settings",       IconComponent: Settings,        roles: ["Fleet Manager"] },
];

export function Sidebar() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading || !user) return null;

  const allowedNavItems = navConfig.filter(item => item.roles.includes(user.role));

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-50 border-r"
      style={{
        width: "240px",
        backgroundColor: "var(--color-surface-container)",
        borderColor: "var(--color-outline-variant)",
      }}
    >
      {/* ── Logo ────────────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-5 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <Zap className="w-4 h-4" style={{ color: "var(--color-on-primary)" }} />
          </div>
          <div>
            <h1
              className="text-base font-bold leading-tight tracking-tight"
              style={{ fontFamily: "'Hanken Grotesk', sans-serif", color: "var(--color-primary)" }}
            >
              TransitOps
            </h1>
            <p
              className="text-[9px] uppercase tracking-[0.12em] font-bold"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Operations Platform
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3">
        <div className="px-3 space-y-0.5">
          {allowedNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const { IconComponent } = item;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 relative",
                  isActive
                    ? "border-l-[3px]"
                    : "border-l-[3px] border-transparent"
                )}
                style={
                  isActive
                    ? {
                        backgroundColor: "var(--color-surface-container-high)",
                        borderLeftColor: "var(--color-primary)",
                        color: "var(--color-on-surface)",
                      }
                    : {
                        color: "var(--color-on-surface-variant)",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--color-surface-container-highest)";
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--color-on-surface)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "transparent";
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--color-on-surface-variant)";
                  }
                }}
              >
                <IconComponent
                  className={clsx("w-[18px] h-[18px] shrink-0 transition-colors", isActive ? "" : "opacity-70 group-hover:opacity-100")}
                />
                <span
                  className="text-[13px] font-semibold tracking-wide"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {item.name}
                </span>

                {/* R/O badge for Dispatcher */}
                {user.role === "Dispatcher" &&
                  (item.name === "Fleet" || item.name === "Drivers") && (
                    <span
                      className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                      style={{
                        backgroundColor: "var(--color-surface-variant)",
                        color: "var(--color-on-surface-variant)",
                      }}
                    >
                      R/O
                    </span>
                  )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── User footer ─────────────────────────────────────────────────── */}
      <div
        className="px-4 py-4 border-t"
        style={{ borderColor: "var(--color-outline-variant)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border"
            style={{
              backgroundColor: "var(--color-secondary-container)",
              color: "var(--color-on-secondary-container)",
              borderColor: "var(--color-outline-variant)",
            }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p
              className="text-xs font-semibold truncate"
              style={{ color: "var(--color-on-surface)" }}
            >
              {user.name}
            </p>
            <p
              className="text-[10px] truncate"
              style={{ color: "var(--color-primary)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.04em", fontWeight: 700 }}
            >
              {user.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
