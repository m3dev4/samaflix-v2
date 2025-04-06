import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

// Fonction pour normaliser les titres
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Fonction pour calculer la similarité entre deux chaînes
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeTitle(str1);
  const s2 = normalizeTitle(str2);
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;
  
  let matches = 0;
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  for (const word1 of words1) {
    if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
      matches++;
    }
  }
  
  return matches / Math.max(words1.length, words2.length);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tmdbTitle = searchParams.get("title");
    
    if (!tmdbTitle) {
      return NextResponse.json({ error: "Title parameter is required" }, { status: 400 });
    }

    // Lire le fichier JSON de la base de données
    const filePath = path.join(process.cwd(), 'data/dulourd_data.json');
    const jsonContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(jsonContent);

    // Chercher la meilleure correspondance
    let bestMatch = null;
    let bestScore = 0;

    for (const movie of data.movies) {
      const score = calculateSimilarity(tmdbTitle, movie.title);
      if (score > bestScore && score > 0.7) { // Seuil de similarité à 70%
        bestScore = score;
        bestMatch = movie;
      }
    }

    if (bestMatch) {
      return NextResponse.json({
        success: true,
        match: bestMatch,
        similarity: bestScore
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "No matching movie found"
      });
    }

  } catch (error) {
    console.error("Error matching movie title:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
} 