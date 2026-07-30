import { create } from "zustand";

import {
  enqueueOperation,
  readNotes,
  readValue,
  removeNote,
  writeNote,
  writeValue,
} from "@/lib/db";
import { createId } from "@/lib/id";

/** @typedef {import("@/lib/db").Note} Note */

/** Debounce window for persistence — fast enough to feel instant, slow enough to batch keystrokes. */
const PERSIST_DELAY = 400;

/** @type {Map<string, ReturnType<typeof setTimeout>>} */
const persistTimers = new Map();

/** @param {Note} note */
export function isBlankNote(note) {
  return !(note?.body ?? "").trim();
}

/**
 * Notes domain state. Owns the local source of truth (IndexedDB) and the
 * dirty queue that a future sync engine will drain.
 *
 * Blank pages are drafts: they live in memory until the first real keystroke,
 * so "+" never pollutes the list with Untitled noise.
 */
export const useNotesStore = create((set, get) => ({
  /** @type {Note[]} */
  notes: [],
  /** @type {string|null} */
  selectedId: null,
  status: "idle", // "idle" | "loading" | "ready" | "error"
  /** @type {string|null} */
  error: null,
  /** @type {"saved"|"saving"|"pending"} */
  saveStatus: "saved",
  /** @type {string[]} note ids with unpersisted changes */
  dirtyQueue: [],
  /** @type {Set<string>} ids that exist in IndexedDB */
  persistedIds: new Set(),
  hasLaunchedBefore: true,

  /** Loads notes from IndexedDB. Safe to call more than once. */
  hydrate: async () => {
    if (get().status === "loading") return;
    set({ status: "loading", error: null });
    try {
      const [stored, launched] = await Promise.all([
        readNotes(),
        readValue("meta", "hasLaunchedBefore"),
      ]);

      // Scrub empty leftovers from earlier sessions (they were never useful).
      const notes = [];
      for (const note of stored) {
        if (isBlankNote(note)) {
          await removeNote(note.id);
        } else {
          notes.push(note);
        }
      }

      set({
        notes,
        status: "ready",
        hasLaunchedBefore: Boolean(launched),
        persistedIds: new Set(notes.map((note) => note.id)),
      });
      if (!launched) await writeValue("meta", "hasLaunchedBefore", true);
    } catch (cause) {
      console.error(cause);
      set({ status: "error", error: "We couldn't open your local notes storage." });
    }
  },

  /**
   * Opens a blank page ready to type.
   * Reuses an existing draft instead of stacking Untitled notes.
   * @returns {Note}
   */
  createNote: () => {
    const { notes, selectedId } = get();
    const selected = notes.find((note) => note.id === selectedId);
    if (selected && isBlankNote(selected)) return selected;

    const existingBlank = notes.find(isBlankNote);
    if (existingBlank) {
      set({ selectedId: existingBlank.id, saveStatus: "saved" });
      return existingBlank;
    }

    const now = Date.now();
    /** @type {Note} */
    const note = {
      id: createId(),
      body: "",
      createdAt: now,
      updatedAt: now,
      pinned: false,
      deleted: false,
    };
    set((state) => ({
      notes: [note, ...state.notes.filter((item) => !isBlankNote(item))],
      selectedId: note.id,
      saveStatus: "saved",
    }));
    // Intentionally not written to IndexedDB until the user types.
    return note;
  },

  /**
   * Applies an edit optimistically, then debounces persistence.
   * Empty drafts stay in memory only; the first non-empty body creates the record.
   * @param {string} id
   * @param {string} body
   */
  updateNoteBody: (id, body) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, body, updatedAt: Date.now() } : note,
      ),
      saveStatus: "saving",
      dirtyQueue: state.dirtyQueue.includes(id) ? state.dirtyQueue : [...state.dirtyQueue, id],
    }));

    clearTimeout(persistTimers.get(id));
    persistTimers.set(
      id,
      setTimeout(async () => {
        const note = get().notes.find((item) => item.id === id);
        if (!note) return;

        try {
          const blank = isBlankNote(note);
          const wasPersisted = get().persistedIds.has(id);

          if (blank) {
            if (wasPersisted) {
              await removeNote(id);
              await enqueueOperation({
                type: "delete",
                noteId: id,
                payload: { deletedAt: Date.now() },
              });
              set((state) => {
                const persistedIds = new Set(state.persistedIds);
                persistedIds.delete(id);
                const dirtyQueue = state.dirtyQueue.filter((queued) => queued !== id);
                return {
                  persistedIds,
                  dirtyQueue,
                  saveStatus: dirtyQueue.length ? "pending" : "saved",
                };
              });
            } else {
              set((state) => {
                const dirtyQueue = state.dirtyQueue.filter((queued) => queued !== id);
                return { dirtyQueue, saveStatus: dirtyQueue.length ? "pending" : "saved" };
              });
            }
            return;
          }

          await writeNote(note);
          await enqueueOperation({
            type: wasPersisted ? "update" : "create",
            noteId: id,
            payload: wasPersisted
              ? { body: note.body, updatedAt: note.updatedAt }
              : note,
          });

          set((state) => {
            const persistedIds = new Set(state.persistedIds);
            persistedIds.add(id);
            const dirtyQueue = state.dirtyQueue.filter((queued) => queued !== id);
            return {
              persistedIds,
              dirtyQueue,
              saveStatus: dirtyQueue.length ? "pending" : "saved",
            };
          });
        } catch (cause) {
          console.error(cause);
          set({ saveStatus: "pending", error: "Changes couldn't be saved locally." });
        }
      }, PERSIST_DELAY),
    );
  },

  /** @param {string} id */
  deleteNote: async (id) => {
    clearTimeout(persistTimers.get(id));
    const wasPersisted = get().persistedIds.has(id);
    const remaining = get().notes.filter((note) => note.id !== id);
    set((state) => {
      const persistedIds = new Set(state.persistedIds);
      persistedIds.delete(id);
      return {
        notes: remaining,
        selectedId: state.selectedId === id ? (remaining[0]?.id ?? null) : state.selectedId,
        dirtyQueue: state.dirtyQueue.filter((queued) => queued !== id),
        persistedIds,
      };
    });
    if (wasPersisted) {
      await removeNote(id);
      await enqueueOperation({ type: "delete", noteId: id, payload: { deletedAt: Date.now() } });
    }
  },

  /** @param {string|null} selectedId */
  selectNote: (selectedId) =>
    set((state) => ({
      selectedId,
      // Drop abandoned blank drafts when moving to another note.
      notes: state.notes.filter(
        (note) => note.id === selectedId || !isBlankNote(note),
      ),
    })),

  /** @param {string} id */
  togglePinned: (id) => {
    if (!get().persistedIds.has(id)) return;
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned } : note,
      ),
    }));
    const note = get().notes.find((item) => item.id === id);
    if (note) void writeNote(note);
  },

  /**
   * Persist share credentials on the local note after publishing a snapshot.
   * @param {string} id
   * @param {{ shareId: string, shareRevokeToken: string, sharedAt: number }} meta
   */
  setNoteShare: (id, meta) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id
          ? {
              ...note,
              shareId: meta.shareId,
              shareRevokeToken: meta.shareRevokeToken,
              sharedAt: meta.sharedAt,
            }
          : note,
      ),
    }));
    const note = get().notes.find((item) => item.id === id);
    if (!note) return;
    void writeNote(note).then(() => {
      set((state) => {
        const persistedIds = new Set(state.persistedIds);
        persistedIds.add(id);
        return { persistedIds };
      });
    });
  },

  /** Clears local share metadata after revoke (or failed share cleanup). */
  clearNoteShare: (id) => {
    set((state) => ({
      notes: state.notes.map((note) => {
        if (note.id !== id) return note;
        return {
          id: note.id,
          body: note.body,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          pinned: note.pinned,
          deleted: note.deleted,
        };
      }),
    }));
    const note = get().notes.find((item) => item.id === id);
    if (note && get().persistedIds.has(id)) void writeNote(note);
  },
}));

/**
 * Sorted view: pinned first, then most recently updated.
 * Blank drafts are excluded — they are not "saved notes" yet.
 * @param {{notes: Note[]}} state
 * @returns {Note[]}
 */
export const selectOrderedNotes = (state) =>
  [...state.notes]
    .filter((note) => !isBlankNote(note))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
