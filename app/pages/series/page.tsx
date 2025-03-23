"use client";

import PlatformList from "@/components/films/platform-list";
import { SearchBar } from "@/components/films/search-bar";
import { searchSeries } from "@/utils/tmdb";
import Category from "@/components/series/category";
import SeriesCaroussel from "@/components/series/seriesCaroussel";
import React, { useEffect, useState, Suspense, useMemo } from "react";
import { seriesCategories } from "@/constants";
import { getSeriesByProviderAndRegion } from "@/components/getMovie";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { ThemeColorToggle } from "@/components/themes/theme-color-toggle";

interface Series {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  first_air_date: string;
  providers?: {
    [key: string]: {
      flatrate?: Array<{ provider_name: string; provider_id: number }>;
      free?: Array<{ provider_name: string; provider_id: number }>;
      ads?: Array<{ provider_name: string; provider_id: number }>;
    };
  };
}

const LazySeriesSection = ({
  category,
  series,
}: {
  category: string;
  series: Series[];
}) => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
    rootMargin: "100px",
  });

  return (
    <div ref={ref}>
      {inView && (
        <section id={category.toLowerCase().replace(/\s+/g, "-")}>
          <SeriesCaroussel title={category} series={series} region="FR" />
        </section>
      )}
    </div>
  );
};

const PageSeries = () => {
  const [categorySeries, setCategorySeries] = useState<{
    [key: string]: Series[];
  }>({});
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Series[]>([]);
  const { ref: headerRef, inView: headerInView } = useInView({
    threshold: 0,
    initialInView: true,
  });

  const providers = [
    "8",    // Netflix
    "119",  // Prime Video
    "337",  // Disney+
    "384",  // HBO Max
    "531",  // Paramount+
    "2",    // Apple TV+
    "387"   // HBO
  ];

  const providerMap = {
    "8": "Netflix",
    "119": "Prime Video",
    "337": "Disney+",
    "384": "HBO Max",
    "531": "Paramount+",
    "2": "Apple TV+",
    "387": "HBO"
  };

  const filterSeriesByPlatform = useMemo(
    () => (series: Series[], platform: string | null): Series[] => {
      if (!platform) return series;

      const normalizeProviderName = (name: string) => {
        const platformMap: { [key: string]: string[] } = {
          Netflix: ["Netflix"],
          "Prime Video": ["Amazon Prime Video", "Prime Video", "Amazon Video"],
          "Disney+": ["Disney Plus", "Disney+"],
          "HBO Max": ["HBO Max", "Max"],
          "Paramount+": ["Paramount Plus", "Paramount+"],
        };

        return platformMap[platform] || [platform];
      };

      const platformNames = normalizeProviderName(platform);

      return series.filter((serie) => {
        const providers = serie.providers?.FR;

        if (!providers) return false;

        const allProviders = [
          ...(providers.flatrate || []),
          ...(providers.free || []),
          ...(providers.ads || []),
        ];

        return allProviders.some((provider) =>
          platformNames.some(
            (name) => provider.provider_name.toLowerCase() === name.toLowerCase()
          )
        );
      });
    },
    []
  );

  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching series data for page...");

        const combinedSeries = await Promise.all(
          Object.entries(providerMap).map(([providerId, name]) =>
            getSeriesByProviderAndRegion([providerId], "FR", 20)
              .then(series => {
                // Filtrer les doublons basés sur l'ID de la série
                const uniqueSeries = series.reduce((acc: Series[], serie) => {
                  if (!acc.some(existingSerie => existingSerie.id === serie.id)) {
                    acc.push(serie);
                  }
                  return acc;
                }, []);

                return {
                  provider: name,
                  series: uniqueSeries
                };
              })
          )
        );

        // Convertir en objet pour le stockage
        const categorizedSeries = combinedSeries.reduce((acc: { [key: string]: Series[] }, { provider, series }) => {
          acc[provider] = series;
          return acc;
        }, {});

        console.log("Fetched series data:", categorizedSeries);
        sessionStorage.setItem("seriesData", JSON.stringify(categorizedSeries));
        setCategorySeries(categorizedSeries);
      } catch (error) {
        console.error("Error fetching series data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeriesData();
  }, []);

  const filteredCategories = useMemo(() => {
    const result = seriesCategories
      .map((category) => ({
        category,
        series: filterSeriesByPlatform(
          categorySeries[category] || [],
          selectedPlatform
        ),
      }))
      .filter(({ series }) => series.length > 0);

    console.log("Filtered categories for SeriesCaroussel:", result); // Debugging
    return result;
  }, [seriesCategories, categorySeries, selectedPlatform, filterSeriesByPlatform]);

  const handleSearch = async (query: string) => {
    if (query.length > 2) {
      setIsSearching(true);
      try {
        const results = await searchSeries(query);
        console.log("Search results:", results); // Debugging
        setSearchResults(results.results || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-custom text-primary font-popins overflow-x-hidden">
      <header className="fixed w-full top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/40 shadow-sm">
        <div className="container mx-auto">
          <nav className="flex items-center justify-between py-4">
            <ul className="flex items-center gap-8">
              <li className="flex items-center space-x-6">
                <Link
                  href="/"
                  className="text-2xl font-bold hover:text-primary transition-colors"
                >
                  Samaflix
                </Link>
                <Link
                  href="/pages/films"
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  Films
                </Link>
                <Link
                  href="/pages/series"
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  Séries
                </Link>
              </li>
            </ul>
            <div className="flex items-center space-x-4">
              <ThemeColorToggle />
            </div>
          </nav>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8 space-y-12">
        <div ref={headerRef}>
          <section className="text-center space-y-4 my-32">
            <h1 className="text-6xl font-bold text-primary">Séries</h1>
            <p className="text-xl text-primary">
              Explore une large sélection de séries
            </p>
            <SearchBar onSearch={handleSearch} />
          </section>

          <div className="space-y-6 mt-8">
            <Category />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-16">
            {isSearching && <div className="text-center">Searching...</div>}
            {searchResults.length > 0 ? (
              <SeriesCaroussel title="Search Results" series={searchResults} region="FR" />
            ) : (
              !isSearching && <div className="text-center"></div>
            )}
            {Object.entries(categorySeries).map(([category, series]) => (
              series.length > 0 && (
                <Suspense
                  key={category}
                  fallback={
                    <div className="h-[300px] animate-pulse bg-gray-800 rounded-lg" />
                  }
                >
                  <SeriesCaroussel 
                    title={category} 
                    series={series.slice(0, 20)}
                    showAllLink={true}
                    providerId={Object.entries(providerMap).find(([_, name]) => name === category)?.[0]}
                  />
                </Suspense>
              )
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default PageSeries;

