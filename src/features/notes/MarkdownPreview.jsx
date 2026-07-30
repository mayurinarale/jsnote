import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

/**
 * Editorial markdown preview with interactive GFM checklists.
 * Write mode stays a plain textarea — this surface is for reading and ticking.
 *
 * @param {{
 *  content: string,
 *  onToggleTask?: (index: number) => void,
 *  className?: string
 * }} props
 */
export function MarkdownPreview({ content, onToggleTask, className }) {
  // Fresh components each render so task indices reset to document order.
  const components = createComponents(onToggleTask);

  if (!content.trim()) {
    return <p className="font-reading text-[1.0625rem] leading-8 text-muted-foreground">Nothing to preview yet.</p>;
  }

  return (
    <div className={cn("markdown-preview font-reading text-[1.0625rem] leading-8 text-foreground", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

/**
 * @param {((index: number) => void) | undefined} onToggleTask
 */
function createComponents(onToggleTask) {
  return {
    h1: ({ children }) => (
      <h1 className="mb-4 mt-8 font-display text-3xl leading-tight tracking-tight first:mt-0">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-3 mt-7 font-display text-2xl leading-tight tracking-tight first:mt-0">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-6 font-display text-xl leading-snug first:mt-0">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-2 mt-5 text-base font-semibold first:mt-0">{children}</h4>
    ),
    p: ({ children }) => <p className="my-3 first:mt-0 last:mb-0">{children}</p>,
    ul: ({ children, className }) => {
      const isTaskList = typeof className === "string" && className.includes("contains-task-list");
      return (
        <ul
          className={cn(
            "my-3 space-y-1.5 first:mt-0 last:mb-0",
            isTaskList ? "list-none pl-0" : "list-disc pl-6",
            className,
          )}
        >
          {children}
        </ul>
      );
    },
    ol: ({ children }) => (
      <ol className="my-3 list-decimal space-y-1.5 pl-6 first:mt-0 last:mb-0">{children}</ol>
    ),
    li: ({ children, className, ...props }) => {
      const isTask = typeof className === "string" && className.includes("task-list-item");
      return (
        <li
          className={cn(isTask && "flex list-none items-start gap-0 pl-0", className)}
          {...props}
        >
          {children}
        </li>
      );
    },
    input: ({ type, checked }) => {
      if (type !== "checkbox") return null;

      const isChecked = Boolean(checked);

      return (
        <button
          type="button"
          role="checkbox"
          aria-checked={isChecked}
          aria-label={isChecked ? "Mark as not done" : "Mark as done"}
          onClick={(event) => {
            if (!onToggleTask) return;
            const root = event.currentTarget.closest(".markdown-preview");
            const boxes = root
              ? [...root.querySelectorAll('[role="checkbox"]')]
              : [];
            const index = boxes.indexOf(event.currentTarget);
            if (index >= 0) onToggleTask(index);
          }}
          className={cn(
            "mr-2 mt-1.5 inline-grid size-4 shrink-0 place-items-center rounded-sm border border-border transition-colors duration-[var(--duration-fast)]",
            isChecked
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-surface hover:border-primary/60",
            !onToggleTask && "pointer-events-none opacity-70 hover:border-border",
          )}
          tabIndex={onToggleTask ? 0 : -1}
          aria-disabled={!onToggleTask || undefined}
        >
          {isChecked ? (
            <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true">
              <path
                d="M2.5 6.2 4.8 8.5 9.5 3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </button>
      );
    },
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-4 border-l-2 border-primary/40 pl-4 text-muted-foreground first:mt-0 last:mb-0">
        {children}
      </blockquote>
    ),
    code: ({ className, children, ...props }) => {
      const isBlock = typeof className === "string" && className.includes("language-");
      if (isBlock) {
        return (
          <code className={cn("font-mono text-[0.9em]", className)} {...props}>
            {children}
          </code>
        );
      }
      return (
        <code
          className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[0.875em] text-foreground"
          {...props}
        >
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre className="my-4 overflow-x-auto rounded-xl border border-border bg-secondary/60 p-4 font-mono text-sm leading-6 first:mt-0 last:mb-0">
        {children}
      </pre>
    ),
    hr: () => <hr className="my-8 border-border" />,
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto first:mt-0 last:mb-0">
        <table className="w-full border-collapse text-left text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border-b border-border px-3 py-2 font-semibold">{children}</th>
    ),
    td: ({ children }) => <td className="border-b border-border/70 px-3 py-2 align-top">{children}</td>,
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  };
}
