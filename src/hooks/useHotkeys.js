import { useEffect } from "react";

/**
 * Global keyboard shortcuts. QuickNote is keyboard-first, so bindings live in
 * one place rather than being scattered across components.
 *
 * @param {Record<string, (event: KeyboardEvent) => void>} bindings
 *   keys are normalised combos, e.g. "mod+k", "mod+n", "escape", "/"
 * @param {{enabled?: boolean, allowInInputs?: string[]}} [options]
 */
export function useHotkeys(bindings, options = {}) {
  const { enabled = true, allowInInputs = [] } = options;

  useEffect(() => {
    if (!enabled) return undefined;

    /** @param {KeyboardEvent} event */
    const onKeyDown = (event) => {
      const combo = comboFromEvent(event);
      const handler = bindings[combo];
      if (!handler) return;
      if (isTypingTarget(event.target) && !allowInInputs.includes(combo)) return;
      event.preventDefault();
      handler(event);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bindings, enabled, allowInInputs]);
}

/**
 * @param {KeyboardEvent} event
 * @returns {string}
 */
function comboFromEvent(event) {
  const parts = [];
  if (event.metaKey || event.ctrlKey) parts.push("mod");
  if (event.shiftKey) parts.push("shift");
  if (event.altKey) parts.push("alt");
  parts.push(event.key.toLowerCase());
  return parts.join("+");
}

/** @param {EventTarget|null} target */
function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["input", "textarea", "select"].includes(target.tagName.toLowerCase())
  );
}

/** True on Apple platforms, used to render ⌘ vs Ctrl in shortcut hints. */
export function isAppleDevice() {
  if (typeof navigator === "undefined") return false;
  return /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);
}