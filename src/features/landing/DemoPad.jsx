import { useState } from "react";

import { countWords } from "@/lib/format";

const SEED = "Open → Type → Done.\n\nThis pad is real. Type in it.\nNothing here is saved — your actual notes are.";

/**
 * Live, editable demo of the writing surface used on the landing page.
 * Intentionally ephemeral: it never touches IndexedDB or the notes store, so
 * visitors can try the feel of the editor without creating data.
 */
export function DemoPad() {
  const [body, setBody] = useState(SEED);
  const words = countWords(body);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-overlay">
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
        <span className="size-2.5 rounded-full bg-muted-foreground/30" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" aria-hidden="true" />
        <span className="ml-2 text-xs text-muted-foreground">Try it — no account, no save button</span>
      </div>

      <label htmlFor="demo-pad" className="sr-only-focusable">
        Demo note
      </label>
      <textarea
        id="demo-pad"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        spellCheck
        rows={8}
        placeholder="Start typing…"
        className="w-full resize-none border-0 bg-transparent px-5 py-5 font-reading text-[1.0625rem] leading-8 text-foreground caret-primary outline-none placeholder:text-muted-foreground sm:px-7"
      />

      <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-2 text-xs text-muted-foreground">
        <span>
          {words} {words === 1 ? "word" : "words"}
        </span>
        <span>Demo only — nothing here is stored</span>
      </div>
    </div>
  );
}
