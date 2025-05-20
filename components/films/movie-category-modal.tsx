"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import { MovieCard, MovieCardSkeleton } from "./movie-card";

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

interface MovieCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  categoryId?: string;
  initialMovies: Movie[];
  loadMoreMovies?: (page: number, category?: string) => Promise<Movie[]>;
  totalCount?: number;
}

const MovieCategoryModal = ({
  isOpen,
  onClose,
  title,
  categoryId,
  initialMovies,
  loadMoreMovies,
  totalCount = 0,
}: MovieCategoryModalProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  
  // Réinitialiser l'état quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setMovies(initialMovies);
      setPage(1);
      setHasMore(true);
    }
  }, [isOpen, initialMovies]);
  
  // Fonction pour charger plus de films
  const fetchMoreMovies = useCallback(async () => {
    if (!loadMoreMovies || isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const newMovies = await loadMoreMovies(nextPage, categoryId);
      
      if (newMovies.length === 0) {
        setHasMore(false);
      } else {
        setMovies(prevMovies => [...prevMovies, ...newMovies]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des films supplémentaires:", error);
    } finally {
      setIsLoading(false);
    }
  }, [loadMoreMovies, isLoading, hasMore, page, categoryId]);
  
  // Observer pour le scroll infini
  useEffect(() => {
    if (!isOpen) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          fetchMoreMovies();
        }
      },
      { threshold: 0.1 }
    );
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    
    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [isOpen, fetchMoreMovies, isLoading]);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 overflow-y-auto">
      <div className="relative w-full max-w-7xl h-full max-h-[90vh] bg-[#0f172a] rounded-lg p-6 m-4 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {title} ({movies.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 pr-2 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => (
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
                />
              </div>
            ))}
            
            {/* Loading skeletons */}
            {isLoading && (
              <>
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={`skeleton-${index}`}>
                    <MovieCardSkeleton />
                  </div>
                ))}
              </>
            )}
          </div>
          
          {/* Invisible loader for intersection observer */}
          {hasMore && (
            <div 
              ref={loaderRef} 
              className="h-20 w-full flex items-center justify-center mt-4"
            >
              {isLoading && (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
                  <span className="text-white text-sm">Chargement...</span>
                </div>
              )}
            </div>
          )}
          
          {!hasMore && movies.length > 0 && (
            <div className="text-center text-gray-400 mt-6 mb-4">
              Vous avez vu tous les films de cette catégorie
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCategoryModal;
