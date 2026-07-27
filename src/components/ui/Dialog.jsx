import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { IconButton } from "./IconButton";
import { cn } from "@/lib/utils";

/**
 * Accessible modal dialog: focus trap, restore-focus, Escape to close,
 * scroll lock and labelled surface. Used by destructive confirmations.
 *
 * @param {{
 *  open: boolean,
 *  onClose: () => void,
 *  title: string,
 *  description?: string,
 *  children?: React.ReactNode,
 *  footer?: React.ReactNode,
 *  className?: string
 * }} props
 */
export function Dialog({ open, onClose, title, description, children, footer, className }) {
  const panelRef = useRef(null);
  const restoreRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    restoreRef.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => !el.hasAttribute("disabled"));

    focusables()[0]?.focus();

    /** @param {KeyboardEvent} event */
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      if (restoreRef.current instanceof HTMLElement) restoreRef.current.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-foreground/25 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? "dialog-description" : undefined}
        className={cn(
          "relative w-full max-w-md rounded-2xl border border-border bg-popover p-6 shadow-overlay",
          className,
        )}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <h2 id="dialog-title" className="text-lg font-semibold text-foreground">
              {title}
            </h2>
            {description ? (
              <p id="dialog-description" className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <IconButton label="Close dialog" size="sm" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
          </IconButton>
        </div>
        {children ? <div className="mt-4">{children}</div> : null}
        {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}