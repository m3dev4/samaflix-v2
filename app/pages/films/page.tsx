"use client"

import PlatformList from "../../../components/films/platform-list";
import { SearchBar } from "../../../components/films/search-bar";
import { searchMovies } from "../../../utils/tmdb";
import Category from "../../../components/films/category";
import MovieCaroussel from "../../../components/films/movieCaroussel";
import React, { useEffect, useState, Suspense, useMemo } from "react";
import { categories } from "../../../constants";
import { getMovies } from "../../../components/getMovie";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { ThemeColorToggle } from "@/components/themes/theme-color-toggle";
import type { Metadata } from "next";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
  providers?: {
    [key: string]: {
      flatrate?: Array<{ provider_name: string; provider_id: number }>;
      free?: Array<{ provider_name: string; provider_id: number }>;
      ads?: Array<{ provider_name: string; provider_id: number }>;
    };
  };
}

// Composant pour le chargement progressif des sections
const LazyMovieSection = ({ category, movies }: { category: string; movies: Movie[] }) => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
    rootMargin: '100px',
  });

  return (
    <div ref={ref}>
      {inView && (
        <section 
          id={category.toLowerCase().replace(/\s+/g, '-')}
        >
          <MovieCaroussel 
            title={category}
            movies={movies}
          />
        </section>
      )}
    </div>
  );
};

const PageMovies = () => {
  const [categoryMovies, setCategoryMovies] = useState<{ [key: string]: Movie[] }>({});
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ref: headerRef, inView: headerInView } = useInView({
    threshold: 0,
    initialInView: true,
  });

  // Fonction mémorisée pour filtrer les films par plateforme
  const filterMoviesByPlatform = useMemo(() => (movies: Movie[], platform: string | null): Movie[] => {
    if (!platform) return movies;
    
    // Fonction helper pour normaliser les noms des providers
    const normalizeProviderName = (name: string) => {
      const platformMap: { [key: string]: string[] } = {
        'Netflix': ['Netflix'],
        'Apple TV+': ['Apple TV Plus', 'Apple TV+', 'Apple TV'],
        'Max': ['HBO Max', 'Max'],
        'Prime Video': ['Amazon Prime Video', 'Prime Video', 'Amazon Video'],
        'Disney+': ['Disney Plus', 'Disney+'],
        'Paramount+': ['Paramount Plus', 'Paramount+'],
        'Hulu': ['Hulu']
      };
  
      return platformMap[platform] || [platform];
    };
  
    const platformNames = normalizeProviderName(platform);
    
    return movies.filter(movie => {
      const providers = movie.providers?.FR;
      
      if (!providers) return false;
  
      // Vérifier dans toutes les catégories de providers
      const allProviders = [
        ...(providers.flatrate || []),
        ...(providers.free || []),
        ...(providers.ads || []),
      ];
  
      return allProviders.some(provider => 
        platformNames.some(name => 
          provider.provider_name.toLowerCase() === name.toLowerCase()
        )
      );
    });
  }, []);

  useEffect(() => {
    if (selectedPlatform) {
    console.log('Filtered Movies:', 
        Object.entries(categoryMovies).map(([category, movies]) => ({
          category,
          count: filterMoviesByPlatform(movies, selectedPlatform).length,
          totalMovies: movies.length
        }))
      );
    }
  }, [selectedPlatform, categoryMovies, filterMoviesByPlatform]);

  // Effet pour charger les films avec mise en cache
  useEffect(() => {
    const fetchMoviesData = async () => {
      try {
        setIsLoading(true);
        
        // Vérifier le cache
        const cachedData = sessionStorage.getItem('moviesData');
        if (cachedData) {
          setCategoryMovies(JSON.parse(cachedData));
          setIsLoading(false);
          return;
        }

        const data = await getMovies();
        const categorizedMovies = {
          "Now Playing": data.latestMovies,
          "Top Rated": data.topRated,
          "Most Popular": data.popularMovies,
          "Action & Adventure": data.actionAndAdventure,
          "Animation": data.animation,
          "Comedy": data.comedy,
          "Crime": data.crime,
          "Documentary": data.documentary,
          "Drama": data.drama,
          "Horror": data.horror,
          "Family": data.family,
          "Romance": data.romance,
          "Mystery & Thriller": data.mysteryAndThriller,
          "Sci-Fi": data.scifi,
          "War": data.war,
          "Western": data.western,
        };

        // Mettre en cache les données
        sessionStorage.setItem('moviesData', JSON.stringify(categorizedMovies));
        setCategoryMovies(categorizedMovies);
      } catch (error) {
        console.error("Erreur lors du chargement des films:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoviesData();
  }, []);

  // Mémoriser les films filtrés pour chaque catégorie
  const filteredCategories = useMemo(() => {
    return categories.map(category => ({
      category,
      movies: filterMoviesByPlatform(categoryMovies[category] || [], selectedPlatform)
    })).filter(({ movies }) => movies.length > 0);
  }, [categories, categoryMovies, selectedPlatform, filterMoviesByPlatform]);

  const handleSearch = async (query: string) => {
    if (query.length > 2) {
      setIsSearching(true);
      try {
        const results = await searchMovies(query);
        setSearchResults(results.results); // Assuming results are in the 'results' field
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
          <section className="text-center  space-y-4 my-32">
            <h1 className="text-6xl font-bold text-primary">Films</h1>
            <p className="text-xl text-primary">Explore une large selection de films</p>
            <SearchBar onSearch={handleSearch} />
          </section>
          
          <div className="space-y-6 mt-8">
            {/* <PlatformList 
              selectedPlatform={selectedPlatform}
              onPlatformSelect={setSelectedPlatform}
            /> */}
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
              <MovieCaroussel 
                title="Search Results"
                movies={searchResults}
              />
            ) : (
              !isSearching && (
                <div className="text-center"></div>
              )
            )}
            {filteredCategories.map(({ category, movies }) => (
              <Suspense 
                key={category} 
                fallback={
                  <div className="h-[300px] animate-pulse bg-gray-800 rounded-lg" />
                }
              >
                <LazyMovieSection 
                  category={category}
                  movies={movies}
                />
              </Suspense>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default PageMovies;
