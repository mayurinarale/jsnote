import { Eye, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";

import { SaveStatus } from "./SaveStatus";
import { IconButton } from "@/components/ui/IconButton";
import { countWords } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Editor shell. No markdown rendering yet (blueprint: phase 2) — this phase
 * owns typography, rhythm, cursor behaviour and the status furniture.
 *
 * @param {{
 *  note: import("@/lib/db").Note,
 *  saveStatus: "saved"|"saving"|"pending",
 *  previewMode: boolean,
 *  onChange: (body: string) => void,
 *  onTogglePreview: () => void,
 *  onRequestDelete: () => void
 * }} props
 */
export function Editor({
  note,
  saveStatus,
  previewMode,
  onChange,
  onTogglePreview,
  onRequestDelete,
}) {
  const textareaRef = useRef(null);

  // Open → Type: the caret lands in the body the moment a note is opened.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el || previewMode) return;
    el.focus({ preventScroll: true });
    el.setSelectionRange(el.value.length, el.value.length);
  }, [note.id, previewMode]);

  const words = countWords(note.body);

  return (
    <section aria-label="Note editor" className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-end gap-1 px-3 py-2">
        <IconButton
          label={previewMode ? "Switch to writing" : "Preview note"}
          size="sm"
          aria-pressed={previewMode}
          onClick={onTogglePreview}
          className={cn(previewMode && "bg-accent text-accent-foreground")}
        >
          <Eye className="size-4" aria-hidden="true" />
        </IconButton>
        <IconButton label="Delete note" size="sm" onClick={onRequestDelete}>
          <Trash2 className="size-4" aria-hidden="true" />
        </IconButton>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[68ch] px-5 pb-24 pt-2 sm:px-8">
          {previewMode ? (
            <div className="whitespace-pre-wrap font-reading text-[1.0625rem] leading-8 text-foreground">
              {note.body || <span className="text-muted-foreground">Nothing to preview yet.</span>}
            </div>
          ) : (
            <>
              <label htmlFor="note-body" className="sr-only-focusable">
                Note body
              </label>
              <textarea
                id="note-body"
                ref={textareaRef}
                autoFocus
                value={note.body}
                onChange={(event) => onChange(event.target.value)}
                spellCheck
                placeholder="Start typing…"
                className="min-h-[60vh] w-full resize-none border-0 bg-transparent font-reading text-[1.0625rem] leading-8 text-foreground caret-primary outline-none placeholder:text-muted-foreground"
              />
            </>
          )}
        </div>
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-border px-4 py-2 text-xs text-muted-foreground">
        <span>
          {words} {words === 1 ? "word" : "words"}
        </span>
        <SaveStatus status={saveStatus} />
      </footer>
    </section>
  );
}