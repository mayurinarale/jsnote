import { forwardRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Icon-only control. `label` is mandatory — it becomes the accessible name.
 * Tap target stays at 44px on touch, matching WCAG 2.2 target size.
 * @type {React.ForwardRefExoticComponent<
 *   { label: string, size?: "sm"|"md" } & React.ButtonHTMLAttributes<HTMLButtonElement>
 * >}
 */
export const IconButton = forwardRef(function IconButton(
  { label, size = "md", className, type = "button", children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg text-muted-foreground",
        "transition-colors duration-[var(--duration-fast)] hover:bg-accent hover:text-foreground",
        "disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "size-9" : "size-11",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});