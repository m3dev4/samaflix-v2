"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useThemeColor } from "@/context/theme-data-provider";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const availableThemes = [
  { name: "Zinc", light: "bg-zinc-900", dark: "bg-zinc-700" },
  { name: "Rose", light: "bg-pink-900", dark: "bg-pink-700" },
  { name: "Blue", light: "bg-blue-900", dark: "bg-blue-700" },
  { name: "Green", light: "bg-green-900", dark: "bg-green-700" },
  { name: "Orange", light: "bg-orange-900", dark: "bg-orange-700" },
];

export function ThemeColorToggle() {
  const { themeColor, setThemeColor } = useThemeColor();
  const { theme } = useTheme();

  const createSelectItem = () => {
    return availableThemes.map(({ name, light, dark }) => (
      <SelectItem key={name} value={name}>
        <div className="flex items-center space-x-3">
          <div
            className={cn(
              "rounded-full",
              "w-5",
              "h-5",
              theme === "light" ? light : dark,
            )}
          ></div>
          <div className="text-sm">{name}</div>
        </div>
      </SelectItem>
    ));
  };
  return (
    <Select
      onValueChange={(value) => setThemeColor(value as ThemesColor)}
      defaultValue={themeColor}
    >
      <SelectTrigger className="w-44 ring-offset-transparent focus:ring-transparent">
        <SelectValue placeholder="Select Color" />
      </SelectTrigger>
      <SelectContent className="border-muted">
        {createSelectItem()}
      </SelectContent>
    </Select>
  );
}
