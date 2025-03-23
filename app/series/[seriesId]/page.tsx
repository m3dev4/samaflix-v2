"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Star, Play, RotateCcw } from "lucide-react";
import Link from "next/link";
import { ThemeColorToggle } from "@/components/themes/theme-color-toggle";
import { toast } from "sonner";

interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string;
  episode_number: number;
  air_date: string;
}

interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  episodes: Episode[];
}

interface SeriesDetails {
  id: number;
  name: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  vote_average: number;
  first_air_date: string;
  seasons: Season[];
}

interface WatchProgress {
  episodeId: number;
  currentTime: number;
  duration: number;
  seasonNumber: number;
  episodeNumber: number;
  lastWatched: string;
}

interface StreamingSource {
  url: string;
  type: 'mp4' | 'm3u8' | 'embed';
  player?: string;
  quality?: string;
  lang?: string;
}

export default function SeriesDetailsPage() {
  const params = useParams();
  const [series, setSeries] = useState<SeriesDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [watchProgress, setWatchProgress] = useState<WatchProgress | null>(null);
  const [episodeProgress, setEpisodeProgress] = useState<{[key: string]: WatchProgress}>({});
  const router = useRouter();

  useEffect(() => {
    const fetchSeriesDetails = async () => {
      try {
        const [detailsResponse, seasonsResponse] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/tv/${params.seriesId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`),
          fetch(`https://api.themoviedb.org/3/tv/${params.seriesId}/season/${selectedSeason}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`)
        ]);

        const details = await detailsResponse.json();
        const seasonDetails = await seasonsResponse.json();
        
        setSeries((prevSeries: SeriesDetails | null): SeriesDetails => ({
          ...details,
          seasons: details.seasons.map((season: Season): Season =>
            season.season_number === selectedSeason
              ? { ...season, episodes: seasonDetails.episodes as Episode[] }
              : season
          )
        }));
      } catch (error) {
        console.error("Error fetching series details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.seriesId) {
      fetchSeriesDetails();
    }
  }, [params.seriesId, selectedSeason]);

  useEffect(() => {
    // Charger les progressions au chargement de la page
    if (params.seriesId) {
      // Charger la progression globale
      const globalProgress = localStorage.getItem(`series-progress-${params.seriesId}`);
      if (globalProgress) {
        try {
          const savedProgress = JSON.parse(globalProgress);
          setWatchProgress(savedProgress);
          setSelectedSeason(savedProgress.seasonNumber);
        } catch (e) {
          console.error('Erreur lors du chargement de la progression globale:', e);
        }
      }

      // Charger toutes les progressions des épisodes
      const allProgress: {[key: string]: WatchProgress} = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`series-progress-${params.seriesId}-`)) {
          try {
            const progress = JSON.parse(localStorage.getItem(key) || '');
            const episodeKey = `${progress.seasonNumber}-${progress.episodeNumber}`;
            allProgress[episodeKey] = progress;
          } catch (e) {
            console.error('Erreur lors du chargement de la progression:', e);
          }
        }
      }
      setEpisodeProgress(allProgress);
    }
  }, [params.seriesId]);

  const handleEpisodeClick = async (episode: Episode, resumeTime?: number) => {
    try {
      if (!series) return;
      
      const loadingToast = toast.loading("Recherche d'un flux vidéo...", {
        duration: Infinity
      });
      
      const { extractDuLourd } = await import('@/utils/sites/duLourd/scrape');
      console.log("Searching streams for:", {
        name: series.name,
        season: selectedSeason,
        episode: episode.episode_number
      });
      
      const sources = await extractDuLourd(
        series.name,
        selectedSeason,
        episode.episode_number
      );
      
      console.log("Stream sources found:", sources);
      toast.dismiss(loadingToast);
      
      if (sources && sources.length > 0) {
        // Sélectionner le meilleur provider disponible
        const bestProvider = sources.find(s => s.player === 'uqload' && s.quality === '1080p') || 
                           sources.find(s => s.player === 'uqload') ||
                           sources[0];
        
        toast.success("Flux trouvé ! Lancement de la vidéo...", {
          duration: 2000
        });
        
        // Lancer directement la vidéo
        handleProviderSelection(episode, bestProvider, resumeTime);
      } else {
        toast.error("Impossible de trouver un flux vidéo pour cet épisode", {
          duration: 3000
        });
      }
    } catch (error) {
      toast.error("Erreur lors de la recherche du flux vidéo", {
        duration: 3000
      });
      console.error('Error:', error);
    }
  };

  const handleProviderSelection = async (episode: Episode, streamData: StreamingSource, resumeTime?: number) => {
    if (!series) return;

    const params = new URLSearchParams({
      url: streamData.url,
      title: `${series.name} - S${selectedSeason}E${episode.episode_number} - ${episode.name}`,
      description: episode.overview || '',
      startTime: resumeTime ? resumeTime.toString() : '0',
      seriesId: series.id.toString()
    });
    
    const url = `/watch-serie/${series.id}?${params.toString()}`;
    console.log("Redirecting to:", url);
    
    try {
      await router.push(url);
    } catch (error) {
      console.error("Router push failed:", error);
      window.location.href = url;
    }
  };

  if (isLoading || !series) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section with Backdrop */}
      <div className="relative w-full" style={{ height: 'calc(56.25vw)' }}>
        <Image
          src={`https://image.tmdb.org/t/p/original${series.backdrop_path}`}
          alt={series.name}
          fill
          className="object-cover"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        {/* Navigation */}
        <header className="absolute top-0 left-0 right-0 z-10">
          <div className="p-4">
            <Link
              href="/pages/series"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/40 hover:bg-black/60"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
          </div>
        </header>
      </div>

      {/* Series Info */}
      <div className="px-4 -mt-10 relative z-10">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2">{series.name}</h1>
        
        <div className="flex items-center gap-2 text-sm text-white/90 mb-4">
          <span>{new Date(series.first_air_date).getFullYear()}</span>
          <span className="w-1 h-1 rounded-full bg-white/50"></span>
          <span>{series.vote_average.toFixed(1)} ★</span>
        </div>

        <p className="text-sm text-white/80 line-clamp-3 mb-4">{series.overview}</p>

        {watchProgress && (
          <button
            onClick={() => {
              const episode = series?.seasons
                .find(s => s.season_number === watchProgress.seasonNumber)
                ?.episodes?.find(e => e.episode_number === watchProgress.episodeNumber);
              if (episode) {
                handleEpisodeClick(episode, watchProgress.currentTime);
              }
            }}
            className="w-full bg-white hover:bg-white/90 text-black font-medium px-4 py-3 rounded-md mb-6 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Reprendre S{watchProgress.seasonNumber} E{watchProgress.episodeNumber}
          </button>
        )}

        <div className="flex items-center gap-2 text-xs text-white/60 mb-8">
          <span className="font-medium">Action</span>
          <span>•</span>
          <span className="font-medium">Drame</span>
          <span>•</span>
          <span className="font-medium">Suspense</span>
        </div>
      </div>

      {/* Season Selector */}
      <div className="px-4 mb-4">
        <select 
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(Number(e.target.value))}
          className="w-full bg-transparent border border-white/20 text-white px-4 py-3 rounded-md appearance-none cursor-pointer mb-4"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            backgroundSize: '1.5rem'
          }}
        >
          {series?.seasons.map((season) => (
            <option key={season.id} value={season.season_number}>
              Saison {season.season_number}
            </option>
          ))}
        </select>
      </div>

      {/* Episodes List */}
      <div className="pb-8">
        {series?.seasons
          .find(s => s.season_number === selectedSeason)
          ?.episodes?.map((episode) => {
            const progress = episodeProgress[`${selectedSeason}-${episode.episode_number}`];
            const progressPercentage = progress ? (progress.currentTime / progress.duration) * 100 : 0;

            return (
              <div
                key={episode.id}
                className="group border-b border-white/10 cursor-pointer"
                onClick={() => handleEpisodeClick(episode, progress?.currentTime)}
              >
                <div className="px-4 py-3 flex gap-4">
                  <div className="relative w-32 aspect-video rounded overflow-hidden flex-shrink-0">
                    {episode.still_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                        alt={episode.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white/40" />
                      </div>
                    )}
                    {progress && (
                      <div className="absolute bottom-0 left-0 right-0">
                        <div className="h-1 bg-white/20">
                          <div 
                            className="h-full bg-red-600"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-medium text-sm">
                        {episode.episode_number}. {episode.name}
                      </h3>
                      <span className="text-xs text-white/60 flex-shrink-0">
                        {progress ? formatTime(progress.duration) : "45m"}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 line-clamp-2">
                      {episode.overview || "Aucune description disponible"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </main>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
