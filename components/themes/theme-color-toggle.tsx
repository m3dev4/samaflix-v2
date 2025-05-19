"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { useTheme } from "next-themes"
import { useThemeColor } from "@/context/theme-data-provider"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const availableThemes = [
  { name: "Zinc", color: "#71717a" },
  { name: "Rose", color: "#e11d48" },
  { name: "Blue", color: "#3b82f6" },
  { name: "Green", color: "#22c55e" },
  { name: "Orange", color: "#f97316" },
]

export function ThemeColorToggle() {
  const { themeColor, setThemeColor } = useThemeColor()
  const { theme } = useTheme()
  const [open, setOpen] = useState(false)

  // Trouver la couleur actuelle pour l'afficher dans le bouton
  const currentTheme = availableThemes.find((t) => t.name === themeColor) || availableThemes[0]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label="Changer de thème">
          <div className="w-5 h-5 rounded-full" style={{ backgroundColor: currentTheme.color }} />
          <span className="sr-only">Changer de thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px] bg-gray-900/95 backdrop-blur-sm border-gray-800">
        <div className="px-3 py-2 text-xs font-medium text-gray-400 border-b border-gray-800">Thème de couleur</div>
        {availableThemes.map((item) => (
          <DropdownMenuItem
            key={item.name}
            className={cn(
              "flex items-center gap-2 px-3 py-2 cursor-pointer",
              themeColor === item.name && "bg-gray-800",
            )}
            onClick={() => {
              setThemeColor(item.name as any)
              setOpen(false)
            }}
          >
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="flex-1">{item.name}</span>
            {themeColor === item.name && <Check className="h-4 w-4 text-rose-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
