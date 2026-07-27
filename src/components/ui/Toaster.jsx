import { X } from "lucide-react";

import { IconButton } from "./IconButton";
import { useUiStore } from "@/app/stores/useUiStore";
import { cn } from "@/lib/utils";

/**
 * Toast region. Polite live region so screen readers announce confirmations
 * (e.g. "Note deleted") without stealing focus.
 */
export function Toaster() {
  const toasts = useUiStore((state) => state.toasts);
  const dismissToast = useUiStore((state) => state.dismissToast);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-60 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-overlay",
            toast.tone === "destructive"
              ? "border-destructive/30 bg-destructive/10 text-foreground"
              : "border-border bg-popover text-popover-foreground",
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{toast.description}</p>
            ) : null}
          </div>
          <IconButton label="Dismiss notification" size="sm" onClick={() => dismissToast(toast.id)}>
            <X className="size-4" aria-hidden="true" />
          </IconButton>
        </div>
      ))}
    </div>
  );
}