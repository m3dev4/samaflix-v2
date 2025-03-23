export interface Series {
  id: number;
  title: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  first_air_date: string;
  genre_ids?: number[];
  popularity?: number;
  overview?: string;
}

export interface ProviderProps {
  params: {
    providerId: string;
  };
}

export interface ProviderNames {
  [key: string]: string;
}
