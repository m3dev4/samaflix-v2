import { extractFrenchStream } from './scrape';

/**
 * Fonction de test pour French-Stream
 */
export async function testFrenchStream(seriesName: string = 'Lucifer', season: number = 1, episode: number = 1) {
  console.log(`[TEST] Testant French-Stream pour: ${seriesName}, S${season}E${episode}`);
  
  try {
    const sources = await extractFrenchStream(seriesName, season, episode);
    console.log(`[TEST] Résultats pour ${seriesName}: ${sources.length} sources trouvées`);
    
    if (sources.length > 0) {
      console.log('[TEST] Première source:', sources[0]);
      return sources;
    } else {
      console.log('[TEST] Aucune source trouvée');
      return [];
    }
  } catch (error) {
    console.error('[TEST] Erreur:', error);
    throw error;
  }
}
