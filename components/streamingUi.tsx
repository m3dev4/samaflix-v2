import React from "react";
import { getImageUrl } from "@/utils/tmdb";
import Image from "next/image";
import { Button } from "./ui/button";
import { FaInfoCircle, FaPlay } from "react-icons/fa";
import { getMovies } from "./getMovie";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Info, Play, Star } from "lucide-react";

const StreamingUi = async () => {
  const { hero } = await getMovies();
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 z-10 bg-gradient-custom-hero to-transparent" />

      {/* Gradient horizontal - de gauche à droite */}
      <div className="absolute inset-0 z-10 bg-gradient-custom-hero-reverse to-transparent" />
      <Image
        src={getImageUrl(hero.backdrop_path || "placeholder.svg")}
        alt={hero.title}
        fill
        className="object-cover"
        priority
      />

      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-12 max-w-2xl space-y-4">
        <h1 className="text-4xl md:text-6xl text-primary font-bold tracking-tighter">
          {hero.title}
        </h1>

        <div className="flex items-center flex-wrap gap-3 text-sm text-primary">
          <span>{hero ? "TV-MA" : "TV-14"}</span>
          <span>{new Date(hero.release_date).getFullYear()}</span>
          <Badge
            className="border-yellow-500 text-yellow-400"
            variant="outline"
          >
            HD
          </Badge>
          <div className="flex items-center ">
            <span className="text-yellow-400 mr-1">
              {hero.vote_average.toFixed(1)}{" "}
            </span>
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          </div>
        </div>
        <p className="text-gray-300 line-clamp-3 md:line-clamp-4">
          {hero.overview}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/watch/${hero.id}?title=${encodeURIComponent(hero.title)}&description=${encodeURIComponent(hero.overview)}`}
          >
            <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold font-popins">
              <Play className="w-4 h-4 mr-2 font-extrabold" />
              Lecture
            </Button>
          </Link>
          <Link href={`/movie/${hero.id}`}>
            <Button
              className="border-gray-700 bg-gray-900/60 backdrop-blur-sm hover:bg-gray-800"
              variant="secondary"
            >
              <Info className="w-4 h-4 mr-2" />
              Plus d&apos;infos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StreamingUi;
