"use client";

import { useAuth } from "@/hooks/useAuth";
import { Bell, HelpCircle, LogOut, Search } from "lucide-react";

export function TopNavbar() {
  const { user, logout, isLoading } = useAuth();
  if (isLoading || !user) return null;

  const initials = (user.name || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header
      className="h-16 w-full sticky top-0 z-40 flex items-center justify-between border-b"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-outline-variant)",
        paddingLeft: "32px",
        paddingRight: "32px",
      }}
    >
      {/* ── Search ────────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "var(--color-on-surface-variant)" }}
          />
          <input
            type="text"
            placeholder="Search operations, assets, or trips..."
            className="w-full py-2 pl-9 pr-4 rounded-lg text-sm border transition-all focus:outline-none"
            style={{
              backgroundColor: "var(--color-surface-container-lowest)",
              borderColor: "var(--color-outline-variant)",
              color: "var(--color-on-surface)",
              fontFamily: "'Inter', sans-serif",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--color-primary)";
              e.currentTarget.style.boxShadow = "0 0 0 2px color-mix(in srgb, var(--color-primary) 20%, transparent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--color-outline-variant)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      {/* ── Right section ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 ml-6">
        {/* Icon buttons */}
        <button
          className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: "var(--color-on-surface-variant)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-surface-container-high)";
            (e.currentTarget as HTMLElement).style.color = "var(--color-on-surface)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--color-on-surface-variant)";
          }}
          title="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          {/* Unread dot */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
            style={{
              backgroundColor: "var(--color-primary)",
              borderColor: "var(--color-surface)",
            }}
          />
        </button>

        <button
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: "var(--color-on-surface-variant)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-surface-container-high)";
            (e.currentTarget as HTMLElement).style.color = "var(--color-on-surface)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--color-on-surface-variant)";
          }}
          title="Help"
        >
          <HelpCircle className="w-[18px] h-[18px]" />
        </button>

        {/* Divider */}
        <div
          className="w-px h-6 mx-1"
          style={{ backgroundColor: "var(--color-outline-variant)" }}
        />

        {/* User info + avatar */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p
              className="text-sm font-semibold leading-tight"
              style={{ color: "var(--color-on-surface)", fontFamily: "'Hanken Grotesk', sans-serif" }}
            >
              {user.name}
            </p>
            <p
              className="text-[10px] font-bold tracking-wide leading-tight"
              style={{ color: "var(--color-primary)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.05em" }}
            >
              {user.role}
            </p>
          </div>

          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0"
            style={{
              backgroundColor: "var(--color-secondary-container)",
              color: "var(--color-on-secondary-container)",
              borderColor: "var(--color-outline-variant)",
            }}
          >
            {initials}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            title="Log out"
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "var(--color-on-surface-variant)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "color-mix(in srgb, var(--color-error) 15%, transparent)";
              (e.currentTarget as HTMLElement).style.color = "var(--color-error)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--color-on-surface-variant)";
            }}
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
