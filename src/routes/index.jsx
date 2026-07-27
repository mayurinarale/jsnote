import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Keyboard, PenLine, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ShortcutHint } from "@/components/ui/ShortcutHint";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QuickNote — Open. Type. Done." },
      {
        name: "description",
        content:
          "QuickNote is a frictionless thinking tool. No folders, no setup, no ceremony — just a page that's ready before you are.",
      },
      { property: "og:title", content: "QuickNote — Open. Type. Done." },
      {
        property: "og:description",
        content: "A frictionless thinking tool. No folders, no setup — just write.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  {
    icon: Keyboard,
    title: "Keyboard first",
    body: "New note, search, theme — every action has a key. Your hands never leave home row.",
  },
  {
    icon: WifiOff,
    title: "Works offline",
    body: "Notes are written to your device first. Losing signal changes nothing about writing.",
  },
  {
    icon: PenLine,
    title: "No ceremony",
    body: "No titles to invent, no folder to choose, no save button to find. Type and it's kept.",
  },
];

function Landing() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <span className="inline-flex min-w-0 items-center gap-2">
          <PenLine className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate font-display text-xl leading-none">QuickNote</span>
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Link to="/app">
            <Button size="sm">Open QuickNote</Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto w-full max-w-3xl px-5 pb-16 pt-16 text-center sm:px-8 sm:pt-24">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            A thinking tool, not a filing cabinet
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl">
            Open. Type. Done.
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-reading text-lg leading-8 text-muted-foreground">
            Most note apps ask you to organise before you think. QuickNote gives you a
            page that's already waiting — and gets out of the way for good.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3">
            <Link to="/app">
              <Button size="lg">
                Start writing
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              then press <ShortcutHint keys={["mod", "n"]} /> for a new note
            </span>
          </div>
        </section>

        <section
          aria-label="Why QuickNote"
          className="mx-auto grid w-full max-w-5xl gap-4 px-5 pb-24 sm:grid-cols-3 sm:px-8"
        >
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <article key={title} className="rounded-2xl border border-border bg-surface p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-secondary text-muted-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-base font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto w-full max-w-5xl px-5 py-6 text-xs text-muted-foreground sm:px-8">
          Your notes are stored on this device. Nothing is uploaded.
        </div>
      </footer>
    </div>
  );
}