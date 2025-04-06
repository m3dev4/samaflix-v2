import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface ViewAllButtonProps {
  category: string;
  count: number;
}

const categorySlugMap: { [key: string]: string } = {
  "Now Playing": "now-playing",
  "Top Rated": "top-rated",
  "Most Popular": "most-popular",
  "Action & Adventure": "action-adventure",
  "Animation": "animation",
  "Comedy": "comedy",
  "Crime": "crime",
  "Documentary": "documentary",
  "Drama": "drama",
  "Horror": "horror",
  "Family": "family",
  "Romance": "romance",
  "Mystery & Thriller": "mystery-thriller",
  "Reality": "reality",
  "Sci-Fi": "sci-fi",
  "War": "war",
  "Western": "western"
};

export function ViewAllButton({ category, count }: ViewAllButtonProps) {
  const categorySlug = categorySlugMap[category] || category.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <Link 
      href={`/pages/films/category/${categorySlug}`}
      className="flex items-center text-sm text-player-accent hover:text-player-accent/80 transition-colors"
    >
      <span>Voir tout ({count})</span>
      <ChevronRight className="w-4 h-4 ml-1" />
    </Link>
  );
} 