/**
 * Derives a human title from note body text.
 * Note has no title field by design (Open → Type → Done).
 * @param {string} body
 * @returns {string}
 */
export function deriveTitle(body) {
  const firstLine = (body || "").split("\n").find((line) => line.trim().length > 0);
  if (!firstLine) return "Untitled note";
  return firstLine.trim().replace(/^#+\s*/, "").slice(0, 80);
}

/**
 * One-line preview of the note body, excluding the derived title line.
 * @param {string} body
 * @returns {string}
 */
export function derivePreview(body) {
  const lines = (body || "").split("\n").filter((line) => line.trim().length > 0);
  return lines.slice(1).join(" ").trim().slice(0, 140);
}

/**
 * Word count for the editor footer.
 * @param {string} body
 * @returns {number}
 */
export function countWords(body) {
  const trimmed = (body || "").trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

const RELATIVE = [
  [60_000, "just now"],
  [3_600_000, (ms) => `${Math.floor(ms / 60_000)}m ago`],
  [86_400_000, (ms) => `${Math.floor(ms / 3_600_000)}h ago`],
  [604_800_000, (ms) => `${Math.floor(ms / 86_400_000)}d ago`],
];

/**
 * Compact relative timestamp used in the note list.
 * @param {number} timestamp epoch milliseconds
 * @param {number} [now]
 * @returns {string}
 */
export function formatRelativeTime(timestamp, now = Date.now()) {
  const diff = Math.max(0, now - timestamp);
  for (const [limit, label] of RELATIVE) {
    if (diff < limit) return typeof label === "function" ? label(diff) : label;
  }
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}