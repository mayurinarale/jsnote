import { useEffect, useState } from "react";

import { isAppleDevice } from "@/hooks/useHotkeys";
import { cn } from "@/lib/utils";

const LABELS = { mod: "Ctrl", shift: "Shift", alt: "Alt", enter: "Enter", escape: "Esc" };
const APPLE_LABELS = { ...LABELS, mod: "⌘", alt: "⌥", escape: "Esc" };

/**
 * Renders a keyboard combo, e.g. <ShortcutHint keys={["mod", "k"]} />.
 * Platform is resolved after mount to avoid a hydration mismatch.
 * @param {{keys: string[], className?: string}} props
 */
export function ShortcutHint({ keys, className }) {
  const [apple, setApple] = useState(false);
  useEffect(() => setApple(isAppleDevice()), []);
  const map = apple ? APPLE_LABELS : LABELS;

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {keys.map((key) => (
        <kbd
          key={key}
          className="min-w-6 rounded-md border border-border bg-surface-raised px-1.5 py-0.5 text-center font-mono text-[11px] leading-5 text-muted-foreground"
        >
          {map[key] ?? key.toUpperCase()}
        </kbd>
      ))}
    </span>
  );
}