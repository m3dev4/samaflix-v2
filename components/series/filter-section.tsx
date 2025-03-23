'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AnimatePresence } from 'framer-motion';
import { ChevronDown, Filter } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface FilterSectionProps {
  onFilterChange: (filterType: string, value: string) => void;
}

export function FilterSection({ onFilterChange }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const genres = [
    { id: 10759, name: 'Action & Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 27, name: 'Horror' },
    { id: 9648, name: 'Mystery' },
    { id: 10764, name: 'Reality' },
    { id: 10765, name: 'Science Fiction & Fantasy' },
    { id: 10749, name: 'Romance' },
    { id: 53, name: 'Thriller' },
    { id: 10768, name: 'War & Politics' }
  ];

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Top Rated' },
    { value: 'first_air_date.desc', label: 'Latest Releases' },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/10 backdrop-blur-lg border border-white/10 text-white/90 hover:bg-black/20 transition-colors"
      >
        <Filter className="h-4 w-4" />
        Filters
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
              <Select onValueChange={(value) => {
                console.log("Selected genre:", value); // Debug
                onFilterChange('genre', value);
              }}>
                <SelectTrigger className="w-full bg-transparent border-white/10 text-white">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10">
                  <SelectItem value="all" className="text-white hover:bg-white/10">
                    Tous les genres
                  </SelectItem>
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
                  <SelectValue placeholder="Sort By" />
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
                  <SelectValue placeholder="Year" />
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
  );
}
