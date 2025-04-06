"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MovieCard } from '@/components/films/movie-card';
import { Pagination } from '@/components/ui/pagination';
import { getMovies } from '@/components/getMovie';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
  providers?: {
    [key: string]: {
      flatrate?: Array<{ provider_name: string; provider_id: number }>;
      free?: Array<{ provider_name: string; provider_id: number }>;
      ads?: Array<{ provider_name: string; provider_id: number }>;
      rent?: Array<{ provider_name: string; provider_id: number }>;
      buy?: Array<{ provider_name: string; provider_id: number }>;
    };
  };
}

const ITEMS_PER_PAGE = 20;

const categoryMap: { [key: string]: keyof Awaited<ReturnType<typeof getMovies>> } = {
  "now-playing": "latestMovies",
  "top-rated": "topRated",
  "most-popular": "popularMovies",
  "action-adventure": "actionAndAdventure",
  "animation": "animation",
  "comedy": "comedy",
  "crime": "crime",
  "documentary": "documentary",
  "drama": "drama",
  "horror": "horror",
  "family": "family",
  "romance": "romance",
  "mystery-thriller": "mysteryAndThriller",
  "reality": "reality",
  "sci-fi": "scifi",
  "war": "war",
  "western": "western"
};

export default function CategoryPage() {
  const params = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalMovies, setTotalMovies] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const category = params.category as string;

  useEffect(() => {
    const loadMovies = async () => {
      try {
        console.log('Catégorie actuelle:', category);
        console.log('Clé de catégorie:', categoryMap[category]);
        
        setIsLoading(true);
        setError(null);
        const data = await getMovies();
        const categoryKey = categoryMap[category];
        
        if (!categoryKey) {
          setError("Catégorie non trouvée");
          return;
        }

        const allMovies = data[categoryKey] as Movie[];
        console.log('Films trouvés:', allMovies?.length || 0);
        
        if (!allMovies || allMovies.length === 0) {
          setError("Aucun film trouvé dans cette catégorie");
          return;
        }

        setTotalMovies(allMovies.length);
        
        // Pagination
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        setMovies(allMovies.slice(start, end));
      } catch (err) {
        setError("Erreur lors du chargement des films");
        console.error("Error loading movies:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovies();
  }, [category, currentPage]);

  const totalPages = Math.ceil(totalMovies / ITEMS_PER_PAGE);
  const categoryTitle = category.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return (
    <main className="min-h-screen bg-gradient-custom text-primary font-popins p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/pages/films"
            className="flex items-center text-sm hover:text-player-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Retour
          </Link>
          <h1 className="text-4xl font-bold">
            {categoryTitle}
          </h1>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-player-accent"></div>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center min-h-[400px]">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
} 