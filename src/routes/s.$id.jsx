import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { BrandMark } from "@/components/BrandMark";
import { MarkdownPreview } from "@/features/notes/MarkdownPreview";
import { getSharedNote } from "@/lib/share.functions";

export const Route = createFileRoute("/s/$id")({
  loader: async ({ params }) => {
    const shared = await getSharedNote({ data: { id: params.id } });
    if (!shared) throw notFound();
    return { shared };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.shared?.title ?? "Shared note";
    return {
      meta: [
        { title: `${title} — jsnote` },
        {
          name: "description",
          content: "A read-only note shared with jsnote. No account required.",
        },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: `${title} — jsnote` },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: SharedNotePage,
});

function SharedNotePage() {
  const { shared } = Route.useLoaderData();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-[68ch] items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <BrandMark size="sm" to="/about" />
        <p className="text-xs text-muted-foreground">Read-only</p>
      </header>

      <main className="mx-auto w-full max-w-[68ch] px-5 pb-24 sm:px-8">
        <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">
          {shared.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Shared{" "}
          {new Date(shared.updatedAt || shared.createdAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        <div className="mt-10">
          <MarkdownPreview content={shared.body} />
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[68ch] flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs text-muted-foreground sm:px-8">
          <span>Snapshot · readers can't edit</span>
          <Link to="/" className="text-foreground underline-offset-2 hover:underline">
            Open jsnote
          </Link>
        </div>
      </footer>
    </div>
  );
}
