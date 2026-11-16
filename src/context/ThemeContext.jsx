import React, { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Permanently locked to the Creator Dark Charcoal theme (#111318)
  const theme = "dark";
  const toggleTheme = () => {}; // No-op, theme toggle removed

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.classList.remove("light");
    try {
      localStorage.removeItem("mailbridge-theme");
    } catch (_) {}
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: "dark", toggleTheme: () => {} };
  }
  return context;
}
