import { StreamingSource } from "@/types";
import { extractDuLourd } from "../sites";

interface Provider {
  name: string;
  scrape: (
    seriesName: string,
    season: number,
    episode: number,
  ) => Promise<StreamingSource[]>;
}

const providers: Provider[] = [
  {
    name: "Dulourd",
    scrape: extractDuLourd,
  },
];

export async function getMultipleProviderStreaming(
  seriesName: string,
  season: number,
  episode: number,
): Promise<StreamingSource | null> {
  for (const provider of providers) {
    try {
      console.log(`Trying ${provider.name}...`);
      const sources = await provider.scrape(seriesName, season, episode);

      if (sources && sources.length > 0) {
        const uqloadSource = sources.find((s) => s.player === "uqload");
        if (uqloadSource) return uqloadSource;

        return sources[0];
      }
    } catch (error) {
      console.error(`Error with ${provider.name}:`, error);
    }
  }
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
