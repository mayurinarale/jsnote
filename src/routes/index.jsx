import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { LoadingState } from "@/components/states/LoadingState";
import { useNotesStore } from "@/app/stores/useNotesStore";
import { WorkspaceShell } from "@/features/notes/WorkspaceShell";
import { useNotesWorkspace } from "@/features/notes/useNotesWorkspace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Your notes — jsnote" },
      {
        name: "description",
        content:
          "Open jsnote and start typing. Notes save to your device instantly — no folders, no setup, no save button.",
      },
      { property: "og:title", content: "Your notes — jsnote" },
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
  const navigate = useNavigate();
  const createNote = useNotesStore((state) => state.createNote);
  const rawNotes = useNotesStore((state) => state.notes);
  const handled = useRef(false);

  // Open → Type: land straight in a writable note, never on a chooser screen.
  useEffect(() => {
    if (handled.current) return;
    if (workspace.status !== "ready") return;
    handled.current = true;

    // Prefer a note with content; otherwise open (or reuse) a blank draft.
    const withContent = rawNotes.find((note) => note.body.trim());
    const target = withContent ?? createNote();
    navigate({ to: "/app/n/$id", params: { id: target.id }, replace: true });
  }, [createNote, navigate, rawNotes, workspace.status]);

  return (
    <WorkspaceShell workspace={workspace} selectedId={null} showListOnMobile={false}>
      <LoadingState rows={3} label="Opening your note" />
    </WorkspaceShell>
  );
}
