import { AlertTriangle, RefreshCw } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-sm text-zinc-400">Loading data...</p>
      </div>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  const message = error?.message || "An error occurred while loading data";
  
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500" />
        <div>
          <p className="text-sm font-semibold text-red-300 mb-1">Error loading data</p>
          <p className="text-xs text-red-400/80 max-w-xs">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ title = "No data found", message = "There are no results to display." }: { title?: string; message?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <p className="text-sm font-semibold text-zinc-300 mb-1">{title}</p>
        <p className="text-xs text-zinc-500">{message}</p>
      </div>
    </div>
  );
}
