import React from "react";
import { getImageUrl } from "@/utils/tmdb";
import Image from "next/image";
import { Button } from "./ui/button";
import { FaInfoCircle } from "react-icons/fa";
import { getMovies } from "./getMovie";
import Link from "next/link";

const StreamingUi = async () => {
  const { hero } = await getMovies();
  return (
    <div>
      <Image
        src={getImageUrl(hero.backdrop_path || "placeholder.svg")}
        alt={hero.title}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
        <h1 className="text-5xl md:text-6xl text-primary font-bold tracking-tighter">
          {hero.title}
        </h1>

        <div className="flex items-center gap-2 text-sm text-primary">
          <span>{hero ? "TV-MA" : "TV-14"}</span>
          <span>{new Date(hero.release_date).getFullYear()}</span>
          <span>HDR</span>
          <span>
            {hero.vote_average.toFixed(1)}{" "}
            <span className="text-yellow-500">★</span>
          </span>
        </div>
        <p className="max-w-xl text-primary font-bold">{hero.overview}</p>
        <div className="flex items-center gap-3">
          {/* <Link href={`/watch/${hero.id}?title=${encodeURIComponent(hero.title)}&description=${encodeURIComponent(hero.overview)}`}>
            <Button className="bg-slate-900 text-primary font-bold font-popins hover:bg-slate-900/90">
              <FaPlay className="w-4 h-4 mr-2" />
              Lecture
            </Button>
          </Link> */}
          <Link href={`/movie/${hero.id}`}>
            <Button
              className="bg-white/20 hover:bg-white/30 font-bold font-popins"
              variant="secondary"
            >
              <FaInfoCircle className="w-4 h-4 mr-2" />
              Plus d&apos;infos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StreamingUi;
