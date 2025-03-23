export interface TMDBMOVIE {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  realease_date: string;
  vote_average: number;
  genre_ids: number[];
  adult: boolean;
}

export interface TMDBResponse {
  result: TMDBMOVIE[];
  page: number;
  total_pages: number;
  total_results: number;
}
