"use client";

import { createContext, useContext, useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Светлая тема выпилена: сайт всегда тёмный. Провайдер оставлен, чтобы
 * не ломать useTheme-потребителей, но всегда отдаёт "dark", а
 * toggleTheme — no-op. Сохранённое в localStorage значение "light"
 * перезаписывается, чтобы старые посетители тоже получили тёмную тему.
 */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } catch {
      // ignore (SSR safety)
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "dark", toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
