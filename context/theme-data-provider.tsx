"use client";
import setGlobalColorThemes from "../lib/themes-color";
import { useTheme } from "next-themes";
import { ThemeProviderProps } from "next-themes";
import { createContext, useContext, useEffect, useState } from "react";

const themeContext = createContext<ThemesColorStateParams>({
  themeColor: "Zinc",
  setThemeColor: () => {},
});

export default function ThemeDataProvider({ children }: ThemeProviderProps) {
  const getSavedThemeColor = (): ThemesColor => {
    if (typeof window === "undefined") return "Zinc";
    try {
      const saved = localStorage.getItem("themeColor");
      return (saved as ThemesColor) || "Zinc";
    } catch (error) {
      return "Zinc";
    }
  };

  const [themeColor, setThemeColor] = useState<ThemesColor>(getSavedThemeColor());
  const [isMounted, setIsMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (themeColor && typeof window !== "undefined") {
      localStorage.setItem("themeColor", themeColor);
      
      // S'assurer que le mode de thème est valide (light ou dark)
      const validThemeMode = resolvedTheme === "light" || resolvedTheme === "dark" 
        ? resolvedTheme 
        : theme === "light" || theme === "dark" 
          ? theme 
          : "light"; // Valeur par défaut si aucun thème valide n'est trouvé
      
      setGlobalColorThemes(
        validThemeMode as "light" | "dark",
        themeColor
      );
    }
  }, [themeColor, theme, resolvedTheme]);

  if (!isMounted) {
    return null;
  }

  return (
    <themeContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </themeContext.Provider>
  );
}

export function useThemeColor() {
  const context = useContext(themeContext);
  if (!context) {
    throw new Error("useThemeColor must be used within a ThemeDataProvider");
  }
  return context;
}
