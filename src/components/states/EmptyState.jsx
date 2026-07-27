import { cn } from "@/lib/utils";

/**
 * Canonical empty state. Every empty surface in QuickNote uses this so the
 * voice, spacing and hierarchy stay identical.
 * @param {{
 *  icon?: React.ElementType,
 *  title: string,
 *  description?: string,
 *  action?: React.ReactNode,
 *  hint?: React.ReactNode,
 *  className?: string
 * }} props
 */
export function EmptyState({ icon: Icon, title, description, action, hint, className }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="grid size-11 place-items-center rounded-xl bg-secondary text-muted-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      ) : null}
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {description ? (
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}