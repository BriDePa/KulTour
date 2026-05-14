import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  resolvedTheme: "light" | "dark";
}

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getResolvedTheme = (mode: ThemeMode): "light" | "dark" => {
  if (mode === "system") {
    return getSystemTheme();
  }
  return mode;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "system",
      resolvedTheme: getSystemTheme(),

      setTheme: (mode) => {
        const resolved = getResolvedTheme(mode);
        set({ mode, resolvedTheme: resolved });
        applyTheme(resolved);
      },

      toggleTheme: () => {
        const current = get().resolvedTheme;
        const next = current === "light" ? "dark" : "light";
        set({ mode: next, resolvedTheme: next });
        applyTheme(next);
      },
    }),
    {
      name: "kultour_theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = getResolvedTheme(state.mode);
          state.resolvedTheme = resolved;
          applyTheme(resolved);
        }
      },
    }
  )
);

function applyTheme(theme: "light" | "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

if (typeof window !== "undefined") {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", () => {
    const state = useThemeStore.getState();
    if (state.mode === "system") {
      const newTheme = getSystemTheme();
      state.resolvedTheme = newTheme;
      applyTheme(newTheme);
    }
  });
}