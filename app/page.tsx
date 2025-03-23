import StreamingUi from "@/components/streamingUi";
import ContentRow from "@/components/contentRow";
import { getMovies } from "@/components/getMovie";
import AlerteInfo from "@/components/alerteInfo";
import Link from "next/link";
import { ThemeColorToggle } from "@/components/themes/theme-color-toggle";

export default async function Home() {
  const { similar, latestMovies, popular } = await getMovies();
  return (
    <div className="min-h-screen text-white bg-gradient-custom font-popins">
       <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/40 shadow-sm">
        <div className="container mx-auto">
          <nav className="flex items-center justify-between py-4">
            <ul className="flex items-center gap-8">
              <li className="flex items-center space-x-6">
                <Link
                  href="/"
                  className="text-2xl font-bold hover:text-primary transition-colors"
                >
                  Samaflix
                </Link>
                <Link
                  href="/pages/films"
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  Films
                </Link>
                <Link
                  href="/pages/series"
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  Séries
                </Link>
              </li>
            </ul>
            <div className="flex items-center space-x-4">
              <ThemeColorToggle />
            </div>
          </nav>
        </div>
      </header>
      <div className="flex items-center justify-center">
      <AlerteInfo />
      </div>
      <div className="relative h-screen">
        <StreamingUi />
      </div>
      <div className="space-y-2">
        <ContentRow title="Titre similaires" items={similar} />
        <ContentRow title="Dernieres sorties films" items={latestMovies} />
        <ContentRow title="Titre les plus populaires" items={popular} />
      </div>
    </div>
  );
}
