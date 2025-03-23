import type { Metadata } from "next";
import { fetchMovieDetails } from "@/utils/tmdb";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const movieData = await fetchMovieDetails(params.id);
    const title = movieData.title || "Film";
    const description = movieData.overview || "Découvrez ce film en streaming sur Samaflix";
    const imageUrl = movieData.backdrop_path 
      ? `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`
      : "/samaflix-films-banner.jpg";
    const releaseYear = movieData.release_date ? new Date(movieData.release_date).getFullYear() : "";

    return {
      title: `${title} (${releaseYear}) en Streaming HD | Samaflix`,
      description: `${description} Regardez ${title} en streaming HD sur Samaflix.`,
      openGraph: {
        title: `${title} (${releaseYear}) - Streaming HD | Samaflix`,
        description,
        type: "video.movie",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title
          }
        ]
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} (${releaseYear}) - Streaming HD | Samaflix`,
        description,
        images: [imageUrl]
      }
    };
  } catch (error) {
    return {
      title: "Film en Streaming | Samaflix",
      description: "Découvrez ce film en streaming HD sur Samaflix"
    };
  }
} 