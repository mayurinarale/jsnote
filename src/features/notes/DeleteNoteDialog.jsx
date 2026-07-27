import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

/**
 * Destructive confirmation. Deletion is the only irreversible action in
 * QuickNote, so it is the only one that interrupts the writer.
 * @param {{open: boolean, onCancel: () => void, onConfirm: () => void}} props
 */
export function DeleteNoteDialog({ open, onCancel, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title="Delete this note?"
      description="This removes it from this device. It can't be undone."
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Keep note
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </>
      }
    />
  );
}