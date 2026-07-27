import { useEffect } from "react";

import { useUiStore } from "@/app/stores/useUiStore";

/**
 * Mirrors navigator connectivity into UI state so offline empty/idle states
 * can be rendered honestly.
 */
export function useOnlineStatus() {
  const setOnline = useUiStore((state) => state.setOnline);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [setOnline]);
}