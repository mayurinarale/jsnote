import { Monitor, Moon, Sun } from "lucide-react";

import { useUiStore } from "@/app/stores/useUiStore";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light theme", Icon: Sun },
  { value: "dark", label: "Dark theme", Icon: Moon },
  { value: "system", label: "System theme", Icon: Monitor },
];

/**
 * Three-state theme control rendered as a radio group so keyboard users can
 * arrow between options and screen readers announce the selected theme.
 * @param {{className?: string}} props
 */
export function ThemeToggle({ className }) {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn("inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5", className)}
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          onClick={() => setTheme(value)}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-md transition-colors duration-[var(--duration-fast)]",
            theme === value
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}