import { Link } from "@tanstack/react-router";
import { Pin } from "lucide-react";
import { memo } from "react";

import { derivePreview, deriveTitle, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * A single row in the note list. Memoised: typing in the editor updates one
 * note, and only that row should re-render.
 * @param {{note: import("@/lib/db").Note, active: boolean}} props
 */
function NoteListItemBase({ note, active }) {
  const preview = derivePreview(note.body);

  return (
    <li>
      <Link
        to="/app/n/$id"
        params={{ id: note.id }}
        aria-current={active ? "true" : undefined}
        className={cn(
          "block rounded-lg px-3 py-3 transition-colors duration-[var(--duration-fast)]",
          active ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
        )}
      >
        <div className="flex items-center gap-2">
          {note.pinned ? (
            <Pin className="size-3.5 shrink-0 text-primary" aria-label="Pinned" />
          ) : null}
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
            {deriveTitle(note.body)}
          </span>
          <time
            dateTime={new Date(note.updatedAt).toISOString()}
            className="shrink-0 text-xs text-muted-foreground"
          >
            {formatRelativeTime(note.updatedAt)}
          </time>
        </div>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {preview || "No additional text"}
        </p>
      </Link>
    </li>
  );
}

export const NoteListItem = memo(NoteListItemBase);