import { openDB } from "idb";

/**
 * @typedef {Object} Note
 * @property {string} id
 * @property {string} body
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {boolean} pinned
 * @property {boolean} deleted soft delete, so sync can propagate tombstones
 */

/**
 * @typedef {Object} PendingOperation
 * @property {number} [seq] auto-increment key
 * @property {"create"|"update"|"delete"} type
 * @property {string} noteId
 * @property {number} queuedAt
 * @property {Object} payload
 */

const DB_NAME = "quicknote";
const DB_VERSION = 1;

export const STORE = {
  notes: "notes",
  meta: "meta",
  settings: "settings",
  pending: "pending_operations",
};

let dbPromise;

/** IndexedDB is browser-only; SSR must never touch it. */
function isBrowser() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

/**
 * Lazily opens (and upgrades) the QuickNote database.
 * @returns {Promise<import("idb").IDBPDatabase|null>}
 */
export function getDb() {
  if (!isBrowser()) return Promise.resolve(null);
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE.notes)) {
          const notes = db.createObjectStore(STORE.notes, { keyPath: "id" });
          notes.createIndex("updatedAt", "updatedAt");
          notes.createIndex("deleted", "deleted");
        }
        if (!db.objectStoreNames.contains(STORE.meta)) {
          db.createObjectStore(STORE.meta, { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains(STORE.settings)) {
          db.createObjectStore(STORE.settings, { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains(STORE.pending)) {
          const pending = db.createObjectStore(STORE.pending, {
            keyPath: "seq",
            autoIncrement: true,
          });
          pending.createIndex("noteId", "noteId");
        }
      },
    });
  }
  return dbPromise;
}

/* ------------------------------ notes ------------------------------ */

/** @returns {Promise<Note[]>} live (non-deleted) notes, newest first */
export async function readNotes() {
  const db = await getDb();
  if (!db) return [];
  const all = await db.getAll(STORE.notes);
  return all.filter((note) => !note.deleted).sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * @param {Note} note
 * @returns {Promise<void>}
 */
export async function writeNote(note) {
  const db = await getDb();
  if (db) await db.put(STORE.notes, note);
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function removeNote(id) {
  const db = await getDb();
  if (db) await db.delete(STORE.notes, id);
}

/* --------------------------- key/value stores --------------------------- */

/**
 * @param {"meta"|"settings"} storeName
 * @param {string} key
 * @returns {Promise<unknown>}
 */
export async function readValue(storeName, key) {
  const db = await getDb();
  if (!db) return undefined;
  const row = await db.get(STORE[storeName], key);
  return row?.value;
}

/**
 * @param {"meta"|"settings"} storeName
 * @param {string} key
 * @param {unknown} value
 */
export async function writeValue(storeName, key, value) {
  const db = await getDb();
  if (db) await db.put(STORE[storeName], { key, value });
}

/* -------------------------- pending operations -------------------------- */

/**
 * Queues a mutation for the future sync engine. Writing the intent — not just
 * the result — is what makes offline-first synchronisation possible later.
 * @param {Omit<PendingOperation, "seq"|"queuedAt">} operation
 */
export async function enqueueOperation(operation) {
  const db = await getDb();
  if (db) await db.add(STORE.pending, { ...operation, queuedAt: Date.now() });
}

/** @returns {Promise<PendingOperation[]>} */
export async function readPendingOperations() {
  const db = await getDb();
  if (!db) return [];
  return db.getAll(STORE.pending);
}

/** @param {number} seq */
export async function dequeueOperation(seq) {
  const db = await getDb();
  if (db) await db.delete(STORE.pending, seq);
}