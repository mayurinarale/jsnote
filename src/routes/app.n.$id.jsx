import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileQuestion } from "lucide-react";
import { useCallback, useState } from "react";

import { EmptyState } from "@/components/states/EmptyState";
import { LoadingState } from "@/components/states/LoadingState";
import { Button } from "@/components/ui/Button";
import { useNotesStore } from "@/app/stores/useNotesStore";
import { useUiStore } from "@/app/stores/useUiStore";
import { DeleteNoteDialog } from "@/features/notes/DeleteNoteDialog";
import { Editor } from "@/features/notes/Editor";
import { WorkspaceShell } from "@/features/notes/WorkspaceShell";
import { useNotesWorkspace } from "@/features/notes/useNotesWorkspace";

export const Route = createFileRoute("/app/n/$id")({
  component: NoteRoute,
});

function NoteRoute() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const workspace = useNotesWorkspace({ selectedId: id });
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const note = useNotesStore((state) => state.notes.find((item) => item.id === id));
  const updateNoteBody = useNotesStore((state) => state.updateNoteBody);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const setNoteShare = useNotesStore((state) => state.setNoteShare);
  const clearNoteShare = useNotesStore((state) => state.clearNoteShare);
  const pushToast = useUiStore((state) => state.pushToast);

  const handleChange = useCallback(
    (body) => updateNoteBody(id, body),
    [id, updateNoteBody],
  );

  const handleDelete = useCallback(async () => {
    setConfirmingDelete(false);
    await deleteNote(id);
    pushToast({ title: "Note deleted", tone: "destructive" });
    navigate({ to: "/" });
  }, [deleteNote, id, navigate, pushToast]);

  const handleShared = useCallback(
    (meta) => {
      setNoteShare(id, meta);
      pushToast({ title: "Link ready", description: "Anyone with the link can read this snapshot." });
    },
    [id, pushToast, setNoteShare],
  );

  const handleShareRevoked = useCallback(() => {
    clearNoteShare(id);
    pushToast({ title: "Sharing stopped", description: "The old link no longer works." });
  }, [clearNoteShare, id, pushToast]);

  let body;
  if (workspace.status === "loading" || workspace.status === "idle") {
    body = <LoadingState rows={3} label="Opening note" />;
  } else if (!note) {
    body = (
      <EmptyState
        icon={FileQuestion}
        title="This note isn't here"
        description="It may have been deleted on this device."
        action={<Button onClick={() => navigate({ to: "/" })}>Back to notes</Button>}
      />
    );
  } else {
    body = (
      <Editor
        note={note}
        saveStatus={workspace.saveStatus}
        onChange={handleChange}
        onRequestDelete={() => setConfirmingDelete(true)}
        onShared={handleShared}
        onShareRevoked={handleShareRevoked}
      />
    );
  }

  return (
    <WorkspaceShell workspace={workspace} selectedId={id} showListOnMobile={false}>
      {body}
      <DeleteNoteDialog
        open={confirmingDelete}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={handleDelete}
      />
    </WorkspaceShell>
  );
}