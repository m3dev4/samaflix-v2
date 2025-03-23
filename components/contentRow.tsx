import React from "react";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/utils/tmdb";
import Link from "next/link";
interface ContentRowProps {
  title: string;
  items: Array<{
    id: number;
    title: string;
    name?: string;
    poster_path: string;
  }>;
}
const ContentRow = ({ title, items }: ContentRowProps) => {
  return (
    <section className="px-8 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
      <Link href="/pages/films">
      <Button variant="ghost" className="text-sm">
          Voir Tout
          <ChevronRight className="w-4 h-4" />
        </Button>
      </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <Link href={`/movie/${item.id}`} key={item.id}>
          <div

            className="relative aspect-[2/3] rounded-md overflow-hidden group"
          >
            <Image
              src={getImageUrl(item.poster_path, "w500") || "placeholder.svg"}
              alt={item.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ContentRow;
