import { Link } from "@tanstack/react-router";
import { PenLine } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Product wordmark. Keeps branding consistent across sidebar, mobile chrome,
 * and marketing surfaces so the writing surface never feels anonymous.
 *
 * @param {{
 *  to?: string,
 *  size?: "sm" | "md" | "lg",
 *  className?: string
 * }} props
 */
export function BrandMark({ to = "/", size = "md", className }) {
  const iconSize = size === "lg" ? "size-5" : "size-4";
  const textSize =
    size === "lg" ? "text-xl" : size === "sm" ? "text-base" : "text-lg";

  const mark = (
    <>
      <PenLine className={cn(iconSize, "shrink-0 text-primary")} aria-hidden="true" />
      <span className={cn("truncate font-display leading-none tracking-tight", textSize)}>
        jsnote
      </span>
    </>
  );

  if (!to) {
    return (
      <span className={cn("inline-flex min-w-0 items-center gap-2", className)} aria-label="jsnote">
        {mark}
      </span>
    );
  }

  return (
    <Link
      to={to}
      aria-label="jsnote home"
      className={cn(
        "inline-flex min-w-0 items-center gap-2 text-foreground transition-opacity duration-[var(--duration-fast)] hover:opacity-80",
        className,
      )}
    >
      {mark}
    </Link>
  );
}
