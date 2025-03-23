"use client";

import { fetchMovieDetails } from "@/utils/tmdb";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, Loader2, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface MovieDetails {
  title: string;
  overview: string;
  backdrop_path: string;
  release_date: string;
  // Ajoutez d'autres propriétés selon vos besoins
}

export default function MovieDetailsPage() {
  const params = useParams();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadMovieDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMovieDetails(params.id as string);
      setMovie(data);
      setRetryCount(0); // Réinitialiser le compteur en cas de succès
    } catch (error) {
      console.error("Erreur lors du chargement des détails du film:", error);
      setError("Une erreur est survenue lors du chargement des détails du film");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovieDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black/80">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-white/80">Chargement du film...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black/80">
        <div className="max-w-md w-full p-6 space-y-4">
          <Alert variant="destructive" className="bg-destructive/20 border-destructive/30">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            variant="outline"
            onClick={() => {
              setRetryCount(prev => prev + 1);
              loadMovieDetails();
            }}
            disabled={retryCount >= 3}
            className="w-full bg-white/5 border-white/20 hover:bg-white/10 transition-all group"
          >
            <RefreshCcw className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
            {retryCount >= 3 ? "Trop de tentatives" : "Réessayer"}
          </Button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black/80">
        <Alert variant="destructive" className="max-w-md bg-destructive/20 border-destructive/30">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>Film non trouvé</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {movie.backdrop_path && (
        <div className="relative h-[50vh] md:h-[70vh]">
          <img 
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
      )}
      
      <div className="relative z-10 px-4 py-8 -mt-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{movie.title}</h1>
          <p className="text-lg text-white/80 leading-relaxed">{movie.overview}</p>
        </div>
      </div>
    </div>
  );
} 