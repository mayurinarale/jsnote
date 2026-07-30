/**
 * GFM task-list helpers.
 * Checklists live in the note source as `- [ ]` / `- [x]` so preview toggles
 * and keyboard edits stay one source of truth.
 */

/** Matches a GFM task list item; capture groups: indent+bullet, mark, rest. */
export const TASK_LINE_RE = /^(\s*[-*+]\s+)\[([ xX])\](.*)$/;

/**
 * Toggles the Nth task-list item in document order (0-based).
 * Used by preview checkboxes, which emit indices in render order.
 * @param {string} body
 * @param {number} index
 * @returns {string}
 */
export function toggleChecklistItem(body, index) {
  if (!body || index < 0) return body;

  let seen = -1;
  const lines = body.split("\n");

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(TASK_LINE_RE);
    if (!match) continue;
    seen += 1;
    if (seen !== index) continue;

    const next = match[2].toLowerCase() === "x" ? " " : "x";
    lines[i] = `${match[1]}[${next}]${match[3]}`;
    return lines.join("\n");
  }

  return body;
}

/**
 * Locates the line containing `offset` in `body`.
 * @param {string} body
 * @param {number} offset
 * @returns {{ start: number, end: number, line: string, lineIndex: number }}
 */
export function lineAtOffset(body, offset) {
  const safe = Math.max(0, Math.min(offset, body.length));
  const start = body.lastIndexOf("\n", safe - 1) + 1;
  const newline = body.indexOf("\n", safe);
  const end = newline === -1 ? body.length : newline;
  const lineIndex = body.slice(0, start).split("\n").length - 1;
  return { start, end, line: body.slice(start, end), lineIndex };
}

/**
 * Toggles the task mark on the line under the caret.
 * If the line is not a task, converts it into an unchecked task item.
 * @param {string} body
 * @param {number} offset caret position
 * @returns {{ body: string, selection: number } | null}
 */
export function toggleChecklistAtOffset(body, offset) {
  const { start, end, line } = lineAtOffset(body, offset);
  const task = line.match(TASK_LINE_RE);

  if (task) {
    const next = task[2].toLowerCase() === "x" ? " " : "x";
    const nextLine = `${task[1]}[${next}]${task[3]}`;
    const nextBody = body.slice(0, start) + nextLine + body.slice(end);
    const delta = nextLine.length - line.length;
    return { body: nextBody, selection: offset + delta };
  }

  const indent = line.match(/^\s*/)?.[0] ?? "";
  const content = line.slice(indent.length).replace(/^[-*+]\s+/, "");
  const nextLine = `${indent}- [ ] ${content}`;
  const nextBody = body.slice(0, start) + nextLine + body.slice(end);
  const caret = start + nextLine.length;
  return { body: nextBody, selection: caret };
}

/**
 * Continues (or exits) a checklist when Enter is pressed on a task line.
 * Empty task → leave the list. Otherwise → insert a fresh unchecked item.
 * @param {string} body
 * @param {number} selectionStart
 * @param {number} selectionEnd
 * @returns {{ body: string, selection: number } | null}
 */
export function continueChecklistOnEnter(body, selectionStart, selectionEnd) {
  if (selectionStart !== selectionEnd) return null;

  const { start, end, line } = lineAtOffset(body, selectionStart);
  const task = line.match(TASK_LINE_RE);
  if (!task) return null;

  const content = task[3].replace(/^\s*/, "");
  // Empty item: exit the list — replace the line with a blank one.
  if (!content) {
    const nextBody = body.slice(0, start) + body.slice(end);
    return { body: nextBody, selection: start };
  }

  const indent = task[1].match(/^\s*/)?.[0] ?? "";
  const insert = `\n${indent}- [ ] `;
  const nextBody = body.slice(0, selectionStart) + insert + body.slice(selectionEnd);
  return { body: nextBody, selection: selectionStart + insert.length };
}
