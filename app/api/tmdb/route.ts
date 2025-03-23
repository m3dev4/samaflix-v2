import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_API_URL = "https://api.themoviedb.org/3";

interface TMDBResult {
  name: string;
  id: number;
}

interface SearchResult {
  title: string;
  score: number;
}

async function searchSeriesOnTMDB(title: string) {
  try {
    // Normaliser le titre pour la recherche
    const searchTitle = title.replace(/\s*:\s*/, ' : ');
    
    const response = await fetch(
      `${TMDB_API_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTitle)}&language=fr-FR`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      return null;
    }

    // Trouver la correspondance la plus proche
    const results: SearchResult[] = data.results.map((result: TMDBResult) => ({
      title: result.name,
      score: calculateSimilarity(title, result.name)
    }));

    results.sort((a: SearchResult, b: SearchResult) => b.score - a.score);
    return results[0].score > 0.8 ? results[0].title : null;
  } catch (error) {
    console.error(`Erreur lors de la recherche de "${title}":`, error);
    return null;
  }
}

function calculateSimilarity(str1: string, str2: string): number {
  // Normaliser les chaînes pour la comparaison
  const normalize = (str: string) => 
    str.toLowerCase()
       .normalize('NFD')
       .replace(/[\u0300-\u036f]/g, '')
       .replace(/[^a-z0-9]/g, '');

  const s1 = normalize(str1);
  const s2 = normalize(str2);

  if (s1 === s2) return 1;

  // Calculer la distance de Levenshtein
  const matrix = Array(s2.length + 1).fill(null).map(() => 
    Array(s1.length + 1).fill(null)
  );

  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  // Convertir la distance en score de similarité
  const maxLength = Math.max(s1.length, s2.length);
  return 1 - matrix[s2.length][s1.length] / maxLength;
}

function shouldUpdateTitle(currentTitle: string, tmdbTitle: string): boolean {
  // Si les titres sont exactement identiques, pas de mise à jour
  if (currentTitle === tmdbTitle) return false;

  // Normaliser les titres en gardant la ponctuation importante
  const normalizeForComparison = (str: string) => 
    str.toLowerCase()
       .normalize('NFD')
       .replace(/[\u0300-\u036f]/g, '')
       .replace(/\s+/g, ' ')
       .trim();

  const normalizedCurrent = normalizeForComparison(currentTitle);
  const normalizedTMDB = normalizeForComparison(tmdbTitle);

  // Si seule la ponctuation ou la casse diffère, mettre à jour
  if (normalizedCurrent === normalizedTMDB) return true;

  // Cas spéciaux à ne pas mettre à jour
  const specialCases = [
    { current: "Flash (2014)", tmdb: "Flash" },
    { current: "Doctor Who (2005)", tmdb: "Doctor Who" },
    { current: "S.W.A.T. (2017)", tmdb: "S.W.A.T." }
  ];

  if (specialCases.some(({ current, tmdb }) => currentTitle === current && tmdbTitle === tmdb)) {
    return false;
  }

  // Vérifier si seul le formatage des deux-points diffère
  const colonPattern = /\s*:\s*/;
  const currentParts = currentTitle.split(colonPattern);
  const tmdbParts = tmdbTitle.split(colonPattern);

  if (currentParts.length === tmdbParts.length) {
    const normalizedCurrentParts = currentParts.map(normalizeForComparison);
    const normalizedTMDBParts = tmdbParts.map(normalizeForComparison);
    
    if (normalizedCurrentParts.every((part, i) => part === normalizedTMDBParts[i])) {
      return true;
    }
  }

  return false;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get("preview") === "true";

    // Lire le fichier JSON
    const filePath = path.join(process.cwd(), 'data/dulourd_data.json');
    const jsonContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(jsonContent);

    let updatedCount = 0;
    const updates: { old: string; new: string }[] = [];

    // Parcourir chaque série
    for (const serie of data.series) {
      const tmdbTitle = await searchSeriesOnTMDB(serie.title);
      
      if (tmdbTitle && shouldUpdateTitle(serie.title, tmdbTitle)) {
        updates.push({ old: serie.title, new: tmdbTitle });
        if (!isPreview) {
          serie.title = tmdbTitle;
        }
        updatedCount++;
      }

      // Attendre un peu entre chaque requête pour respecter les limites de l'API
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    // Sauvegarder les modifications seulement si ce n'est pas une prévisualisation
    if (updatedCount > 0 && !isPreview) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      updates,
      mode: isPreview ? 'preview' : 'sync'
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des titres:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erreur inconnue" 
      },
      { status: 500 }
    );
  }
} 