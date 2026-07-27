import { createFileRoute } from "@tanstack/react-router";
import { FileText, Plus } from "lucide-react";

import { EmptyState } from "@/components/states/EmptyState";
import { Button } from "@/components/ui/Button";
import { ShortcutHint } from "@/components/ui/ShortcutHint";
import { WorkspaceShell } from "@/features/notes/WorkspaceShell";
import { useNotesWorkspace } from "@/features/notes/useNotesWorkspace";

export const Route = createFileRoute("/app/")({
  component: NotesIndex,
});

function NotesIndex() {
  const workspace = useNotesWorkspace();

  return (
    <WorkspaceShell workspace={workspace} selectedId={null} showListOnMobile>
      <EmptyState
        icon={FileText}
        title="Nothing open"
        description="Pick a note from the list, or start a new one and begin typing."
        action={
          <Button onClick={workspace.handleCreate}>
            <Plus className="size-4" aria-hidden="true" />
            New note
          </Button>
        }
        hint={
          <span className="inline-flex items-center gap-1.5">
            <ShortcutHint keys={["mod", "k"]} /> to search
          </span>
        }
      />
    </WorkspaceShell>
  );
}