import type { Metadata } from "next";
import { fetchSeriesDetails } from "@/utils/tmdb";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const seriesData = await fetchSeriesDetails(params.id);
    const title = seriesData.name || "Série";
    const description = seriesData.overview || "Découvrez cette série en streaming sur Samaflix";
    const imageUrl = seriesData.backdrop_path 
      ? `https://image.tmdb.org/t/p/original${seriesData.backdrop_path}`
      : "/samaflix-series-banner.jpg";
    const firstAirYear = seriesData.first_air_date ? new Date(seriesData.first_air_date).getFullYear() : "";

    return {
      title: `${title} ${firstAirYear ? `(${firstAirYear})` : ""} en Streaming HD | Samaflix`,
      description: `${description} Regardez ${title} en streaming HD sur Samaflix.`,
      openGraph: {
        title: `${title} ${firstAirYear ? `(${firstAirYear})` : ""} - Streaming HD | Samaflix`,
        description,
        type: "video.episode",
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
        title: `${title} ${firstAirYear ? `(${firstAirYear})` : ""} - Streaming HD | Samaflix`,
        description,
        images: [imageUrl]
      }
    };
  } catch (error) {
    console.error("Erreur lors de la génération des métadonnées:", error);
    return {
      title: "Série en Streaming | Samaflix",
      description: "Découvrez cette série en streaming HD sur Samaflix"
    };
  }
} 