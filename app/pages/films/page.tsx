"use client";

import PlatformList from "../../../components/films/platform-list";
import { SearchBar } from "../../../components/films/search-bar";
import { searchMovies } from "../../../utils/tmdb";
import Category from "../../../components/films/category";
import MovieCaroussel from "../../../components/films/movieCaroussel";
import React, { useEffect, useState, Suspense, useMemo } from "react";
import { categories } from "../../../constants";
import { getMovies } from "../../../components/getMovie";
import { useInView } from "react-intersection-observer";
import Navbar from "@/components/navbar";
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
const LazyMovieSection = ({
  category,
  movies,
  viewMode,
  onViewChange,
}: {
  category: string;
  movies: Movie[];
  viewMode: "grid" | "row";
  onViewChange: (category: string, view: "grid" | "row") => void;
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
          <MovieCaroussel 
            title={category} 
            movies={movies} 
            viewMode={viewMode}
            onViewChange={onViewChange}
          />
        </section>
      )}
    </div>
  );
};

const PageMovies = () => {
  const [categoryMovies, setCategoryMovies] = useState<{
    [key: string]: Movie[];
  }>({});
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [categoryViewModes, setCategoryViewModes] = useState<{
    [key: string]: "grid" | "row";
  }>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ref: headerRef, inView: headerInView } = useInView({
    threshold: 0,
    initialInView: true,
  });

  // Fonction mémorisée pour filtrer les films par plateforme
  const filterMoviesByPlatform = useMemo(
    () =>
      (movies: Movie[], platform: string | null): Movie[] => {
        if (!platform) return movies;

        // Fonction helper pour normaliser les noms des providers
        const normalizeProviderName = (name: string) => {
          const platformMap: { [key: string]: string[] } = {
            Netflix: ["Netflix"],
            "Apple TV+": ["Apple TV Plus", "Apple TV+", "Apple TV"],
            Max: ["HBO Max", "Max"],
            "Prime Video": [
              "Amazon Prime Video",
              "Prime Video",
              "Amazon Video",
            ],
            "Disney+": ["Disney Plus", "Disney+"],
            "Paramount+": ["Paramount Plus", "Paramount+"],
            Hulu: ["Hulu"],
          };

          return platformMap[platform] || [platform];
        };

        const platformNames = normalizeProviderName(platform);

        return movies.filter((movie) => {
          const providers = movie.providers?.FR;

          if (!providers) return false;

          // Vérifier dans toutes les catégories de providers
          const allProviders = [
            ...(providers.flatrate || []),
            ...(providers.free || []),
            ...(providers.ads || []),
          ];

          return allProviders.some((provider) =>
            platformNames.some(
              (name) =>
                provider.provider_name.toLowerCase() === name.toLowerCase(),
            ),
          );
        });
      },
    [],
  );

  useEffect(() => {
    if (selectedPlatform) {
      console.log(
        "Filtered Movies:",
        Object.entries(categoryMovies).map(([category, movies]) => ({
          category,
          count: filterMoviesByPlatform(movies, selectedPlatform).length,
          totalMovies: movies.length,
        })),
      );
    }
  }, [selectedPlatform, categoryMovies, filterMoviesByPlatform]);

  // Effet pour charger les films avec mise en cache et chargement progressif
  useEffect(() => {
    // Premier chargement - vérifier le cache pour un démarrage rapide
    const checkCache = () => {
      try {
        const cachedData = localStorage.getItem("moviesData");
        const cachedTimestamp = localStorage.getItem("moviesDataTimestamp");
        
        if (cachedData && cachedTimestamp) {
          // Vérifier si le cache a moins de 12 heures
          const now = Date.now();
          const timestamp = parseInt(cachedTimestamp);
          const twelveHoursMs = 12 * 60 * 60 * 1000;
          
          if (now - timestamp < twelveHoursMs) {
            const parsedData = JSON.parse(cachedData);
            setCategoryMovies(parsedData);
            setIsLoading(false);
            return true; // Cache valide et utilisé
          }
        }
        return false; // Pas de cache ou cache expiré
      } catch (error) {
        console.error("Erreur lors de la récupération du cache:", error);
        return false;
      }
    };

    // Chargement initial des catégories principales uniquement
    const loadInitialCategories = async () => {
      try {
        setIsLoading(true);
        
        // Charger d'abord uniquement les 3 premières catégories pour un affichage rapide
        const data = await getMovies();
        
        const initialCategories = {
          "Now Playing": data.latestMovies || [],
          "Top Rated": data.topRated || [],
          "Most Popular": data.popularMovies || [],
        };
        
        setCategoryMovies(initialCategories);
        setIsLoading(false);
        
        return { data, initialCategories };
      } catch (error) {
        console.error("Erreur lors du chargement initial des films:", error);
        setIsLoading(false);
        return { data: {}, initialCategories: {} };
      }
    };

    // Chargement des catégories restantes en arrière-plan
    const loadRemainingCategories = async (data: any, initialCategories: any) => {
      try {
        // Délai pour permettre au rendu initial de se terminer
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const allCategories = {
          ...initialCategories,
          "Action & Adventure": data.actionAndAdventure || [],
          "Animation": data.animation || [],
          "Comedy": data.comedy || [],
          "Crime": data.crime || [],
          "Documentary": data.documentary || [],
          "Drama": data.drama || [],
          "Horror": data.horror || [],
          "Family": data.family || [],
          "Romance": data.romance || [],
          "Mystery & Thriller": data.mysteryAndThriller || [],
          "Sci-Fi": data.scifi || [],
          "War": data.war || [],
        };
        
        setCategoryMovies(allCategories);
        
        // Mettre à jour le cache avec des données fraîches
        localStorage.setItem("moviesData", JSON.stringify(allCategories));
        localStorage.setItem("moviesDataTimestamp", Date.now().toString());
      } catch (error) {
        console.error("Erreur lors du chargement des catégories restantes:", error);
      }
    };

    const initializeData = async () => {
      // Vérifier d'abord le cache
      if (!checkCache()) {
        // Si pas de cache valide, charger les catégories principales
        const { data, initialCategories } = await loadInitialCategories();
        
        // Puis charger les catégories restantes en arrière-plan
        loadRemainingCategories(data, initialCategories);
      } else {
        // Le cache a été utilisé, mais rafraîchir les données en arrière-plan après un délai
        setTimeout(async () => {
          const { data, initialCategories } = await loadInitialCategories();
          loadRemainingCategories(data, initialCategories);
        }, 5000);
      }
    };

    initializeData();
  }, []);

  // Mémoriser les films filtrés pour chaque catégorie
  const filteredCategories = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        movies: filterMoviesByPlatform(
          categoryMovies[category] || [],
          selectedPlatform,
        ),
        viewMode: categoryViewModes[category] || "row",
      }))
      .filter(({ movies }) => movies.length > 0);
  }, [categories, categoryMovies, selectedPlatform, filterMoviesByPlatform, categoryViewModes]);
  
  // Gérer le changement de mode d'affichage pour une catégorie
  const handleViewModeChange = (category: string, viewMode: "grid" | "row") => {
    setCategoryViewModes((prev) => ({
      ...prev,
      [category]: viewMode,
    }));
  };

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
      <Navbar />
      <div className="container mx-auto px-4 py-8 space-y-12">
        <div ref={headerRef}>
          <section className="text-center  space-y-4 my-32">
            <h1 className="text-6xl font-bold text-primary">Films</h1>
            <p className="text-xl text-primary">
              Explore une large selection de films
            </p>
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
                className="overflow-x-auto"
              />
            ) : (
              !isSearching && <div className="text-center"></div>
            )}
            {filteredCategories.map((item) => (
              <div key={item.category} className="mb-10">
                <LazyMovieSection
                  category={item.category}
                  movies={item.movies}
                  viewMode={item.viewMode}
                  onViewChange={handleViewModeChange}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default PageMovies;
