import { cn } from "@/lib/utils";

const TONES = {
  neutral: "bg-secondary text-secondary-foreground",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/12 text-destructive",
};

/**
 * Small status label. Tone is never the only signal — always pair with text.
 * @param {{tone?: keyof typeof TONES, className?: string, children: React.ReactNode}} props
 */
export function Badge({ tone = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}