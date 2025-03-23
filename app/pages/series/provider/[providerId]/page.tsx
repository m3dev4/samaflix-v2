"use client";

import { useEffect, useState, useRef } from "react";
import { fetchSeriesByProviderAndRegion } from "@/utils/tmdb";
import { SeriesCard } from "@/components/series/series-card";
import { FilterSection } from "@/components/series/filter-section";
import Link from "next/link";
import { ThemeColorToggle } from "@/components/themes/theme-color-toggle";
import { Series } from "@/types/series";
import { useParams } from "next/navigation";

const providerNames = {
  "8": "Netflix",
  "119": "Prime Video",
  "337": "Disney+",
  "384": "HBO Max",
  "531": "Paramount+",
  "2": "Apple TV+",
  "387": "HBO"
} as const;

export default function ProviderSeriesPage() {
  const params = useParams();
  const providerId = params?.providerId as string;
  
  const [series, setSeries] = useState<Series[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [providerName, setProviderName] = useState<string>("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoadingMore) {
          loadMoreSeries();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore]);

  const loadMoreSeries = async () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      const result = await fetchSeriesByProviderAndRegion(
        [providerId],
        "FR",
        20,
        page
      );
      
      if (result.length === 0) {
        setHasMore(false);
      } else {
        const newSeries = result.filter(newSerie => 
          !series.some(existingSerie => existingSerie.id === newSerie.id)
        );

        if (newSeries.length === 0) {
          setHasMore(false);
        } else {
          setSeries(prev => [...prev, ...newSeries]);
          setFilteredSeries(prev => [...prev, ...newSeries]);
          setPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error loading more series:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    // Reset state when provider changes
    setSeries([]);
    setFilteredSeries([]);
    setPage(1);
    setHasMore(true);
    setIsLoading(true);
    
    // Set provider name
    setProviderName(providerNames[providerId as keyof typeof providerNames] || "Unknown Provider");
    
    // Initial load
    loadMoreSeries();
  }, [providerId]);

  const handleFilterChange = (filterType: string, value: string) => {
    let filtered = [...series];
    console.log("Current filter:", filterType, value);

    switch (filterType) {
      case 'genre':
        if (value === 'all') {
          filtered = series;
        } else {
          const genreId = parseInt(value);
          filtered = series.filter(serie => {
            console.log("Serie genres:", serie.genre_ids);
            return serie.genre_ids && serie.genre_ids.includes(genreId);
          });
        }
        break;
      case 'sort':
        filtered.sort((a, b) => {
          switch (value) {
            case 'popularity.desc':
              return (b.popularity ?? 0) - (a.popularity ?? 0);
            case 'vote_average.desc':
              return b.vote_average - a.vote_average;
            case 'first_air_date.desc':
              return new Date(b.first_air_date).getTime() - new Date(a.first_air_date).getTime();
            default:
              return 0;
          }
        });
        break;
      case 'year':
        filtered = series.filter(serie => 
          new Date(serie.first_air_date).getFullYear().toString() === value
        );
        break;
    }

    console.log(`Filtered series count: ${filtered.length}`);
    setFilteredSeries(filtered);
  };

  return (
    <main className="min-h-screen bg-gradient-custom text-primary font-popins">
      <header className="fixed w-full top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/40 shadow-sm">
        <div className="container mx-auto">
          <nav className="flex items-center justify-between py-4">
            <Link
              href="/pages/series"
              className="text-lg font-medium hover:text-primary transition-colors"
            >
              ← Retour
            </Link>
            <FilterSection onFilterChange={handleFilterChange} />
            <div className="flex items-center space-x-4">
              <ThemeColorToggle />
            </div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Toutes les séries {providerName}</h1>
          <p className="text-sm text-primary">{filteredSeries.length} séries</p>
        </div>
        
        {isLoading && series.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredSeries.map((serie) => (
                <SeriesCard
                  key={serie.id}
                  series={serie}
                  priority={false}
                />
              ))}
            </div>
            
            {hasMore && (
              <div 
                ref={loadMoreRef} 
                className="flex justify-center items-center py-8"
              >
                {isLoadingMore && (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}