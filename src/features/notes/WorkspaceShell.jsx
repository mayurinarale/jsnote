import { Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Search } from "lucide-react";

import { SearchOverlay } from "./SearchOverlay";
import { Sidebar } from "./Sidebar";
import { BrandMark } from "@/components/BrandMark";
import { IconButton } from "@/components/ui/IconButton";
import { useIsMobileViewport } from "@/hooks/useMediaQuery";

/**
 * Responsive workspace chrome.
 * Writing stays center-left; saved notes sit in a slim rail on the right.
 * Mobile keeps list and editor as separate screens.
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

  const isMobile = useIsMobileViewport();

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
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {isMobile ? (
            <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-2 py-2">
              {!showListOnMobile ? (
                <Link
                  to="/"
                  aria-label="Back to all notes"
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <ArrowLeft className="size-5" aria-hidden="true" />
                </Link>
              ) : (
                <span />
              )}
              {!showListOnMobile ? (
                <BrandMark size="sm" className="justify-center" />
              ) : (
                <span />
              )}
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

        {/* Saved notes — slim column on the right */}
        {!isMobile ? (
          <aside
            aria-label="Your notes"
            className="h-full w-[14.5rem] shrink-0 border-l border-sidebar-border bg-sidebar"
          >
            {sidebar}
          </aside>
        ) : null}
      </div>

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
