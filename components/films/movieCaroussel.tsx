"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { MovieCard, MovieCardSkeleton } from "./movie-card";
import { useInView } from "react-intersection-observer";
import { ViewAllButton } from './ViewAllButton';

interface MovieProvider {
  provider_name: string;
  provider_id: number;
  logo_path?: string;
}

interface Providers {
  flatrate?: MovieProvider[];
  free?: MovieProvider[];
  ads?: MovieProvider[];
  rent?: MovieProvider[];
  buy?: MovieProvider[];
}

interface Movie {
  id: number;
  title: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  providers?: {
    FR?: Providers;
  };
}

interface MovieCarousselProps {
  title: string;
  movies?: Movie[];
  className?: string;
  selectedPlatform?: string | null;
}

const VISIBLE_ITEMS = 5;

const MovieCaroussel = ({
  title,
  movies = [],
  className = "",
  selectedPlatform,
}: MovieCarousselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Si aucun film n'est disponible pour la plateforme sélectionnée, ne pas afficher le carousel
  if (selectedPlatform && movies.length === 0) {
    return null;
  }

  // Optimisation du préchargement des images
  const preloadNextImages = useCallback(async () => {
    if (inView && movies.length > 0) {
      const nextMovies = movies.slice(
        currentIndex,
        currentIndex + VISIBLE_ITEMS + 2,
      );
      await Promise.all(
        nextMovies.map((movie) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
          });
        }),
      );
    }
  }, [inView, currentIndex, movies]);

  useEffect(() => {
    const timeoutId = setTimeout(preloadNextImages, 100);
    return () => clearTimeout(timeoutId);
  }, [preloadNextImages]);

  const scroll = useCallback(
    (direction: "left" | "right") => {
      if (scrollRef.current && !isScrolling) {
        setIsScrolling(true);
        const { current } = scrollRef;
        const scrollAmount =
          direction === "left" ? -current.offsetWidth : current.offsetWidth;

        current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });

        setCurrentIndex((prev) => {
          const newIndex =
            direction === "left"
              ? Math.max(0, prev - VISIBLE_ITEMS)
              : Math.min(movies.length - VISIBLE_ITEMS, prev + VISIBLE_ITEMS);
          return newIndex;
        });

        setTimeout(() => setIsScrolling(false), 500);
      }
    },
    [isScrolling, movies.length],
  );

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const newIndex = Math.round(
        (scrollLeft / (scrollWidth - clientWidth)) *
          (movies.length - VISIBLE_ITEMS),
      );
      setCurrentIndex(newIndex);
    }
  }, [movies.length]);

  if (!inView) {
    return (
      <div ref={sectionRef} className="space-y-4">
        <h2 className="text-2xl text-primary font-popins">{title}</h2>
        <div className="flex gap-4">
          {Array.from({ length: VISIBLE_ITEMS }).map((_, index) => (
            <div key={index} className="flex-none w-[200px]">
              <MovieCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl text-primary font-popins">
          {title} {movies.length > 0 && `(${movies.length})`}
        </h2>
        <ViewAllButton category={title} count={movies.length} />
      </div>
      <div className="relative group">
        <div
          ref={scrollRef}
          className={`flex overflow-hidden gap-4 scrollbar-hide snap-x snap-mandatory ${className}`}
          onScroll={handleScroll}
        >
          {movies.map((movie, index) => (
            <div key={movie.id} className="flex-none w-[200px] snap-start">
              <MovieCard
                movie={{
                  id: movie.id,
                  title: movie.title || movie.name || "",
                  poster_path: movie.poster_path,
                  vote_average: movie.vote_average,
                  release_date: movie.release_date,
                  providers: movie.providers?.FR, // Pass the FR providers to the MovieCard
                }}
                priority={index < VISIBLE_ITEMS}
              />
            </div>
          ))}
        </div>

        {currentIndex > 0 && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            disabled={isScrolling || currentIndex === 0}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {currentIndex < movies.length - VISIBLE_ITEMS && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            disabled={
              isScrolling || currentIndex >= movies.length - VISIBLE_ITEMS
            }
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieCaroussel;
