import { useEffect, useState } from "react";

/**
 * SSR-safe media query hook. Returns false on the server and during the first
 * client render, then settles after hydration (no hydration mismatch).
 * @param {string} query
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    onChange();
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Blueprint breakpoints. */
export const useIsDesktop = () => useMediaQuery("(min-width: 64rem)");
export const useIsTablet = () => useMediaQuery("(min-width: 48rem) and (max-width: 63.999rem)");
export const useIsMobileViewport = () => useMediaQuery("(max-width: 47.999rem)");