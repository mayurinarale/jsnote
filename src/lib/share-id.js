/**
 * Short, URL-safe share ids — readable like 7Kf92mLp, not UUIDs.
 * Omits ambiguous characters (0/O, 1/l/I).
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/**
 * @param {number} [length]
 * @returns {string}
 */
export function createShareId(length = 8) {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

/**
 * Longer secret used only by the author to revoke or refresh a share.
 * @returns {string}
 */
export function createRevokeToken() {
  const bytes = new Uint8Array(24);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Absolute share URL for the current origin.
 * @param {string} id
 * @returns {string}
 */
export function buildShareUrl(id) {
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/s/${id}`;
  }
  return `/s/${id}`;
}
