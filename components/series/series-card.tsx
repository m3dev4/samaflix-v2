'use client';

import Image from 'next/image';
import { Play, Star } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface ProviderItem {
  provider_id: number;
  provider_name: string;
  logo_path?: string;
  display_priority?: number;
}

interface Providers {
  flatrate?: ProviderItem[];
  free?: ProviderItem[];
  ads?: ProviderItem[];
  rent?: ProviderItem[];
  buy?: ProviderItem[];
}

interface SeriesCardProps {
  series: {
    id: number;
    title: string;
    poster_path: string;
    vote_average: number;
    first_air_date: string;
    video_url?: string;
    providers?: Providers;
  };
  priority?: boolean;
}

export function SeriesCard({ series, priority = false }: SeriesCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link href={`/series/${series.id}`} className="block">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="group relative rounded-lg overflow-hidden cursor-pointer"
      >
        <div className="aspect-[2/3] overflow-hidden rounded-lg bg-gray-900">
          <Image
            src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
            alt={series.title}
            width={500}
            height={750}
            className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-800 animate-pulse" />
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
              <Play className="h-12 w-12 text-white" fill="white" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-semibold truncate text-lg">{series.title}</h3>

          <div className="flex items-center gap-3 text-sm text-white/80 mt-2">
            <div className="flex items-center bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
              <Star className="w-4 h-4 mr-1 text-yellow-400" />
              {series.vote_average.toFixed(1)}
            </div>
            <div className="bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
              {new Date(series.first_air_date).getFullYear()}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export function SeriesCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="aspect-[2/3] animate-pulse bg-gray-800 rounded-lg" />
    </div>
  );
}
