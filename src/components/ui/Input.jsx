import { forwardRef } from "react";

import { cn } from "@/lib/utils";

/** @type {React.ForwardRefExoticComponent<React.InputHTMLAttributes<HTMLInputElement>>} */
export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground",
        "placeholder:text-muted-foreground",
        "transition-colors duration-[var(--duration-fast)] focus:border-ring",
        className,
      )}
      {...props}
    />
  );
});