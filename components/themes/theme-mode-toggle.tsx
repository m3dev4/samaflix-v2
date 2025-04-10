import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeModeToggle() {
  const { setTheme, theme } = useTheme();
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-iconTheme w-iconTheme rotate-0 scale-100 transition-all dark:scale-0 dark:rotate-90" />
      <Moon className="absolute h-iconTheme w-iconTheme rotate-0 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
