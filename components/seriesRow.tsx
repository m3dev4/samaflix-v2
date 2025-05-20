import React from "react";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { SeriesCard } from "./series/series-card";
import { Series } from "@/types";

interface SeriesRowProps {
  title: string;
  items: Series[];
}

const SeriesRow = ({ title, items }: SeriesRowProps) => {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link href="/pages/series">
          <Button variant="link" className="text-sm">
            Voir Tout
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <ScrollArea className="w-full whitespace-nowrap pb-6">
        <div className="flex gap-5 px-1">
          {items.map((item) => (
            <SeriesCard key={item.id} series={{
              id: item.id,
              title: item.name,
              poster_path: item.poster_view,
              vote_average: item.vote_average,
              first_air_date: item.first_air_date,
            }} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
};

export default SeriesRow;
