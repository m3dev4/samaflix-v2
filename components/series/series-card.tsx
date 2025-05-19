"use client"

import Image from "next/image"
import { Play, Star, Calendar, Eye } from "lucide-react"
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

interface SeriesCardProps {
  series: {
    id: number
    title: string
    poster_path: string
    vote_average: number
    first_air_date: string
    video_url?: string
    providers?: Providers
  }
  priority?: boolean
}

export function SeriesCard({ series, priority = false }: SeriesCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const formattedDate = new Date(series.first_air_date).getFullYear()
  const rating = series.vote_average.toFixed(1)

  return (
    <Link href={`/series/${series.id}`}>
      <motion.div
        className="group relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{
          scale: 1.03,
          y: -5,
        }}
      >
        <div className="aspect-[2/3] overflow-hidden rounded-lg bg-gray-900 min-w-[180px] md:min-w-[220px] lg:min-w-[240px]">
          {series.poster_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
              alt={series.title}
              width={500}
              height={750}
              className={`h-full w-full object-cover transition-all duration-500 ${
                isHovered ? "scale-110 blur-[1px]" : "scale-100"
              } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-800 text-gray-500">
              <Eye className="h-12 w-12 opacity-50" />
            </div>
          )}

          {!imageLoaded && <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-xl" />}
        </div>

        {/* Overlay gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Play button */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.8,
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="rounded-full bg-primary/90 p-4 backdrop-blur-sm shadow-lg">
              <Play className="h-8 w-8 text-white" fill="white" />
            </div>
          </motion.div>
        </div>

        {/* Title and info */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10,
          }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-white font-semibold truncate text-lg">{series.title}</h3>

          <div className="flex items-center gap-2 text-sm text-white/90 mt-3">
            <div className="flex items-center bg-yellow-500/90 px-2 py-1 rounded-full backdrop-blur-sm">
              <Star className="w-3 h-3 mr-1 text-white" fill="white" />
              {rating}
            </div>
            <div className="flex items-center bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
              <Calendar className="w-3 h-3 mr-1 text-white" />
              {formattedDate}
            </div>
          </div>
        </motion.div>

        {/* Static rating badge (always visible) */}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
          {rating}
        </div>
      </motion.div>
    </Link>
  )
}

export function SeriesCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="aspect-[2/3] animate-pulse bg-gray-800/50 rounded-xl" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="h-5 w-3/4 bg-gray-700/50 animate-pulse rounded-md mb-2"></div>
        <div className="flex gap-2">
          <div className="h-4 w-10 bg-gray-700/50 animate-pulse rounded-full"></div>
          <div className="h-4 w-10 bg-gray-700/50 animate-pulse rounded-full"></div>
        </div>
      </div>
    </div>
  )
}
