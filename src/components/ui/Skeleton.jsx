import { cn } from "@/lib/utils";

/**
 * Loading placeholder. Marked aria-hidden — the surrounding region announces
 * loading state via aria-busy instead.
 * @param {{className?: string}} props
 */
export function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-muted", className)} />;
}