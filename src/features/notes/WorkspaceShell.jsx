import { Link } from "@tanstack/react-router";
import { ArrowLeft, Menu, PenLine, Plus, Search } from "lucide-react";
import { useEffect } from "react";

import { SearchOverlay } from "./SearchOverlay";
import { Sidebar } from "./Sidebar";
import { IconButton } from "@/components/ui/IconButton";
import { useUiStore } from "@/app/stores/useUiStore";
import { useIsDesktop, useIsMobileViewport } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

/**
 * Responsive workspace chrome.
 * Desktop  → persistent two-pane layout.
 * Tablet   → collapsible sidebar overlaying the pane.
 * Mobile   → list and editor are separate screens (routing decides which is
 *            visible) plus a floating action button.
 *
 * @param {{
 *  workspace: ReturnType<typeof import("./useNotesWorkspace").useNotesWorkspace>,
 *  selectedId: string|null,
 *  showListOnMobile: boolean,
 *  children: React.ReactNode
 * }} props
 */
export function WorkspaceShell({ workspace, selectedId, showListOnMobile, children }) {
  const {
    notes,
    status,
    online,
    firstLaunch,
    searchOpen,
    searchQuery,
    openSearch,
    closeSearch,
    setSearchQuery,
    handleCreate,
    retry,
  } = workspace;

  const isDesktop = useIsDesktop();
  const isMobile = useIsMobileViewport();
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  // On tablet the sidebar overlays content, so it starts closed.
  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop, setSidebarOpen]);

  const sidebar = (
    <Sidebar
      notes={notes}
      selectedId={selectedId}
      status={status}
      online={online}
      firstLaunch={firstLaunch}
      onCreate={handleCreate}
      onRetry={retry}
      onSearch={openSearch}
    />
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <a href="#workspace-main" className="sr-only-focusable m-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">
        Skip to content
      </a>

      <div className="flex min-h-0 flex-1">
        {/* Desktop / tablet sidebar */}
        {!isMobile ? (
          <aside
            aria-label="Notes sidebar"
            className={cn(
              "z-30 h-full w-[19rem] shrink-0 border-r border-sidebar-border",
              isDesktop ? "static" : "absolute inset-y-0 left-0 shadow-overlay",
              !sidebarOpen && !isDesktop && "hidden",
            )}
          >
            {sidebar}
          </aside>
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Compact header: tablet toggle + mobile actions */}
          {!isDesktop ? (
            <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-2 py-2">
              {isMobile && !showListOnMobile ? (
                <Link
                  to="/"
                  aria-label="Back to all notes"
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <ArrowLeft className="size-5" aria-hidden="true" />
                </Link>
              ) : isMobile ? (
                <span className="inline-flex items-center gap-2 px-2">
                  <PenLine className="size-4 text-primary" aria-hidden="true" />
                  <span className="font-display text-lg leading-none">QuickNote</span>
                </span>
              ) : (
                <IconButton label={sidebarOpen ? "Hide notes list" : "Show notes list"} onClick={toggleSidebar}>
                  <Menu className="size-5" aria-hidden="true" />
                </IconButton>
              )}
              <span />
              <IconButton label="Search notes" onClick={openSearch}>
                <Search className="size-5" aria-hidden="true" />
              </IconButton>
            </header>
          ) : null}

          <main id="workspace-main" className="min-h-0 flex-1 overflow-hidden">
            {isMobile && showListOnMobile ? (
              <div className="h-full overflow-y-auto">{sidebar}</div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>

      {/* Mobile floating action button */}
      {isMobile && showListOnMobile ? (
        <button
          type="button"
          onClick={handleCreate}
          aria-label="New note"
          className="fixed bottom-6 right-5 z-40 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-overlay transition-transform duration-[var(--duration-fast)] active:scale-95"
        >
          <Plus className="size-6" aria-hidden="true" />
        </button>
      ) : null}

      <SearchOverlay
        open={searchOpen}
        query={searchQuery}
        notes={notes}
        onQueryChange={setSearchQuery}
        onClose={closeSearch}
      />
    </div>
  );
}