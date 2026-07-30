import { Share2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { SaveStatus } from "./SaveStatus";
import { ShareDialog } from "./ShareDialog";
import { BrandMark } from "@/components/BrandMark";
import { IconButton } from "@/components/ui/IconButton";
import {
  continueChecklistOnEnter,
  toggleChecklistAtOffset,
} from "@/lib/checklist";
import { countWords } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Write-first editor. One surface: type. Notes live in the right rail.
 *
 * @param {{
 *  note: import("@/lib/db").Note,
 *  saveStatus: "saved"|"saving"|"pending",
 *  onChange: (body: string) => void,
 *  onRequestDelete: () => void,
 *  onShared: (meta: { shareId: string, shareRevokeToken: string, sharedAt: number }) => void,
 *  onShareRevoked: () => void,
 * }} props
 */
export function Editor({
  note,
  saveStatus,
  onChange,
  onRequestDelete,
  onShared,
  onShareRevoked,
}) {
  const textareaRef = useRef(null);
  const [shareOpen, setShareOpen] = useState(false);

  // Open → Type: the caret lands in the body the moment a note is opened.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.setSelectionRange(el.value.length, el.value.length);
  }, [note.id]);

  const applyEdit = useCallback(
    (next) => {
      if (!next) return;
      onChange(next.body);
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus({ preventScroll: true });
        el.setSelectionRange(next.selection, next.selection);
      });
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (event) => {
      const el = event.currentTarget;

      // ⌘/Ctrl+Enter — toggle or create a checklist on the current line.
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        applyEdit(toggleChecklistAtOffset(el.value, el.selectionStart));
        return;
      }

      if (event.key === "Enter" && !event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const next = continueChecklistOnEnter(el.value, el.selectionStart, el.selectionEnd);
        if (!next) return;
        event.preventDefault();
        applyEdit(next);
      }
    },
    [applyEdit],
  );

  const words = countWords(note.body);
  const isShared = Boolean(note.shareId);

  return (
    <section aria-label="Note editor" className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-4">
        <BrandMark size="sm" className="hidden min-w-0 md:inline-flex" />
        <span className="md:hidden" />
        <div className="flex items-center gap-1">
          <IconButton
            label={isShared ? "Manage shared link" : "Share note"}
            size="sm"
            onClick={() => setShareOpen(true)}
            className={cn(isShared && "text-primary")}
          >
            <Share2 className="size-4" aria-hidden="true" />
          </IconButton>
          <IconButton label="Delete note" size="sm" onClick={onRequestDelete}>
            <Trash2 className="size-4" aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[68ch] px-5 pb-24 pt-2 sm:px-8">
          <label htmlFor="note-body" className="sr-only-focusable">
            Note body
          </label>
          <textarea
            id="note-body"
            ref={textareaRef}
            autoFocus
            value={note.body}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck
            placeholder="Start typing…"
            className="min-h-[60vh] w-full resize-none border-0 bg-transparent font-reading text-[1.0625rem] leading-8 text-foreground caret-primary outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-border px-4 py-2 text-xs text-muted-foreground">
        <span className="min-w-0 truncate">
          {words} {words === 1 ? "word" : "words"}
          <span className="text-muted-foreground/80"> · ⌘↵ checklist</span>
          {isShared ? <span className="text-primary/90"> · shared</span> : null}
        </span>
        <SaveStatus status={saveStatus} />
      </footer>

      <ShareDialog
        open={shareOpen}
        note={note}
        onClose={() => setShareOpen(false)}
        onShared={(meta) => {
          onShared(meta);
        }}
        onRevoked={() => {
          onShareRevoked();
        }}
      />
    </section>
  );
}
