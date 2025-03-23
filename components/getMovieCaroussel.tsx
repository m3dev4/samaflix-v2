import React from "react";
import { getMovies } from "./getMovie";
import MovieCaroussel from "@/components/films/movieCaroussel";


const GetMovieCaroussel = async () => {
  const {
    latestMovies,
    topRated,
    popularMovies,
    actionAndAdventure,
    animation,
    comedy,
    crime,
    documentary,
    drama,
    horror,
    family,
    romance,
    mysteryAndThriller,
    reality,
    scifi,
    war,
    western,
  } = await getMovies();
  return (
    <div className="space-y-8">
      {/* <MovieCaroussel title='Popular Movies' movies={trending} /> */}
      <MovieCaroussel title="Latest Movies" movies={latestMovies} />
      <MovieCaroussel title="Top Rated Movies" movies={topRated} />
      <MovieCaroussel title="Popular Movies" movies={popularMovies} />
      <MovieCaroussel title="Action & Adventure" movies={actionAndAdventure} />
      <MovieCaroussel title="Animation" movies={animation} />
      <MovieCaroussel title="Comedy" movies={comedy} />
      <MovieCaroussel title="Crime" movies={crime} />
      <MovieCaroussel title="Documentary" movies={documentary} />
      <MovieCaroussel title="Drama" movies={drama} />
      <MovieCaroussel title="Horror" movies={horror} />
      <MovieCaroussel title="Family" movies={family} />
      <MovieCaroussel title="Romance" movies={romance} />
      <MovieCaroussel title="Mystery & Thriller" movies={mysteryAndThriller} />
      <MovieCaroussel title="Reality" movies={reality} />
      <MovieCaroussel title="Sci-Fi" movies={scifi} />
      <MovieCaroussel title="War" movies={war} />
      <MovieCaroussel title="Western" movies={western} />

    </div>
  );
};

export default GetMovieCaroussel;
