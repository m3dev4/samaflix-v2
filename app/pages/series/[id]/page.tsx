"use client";

import { fetchSeriesDetails } from "@/utils/tmdb";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface SeriesDetails {
  name: string;
  overview: string;
  backdrop_path: string;
  // Ajoutez d'autres propriétés selon vos besoins
}

export default function SeriesDetailsPage() {
  const params = useParams();
  const [series, setSeries] = useState<SeriesDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSeriesDetails = async () => {
      try {
        const data = await fetchSeriesDetails(params.id as string);
        setSeries(data);
      } catch (error) {
        console.error("Erreur lors du chargement des détails de la série:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSeriesDetails();
  }, [params.id]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!series) {
    return <div>Série non trouvée</div>;
  }

  return (
    <div>
      <h1>{series.name}</h1>
      <p>{series.overview}</p>
      {series.backdrop_path && (
        <img 
          src={`https://image.tmdb.org/t/p/original${series.backdrop_path}`}
          alt={series.name}
          className="w-full h-auto"
        />
      )}
    </div>
  );
} 