import { StreamingSource } from "@/types";
import seriesDatabase from "@/data/frenchstream_data.json";

interface FrenchStreamSeries {
  id: string;
  title: string;
  url: string;
  posterUrl: string;
}

/**
 * Fonction principale pour extraire les sources de streaming depuis French-Stream
 * @param seriesName Nom de la série à rechercher
 * @param season Numéro de saison
 * @param episode Numéro d'épisode
 * @returns Liste des sources de streaming
 */
export async function extractFrenchStream(
  seriesName: string,
  season: number,
  episode: number
): Promise<StreamingSource[]> {
  try {
    console.log(`[french-stream] Recherche de: ${seriesName}, S${season}E${episode}`);

    // 1. Chercher la série dans la base locale
    const normalizedName = seriesName.toLowerCase();
    // 1. Correspondance exacte (stricte)
    let series = seriesDatabase.find((s: FrenchStreamSeries) =>
      s.title.trim().toLowerCase() === normalizedName.trim()
    );

    // 2. Sinon, correspondance partielle (large) avec filtrage intelligent
    if (!series) {
      // Afficher toutes les correspondances possibles pour débogage
      const matches = seriesDatabase.filter((s: FrenchStreamSeries) =>
        s.title.toLowerCase().includes(normalizedName)
      );
      console.log(`[french-stream] Correspondances possibles:`, matches.map(s => s.title));
      
      // Filtrer les correspondances pour éviter les faux positifs
      // 1. Préférer les séries qui correspondent EXACTEMENT au terme recherché (avec saison)
      const exactMatches = matches.filter(s => {
        const titleLower = s.title.toLowerCase();
        return titleLower === normalizedName || titleLower === `${normalizedName} - saison ${season}`;
      });
      
      // 2. Préférer les séries qui commencent exactement par le terme recherché (sans ":" ou autres caractères)
      const exactStartMatches = matches.filter(s => {
        const titleLower = s.title.toLowerCase();
        // Vérifier si le titre commence par le terme recherché suivi d'un espace ou d'un tiret
        return titleLower.startsWith(`${normalizedName} `) || titleLower.startsWith(`${normalizedName}-`);
      });
      
      // 3. Filtrer pour obtenir uniquement les séries originales (pas les spin-offs comme "Narcos: Mexico")
      const originalSeriesMatches = exactStartMatches.filter(s => {
        const titleLower = s.title.toLowerCase();
        // Exclure les titres contenant des ":" qui indiquent souvent un spin-off
        return !titleLower.includes(":");
      });
      
      // 4. Préférer les séries avec le format "Narcos - Saison X"
      const seasonMatches = originalSeriesMatches.filter(s => 
        s.title.toLowerCase().includes(` - saison `)
      );
      
      // Afficher les résultats de filtrage pour débogage
      console.log(`[french-stream] Filtrage: Exact=${exactMatches.length}, ExactStart=${exactStartMatches.length}, Original=${originalSeriesMatches.length}, Saison=${seasonMatches.length}`);
      
      // 5. Prioriser dans cet ordre: correspondance exacte, série originale avec saison, série originale, série dérivée, n'importe quelle correspondance
      if (exactMatches.length > 0) {
        series = exactMatches[0];
      } else if (seasonMatches.length > 0) {
        // Prendre la série avec le numéro de saison correspondant si possible
        const seasonMatch = seasonMatches.find(s => 
          s.title.toLowerCase().includes(` - saison ${season}`)
        );
        series = seasonMatch || seasonMatches[0];
      } else if (originalSeriesMatches.length > 0) {
        series = originalSeriesMatches[0];
      } else if (exactStartMatches.length > 0) {
        series = exactStartMatches[0];
      } else if (matches.length > 0) {
        series = matches[0];
      }
    }

    if (!series) {
      throw new Error(`Série "${seriesName}" non trouvée dans la base de données`);
    }

    console.log(`[french-stream] Série trouvée: ${series.title}`);

    // 2. Construire l'URL de l'épisode
    const episodeUrl = series.url;
    console.log(`[french-stream] URL de la page: ${episodeUrl}`);

    // 3. Récupérer le HTML de la page via un proxy backend
    const response = await fetch(`/api/serie/proxy?url=${encodeURIComponent(episodeUrl)}`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    const html = await response.text();
    console.log(`[french-stream] HTML récupéré, longueur: ${html.length}`);

    // 4. Extraire les liens de streaming
    const sources: StreamingSource[] = [];

    // Détecter la langue préférée (VF ou VOSTFR)
    const isVostfr = episodeUrl.toLowerCase().includes('vostfr');
    const lang = isVostfr ? 'VOSTFR' : 'VF';

    // Chercher les liens d'épisodes avec plusieurs patterns possibles
    let episodeMatch = null;
    
    // NOUVEAU: Extraction simple de tous les liens embed
    console.log(`[french-stream] Extraction de tous les liens embed de la page`);
    
    // 1. Extraire toutes les iframes
    const iframeRegex = /<iframe[^>]*src="([^"]+)"/gi;
    let iframeMatch;
    let embedCount = 0;
    
    while ((iframeMatch = iframeRegex.exec(html)) !== null) {
      embedCount++;
      const iframeSrc = iframeMatch[1];
      console.log(`[french-stream] Iframe ${embedCount} trouvée: ${iframeSrc}`);
      
      if (iframeSrc && (iframeSrc.startsWith('http') || iframeSrc.startsWith('//'))) {
        sources.push({
          player: getPlayerName(iframeSrc),
          url: iframeSrc,
          quality: 'HD',
          lang,
          type: "embed"
        });
      }
    }
    
    // 2. Extraire tous les liens href qui contiennent des noms de lecteurs connus
    const playerNames = ['uqload', 'yourupload', 'upstream', 'upvid', 'vudeo', 'voe', 'streamtape', 'doodstream'];
    
    for (const playerName of playerNames) {
      // Recherche simple pour chaque lecteur individuellement
      const playerRegex = new RegExp(`<a[^>]*href=\"([^\"]*${playerName}[^\"]*)\"|<iframe[^>]*src=\"([^\"]*${playerName}[^\"]*)\"`, 'gi');
      let playerMatch;
      
      while ((playerMatch = playerRegex.exec(html)) !== null) {
        const url = playerMatch[1] || playerMatch[2];
        if (url) {
          console.log(`[french-stream] Lien ${playerName} trouvé: ${url}`);
          
          // Vérifier si c'est un lien direct vers le lecteur (pas un lien flixeo)
          if (url.includes(playerName) && !url.includes('flixeo.xyz')) {
            sources.push({
              player: playerName,
              url: url,
              quality: 'HD',
              lang,
              type: "embed"
            });
          } else {
            console.log(`[french-stream] Lien ${playerName} ignoré car ce n'est pas un lien direct: ${url}`);
          }
        }
      }
    }
    
    // Pattern 1: Format standard "Episode X"
    const episodeRegex1 = new RegExp(`Episode\\s*${episode}[^<]*<\\/a>[\\s\\S]*?<a[^>]*href=\"([^\"]+)\"`, 'i');
    episodeMatch = html.match(episodeRegex1);
    
    // Pattern 2: Format alternatif avec numéro d'épisode dans l'URL
    if (!episodeMatch) {
      const episodeRegex2 = new RegExp(`<a[^>]*href=\"([^\"]*episode-?${episode}[^\"]*)\"|<a[^>]*href=\"([^\"]*e-?${episode}[^\"]*)\"|<a[^>]*href=\"([^\"]*${episode}-episode[^\"]*)\"|<a[^>]*href=\"([^\"]*-${episode}[^\"]*)\"|<a[^>]*href=\"([^\"]*\\/ep-?${episode}[^\"]*)\"`, 'i');
      const match = html.match(episodeRegex2);
      if (match) {
        // Trouver le premier groupe non-null
        for (let i = 1; i < match.length; i++) {
          if (match[i]) {
            episodeMatch = [match[0], match[i]];
            break;
          }
        }
      }
    }
    
    // Pattern 3: Recherche dans les liens de saison pour l'épisode spécifique
    if (!episodeMatch) {
      const seasonLinks = html.match(/<a[^>]*href=\"([^\"]*saison-?${season}[^\"]*)\"/gi);
      if (seasonLinks && seasonLinks.length > 0) {
        console.log(`[french-stream] Trouvé ${seasonLinks.length} liens de saison ${season}`);
        // Extraire les URLs des liens de saison
        for (const link of seasonLinks) {
          const urlMatch = link.match(/href=\"([^\"]+)\"/i);
          if (urlMatch && urlMatch[1]) {
            console.log(`[french-stream] Vérification du lien de saison: ${urlMatch[1]}`);
            episodeMatch = [link, urlMatch[1]];
            break;
          }
        }
      }
    }

    // On ignore complètement l'accès à flixeo.xyz qui cause l'erreur 500
    // et on se concentre uniquement sur l'extraction directe des liens embed
    
    // Afficher des informations sur l'épisode trouvé (pour débogage)
    if (episodeMatch && episodeMatch[1]) {
      const episodeRelativeUrl = episodeMatch[1];
      const playerUrl = episodeRelativeUrl.startsWith('http') 
          ? episodeRelativeUrl 
          : `https://fsmirror41.lol${episodeRelativeUrl.startsWith('/') ? '' : '/'}${episodeRelativeUrl}`;
      
      console.log(`[french-stream] Lien de l'épisode identifié (non utilisé): ${playerUrl}`);
    } else {
      console.log(`[french-stream] Aucun lien d'épisode spécifique identifié, utilisation des liens directs`);
    }

    // Filtrer les sources pour l'épisode demandé si possible
    if (sources.length > 0) {
      console.log(`[french-stream] ${sources.length} sources trouvées, filtrage pour S${season}E${episode}`);
      
      // Filtrer pour ne garder que les liens directs (pas de flixeo.xyz)
      const directSources = sources.filter(source => {
        // Vérifier si c'est un lien direct vers un lecteur connu
        const isDirectLink = !source.url.includes('flixeo.xyz') && 
                         (source.url.includes('uqload.') || 
                          source.url.includes('vudeo.') || 
                          source.url.includes('streamtape.') || 
                          source.url.includes('doodstream.'));
        
        if (!isDirectLink) {
          console.log(`[french-stream] Lien ignoré car ce n'est pas un lien direct: ${source.url}`);
        }
        
        return isDirectLink;
      });
      
      console.log(`[french-stream] ${directSources.length} liens directs trouvés après filtrage`);
      
      if (directSources.length === 0) {
        console.warn(`[french-stream] Aucun lien direct trouvé pour ${seriesName} S${season}E${episode}`);
        return [];
      }
      
      // Essayer de trouver le bon épisode en fonction du numéro dans l'URL ou de la position dans la liste
      const episodeIdentifiers = [
        `e${episode}`, 
        `ep${episode}`, 
        `episode${episode}`, 
        `episode-${episode}`,
        `${episode}-episode`,
        `-${episode}.`
      ];
      
      // 1. D'abord, essayer de trouver les liens qui contiennent explicitement le numéro d'épisode
      const episodeSpecificSources = directSources.filter(source => {
        const url = source.url.toLowerCase();
        return episodeIdentifiers.some(id => url.includes(id));
      });
      
      // 2. Si on a trouvé des liens spécifiques à l'épisode, les utiliser
      if (episodeSpecificSources.length > 0) {
        console.log(`[french-stream] ${episodeSpecificSources.length} sources spécifiques à l'épisode ${episode} trouvées`);
        return episodeSpecificSources;
      }
      
      // 3. Sinon, si on a exactement 10 sources et qu'on cherche l'épisode 1, prendre la première
      if (episode === 1) {
        console.log(`[french-stream] Utilisation de la première source pour l'épisode 1`);
        return [directSources[0]];
      }
      
      // 4. Ou si on a un nombre de sources égal ou supérieur au numéro d'épisode, prendre celle correspondant à la position
      if (directSources.length >= episode) {
        console.log(`[french-stream] Utilisation de la source à l'index ${episode-1} pour l'épisode ${episode}`);
        return [directSources[episode-1]];
      }
      
      console.log(`[french-stream] Impossible de filtrer pour l'épisode spécifique, retour du premier lien direct`);
      return [directSources[0]];
    } else {
      console.warn(`[french-stream] Aucune source trouvée pour ${seriesName} S${season}E${episode}`);
    }

    return sources;
  } catch (error) {
    console.error(`[french-stream] Erreur:`, error);
    throw error;
  }
}

/**
 * Détermine le nom du lecteur à partir de l'URL
 */
function getPlayerName(url: string): string {
  if (url.includes('dood')) return 'doodstream';
  if (url.includes('uqload')) return 'uqload';
  if (url.includes('vido')) return 'vidoza';
  if (url.includes('upstream')) return 'upstream';
  if (url.includes('voe')) return 'voe';
  if (url.includes('netu')) return 'netu';
  if (url.includes('streamtape')) return 'streamtape';
  return 'unknown';
}