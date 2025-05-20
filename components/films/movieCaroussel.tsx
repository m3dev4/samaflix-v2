"use client";

import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { MovieCard, MovieCardSkeleton } from "./movie-card";
import { useInView } from "react-intersection-observer";
import ViewToggle from "../veiwToggle";
import MovieCategoryModal from "./movie-category-modal";
import { searchMovies, getMoviesByCategory } from "@/utils/tmdb";

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
  viewMode?: "grid" | "row";
  onViewChange?: (category: string, view: "grid" | "row") => void;
  categoryId?: string;
}

const VISIBLE_ITEMS = 5;

const MovieCaroussel = ({
  title,
  movies = [],
  className = "",
  selectedPlatform,
  viewMode = "row",
  onViewChange,
  categoryId,
}: MovieCarousselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  
  // Fonction pour charger plus de films à la demande
  const loadMoreMovies = useCallback(async (page: number, catId?: string) => {
    try {
      let newMovies: Movie[] = [];
      
      // Utiliser l'ID de catégorie pour charger les films correspondants
      if (catId) {
        // Si nous avons un ID de catégorie spécifique, utiliser cette fonction
        newMovies = await getMoviesByCategory(catId, page);
      } else {
        // Sinon, utiliser le titre de la catégorie pour faire une recherche
        // Convertir les titres de catégories en paramètres de recherche appropriés
        const categoryParam = (() => {
          switch (title) {
            case "Now Playing":
              return "now_playing";
            case "Top Rated":
              return "top_rated";
            case "Most Popular":
              return "popular";
            case "Upcoming":
              return "upcoming";
            default:
              return title.toLowerCase().replace(/\s+/g, '_');
          }
        })();
        
        newMovies = await getMoviesByCategory(categoryParam, page);
      }
      
      return newMovies;
    } catch (error) {
      console.error(`Erreur lors du chargement des films pour ${title}:`, error);
      return [];
    }
  }, [title]);

  // Si aucun film n'est disponible pour la plateforme sélectionnée, ne pas afficher le carousel
  if (selectedPlatform && movies.length === 0) {
    return null;
  }

  // Optimisation du préchargement des images
  const preloadNextImages = useCallback(async () => {
    if (inView && movies.length > 0) {
      // Préchargement limité aux images visibles + 2 pour une meilleure expérience
      const nextMovies = movies.slice(
        currentIndex,
        currentIndex + VISIBLE_ITEMS + 2,
      );
      
      // Préchargement en série plutôt qu'en parallèle pour éviter la congestion
      for (const movie of nextMovies) {
        await new Promise((resolve) => {
          if (!movie.poster_path) {
            resolve(null);
            return;
          }
          
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          // Utiliser une taille d'image plus petite pour le préchargement
          img.src = `https://image.tmdb.org/t/p/w342${movie.poster_path}`;
        });
        // Petit délai entre chaque préchargement pour éviter de submerger l'API
        await new Promise(resolve => setTimeout(resolve, 50));
      }
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl text-primary font-popins">
          {title} {movies.length > 0 && `(${movies.length})`}
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 rounded-md text-sm font-medium transition-colors"
            aria-label="Voir tous les films de cette catégorie"
          >
            <Eye className="h-4 w-4" />
            Voir tout
          </button>
          {onViewChange && (
            <ViewToggle
              currentView={viewMode}
              onViewChange={(view) => onViewChange(title, view)}
            />
          )}
        </div>
      </div>
      {viewMode === "row" ? (
        <div className="relative group">
          <div
            ref={scrollRef}
            className={`flex overflow-x-auto overflow-y-hidden gap-4 scrollbar-hide snap-x snap-mandatory ${className}`}
            onScroll={handleScroll}
          >
            {movies.map((movie, index) => (
              <div key={movie.id} className="flex-none w-[200px] snap-start">
                {/* Optimisation: N'afficher la carte que pour les éléments visibles ou proches */}
                {(index >= Math.max(0, currentIndex - 2) && 
                 index <= currentIndex + VISIBLE_ITEMS + 1) ? (
                  <MovieCard
                    movie={{
                      id: movie.id,
                      title: movie.title || movie.name || "",
                      poster_path: movie.poster_path,
                      vote_average: movie.vote_average,
                      release_date: movie.release_date,
                      providers: movie.providers?.FR,
                    }}
                    priority={index < VISIBLE_ITEMS}
                  />
                ) : (
                  <div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Limiter l'affichage à un maximum de 15 éléments en mode grille pour de meilleures performances */}
          {movies.slice(0, 15).map((movie, index) => (
            <div key={movie.id}>
              <MovieCard
                movie={{
                  id: movie.id,
                  title: movie.title || movie.name || "",
                  poster_path: movie.poster_path,
                  vote_average: movie.vote_average,
                  release_date: movie.release_date,
                  providers: movie.providers?.FR,
                }}
                priority={index < 5} // Priorité seulement pour les 5 premiers éléments
              />
            </div>
          ))}
        </div>
      )}

      {viewMode === "row" && (
        <div className="relative">
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
      )}
      {/* Modal pour voir tous les films de la catégorie */}
      <MovieCategoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        categoryId={categoryId}
        initialMovies={movies}
        loadMoreMovies={loadMoreMovies}
        totalCount={movies.length > 0 ? movies.length * 3 : 100} // Estimation du nombre total de films
      />
    </div>
  );
};

export default MovieCaroussel;