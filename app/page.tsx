import StreamingUi from "@/components/streamingUi";
import ContentRow from "@/components/contentRow";
import { getMovies } from "@/components/getMovie";
import AlerteInfo from "@/components/alerteInfo";
import Link from "next/link";
import { ThemeColorToggle } from "@/components/themes/theme-color-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, TrendingUp, Tv } from "lucide-react";
import { getSeries } from "@/components/getSerie";
import SeriesRow from "@/components/seriesRow";
import Navbar from "@/components/navbar";

export default async function Home() {
  const { trending, latestMovies, topRated, similar } = await getMovies();
  const { latest } = await getSeries();

  return (
    <div className="min-h-screen text-white bg-gradient-custom font-popins">
      <Navbar />
      {/* <div className="flex items-center justify-center">
      <AlerteInfo />
      </div> */}
      <div className="relative h-[85vh] w-full">
        <StreamingUi />
      </div>

      <div className="px-4 md:px-6 py-8 space-y-8">
        <Tabs defaultValue="tendances" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-gray-900/50">
              <TabsTrigger
                value="tendances"
                className="data-[state=active]:bg-rose-600"
              >
                <TrendingUp className="mr-2 h-4 w-4" /> Tendances
              </TabsTrigger>
              <TabsTrigger
                value="films"
                className="data-[state=active]:bg-rose-600"
              >
                <Film className="mr-2 h-4 w-4" /> Films
              </TabsTrigger>
              <TabsTrigger
                value="series"
                className="data-[state=active]:bg-rose-600"
              >
                <Tv className="mr-2 h-4 w-4" /> Séries
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="tendances" className="mt-0 space-y-8">
            <ContentRow title="Film Tendances" items={trending} />
          </TabsContent>

          <TabsContent value="films" className="mt-0 space-y-8">
            <ContentRow title="Film Populaire" items={latestMovies} />
          </TabsContent>

          <TabsContent value="films" className="mt-0 space-y-8">
            <ContentRow title="Film Mieux Notés" items={topRated} />
          </TabsContent>

          <TabsContent value="series" className="mt-0 ">
            <SeriesRow title="Séries" items={latest} />
          </TabsContent>
        </Tabs>
        <ContentRow title="Titre Similaire" items={similar} />
      </div>
    </div>
  );
}
