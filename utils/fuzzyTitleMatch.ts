// Fuzzy title matching utility for Samaflix
// Usage: import { findBestStreamingMovie } from '@/utils/fuzzyTitleMatch';

import removeAccents from 'remove-accents';

export interface StreamingMovie {
  title: string;
  url: string;
  image: string;
  type: string;
  streamingLinks: {
    url: string;
    provider: string;
    quality: string;
    type: string;
  }[];
}

function normalizeTitle(title: string) {
  return removeAccents(title)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeTitle(str1);
  const s2 = normalizeTitle(str2);
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;
  let matches = 0;
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  for (const word1 of words1) {
    if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
      matches++;
    }
  }
  return matches / Math.max(words1.length, words2.length);
}

export function findBestStreamingMovie(
  tmdbTitle: string,
  movies: StreamingMovie[],
  threshold = 0.6
): StreamingMovie | null {
  let bestMatch: StreamingMovie | null = null;
  let bestScore = 0;
  for (const movie of movies) {
    const score = calculateSimilarity(tmdbTitle, movie.title);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = movie;
    }
  }
  return bestScore >= threshold ? bestMatch : null;
}
