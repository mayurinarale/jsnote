import { createFileRoute } from "@tanstack/react-router";
import { FileText, Plus } from "lucide-react";

import { EmptyState } from "@/components/states/EmptyState";
import { Button } from "@/components/ui/Button";
import { ShortcutHint } from "@/components/ui/ShortcutHint";
import { WorkspaceShell } from "@/features/notes/WorkspaceShell";
import { useNotesWorkspace } from "@/features/notes/useNotesWorkspace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Your notes — QuickNote" },
      {
        name: "description",
        content:
          "Open QuickNote and start typing. Notes save to your device instantly — no folders, no setup, no save button.",
      },
      { property: "og:title", content: "Your notes — QuickNote" },
      {
        property: "og:description",
        content: "Open. Type. Done. A frictionless notes workspace that works offline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotesHome,
});

function NotesHome() {
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
