"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
}

interface MediaCarouselProps {
  items: MediaItem[];
  title: string;
  className?: string;
}

export function MediaCarousel({ items, title, className }: MediaCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    dragFree: true,
  });

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className={cn("relative group", className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold relative inline-block">
          <span className="relative z-10">{title}</span>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-primary/20 transform -skew-x-12"></div>
        </h2>
      </div>

      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="flex gap-4 py-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative flex-[0_0_200px] sm:flex-[0_0_240px] md:flex-[0_0_280px] transition-all duration-300 hover:scale-105"
            >
              <div className="relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title || item.name || ""}
                  width={500}
                  height={750}
                  className="h-auto w-full object-cover transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white text-lg font-semibold drop-shadow-lg">
                    {item.title || item.name}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/80 text-white p-3 rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/90"
        aria-label="Previous"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/80 text-white p-3 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/90"
        aria-label="Next"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}