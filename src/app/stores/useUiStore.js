import { create } from "zustand";

import { applyTheme, persistTheme, readStoredTheme } from "@/lib/theme";

/**
 * UI-only state. Deliberately separate from notes state so that view concerns
 * (sidebar, overlays, theme, toasts) never trigger data re-renders.
 */
export const useUiStore = create((set, get) => ({
  /** @type {import("@/lib/theme").ThemePreference} */
  theme: "system",
  sidebarOpen: true,
  searchOpen: false,
  searchQuery: "",
  online: true,
  /** @type {{id: string, title: string, description?: string, tone: "default"|"destructive"}[]} */
  toasts: [],

  /** Hydrates theme from storage on mount (client only). */
  initTheme: () => {
    const stored = readStoredTheme();
    set({ theme: stored });
    applyTheme(stored);
  },

  /** @param {import("@/lib/theme").ThemePreference} theme */
  setTheme: (theme) => {
    persistTheme(theme);
    applyTheme(theme);
    set({ theme });
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  /** @param {boolean} open */
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false, searchQuery: "" }),
  /** @param {string} searchQuery */
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  /** @param {boolean} online */
  setOnline: (online) => set({ online }),

  /** @param {{title: string, description?: string, tone?: "default"|"destructive"}} toast */
  pushToast: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts, { tone: "default", ...toast, id }],
    }));
    setTimeout(() => get().dismissToast(id), 4000);
    return id;
  },

  /** @param {string} id */
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));