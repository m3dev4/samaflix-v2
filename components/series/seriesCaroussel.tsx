"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { SeriesCard, SeriesCardSkeleton } from "./series-card";
import { useInView } from "react-intersection-observer";
import { fetchSeriesByProviderAndRegion } from "@/utils/tmdb";
import Link from "next/link";

interface Series {
  id: number;
  title: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  first_air_date: string;
}

interface SeriesCarousselProps {
  title: string;
  series: Series[]; // Changement ici pour accepter les séries directement
  region?: string;
  showAllLink?: boolean;
  providerId?: string;
}

const VISIBLE_ITEMS = 5;

const SeriesCaroussel = ({ 
  title, 
  series = [], 
  region = "FR",
  showAllLink = false,
  providerId 
}: SeriesCarousselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Supprimer le useEffect de récupération des données car elles sont maintenant passées en props

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
              : Math.min(series.length - VISIBLE_ITEMS, prev + VISIBLE_ITEMS);
          return newIndex;
        });

        setTimeout(() => setIsScrolling(false), 500);
      }
    },
    [isScrolling, series.length]
  );

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const newIndex = Math.round(
        (scrollLeft / (scrollWidth - clientWidth)) *
          (series.length - VISIBLE_ITEMS)
      );
      setCurrentIndex(newIndex);
    }
  }, [series.length]);

  if (!inView) {
    return (
      <div ref={sectionRef} className="space-y-4">
        <h2 className="text-2xl text-primary font-popins">{title}</h2>
        <div className="flex gap-4">
          {Array.from({ length: VISIBLE_ITEMS }).map((_, index) => (
            <div key={index} className="flex-none w-[200px]">
              <SeriesCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl text-primary font-popins">
          {title} {series.length > 0 && `(${series.length})`}
        </h2>
        {showAllLink && (
          <Link 
            href={`/pages/series/provider/${providerId}`}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Voir tout
          </Link>
        )}
      </div>
      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex overflow-hidden gap-4 scrollbar-hide snap-x snap-mandatory"
          onScroll={handleScroll}
        >
          {series.map((serie, index) => (
            <div key={serie.id} className="flex-none w-[200px] snap-start">
              <SeriesCard
                series={{
                  id: serie.id,
                  title: serie.title || serie.name || "",
                  poster_path: serie.poster_path,
                  vote_average: serie.vote_average,
                  first_air_date: serie.first_air_date,
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

        {currentIndex < series.length - VISIBLE_ITEMS && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            disabled={
              isScrolling || currentIndex >= series.length - VISIBLE_ITEMS
            }
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SeriesCaroussel;
