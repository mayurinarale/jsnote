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

/**
 * Notes domain state. Owns the local source of truth (IndexedDB) and the
 * dirty queue that a future sync engine will drain.
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
  hasLaunchedBefore: true,

  /** Loads notes from IndexedDB. Safe to call more than once. */
  hydrate: async () => {
    if (get().status === "loading") return;
    set({ status: "loading", error: null });
    try {
      const [notes, launched] = await Promise.all([
        readNotes(),
        readValue("meta", "hasLaunchedBefore"),
      ]);
      set({ notes, status: "ready", hasLaunchedBefore: Boolean(launched) });
      if (!launched) await writeValue("meta", "hasLaunchedBefore", true);
    } catch (cause) {
      console.error(cause);
      set({ status: "error", error: "We couldn't open your local notes storage." });
    }
  },

  /**
   * Creates an empty note and selects it. Zero friction is the product.
   * @returns {Note}
   */
  createNote: () => {
    const now = Date.now();
    /** @type {Note} */
    const note = { id: createId(), body: "", createdAt: now, updatedAt: now, pinned: false, deleted: false };
    set((state) => ({ notes: [note, ...state.notes], selectedId: note.id }));
    void writeNote(note);
    void enqueueOperation({ type: "create", noteId: note.id, payload: note });
    return note;
  },

  /**
   * Applies an edit optimistically, then debounces persistence.
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
          await writeNote(note);
          await enqueueOperation({ type: "update", noteId: id, payload: { body: note.body, updatedAt: note.updatedAt } });
          set((state) => {
            const dirtyQueue = state.dirtyQueue.filter((queued) => queued !== id);
            return { dirtyQueue, saveStatus: dirtyQueue.length ? "pending" : "saved" };
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
    const remaining = get().notes.filter((note) => note.id !== id);
    set((state) => ({
      notes: remaining,
      selectedId: state.selectedId === id ? (remaining[0]?.id ?? null) : state.selectedId,
      dirtyQueue: state.dirtyQueue.filter((queued) => queued !== id),
    }));
    await removeNote(id);
    await enqueueOperation({ type: "delete", noteId: id, payload: { deletedAt: Date.now() } });
  },

  /** @param {string|null} selectedId */
  selectNote: (selectedId) => set({ selectedId }),

  /** @param {string} id */
  togglePinned: (id) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned } : note,
      ),
    }));
    const note = get().notes.find((item) => item.id === id);
    if (note) void writeNote(note);
  },
}));

/**
 * Sorted view: pinned first, then most recently updated.
 * Defined as a stable selector so components don't re-sort on every render.
 * @param {{notes: Note[]}} state
 * @returns {Note[]}
 */
export const selectOrderedNotes = (state) =>
  [...state.notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);