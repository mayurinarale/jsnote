import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ShortcutHint } from "@/components/ui/ShortcutHint";
import { derivePreview, deriveTitle } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Command-palette style search. UI + keyboard model only in this phase:
 * matching is a simple local substring filter and will be replaced by the
 * indexed search service when the backend lands.
 *
 * @param {{
 *  open: boolean,
 *  query: string,
 *  notes: import("@/lib/db").Note[],
 *  onQueryChange: (value: string) => void,
 *  onClose: () => void
 * }} props
 */
export function SearchOverlay({ open, query, notes, onQueryChange, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const restoreRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return notes.slice(0, 8);
    return notes.filter((note) => note.body.toLowerCase().includes(term)).slice(0, 20);
  }, [notes, query]);

  useEffect(() => setActiveIndex(0), [query, open]);

  useEffect(() => {
    if (!open) return undefined;
    restoreRef.current = document.activeElement;
    inputRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      if (restoreRef.current instanceof HTMLElement) restoreRef.current.focus();
    };
  }, [open]);

  if (!open) return null;

  /** @param {import("react").KeyboardEvent} event */
  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      onClose();
      navigate({ to: "/app/n/$id", params: { id: results[activeIndex].id } });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 bg-foreground/25 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search notes"
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-popover shadow-overlay"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={results[activeIndex] ? `search-result-${results[activeIndex].id}` : undefined}
            aria-label="Search notes"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search your notes…"
            className="h-14 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <ShortcutHint keys={["escape"]} />
        </div>

        <ul id="search-results" role="listbox" aria-label="Search results" className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              No notes match “{query.trim()}”.
            </li>
          ) : (
            results.map((note, index) => (
              <li
                key={note.id}
                id={`search-result-${note.id}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  onClose();
                  navigate({ to: "/app/n/$id", params: { id: note.id } });
                }}
                className={cn(
                  "cursor-pointer rounded-lg px-3 py-2.5",
                  index === activeIndex && "bg-accent text-accent-foreground",
                )}
              >
                <p className="truncate text-sm font-medium text-foreground">{deriveTitle(note.body)}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {derivePreview(note.body) || "No additional text"}
                </p>
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShortcutHint keys={["↑", "↓"]} /> navigate
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShortcutHint keys={["enter"]} /> open
          </span>
        </div>
      </div>
    </div>
  );
}