"use client"

import { useState } from "react"
import { Filter, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

interface FilterSectionProps {
  onFilterChange: (filterType: string, value: string) => void
  activeFilter?: string
}

const genres = [
  { id: "all", name: "Tous les genres" },
  { id: "10759", name: "Action & Aventure" },
  { id: "16", name: "Animation" },
  { id: "35", name: "Comédie" },
  { id: "80", name: "Crime" },
  { id: "99", name: "Documentaire" },
  { id: "18", name: "Drame" },
  { id: "10751", name: "Famille" },
  { id: "10762", name: "Enfants" },
  { id: "9648", name: "Mystère" },
  { id: "10763", name: "News" },
  { id: "10764", name: "Reality" },
  { id: "10765", name: "Science-Fiction & Fantastique" },
  { id: "10766", name: "Soap" },
  { id: "10767", name: "Talk" },
  { id: "10768", name: "Guerre & Politique" },
  { id: "37", name: "Western" },
]

const sortOptions = [
  { id: "popularity.desc", name: "Popularité" },
  { id: "vote_average.desc", name: "Note" },
  { id: "first_air_date.desc", name: "Date de sortie" },
]

const years = [
  { id: "all", name: "Toutes les années" },
  ...Array.from({ length: 30 }, (_, i) => {
    const year = new Date().getFullYear() - i
    return { id: year.toString(), name: year.toString() }
  }),
]

export function FilterSection({ onFilterChange, activeFilter = "all" }: FilterSectionProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("Tous les genres")
  const [selectedSort, setSelectedSort] = useState<string>("Popularité")
  const [selectedYear, setSelectedYear] = useState<string>("Toutes les années")

  const handleGenreChange = (id: string, name: string) => {
    setSelectedGenre(name)
    onFilterChange("genre", id)
  }

  const handleSortChange = (id: string, name: string) => {
    setSelectedSort(name)
    onFilterChange("sort", id)
  }

  const handleYearChange = (id: string, name: string) => {
    setSelectedYear(name)
    onFilterChange("year", id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex flex-wrap gap-3 items-center"
    >
      <div className="flex items-center gap-2 text-sm text-foreground/60">
        <Filter className="h-4 w-4" />
        <span>Filtres:</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1 min-w-32 justify-between">
            <span className="truncate">{selectedGenre}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
          <DropdownMenuLabel>Genres</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {genres.map((genre) => (
            <DropdownMenuItem
              key={genre.id}
              onClick={() => handleGenreChange(genre.id, genre.name)}
              className="flex items-center justify-between"
            >
              {genre.name}
              {activeFilter === genre.id && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1 min-w-32 justify-between">
            <span className="truncate">{selectedSort}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Trier par</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => handleSortChange(option.id, option.name)}
              className="flex items-center justify-between"
            >
              {option.name}
              {selectedSort === option.name && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1 min-w-32 justify-between">
            <span className="truncate">{selectedYear}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
          <DropdownMenuLabel>Année</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {years.map((year) => (
            <DropdownMenuItem
              key={year.id}
              onClick={() => handleYearChange(year.id, year.name)}
              className="flex items-center justify-between"
            >
              {year.name}
              {activeFilter === year.id && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}
