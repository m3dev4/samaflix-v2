import axios from 'axios';

const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p";

// Cache pour les requêtes API
const API_CACHE: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_DURATION = 3600; // 1 heure en secondes

// Fonction utilitaire pour les requêtes avec cache
async function fetchWithCache(url: string) {
  const cache = API_CACHE[url];
  const now = Date.now();

  if (cache && now - cache.timestamp < CACHE_DURATION * 1000) {
    return cache.data;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`TMDB API Error: ${res.status} for URL: ${url}`);
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();

    API_CACHE[url] = { data, timestamp: now };
    return data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return { results: [] }; // Return empty results instead of throwing
  }
}

// Fonction utilitaire pour récupérer les providers d'un film
async function fetchMovieProviders(movieId: number) {
  try {
    const url = `${TMDB_API_URL}/movie/${movieId}/watch/providers?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
    const data = await fetchWithCache(url);
    return data.results?.FR || null; // Retourne spécifiquement les providers français
  } catch (error) {
    console.error(`Error fetching providers for movie ${movieId}:`, error);
    return null;
  }
}

// Fonction utilitaire pour enrichir les résultats avec les providers
export async function enrichMoviesWithProviders(movies: any[]) {
  const enrichedMovies = await Promise.all(
    movies.map(async (movie) => {
      const providers = await fetchMovieProviders(movie.id);
      return {
        ...movie,
        providers: providers ? { FR: providers } : null
      };
    })
  );
  return enrichedMovies;
}

export async function fetchTrending() {
  const url = `${TMDB_API_URL}/trending/all/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`;
  return fetchWithCache(url);
}

export async function fetchSimilar(movieId: number) {
  const url = `${TMDB_API_URL}/movie/${movieId}/similar?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`;
  return fetchWithCache(url);
}

export async function fetchLatestMovies() {
  const url = `${TMDB_API_URL}/movie/now_playing?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR&region=FR`;
  return fetchWithCache(url);
}

export async function fetchPopularTVShows() {
  const url = `${TMDB_API_URL}/tv/popular?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`;
  return fetchWithCache(url);
}

export async function fetchTopRated() {
  const url = `${TMDB_API_URL}/movie/top_rated?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`;
  return fetchWithCache(url);
}

export async function searchMovies(query: string) {
  const url = `${TMDB_API_URL}/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${query}&language=fr-FR`;
  return fetchWithCache(url);
}

export async function fetchMostPopular() {
  const url = `${TMDB_API_URL}/movie/popular?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`;
  return fetchWithCache(url);
}

// Catégories TMDB avec cache
export async function fetchCategoryActionAndAdventure() {
  const url = `${TMDB_API_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=12,28`;
  return fetchWithCache(url);
}

export async function fetchCategoryAnimation() {
  const url = `${TMDB_API_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=16`;
  return fetchWithCache(url);
}

export async function fetchCategoryComedy() {
  const url = `${TMDB_API_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=35`;
  return fetchWithCache(url);
}

export async function fetchCategoryCrime() {
  const url = `${TMDB_API_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=80`;
  return fetchWithCache(url);
}

export async function fetchCategoryDocumentary() {
  const url = `${TMDB_API_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=99`;
  return fetchWithCache(url);
}

export async function fetchCategoryDrama() {
  const url = `${TMDB_API_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=18`;
  return fetchWithCache(url);
}

export async function fetchCategoryHorror() {
  const url = `${TMDB_API_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=27`;
  return fetchWithCache(url);
}

export async function fetchCategoryFamily() {
  const url = `${TMDB_API_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=10751`;
  return fetchWithCache(url);
}

export async function fetchCategoryRomance() {
  const url = `${TMDB_API_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=10749`;
  return fetchWithCache(url);
}

export async function fecthCategoryMysteryAndThriller() {
  const url = `${TMDB_API_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=9648,53`;
  return fetchWithCache(url);
}

export async function fetchCategoryReality() {
  const url = `${TMDB_API_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=10764`;
  return fetchWithCache(url);
}

export async function fecthCategorySciFi() {
  const url = `${TMDB_API_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=878`;
  return fetchWithCache(url);
}

export async function fetchCategoryWar() {
  const url = `${TMDB_API_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=10752`;
  return fetchWithCache(url);
}

export async function fetchCategoryWestern() {
  const url = `${TMDB_API_URL}/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=37`;
  return fetchWithCache(url);
}

export function getImageUrl(path: string, size: "original" | "w500" = "original") {
  return `${TMDB_IMAGE_URL}/${size}${path}`;
}

//  Fonctions pour les series tv

export async function fetchPopularSeries() {
  const url = `${TMDB_API_URL}/tv/popular?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`
  return fetchWithCache(url);
}

export async function fetchTopRatedSeries() {
  const url = `${TMDB_API_URL}/tv/top_rated?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`
  return fetchWithCache(url);
}

export async function fetchLatestSeries() {
  const url = `${TMDB_API_URL}/tv/on_the_air?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`
  return fetchWithCache(url);
}

export async function fetchSeriesProviders(seriesId: number) {
  try {
      const url = `${TMDB_API_URL}/tv/${seriesId}/watch/providers?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;
      const data = await fetchWithCache(url);
      return data.results?.FR || null;
  } catch (error) {
      console.error(`Error fetching providers for series ${seriesId}:`, error);
      return null;
  }
}

export async function fetchSeriesActionAndAdventure() {
  const url = `${TMDB_API_URL}/discover/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=10759&language=fr-FR`;
  return fetchWithCache(url);
}

export async function fetchSeriesAnimation() {
  const url = `${TMDB_API_URL}/discover/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=16&language=fr-FR`;
  return fetchWithCache(url);
}

export async function fetchSeriesComedy() {
  const url = `${TMDB_API_URL}/discover/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=35&language=fr-FR`;
  return fetchWithCache(url);
}

export async function fetchSeriesCrime() {
  const url = `${TMDB_API_URL}/discover/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=80&language=fr-FR`;
  return fetchWithCache(url);
}

export async function fetchSeriesDrama() {
  const url = `${TMDB_API_URL}/discover/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=18&language=fr-FR`;
  return fetchWithCache(url);
}

export async function fetchSeriesHorror() {
  const url = `${TMDB_API_URL}/discover/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=27&language=fr-FR`;
  return fetchWithCache(url);
}

export async function fetchSeriesSciFiAndFantasy() {
  const url = `${TMDB_API_URL}/discover/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=10765&language=fr-FR`;
  return fetchWithCache(url);
}

export async function fetchSeriesDocumentary() {
  const url = `${TMDB_API_URL}/discover/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&with_genres=99&language=fr-FR`;
  return fetchWithCache(url);
}

export async function searchSeries(query: string) {
  const url = `${TMDB_API_URL}/search/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${query}&language=fr-FR`;
  return fetchWithCache(url);
}

export async function enrichSeriesWithProviders(series: any[]) {
  const enrichedSeries = await Promise.all(
      series.map(async (show) => {
          const providers = await fetchSeriesProviders(show.id);
          return {
              ...show,
              providers: providers ? { FR: providers } : null
          };
      })
  );
  return enrichedSeries;
}

export async function fetchSimilarSeries(seriesId: number) {
  const url = `${TMDB_API_URL}/tv/${seriesId}/similar?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`;
  return fetchWithCache(url);
}

// Nouvelle fonction pour précharger les images
export function preloadImage(src: string) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = src;
  });
}

export async function fetchSeriesByProviderAndRegion(
  providers: string[],
  region: string = "FR",
  maxResults: number = 1000,
  page: number = 1
) {
  try {
    const providerQueries = providers.map(provider => `with_watch_providers=${provider}`).join('&');
    const url = `${TMDB_API_URL}/discover/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR&watch_region=${region}&${providerQueries}&page=${page}`;
    const data = await fetchWithCache(url);
    
    if (!data.results) {
      console.error('No results found in TMDB response');
      return [];
    }

    const enrichedResults = await enrichSeriesWithProviders(data.results);
    return enrichedResults.slice(0, maxResults);
  } catch (error) {
    console.error('Error fetching series by provider:', error);
    return [];
  }
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        next: { revalidate: CACHE_DURATION }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Tentative ${i + 1}/${retries} échouée:`, error);
      lastError = error;
      
      // Attendre un peu plus longtemps entre chaque tentative
      await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 4000)));
    }
  }

  throw lastError;
}

export async function fetchMovieDetails(movieId: string) {
  const url = `${TMDB_API_URL}/movie/${movieId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`;
  
  try {
    // Essayer d'abord de récupérer depuis le cache du navigateur
    const cacheKey = `movie-${movieId}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const isExpired = Date.now() - timestamp > CACHE_DURATION * 1000;
      
      if (!isExpired) {
        return data;
      }
    }

    // Si pas en cache ou expiré, faire la requête
    const data = await fetchWithRetry(url);
    
    // Sauvegarder dans le cache
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));

    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du film:", error);
    throw error;
  }
}

export async function fetchSeriesDetails(seriesId: string) {
  const url = `${TMDB_API_URL}/tv/${seriesId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`;
  
  try {
    const cacheKey = `series-${seriesId}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const isExpired = Date.now() - timestamp > CACHE_DURATION * 1000;
      
      if (!isExpired) {
        return data;
      }
    }

    const data = await fetchWithRetry(url);
    
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));

    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de la série:", error);
    throw error;
  }
}