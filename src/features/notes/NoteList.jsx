import { FileText, Plus, WifiOff } from "lucide-react";

import { NoteListItem } from "./NoteListItem";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { Button } from "@/components/ui/Button";
import { ShortcutHint } from "@/components/ui/ShortcutHint";

/**
 * Note list with every state the blueprint requires: loading, error, first
 * launch, empty, offline-and-empty, and populated.
 *
 * @param {{
 *  notes: import("@/lib/db").Note[],
 *  selectedId: string|null,
 *  status: string,
 *  online: boolean,
 *  firstLaunch: boolean,
 *  onCreate: () => void,
 *  onRetry: () => void
 * }} props
 */
export function NoteList({ notes, selectedId, status, online, firstLaunch, onCreate, onRetry }) {
  if (status === "loading" || status === "idle") return <LoadingState />;
  if (status === "error") return <ErrorState onRetry={onRetry} />;

  if (notes.length === 0) {
    if (!online) {
      return (
        <EmptyState
          icon={WifiOff}
          title="You're offline"
          description="You can still write. Everything stays on this device until you reconnect."
          action={<Button onClick={onCreate}>New note</Button>}
        />
      );
    }
    return (
      <EmptyState
        icon={FileText}
        title={firstLaunch ? "Welcome to Note" : "No notes yet"}
        description={
          firstLaunch
            ? "One keystroke from thought to text. Start with an empty page."
            : "Create a note and start typing — nothing else to set up."
        }
        action={
          <Button onClick={onCreate}>
            <Plus className="size-4" aria-hidden="true" />
            New note
          </Button>
        }
        hint={
          <span className="inline-flex items-center gap-1.5">
            or press <ShortcutHint keys={["mod", "n"]} />
          </span>
        }
      />
    );
  }

  return (
    <ul aria-label="Your notes" className="flex flex-col gap-0.5 p-2">
      {notes.map((note) => (
        <NoteListItem key={note.id} note={note} active={note.id === selectedId} />
      ))}
    </ul>
  );
}