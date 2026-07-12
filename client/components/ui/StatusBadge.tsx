import React from "react";
import { clsx } from "clsx";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case "on trip":
        return "bg-blue-500/20 text-blue-400";
      case "completed":
        return "bg-emerald-500/20 text-emerald-400";
      case "dispatched":
        return "bg-slate-500/20 text-slate-300";
      case "draft":
        return "bg-zinc-800 text-zinc-400";
      case "available":
        return "bg-emerald-500/20 text-emerald-400";
      case "in shop":
        return "bg-amber-500/20 text-amber-500";
      case "retired":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "suspended":
        return "bg-red-500/20 text-red-400";
      case "off duty":
        return "bg-zinc-800 text-zinc-400";
      default:
        return "bg-zinc-800 text-zinc-400";
    }
  };

  return (
    <span className={clsx("px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide whitespace-nowrap", getStatusStyles())}>
      {status}
    </span>
  );
}
