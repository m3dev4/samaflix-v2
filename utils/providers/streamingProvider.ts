import { StreamingSource } from "@/types";
import { extractDuLourd } from "../sites";
import { extractFrenchStream } from "../sites/french-stream";

interface Provider {
  name: string;
  scrape: (
    seriesName: string,
    season: number,
    episode: number,
  ) => Promise<StreamingSource[]>;
}

// Ordre des providers : DuLourd en premier, puis French-Stream comme fallback
const providers: Provider[] = [
  {
    name: "Dulourd",
    scrape: extractDuLourd,
  },
  {
    name: "FrenchStream",
    scrape: extractFrenchStream,
  },
];

export async function getMultipleProviderStreaming(
  seriesName: string,
  season: number,
  episode: number,
): Promise<StreamingSource | null> {
  console.log(`[Provider] Recherche de sources pour ${seriesName} S${season}E${episode}`);
  
  for (const provider of providers) {
    try {
      console.log(`[Provider] Essai avec ${provider.name}...`);
      const sources = await provider.scrape(seriesName, season, episode);
      
      if (sources && sources.length > 0) {
        console.log(`[Provider] ${provider.name} a trouvé ${sources.length} sources`);
        
        // Priorité 1: Source uqload
        const uqloadSource = sources.find((s) => s.player?.toLowerCase() === "uqload");
        if (uqloadSource) {
          console.log(`[Provider] Source uqload trouvée via ${provider.name}`);
          return uqloadSource;
        }
        
        // Priorité 2: Autres lecteurs populaires
        const popularPlayers = ["vudeo", "streamtape", "doodstream", "upvid", "upstream"];
        for (const player of popularPlayers) {
          const source = sources.find((s) => s.player?.toLowerCase() === player);
          if (source) {
            console.log(`[Provider] Source ${player} trouvée via ${provider.name}`);
            return source;
          }
        }
        
        // Priorité 3: Première source disponible
        console.log(`[Provider] Utilisation de la première source disponible via ${provider.name}`);
        return sources[0];
      } else {
        console.log(`[Provider] ${provider.name} n'a trouvé aucune source, essai du provider suivant`);
      }
    } catch (error) {
      console.error(`[Provider] Erreur avec ${provider.name}:`, error);
      console.log(`[Provider] Passage au provider suivant après erreur avec ${provider.name}`);
    }
  }
  
  console.log(`[Provider] Aucune source trouvée après avoir essayé tous les providers`);
  return null;
}

export async function tryVariousNamesWithProviders(
  seriesName: string,
  season: number,
  episode: number,
): Promise<StreamingSource | null> {
  const variants = [
    seriesName,
    seriesName.toLowerCase(),
    seriesName.replace(/\s+/g, "-"),
    seriesName.replace(/\s+/g, ""),
    seriesName.split(":")[0],
  ];
  for (const variant of variants) {
    const result = await getMultipleProviderStreaming(variant, season, episode);
    if (result) {
      return result;
    }
  }
  return null;
}
