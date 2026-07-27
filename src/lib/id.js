/**
 * Collision-resistant client-side identifiers.
 * Notes are created offline-first, so IDs must be generated locally and remain
 * stable once the backend sync layer arrives.
 * @returns {string}
 */
export function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `n_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}