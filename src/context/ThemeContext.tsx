import React, { createContext, useContext, useState, useEffect } from "react";

export type LabTheme = "light" | "dark";

interface ThemeContextType {
  theme: LabTheme;
  toggleTheme: () => void;
  setTheme: (theme: LabTheme) => void;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
  isLight: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to dark mode as requested, with persistence support
  const [theme, setThemeState] = useState<LabTheme>(() => {
    const saved = localStorage.getItem("omnilab_theme");
    return (saved === "dark" || saved === "light") ? saved : "dark";
  });

  const setTheme = (newTheme: LabTheme) => {
    setThemeState(newTheme);
    localStorage.setItem("omnilab_theme", newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const isLight = theme === "light";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isLight }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useLabTheme = () => useContext(ThemeContext);
