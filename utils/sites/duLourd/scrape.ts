import { StreamingSource } from "@/types";
import seriesDatabase from "@/data/dulourd_data.json";

interface DulourdSeries {
  id: string;
  title: string;
  url: string;
  posterUrl: string;
}

interface SeriesUrlPattern {
  seriesId: string;
  pattern: string; // Format de l'URL avec placeholders {season} et {episode}
}

// Table de correspondance pour les séries avec des formats d'URL spécifiques
const specialUrlPatterns: SeriesUrlPattern[] = [
  {
    seriesId: "746", // Game of Thrones
    pattern: "{baseUrl}/1-saison-s/{episode}-episode.html"
  },
  {
    seriesId: "10697", // House of the Dragon
    pattern: "{baseUrl}/1-saison-l/1-episode-s2.html"
  }
  // Ajoutez d'autres séries spéciales ici au besoin
];

/**
 * Construit l'URL de l'épisode en tenant compte des cas spéciaux
 * @param series La série concernée
 * @param season Numéro de saison
 * @param episode Numéro d'épisode
 * @returns L'URL de l'épisode
 */
function buildEpisodeUrl(
  series: DulourdSeries,
  season: number,
  episode: number
): string {
  // Extraire l'ID de la série depuis l'URL
  const seriesIdMatch = series.url.match(/\/(\d+)-[^\/]+\.html$/);
  const seriesId = seriesIdMatch ? seriesIdMatch[1] : "";
  
  // Vérifier si cette série a un format spécial
  const specialPattern = specialUrlPatterns.find(p => p.seriesId === seriesId);
  
  // Base URL sans l'extension .html
  const baseSeriesUrl = series.url.replace(".html", "");
  
  if (specialPattern) {
    // Utiliser le format spécial
    return specialPattern.pattern
      .replace("{baseUrl}", baseSeriesUrl)
      .replace("{season}", season.toString())
      .replace("{episode}", episode.toString());
  }
  
  // Format d'URL standard
  return `${baseSeriesUrl}/${season}-saison/${episode}-episode.html`;
}

/**
 * Fonction principale pour extraire les sources de streaming depuis dulourd.uno
 * @param seriesName Nom de la série à rechercher
 * @param season Numéro de saison
 * @param episode Numéro d'épisode
 * @returns Liste des sources de streaming
 */
export async function extractDuLourd(
  seriesName: string,
  season: number,
  episode: number,
): Promise<StreamingSource[]> {
  try {
    console.log(`[dulourd] Recherche de: ${seriesName}, S${season}E${episode}`);

    // Chercher dans la base de données
    const normalizedName = seriesName.toLowerCase();
    const series = Object.values(seriesDatabase.series).find((s) =>
      s.title.toLowerCase().includes(normalizedName),
    ) as DulourdSeries;

    if (!series) {
      throw new Error(
        `Série "${seriesName}" non trouvée dans la base de données`,
      );
    }

    // Construire l'URL de l'épisode avec gestion des cas spéciaux
    const episodeUrl = buildEpisodeUrl(series, season, episode);

    console.log(`[dulourd] URL épisode:`, episodeUrl);

    // Si l'URL spéciale ne fonctionne pas, essayer avec l'URL standard comme fallback
    let response = await fetch("/api/serie/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: episodeUrl }),
    });

    // Si la première requête échoue, essayer avec le format standard
    if (!response.ok) {
      console.log("[dulourd] Premier format d'URL échoué, essai du format standard");
      const baseSeriesUrl = series.url.replace(".html", "");
      const standardUrl = `${baseSeriesUrl}/${season}-saison/${episode}-episode.html`;
      
      if (standardUrl !== episodeUrl) {
        response = await fetch("/api/serie/proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: standardUrl }),
        });
        
        if (response.ok) {
          console.log("[dulourd] Format standard réussi:", standardUrl);
        }
      }
    }

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const html = await response.text();

    // Debug: Afficher plus de HTML pour voir la structure
    console.log("[dulourd] HTML extrait avec succès");

    // Chercher la section des liens
    const linksSection = html.match(
      /<div[^>]*class="links[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    );
    if (linksSection) {
      console.log("[dulourd] Section des liens trouvée");
    } else {
      console.log("[dulourd] Section des liens non trouvée");
    }

    // Extraire les sources de streaming
    const sources: StreamingSource[] = [];

    // Chercher les liens avec playEpisode comme dans vStream
    const linkRegex = /onclick="playEpisode\(this,\s*'([^']+)',\s*'([^']+)'\)/g;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      const [, videoId, xfield] = match;
      console.log("[dulourd] Trouvé - ID:", videoId, "xfield:", xfield);

      // Extraire le nom du lecteur et la langue depuis xfield
      let [hoster, lang = ""] = xfield.split("_");
      hoster = hoster.charAt(0).toUpperCase() + hoster.slice(1); // Capitalize
      lang = lang.toUpperCase();

      // Construire l'URL pour récupérer l'iframe
      const ajaxUrl =
        "https://www.dulourd.uno/engine/inc/serial/app/ajax/Season.php";
      const formData = new URLSearchParams();
      formData.append("id", videoId);
      formData.append("xfield", xfield);
      formData.append("action", "playEpisode");

      // Faire la requête AJAX pour obtenir l'iframe
      const ajaxResponse = await fetch("/api/serie/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: ajaxUrl,
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Referer: episodeUrl,
          },
          body: formData.toString(),
        }),
      });

      if (!ajaxResponse.ok) {
        console.warn(
          `[dulourd] Erreur lors de la récupération de l'iframe pour ${hoster}:`,
          ajaxResponse.status,
        );
        continue;
      }

      const ajaxHtml = await ajaxResponse.text();
      console.log("[dulourd] Réponse AJAX reçue");

      // Extraire l'URL de l'iframe
      const iframeMatch = ajaxHtml.match(/<iframe[^>]*src="([^"]+)"/i);
      if (iframeMatch) {
        const iframeUrl = iframeMatch[1];
        console.log("[dulourd] URL iframe trouvée:", iframeUrl);

        // Ne pas ajouter de doublons
        if (!sources.some((s) => s.url === iframeUrl)) {
          sources.push({
            url: iframeUrl,
            type: "embed",
            player: hoster.toLowerCase(),
            quality: "auto",
            lang: lang || "VO",
          });
        }
      }
    }

    if (sources.length === 0) {
      throw new Error("Aucune source de streaming trouvée");
    }

    console.log("[dulourd] Sources trouvées:", sources.length);
    return sources;
  } catch (error) {
    console.error(`[dulourd] Erreur:`, error);
    throw error;
  }
}