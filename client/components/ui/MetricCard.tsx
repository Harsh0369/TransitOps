import React from "react";
import { clsx } from "clsx";

interface MetricCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  borderColorClass?: string;
  className?: string;
}

export function MetricCard({ title, value, suffix, borderColorClass, className }: MetricCardProps) {
  return (
    <div className={clsx(
      "bg-zinc-900/50 border border-zinc-800 rounded flex flex-col justify-center px-5 py-4 overflow-hidden relative",
      className
    )}>
      {borderColorClass && (
        <div className={clsx("absolute left-0 top-0 bottom-0 w-1", borderColorClass)} />
      )}
      <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
        {title}
      </h3>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        {suffix && <span className="text-sm font-medium text-zinc-500">{suffix}</span>}
      </div>
    </div>
  );
}
