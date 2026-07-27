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
  const previewMode = useUiStore((state) => state.previewMode);
  const togglePreview = useUiStore((state) => state.togglePreview);
  const pushToast = useUiStore((state) => state.pushToast);

  const handleChange = useCallback(
    (body) => updateNoteBody(id, body),
    [id, updateNoteBody],
  );

  const handleDelete = useCallback(async () => {
    setConfirmingDelete(false);
    await deleteNote(id);
    pushToast({ title: "Note deleted", tone: "destructive" });
    navigate({ to: "/app" });
  }, [deleteNote, id, navigate, pushToast]);

  let body;
  if (workspace.status === "loading" || workspace.status === "idle") {
    body = <LoadingState rows={3} label="Opening note" />;
  } else if (!note) {
    body = (
      <EmptyState
        icon={FileQuestion}
        title="This note isn't here"
        description="It may have been deleted on this device."
        action={<Button onClick={() => navigate({ to: "/app" })}>Back to notes</Button>}
      />
    );
  } else {
    body = (
      <Editor
        note={note}
        saveStatus={workspace.saveStatus}
        previewMode={previewMode}
        onChange={handleChange}
        onTogglePreview={togglePreview}
        onRequestDelete={() => setConfirmingDelete(true)}
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