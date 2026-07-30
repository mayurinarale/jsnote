import { Check, Copy, Link2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { deriveTitle } from "@/lib/format";
import { isBlankNote } from "@/app/stores/useNotesStore";
import { buildShareUrl } from "@/lib/share-id";
import {
  createSharedNote,
  revokeSharedNote,
  updateSharedNote,
} from "@/lib/share.functions";

/**
 * Snapshot share: create a read-only link, copy it, refresh it, or revoke it.
 *
 * @param {{
 *  open: boolean,
 *  note: import("@/lib/db").Note,
 *  onClose: () => void,
 *  onShared: (meta: { shareId: string, shareRevokeToken: string, sharedAt: number }) => void,
 *  onRevoked: () => void,
 * }} props
 */
export function ShareDialog({ open, note, onClose, onShared, onRevoked }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const isShared = Boolean(note.shareId && note.shareRevokeToken);
  const url = note.shareId ? buildShareUrl(note.shareId) : "";
  const blank = isBlankNote(note);

  useEffect(() => {
    if (!open) {
      setError(null);
      setCopied(false);
      setBusy(false);
    }
  }, [open]);

  const copyLink = useCallback(async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy — select the link and copy manually.");
    }
  }, []);

  const handleCreate = useCallback(async () => {
    if (blank) {
      setError("Write something before sharing.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await createSharedNote({
        data: { body: note.body, title: deriveTitle(note.body) },
      });
      onShared({
        shareId: result.id,
        shareRevokeToken: result.revokeToken,
        sharedAt: result.createdAt,
      });
      await copyLink(buildShareUrl(result.id));
    } catch (cause) {
      console.error(cause);
      setError("Couldn't create a share link. Try again.");
    } finally {
      setBusy(false);
    }
  }, [blank, copyLink, note.body, onShared]);

  const handleUpdate = useCallback(async () => {
    if (blank || !note.shareId || !note.shareRevokeToken) return;
    setBusy(true);
    setError(null);
    try {
      const result = await updateSharedNote({
        data: {
          id: note.shareId,
          revokeToken: note.shareRevokeToken,
          body: note.body,
          title: deriveTitle(note.body),
        },
      });
      onShared({
        shareId: note.shareId,
        shareRevokeToken: note.shareRevokeToken,
        sharedAt: result.updatedAt,
      });
    } catch (cause) {
      console.error(cause);
      setError("Couldn't update the shared snapshot.");
    } finally {
      setBusy(false);
    }
  }, [blank, note.body, note.shareId, note.shareRevokeToken, onShared]);

  const handleRevoke = useCallback(async () => {
    if (!note.shareId || !note.shareRevokeToken) return;
    setBusy(true);
    setError(null);
    try {
      await revokeSharedNote({
        data: { id: note.shareId, revokeToken: note.shareRevokeToken },
      });
      onRevoked();
    } catch (cause) {
      console.error(cause);
      setError("Couldn't stop sharing. Try again.");
    } finally {
      setBusy(false);
    }
  }, [note.shareId, note.shareRevokeToken, onRevoked]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isShared ? "Shared link" : "Share this note"}
      description={
        isShared
          ? "Anyone with the link can read a snapshot of this note. They can't edit it."
          : "Creates a read-only link. No account needed for readers."
      }
    >
      {blank ? (
        <p className="text-sm text-muted-foreground">Write a few words first — empty notes can't be shared.</p>
      ) : null}

      {isShared ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
            <Link2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              readOnly
              value={url}
              aria-label="Share link"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
              onFocus={(event) => event.currentTarget.select()}
            />
            <Button size="sm" variant="secondary" onClick={() => copyLink(url)} disabled={busy}>
              {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Snapshot from{" "}
            {note.sharedAt
              ? new Date(note.sharedAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "earlier"}
            . Updating replaces what readers see.
          </p>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        {isShared ? (
          <>
            <Button variant="secondary" onClick={handleUpdate} disabled={busy || blank}>
              <RefreshCw className="size-4" aria-hidden="true" />
              Update snapshot
            </Button>
            <Button variant="danger" onClick={handleRevoke} disabled={busy}>
              Stop sharing
            </Button>
          </>
        ) : (
          <Button onClick={handleCreate} disabled={busy || blank}>
            <Link2 className="size-4" aria-hidden="true" />
            {busy ? "Creating…" : "Create link"}
          </Button>
        )}
      </div>
    </Dialog>
  );
}
