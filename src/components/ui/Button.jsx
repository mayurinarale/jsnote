import { forwardRef } from "react";

import { cn } from "@/lib/utils";

/** @typedef {"primary"|"secondary"|"ghost"|"danger"} ButtonVariant */

const VARIANTS = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-subtle",
  secondary: "bg-secondary text-secondary-foreground hover:bg-accent border border-border",
  ghost: "text-foreground hover:bg-accent",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const SIZES = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

/**
 * Primary action control.
 * @type {React.ForwardRefExoticComponent<
 *   { variant?: ButtonVariant, size?: keyof typeof SIZES } & React.ButtonHTMLAttributes<HTMLButtonElement>
 * >}
 */
export const Button = forwardRef(function Button(
  { variant = "primary", size = "md", className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium",
        "transition-colors duration-[var(--duration-fast)]",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
});