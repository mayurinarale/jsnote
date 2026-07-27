import { Link } from "@tanstack/react-router";
import { PenLine, Plus, Search } from "lucide-react";

import { NoteList } from "./NoteList";
import { Button } from "@/components/ui/Button";
import { ShortcutHint } from "@/components/ui/ShortcutHint";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

/**
 * Left pane: brand, search trigger, note list, theme control.
 * Rendered inline on desktop/tablet and inside a drawer on mobile.
 *
 * @param {{
 *  notes: import("@/lib/db").Note[],
 *  selectedId: string|null,
 *  status: string,
 *  online: boolean,
 *  firstLaunch: boolean,
 *  onCreate: () => void,
 *  onRetry: () => void,
 *  onSearch: () => void,
 *  className?: string
 * }} props
 */
export function Sidebar({
  notes,
  selectedId,
  status,
  online,
  firstLaunch,
  onCreate,
  onRetry,
  onSearch,
  className,
}) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-sidebar", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-3">
        <Link to="/" className="inline-flex min-w-0 items-center gap-2">
          <PenLine className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate font-display text-lg leading-none">Note</span>
        </Link>
        <Button size="sm" onClick={onCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New
        </Button>
      </div>

      <div className="px-3 py-3">
        <button
          type="button"
          onClick={onSearch}
          className="flex h-10 w-full items-center gap-2 rounded-lg border border-sidebar-border bg-surface px-3 text-sm text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:text-foreground"
        >
          <Search className="size-4 shrink-0" aria-hidden="true" />
          <span className="flex-1 text-left">Search notes</span>
          <ShortcutHint keys={["mod", "k"]} />
        </button>
      </div>

      <nav aria-label="Notes" className="min-h-0 flex-1 overflow-y-auto">
        <NoteList
          notes={notes}
          selectedId={selectedId}
          status={status}
          online={online}
          firstLaunch={firstLaunch}
          onCreate={onCreate}
          onRetry={onRetry}
        />
      </nav>

      <div className="flex items-center justify-between border-t border-sidebar-border px-3 py-2.5">
        <span className="text-xs text-muted-foreground">
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </span>
        <ThemeToggle />
      </div>
    </div>
  );
}