'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AnimatePresence } from 'framer-motion'
import { ChevronDown, Filter } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface FilterSectionProps {
  onFilterChange: (filterType: string, value: string) => void
}

export function FilterSection({ onFilterChange }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const genres = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Aventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comédie' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentaire' },
    { id: 18, name: 'Drame' },
    { id: 10751, name: 'Familial' },
    { id: 14, name: 'Fantastique' },
    { id: 36, name: 'Histoire' },
    { id: 27, name: 'Horreur' },
    { id: 10402, name: 'Musique' },
    { id: 9648, name: 'Mystère' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science-Fiction' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'Guerre' },
    { id: 37, name: 'Western' },
  ]

  const sortOptions = [
    { value: 'popularity.desc', label: 'Plus populaires' },
    { value: 'vote_average.desc', label: 'Mieux notés' },
    { value: 'release_date.desc', label: 'Dernières sorties' },
  ]
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/10 backdrop-blur-lg border border-white/10 text-white/90 hover:bg-black/20 transition-colors"
      >
        <Filter className="h-4 w-4" />
        Filtres
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 mt-2 p-4 rounded-lg bg-black/90 backdrop-blur-xl border border-white/10 shadow-xl min-w-[300px]"
          >
            <div className="space-y-4">
              <Select onValueChange={(value) => onFilterChange('genre', value)}>
                <SelectTrigger className="w-full bg-transparent border-white/10 text-white">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                  {genres.map((genre) => (
                    <SelectItem
                      key={genre.id}
                      value={genre.id.toString()}
                      className="text-white hover:bg-white/10"
                    >
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => onFilterChange('sort', value)}>
                <SelectTrigger className="w-full bg-transparent border-white/10 text-white">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                  {sortOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-white hover:bg-white/10"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => onFilterChange('year', value)}>
                <SelectTrigger className="w-full bg-transparent border-white/10 text-white">
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(
                    (year) => (
                      <SelectItem
                        key={year}
                        value={year.toString()}
                        className="text-white hover:bg-white/10"
                      >
                        {year}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}