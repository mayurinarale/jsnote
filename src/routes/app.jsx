import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Your notes — Note" },
      {
        name: "description",
        content:
          "A distraction-free workspace for fast capture. Your notes stay on this device and are ready the moment you open Note.",
      },
      { property: "og:title", content: "Your notes — Note" },
      {
        property: "og:description",
        content: "A distraction-free workspace for fast capture. Open, type, done.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Outlet />,
});