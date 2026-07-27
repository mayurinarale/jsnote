import { ShortcutHint } from "@/components/ui/ShortcutHint";

/** Every shortcut wired in the workspace, mirrored here so it can be learned before entering. */
const SHORTCUTS = [
  { keys: ["mod", "n"], label: "New note" },
  { keys: ["mod", "k"], label: "Search notes" },
  { keys: ["mod", "b"], label: "Toggle the notes list" },
  { keys: ["escape"], label: "Close search" },
];

/** Keyboard-first proof: the whole product surface, listed as keys. */
export function ShortcutShowcase() {
  return (
    <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
      {SHORTCUTS.map(({ keys, label }) => (
        <div
          key={label}
          className="flex items-center justify-between gap-4 border-b border-border pb-3"
        >
          <dt className="min-w-0 truncate text-sm text-foreground">{label}</dt>
          <dd className="shrink-0">
            <ShortcutHint keys={keys} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
