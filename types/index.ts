export interface Series {
  id: number;
  name: string;
  overview: string;
  poster_view: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  origin_country: string[];
  genre_ids: number[];
  providers?: {
    [key: string]: {
      flatrate?: Array<{ provider_name: string; provider_id: number }>;
      free?: Array<{ provider_name: string; provider_id: number }>;
      ads?: Array<{ provider_name: string; provider_id: number }>;
    };
  };
}

export interface SeriesDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  seasons: Season[];
  number_of_seasons: number;
  status: string;
  vote_average: number;
  first_air_date: string;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  poster_path: string;
  episodes?: Episode[];
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  still_path: string | null;
  air_date: string;
  vote_average: number;
}

export interface EpisodeLink {
  quality: string;
  embedUrl: string;
  provider: string;
}

export interface CategoryGroup {
  title: string;
  series: Series[];
  allSeries: Series[];
}


export interface StreamingSource {
  url: string;
  type: 'mp4' | 'm3u8' | 'embed';
  player?: string;
  quality?: string;
  lang?: string;
}

export interface Provider {
  name: string
  domains: string[]
  extractSource: (url: string) => Promise<StreamingSource | null>
}

export interface EpisodeMetadata {
  seriesId: string
  seasonNumber: number
  episodeNumber: number
  title?: string
}