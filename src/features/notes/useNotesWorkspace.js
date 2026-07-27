import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo } from "react";

import { useUiStore } from "@/app/stores/useUiStore";
import { selectOrderedNotes, useNotesStore } from "@/app/stores/useNotesStore";
import { useHotkeys } from "@/hooks/useHotkeys";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/** ⌘K / ⌘N must still fire while the caret is inside the editor. */
const ALLOW_IN_INPUTS = ["mod+k", "mod+n", "mod+b", "mod+/"];

/**
 * Single integration point between the workspace UI and the stores.
 * Keeping hydration, shortcuts and navigation here prevents the same wiring
 * from being duplicated in the list and editor routes.
 *
 * @param {{selectedId?: string|null}} [options]
 */
export function useNotesWorkspace({ selectedId = null } = {}) {
  const navigate = useNavigate();
  useOnlineStatus();

  // Subscribe to the raw array and sort in a memo: selectOrderedNotes returns
  // a new array each call, which would break zustand's snapshot caching.
  const rawNotes = useNotesStore((state) => state.notes);
  const notes = useMemo(() => selectOrderedNotes({ notes: rawNotes }), [rawNotes]);
  const status = useNotesStore((state) => state.status);
  const saveStatus = useNotesStore((state) => state.saveStatus);
  const firstLaunch = useNotesStore((state) => !state.hasLaunchedBefore);
  const hydrate = useNotesStore((state) => state.hydrate);
  const createNote = useNotesStore((state) => state.createNote);
  const selectNote = useNotesStore((state) => state.selectNote);

  const online = useUiStore((state) => state.online);
  const searchOpen = useUiStore((state) => state.searchOpen);
  const searchQuery = useUiStore((state) => state.searchQuery);
  const openSearch = useUiStore((state) => state.openSearch);
  const closeSearch = useUiStore((state) => state.closeSearch);
  const setSearchQuery = useUiStore((state) => state.setSearchQuery);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    selectNote(selectedId);
  }, [selectedId, selectNote]);

  const handleCreate = useCallback(() => {
    const note = createNote();
    navigate({ to: "/app/n/$id", params: { id: note.id } });
  }, [createNote, navigate]);

  const bindings = useMemo(
    () => ({
      "mod+k": openSearch,
      "mod+n": handleCreate,
      "mod+b": toggleSidebar,
      "mod+/": openSearch,
    }),
    [handleCreate, openSearch, toggleSidebar],
  );

  useHotkeys(bindings, { allowInInputs: ALLOW_IN_INPUTS });

  return {
    notes,
    status,
    saveStatus,
    firstLaunch,
    online,
    searchOpen,
    searchQuery,
    openSearch,
    closeSearch,
    setSearchQuery,
    handleCreate,
    retry: hydrate,
  };
}