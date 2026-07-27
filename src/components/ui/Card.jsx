import { cn } from "@/lib/utils";

/**
 * Neutral surface container.
 * @param {{as?: React.ElementType, className?: string, children?: React.ReactNode}} props
 */
export function Card({ as: Tag = "div", className, children, ...props }) {
  return (
    <Tag
      className={cn("rounded-xl border border-border bg-card p-5 shadow-subtle", className)}
      {...props}
    >
      {children}
    </Tag>
  );
}