"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { MovieCard } from "@/components/films/movie-card";
import { Button } from "@/components/ui/button";
import { FaPlay } from "react-icons/fa";
import moviesData from "@/data/cpamieux_movies_with_links.json";
import Link from "next/link";
import { ThemeColorToggle } from "@/components/themes/theme-color-toggle";
import { ToastContainer, toast } from "react-toastify";
import { getVideoProgress } from "@/utils/videoProgress";
import "react-toastify/dist/ReactToastify.css";

interface MovieDetails {
  id: number;
  title: string;
  backdrop_path: string;
  overview: string;
  genres: Array<{ id: number; name: string }>;
  release_date: string;
}

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
}

interface StreamingMovie {
  title: string;
  url: string;
  image: string;
  type: string;
  streamingLinks: {
    url: string;
    provider: string;
    quality: string;
    type: string;
  }[];
}

export default function MoviePage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id as string;

  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [streamingUrl, setStreamingUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch movie details
        const detailsRes = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`,
        );
        if (!detailsRes.ok) {
          throw new Error("Movie not found");
        }
        const details = await detailsRes.json();
        setMovieDetails(details);

        // Find streaming URL
        const streamingMovie = (moviesData as StreamingMovie[]).find(
          (m) =>
            m.title.trim().toLowerCase() === details.title.trim().toLowerCase(),
        );

        if (streamingMovie) {
          const uqloadLink = streamingMovie.streamingLinks.find(
            (link) =>
              link.url.includes("uqload.") || link.url.includes("fuqload."),
          );
          if (uqloadLink) {
            setStreamingUrl(uqloadLink.url);
          }
        }

        // Fetch cast
        const creditsRes = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`,
        );
        const credits = await creditsRes.json();
        setCast(credits.cast.slice(0, 5));

        // Fetch similar movies
        const similarRes = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`,
        );
        const similar = await similarRes.json();
        setSimilarMovies(similar.results.slice(0, 10));
      } catch (error) {
        console.error("Error fetching movie data:", error);
        router.push("/pages/films");
      } finally {
        setIsLoading(false);
      }
    };

    if (movieId) {
      fetchData();
    }
  }, [movieId, router]);

  const handlePlayClick = () => {
    if (streamingUrl) {
      const encodedUrl = encodeURIComponent(streamingUrl);
      const encodedTitle = encodeURIComponent(movieDetails?.title || "");
      const encodedOverview = encodeURIComponent(movieDetails?.overview || "");
      router.push(
        `/watch/${movieId}?title=${encodedTitle}&url=${encodedUrl}&description=${encodedOverview}`,
      );
    } else {
      toast.info(
        "Ce film n'est pas encore disponible sur Samaflix. Il sera ajouté prochainement !🙂",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          style: {
            backgroundColor: "#1a1a1a",
            color: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "12px 24px"
          },
        },
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!movieDetails) {
    return null;
  }

  // Récupérer la progression du film
  const progress = getVideoProgress(movieId);
  const progressPercent = progress ? Math.floor((progress.currentTime / progress.duration) * 100) : 0;

  return (
    <div className="min-h-screen overflow-hidden bg-black text-primary w-full">
      <ToastContainer 
       position="top-right"
       autoClose={5000}
       hideProgressBar={false}
       newestOnTop
       closeOnClick
       rtl={false}
       pauseOnFocusLoss
       draggable
       pauseOnHover
       theme="dark"
      />
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/40 shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between py-4">
            <ul className="flex items-center gap-4 md:gap-8">
              <li className="flex items-center space-x-3 md:space-x-6">
                <Link
                  href="/"
                  className="text-xl md:text-2xl font-bold hover:text-primary transition-colors"
                >
                  Samaflix
                </Link>
                <Link
                  href="/pages/films"
                  className="text-base md:text-lg font-medium hover:text-primary transition-colors"
                >
                  Films
                </Link>
              </li>
            </ul>
            <div className="flex items-center">
              <ThemeColorToggle />
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section with backdrop */}
      <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[90vh] overflow-hidden w-full">
        <Image
          src={`https://image.tmdb.org/t/p/original${movieDetails.backdrop_path}`}
          alt={movieDetails.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-custom-reverse" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 space-y-2 md:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-popins font-bold">
            {movieDetails.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
            <span>{new Date(movieDetails.release_date).getFullYear()}</span>
            <div className="flex flex-wrap gap-2">
              {movieDetails.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-2 py-1 md:px-3 md:py-1 bg-white/20 rounded-full text-xs md:text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>

          <p className="max-w-2xl text-sm md:text-lg line-clamp-3 md:line-clamp-none">
            {movieDetails.overview}
          </p>

          <div className="space-y-2 md:space-y-4">
            {/* Progress bar if movie started */}
            {progress && streamingUrl && (
              <div className="w-full max-w-md">
                <div className="space-y-1 md:space-y-2">
                  <div className="flex justify-between text-xs md:text-sm text-gray-400">
                    <span>Progression : {progressPercent}%</span>
                    <span>{Math.floor(progress.currentTime / 60)}min</span>
                  </div>
                  <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Play button */}
            <div className="flex items-center gap-4">
              <Button
                onClick={handlePlayClick}
                className={`bg-slate-800 hover:bg-slate-900 text-primary px-4 sm:px-6 md:px-8 py-2 md:py-3 rounded-lg flex items-center gap-2 text-sm md:text-base ${
                  !streamingUrl ? 'opacity-50' : ''
                }`}
              >
                <FaPlay className="w-4 h-4 md:w-5 md:h-5" />
                {streamingUrl ? (progress ? 'Reprendre' : 'Lecture') : 'Bientôt disponible'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Casting</h2>
        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {cast.map((actor) => (
            <div key={actor.id} className="flex-shrink-0 w-24 md:w-32">
              <div className="aspect-[2/3] relative mb-1 md:mb-2">
                <Image
                  src={
                    actor.profile_path
                      ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                      : "/placeholder-actor.png"
                  }
                  alt={actor.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <p className="font-semibold text-xs md:text-sm truncate">{actor.name}</p>
              <p className="text-xs md:text-sm text-gray-400 truncate">{actor.character}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Similar Movies Section */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Films Similaires</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
          {similarMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  );
}