"use client"

import { useEffect, useState, useRef } from "react"
import { fetchSeriesByProviderAndRegion } from "@/utils/tmdb"
import { SeriesCard, SeriesCardSkeleton } from "@/components/series/series-card"
import { FilterSection } from "@/components/series/filter-section"
import Link from "next/link"
import { ThemeColorToggle } from "@/components/themes/theme-color-toggle"
import type { Series } from "@/types/series"
import { useParams } from "next/navigation"
import { ArrowLeft, Info } from "lucide-react"
import { motion } from "framer-motion"

const providerNames = {
  "8": "Netflix",
  "119": "Prime Video",
  "337": "Disney+",
  "384": "HBO Max",
  "531": "Paramount+",
  "2": "Apple TV+",
  "387": "HBO",
} as const

const providerColors = {
  "8": "bg-red-100", // Netflix
  "119": "bg-blue-200", // Prime Video
  "337": "bg-blue-200", // Disney+
  "384": "bg-purple-700", // HBO Max
  "531": "bg-blue-100", // Paramount+
  "2": "bg-gray-800", // Apple TV+
  "387": "bg-purple-800", // HBO
} as const

const providerLogos = {
  "8": "/images/providers/netflix.svg",
  "119": "/images/providers/prime-video.png",
  "337": "/images/providers/disney.png",
  "384": "/images/providers/hbo-max.svg",
  "531": "/images/providers/paramount.svg",
  "2": "/images/providers/apple-tv.svg",
  "387": "/images/providers/hbo.svg",
} as const

export default function ProviderSeriesPage() {
  const params = useParams()
  const providerId = params?.providerId as string

  const [series, setSeries] = useState<Series[]>([])
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [providerName, setProviderName] = useState<string>("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !isLoadingMore) {
          loadMoreSeries()
        }
      },
      { threshold: 0.1 },
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isLoadingMore])

  const loadMoreSeries = async () => {
    if (isLoadingMore) return

    setIsLoadingMore(true)
    try {
      const result = await fetchSeriesByProviderAndRegion([providerId], "FR", 20, page)

      if (result.length === 0) {
        setHasMore(false)
      } else {
        const newSeries = result.filter((newSerie) => !series.some((existingSerie) => existingSerie.id === newSerie.id))

        if (newSeries.length === 0) {
          setHasMore(false)
        } else {
          setSeries((prev) => [...prev, ...newSeries])
          setFilteredSeries((prev) => [...prev, ...newSeries])
          setPage((prev) => prev + 1)
        }
      }
    } catch (error) {
      console.error("Error loading more series:", error)
    } finally {
      setIsLoadingMore(false)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Reset state when provider changes
    setSeries([])
    setFilteredSeries([])
    setPage(1)
    setHasMore(true)
    setIsLoading(true)
    setActiveFilter("all")

    // Set provider name
    setProviderName(providerNames[providerId as keyof typeof providerNames] || "Unknown Provider")

    // Initial load
    loadMoreSeries()
  }, [providerId])

  const handleFilterChange = (filterType: string, value: string) => {
    let filtered = [...series]
    setActiveFilter(value)

    switch (filterType) {
      case "genre":
        if (value === "all") {
          filtered = series
        } else {
          const genreId = Number.parseInt(value)
          filtered = series.filter((serie) => {
            return serie.genre_ids && serie.genre_ids.includes(genreId)
          })
        }
        break
      case "sort":
        filtered.sort((a, b) => {
          switch (value) {
            case "popularity.desc":
              return (b.popularity ?? 0) - (a.popularity ?? 0)
            case "vote_average.desc":
              return b.vote_average - a.vote_average
            case "first_air_date.desc":
              return new Date(b.first_air_date).getTime() - new Date(a.first_air_date).getTime()
            default:
              return 0
          }
        })
        break
      case "year":
        if (value === "all") {
          filtered = series
        } else {
          filtered = series.filter((serie) => new Date(serie.first_air_date).getFullYear().toString() === value)
        }
        break
    }

    setFilteredSeries(filtered)
  }

  const providerColor = providerColors[providerId as keyof typeof providerColors] || "bg-gray-800"
  const providerLogo = providerLogos[providerId as keyof typeof providerLogos]

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/80 text-foreground">
      <header className="fixed w-full top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/40 shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between py-4">
            <Link
              href="/pages/series"
              className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Retour</span>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeColorToggle />
            </div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              {providerLogo && (
                <div className={`${providerColor} p-3 rounded-xl shadow-lg`}>
                  <img
                    src={providerLogo || "/placeholder.svg"}
                    alt={providerName}
                    className="h-12 w-12 object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">{providerName}</h1>
                <p className="text-foreground/60 mt-1">{filteredSeries.length} séries disponibles</p>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <FilterSection onFilterChange={handleFilterChange} activeFilter={activeFilter} />
            </div>
          </motion.div>
        </div>

        {isLoading && series.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <SeriesCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredSeries.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
          >
            {filteredSeries.map((serie, index) => (
              <motion.div
                key={serie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <SeriesCard series={serie} priority={index < 6} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-foreground/5 p-6 rounded-full mb-4">
              <Info className="h-10 w-10 text-foreground/40" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucune série trouvée</h3>
            <p className="text-foreground/60 max-w-md">
              Aucune série ne correspond à vos critères de filtrage. Essayez de modifier vos filtres.
            </p>
          </div>
        )}

        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center items-center py-12">
            {isLoadingMore && (
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="text-sm text-foreground/60">Chargement en cours...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
