import { StreamingSource } from "@/types";
import seriesDatabase from "@/data/dulourd_data.json";

interface DulourdSeries {
  id: string;
  title: string;
  url: string;
  posterUrl: string;
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

    // Construire l'URL de l'épisode
    const baseSeriesUrl = series.url.replace(".html", "");
    const episodeUrl = `${baseSeriesUrl}/${season}-saison/${episode}-episode.html`;

    console.log(`[dulourd] URL épisode:`, episodeUrl);

    // Récupérer la page via l'API proxy
    const response = await fetch("/api/serie/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: episodeUrl }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const html = await response.text();

    // Debug: Afficher plus de HTML pour voir la structure
    console.log("[dulourd] HTML complet:", html);

    // Chercher la section des liens
    const linksSection = html.match(
      /<div[^>]*class="links[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    );
    if (linksSection) {
      console.log("[dulourd] Section des liens trouvée:", linksSection[1]);
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
      console.log("[dulourd] Réponse AJAX:", ajaxHtml);

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

    console.log("[dulourd] Sources trouvées:", sources);
    return sources;
  } catch (error) {
    console.error(`[dulourd] Erreur:`, error);
    throw error;
  }
}
