import { Link } from "@tanstack/react-router";
import { Link2, Pin } from "lucide-react";
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
          "block rounded-lg px-2.5 py-2 transition-colors duration-[var(--duration-fast)]",
          active ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
        )}
      >
        <div className="flex items-center gap-1.5">
          {note.pinned ? (
            <Pin className="size-3 shrink-0 text-primary" aria-label="Pinned" />
          ) : null}
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
            {deriveTitle(note.body)}
          </span>
          {note.shareId ? (
            <Link2 className="size-3 shrink-0 text-primary" aria-label="Shared" />
          ) : null}
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {preview || "Empty note"}
          </p>
          <time
            dateTime={new Date(note.updatedAt).toISOString()}
            className="shrink-0 text-[10px] text-muted-foreground"
          >
            {formatRelativeTime(note.updatedAt)}
          </time>
        </div>
      </Link>
    </li>
  );
}

export const NoteListItem = memo(NoteListItemBase);
