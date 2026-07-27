/**
 * Theme resolution + persistence.
 * @typedef {"light"|"dark"|"system"} ThemePreference
 */

export const THEME_STORAGE_KEY = "quicknote:theme";

/**
 * Applies a preference to the document root.
 * @param {ThemePreference} preference
 */
export function applyTheme(preference) {
  if (typeof document === "undefined") return;
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = preference === "system" ? (prefersDark ? "dark" : "light") : preference;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

/** @returns {ThemePreference} */
export function readStoredTheme() {
  if (typeof localStorage === "undefined") return "system";
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

/** @param {ThemePreference} preference */
export function persistTheme(preference) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  }
}

/**
 * Blocking script injected into <head> so the correct theme class is present
 * before first paint — no flash of incorrect theme.
 * The preference itself is intentionally kept in localStorage (synchronous);
 * IndexedDB is async and cannot run before paint.
 */
export const themeBootstrapScript = `(function(){try{var k='${THEME_STORAGE_KEY}';var p=localStorage.getItem(k)||'system';var d=p==='dark'||(p==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`;