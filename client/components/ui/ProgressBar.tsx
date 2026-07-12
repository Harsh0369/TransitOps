import React from "react";
import { clsx } from "clsx";

interface ProgressBarProps {
  progress: number; // 0 to 100
  colorClass?: string;
  className?: string;
  trackColorClass?: string;
}

export function ProgressBar({ 
  progress, 
  colorClass = "bg-amber-500", 
  className,
  trackColorClass = "bg-zinc-800" 
}: ProgressBarProps) {
  return (
    <div className={clsx("w-full h-2 rounded-full overflow-hidden", trackColorClass, className)}>
      <div 
        className={clsx("h-full rounded-full transition-all duration-1000 ease-out", colorClass)} 
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}
