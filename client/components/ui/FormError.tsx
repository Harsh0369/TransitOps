"use client";

import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  error?: string | null;
  fieldErrors?: Record<string, string>;
}

export function FormError({ error, fieldErrors }: FormErrorProps) {
  if (!error && (!fieldErrors || Object.keys(fieldErrors).length === 0)) {
    return null;
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-950/40 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-200">Error</h4>
            <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}
      {fieldErrors && Object.entries(fieldErrors).length > 0 && (
        <div className="space-y-2">
          {Object.entries(fieldErrors).map(([field, message]) => (
            <div key={field} className="p-2.5 rounded-lg border border-red-500/20 bg-red-950/20 flex items-start gap-2">
              <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-300">{message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-xs text-red-400 mt-1">{error}</p>;
}
