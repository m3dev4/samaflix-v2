"use client"

import Image from "next/image"
import { Play, Star } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

interface ProviderItem {
  provider_id: number
  provider_name: string
  logo_path?: string
  display_priority?: number
}

interface Providers {
  flatrate?: ProviderItem[]
  free?: ProviderItem[]
  ads?: ProviderItem[]
  rent?: ProviderItem[]
  buy?: ProviderItem[]
}

interface MovieCardProps {
  movie: {
    id: number
    title: string
    poster_path: string
    vote_average: number
    release_date: string
    video_url?: string
    providers?: Providers
  }
  priority?: boolean
}

export function MovieCard({ movie, priority = false }: MovieCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  // Optimisation: Utiliser des tailles d'images appropriées selon l'appareil
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : "/placeholder.svg?height=513&width=342"

  return (
    <Link href={`/movie/${movie.id}`} className="block">
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.2 }}
        className="group relative rounded-lg overflow-hidden cursor-pointer"
      >
        <div className="aspect-[2/3] overflow-hidden rounded-lg bg-gray-900 min-w-[180px] md:min-w-[160px] lg:min-w-[190px]">
          {!imageLoaded && <div className="absolute inset-0 bg-gray-800 animate-pulse" />}
          <Image
            src={posterUrl || "/placeholder.svg"}
            alt={movie.title}
            width={342}
            height={513}
            className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 640px) 180px, (max-width: 1024px) 160px, 190px"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzgwIiBoZWlnaHQ9IjExNzAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNzgwIiBoZWlnaHQ9IjExNzAiIGZpbGw9IiMyMDIwMjAiLz48L3N2Zz4="
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
              <Play className="h-8 w-8 text-white" fill="white" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-semibold truncate text-base">{movie.title}</h3>

          <div className="flex items-center gap-2 text-xs text-white/80 mt-1">
            <div className="flex items-center bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
              <Star className="w-3 h-3 mr-1 text-yellow-400" />
              {movie.vote_average.toFixed(1)}
            </div>
            <div className="bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {new Date(movie.release_date).getFullYear()}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export function MovieCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="aspect-[2/3] animate-pulse bg-gray-800 rounded-lg" />
    </div>
  )
}
