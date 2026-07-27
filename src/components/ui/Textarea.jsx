import { forwardRef } from "react";

import { cn } from "@/lib/utils";

/** @type {React.ForwardRefExoticComponent<React.TextareaHTMLAttributes<HTMLTextAreaElement>>} */
export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full resize-none rounded-lg border border-border bg-surface p-3 text-sm text-foreground",
        "placeholder:text-muted-foreground transition-colors duration-[var(--duration-fast)] focus:border-ring",
        className,
      )}
      {...props}
    />
  );
});