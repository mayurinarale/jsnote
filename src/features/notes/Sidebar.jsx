import { Plus, Search } from "lucide-react";

import { NoteList } from "./NoteList";
import { IconButton } from "@/components/ui/IconButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

/**
 * Slim notes rail: every saved note, ready to open without leaving the page.
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
      <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-3 py-2.5">
        <p className="truncate text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Notes
        </p>
        <div className="flex items-center gap-0.5">
          <IconButton label="Search notes" size="sm" onClick={onSearch}>
            <Search className="size-4" aria-hidden="true" />
          </IconButton>
          <IconButton label="New note" size="sm" onClick={onCreate}>
            <Plus className="size-4" aria-hidden="true" />
          </IconButton>
        </div>
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

      <div className="flex items-center justify-between border-t border-sidebar-border px-2.5 py-2">
        <span className="text-xs text-muted-foreground">
          {notes.length}
        </span>
        <ThemeToggle />
      </div>
    </div>
  );
}
