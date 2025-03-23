type ThemesColor = "Zinc" | "Rose" | "Orange" | "Blue" | "Green";
interface ThemesColorStateParams {
  themeColor: ThemesColor;
  setThemeColor: React.Dispatch<React.SetStateAction<ThemesColor>>;
}
