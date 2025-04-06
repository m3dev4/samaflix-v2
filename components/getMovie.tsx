import {
  enrichMoviesWithProviders,
  fecthCategoryMysteryAndThriller,
  fecthCategorySciFi,
  fetchCategoryActionAndAdventure,
  fetchCategoryAnimation,
  fetchCategoryComedy,
  fetchCategoryCrime,
  fetchCategoryDocumentary,
  fetchCategoryDrama,
  fetchCategoryFamily,
  fetchCategoryHorror,
  fetchCategoryReality,
  fetchCategoryRomance,
  fetchCategoryWar,
  fetchCategoryWestern,
  fetchLatestMovies,
  fetchMostPopular,
  fetchPopularTVShows,
  fetchSimilar,
  fetchTopRated,
  fetchTrending,
  fetchSeriesByProviderAndRegion,
} from "../utils/tmdb";

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

// Fonction pour normaliser les titres
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

// Fonction utilitaire pour formater les résultats
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const formatAndEnrichMovies = async (results: any[]): Promise<Movie[]> => {
  // D'abord formater les données de base
  const formattedMovies = results.map((movie) => ({
    id: movie.id,
    title: movie.title || movie.name || "",
    original_title: movie.original_title || movie.original_name || "",
    english_title: movie.title_english || "", // Certains films ont un titre anglais
    normalized_title: normalizeTitle(movie.title || movie.name || ""),
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    overview: movie.overview,
    vote_average: movie.vote_average,
    release_date: movie.release_date || movie.first_air_date || "",
    providers: movie.providers?.FR || undefined,
  }));

  // Ensuite enrichir avec les providers
  return enrichMoviesWithProviders(formattedMovies);
};

export async function getMovies() {
  const trending = await fetchTrending();
  const heroMovie = trending.results[0];
  const similar = await fetchSimilar(heroMovie.id);
  const latestMovies = await fetchLatestMovies();
  const popularTvShow = await fetchPopularTVShows();
  const topRated = await fetchTopRated();
  const popularMovies = await fetchMostPopular();
  const actionAndAdventure = await fetchCategoryActionAndAdventure();
  const animation = await fetchCategoryAnimation();
  const comedy = await fetchCategoryComedy();
  const crime = await fetchCategoryCrime();
  const documentary = await fetchCategoryDocumentary();
  const drama = await fetchCategoryDrama();
  const horror = await fetchCategoryHorror();
  const family = await fetchCategoryFamily();
  const romance = await fetchCategoryRomance();
  const mysteryAndThriller = await fecthCategoryMysteryAndThriller();
  const reality = await fetchCategoryReality();
  const scifi = await fecthCategorySciFi();
  const war = await fetchCategoryWar();
  const western = await fetchCategoryWestern();

  // Utiliser Promise.all pour enrichir toutes les catégories en parallèle
  const [
    enrichedTrending,
    enrichedHero,
    enrichedSimilar,
    enrichedLatestMovies,
    enrichedPopular,
    enrichedTopRated,
    enrichedPopularMovies,
    enrichedActionAndAdventure,
    enrichedAnimation,
    enrichedComedy,
    enrichedCrime,
    enrichedDocumentary,
    enrichedDrama,
    enrichedHorror,
    enrichedFamily,
    enrichedRomance,
    enrichedMysteryAndThriller,
    enrichedReality,
    enrichedScifi,
    enrichedWar,
  ] = await Promise.all([
    formatAndEnrichMovies(trending.results),
    formatAndEnrichMovies([heroMovie]),
    formatAndEnrichMovies(similar.results.slice(0, 20)),
    formatAndEnrichMovies(latestMovies.results.slice(0, 20)),
    formatAndEnrichMovies(topRated.results.slice(0, 20)),
    formatAndEnrichMovies(popularMovies.results.slice(0, 20)),
    formatAndEnrichMovies(actionAndAdventure.results.slice(0, 20)),
    formatAndEnrichMovies(animation.results.slice(0, 20)),
    formatAndEnrichMovies(comedy.results.slice(0, 20)),
    formatAndEnrichMovies(crime.results.slice(0, 20)),
    formatAndEnrichMovies(documentary.results.slice(0, 20)),
    formatAndEnrichMovies(drama.results.slice(0, 20)),
    formatAndEnrichMovies(horror.results.slice(0, 20)),
    formatAndEnrichMovies(family.results.slice(0, 20)),
    formatAndEnrichMovies(romance.results.slice(0, 20)),
    formatAndEnrichMovies(mysteryAndThriller.results.slice(0, 20)),
    formatAndEnrichMovies(reality.results.slice(0, 20)),
    formatAndEnrichMovies(scifi.results.slice(0, 20)),
    formatAndEnrichMovies(war.results.slice(0, 20)),
    formatAndEnrichMovies(western.results.slice(0, 20)),
  ]);

  return {
    trending: enrichedTrending,
    hero: enrichedHero[0],
    similar: enrichedSimilar,
    latestMovies: enrichedLatestMovies,
    popular: enrichedPopular,
    topRated: enrichedTopRated,
    popularMovies: enrichedPopularMovies,
    actionAndAdventure: enrichedActionAndAdventure,
    animation: enrichedAnimation,
    comedy: enrichedComedy,
    crime: enrichedCrime,
    documentary: enrichedDocumentary,
    drama: enrichedDrama,
    horror: enrichedHorror,
    family: enrichedFamily,
    romance: enrichedRomance,
    mysteryAndThriller: enrichedMysteryAndThriller,
    reality: enrichedReality,
    scifi: enrichedScifi,
    war: enrichedWar,
  };
}

export async function getSeriesByProviderAndRegion(
  providers: string[],
  region: string = "FR",
  maxResults: number = 200,
  page: number = 1,
) {
  const series = await fetchSeriesByProviderAndRegion(providers, region);
  return series.slice(0, maxResults);
}
