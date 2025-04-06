import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_API_URL = "https://api.themoviedb.org/3";
const BATCH_SIZE = 20158; // Taille de lot plus petite pour un traitement plus rapide
const PARALLEL_REQUESTS = 5; // Nombre de requêtes parallèles
const CACHE_FILE = 'tmdb_cache.json';

// Cache pour les requêtes TMDB
let tmdbCache: { [key: string]: any } = {};

// Créer le dossier data s'il n'existe pas
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Charger le cache au démarrage
try {
  const cachePath = path.join(process.cwd(), 'data', CACHE_FILE);
  if (fs.existsSync(cachePath)) {
    tmdbCache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  }
} catch (error) {
  console.error('Erreur lors du chargement du cache:', error);
}

function calculateSimilarity(str1: string, str2: string): number {
  const normalize = (str: string) => str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const s1 = normalize(str1);
  const s2 = normalize(str2);

  if (s1 === s2) return 1;

  const words1 = s1.split(' ');
  const words2 = s2.split(' ');
  
  // Si l'un des titres est contenu dans l'autre
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.9;
  }

  // Compter les mots en commun
  const commonWords = words1.filter(word => 
    words2.some(w2 => w2 === word || w2.includes(word) || word.includes(w2))
  );

  return commonWords.length / Math.max(words1.length, words2.length);
}

async function searchMovieOnTMDB(title: string) {
  try {
    // Vérifier le cache
    const cacheKey = title.toLowerCase();
    if (tmdbCache[cacheKey]) {
      return tmdbCache[cacheKey];
    }

    const cleanTitle = title.replace(/\s*\(\d{4}\)\s*$/, '');
    
    const response = await fetch(
      `${TMDB_API_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}&language=fr-FR`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      tmdbCache[cacheKey] = null;
      return null;
    }

    // Trouver la meilleure correspondance
    let bestMatch = null;
    let bestScore = 0;

    for (const result of data.results.slice(0, 5)) {
      const score = calculateSimilarity(cleanTitle, result.title);
      // Ne retourner que si le titre est différent et la similarité est suffisante
      if (score > bestScore && score >= 0.8 && result.title.toLowerCase() !== cleanTitle.toLowerCase()) {
        bestScore = score;
        bestMatch = result;
      }
    }

    if (!bestMatch) {
      tmdbCache[cacheKey] = null;
      return null;
    }

    const result = {
      id: bestMatch.id,
      title: bestMatch.title,
      original_title: bestMatch.original_title,
      similarity: bestScore
    };

    // Sauvegarder dans le cache
    tmdbCache[cacheKey] = result;
    return result;
  } catch (error) {
    console.error(`Erreur lors de la recherche de "${title}":`, error);
    return null;
  }
}

// Fonction pour traiter un lot de films
async function processBatch(movies: any[], startIndex: number, isPreview: boolean) {
  const updates: { old: string; new: string; tmdb_id: number; similarity: number }[] = [];
  let updatedCount = 0;

  // Diviser le lot en sous-groupes pour le traitement parallèle
  const chunks = [];
  for (let i = 0; i < movies.length; i += PARALLEL_REQUESTS) {
    chunks.push(movies.slice(i, i + PARALLEL_REQUESTS));
  }

  for (const chunk of chunks) {
    // Traiter plusieurs films en parallèle
    const chunkResults = await Promise.all(
      chunk.map(movie => searchMovieOnTMDB(movie.title))
    );

    // Traiter les résultats
    chunkResults.forEach((tmdbMovie, index) => {
      const movie = chunk[index];
      if (tmdbMovie && tmdbMovie.title !== movie.title) {
        updates.push({
          old: movie.title,
          new: tmdbMovie.title,
          tmdb_id: tmdbMovie.id,
          similarity: tmdbMovie.similarity
        });

        if (!isPreview) {
          movie.title = tmdbMovie.title;
          movie.tmdb_id = tmdbMovie.id;
        }
        updatedCount++;
      }
    });

    // Pause entre les chunks pour respecter les limites de l'API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return { updates, updatedCount };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get("preview") === "true";
    const startIndex = parseInt(searchParams.get("start") || "0");
    const endIndex = Math.min(
      startIndex + BATCH_SIZE,
      parseInt(searchParams.get("end") || String(startIndex + BATCH_SIZE))
    );

    const filePath = path.join(process.cwd(), 'data/cpamieux_movies_with_links.json');
    console.log('Chemin du fichier:', filePath);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fichier non trouvé: ${filePath}`);
    }

    const jsonContent = fs.readFileSync(filePath, 'utf-8');
    const movies = JSON.parse(jsonContent);

    if (!Array.isArray(movies)) {
      throw new Error("Le fichier JSON doit contenir un tableau de films");
    }

    const moviesToProcess = movies.slice(startIndex, endIndex);
    console.log(`Traitement des films ${startIndex} à ${endIndex} sur ${movies.length}`);

    const { updates, updatedCount } = await processBatch(moviesToProcess, startIndex, isPreview);

    // Sauvegarder les modifications
    if (updatedCount > 0 && !isPreview) {
      // Mettre à jour les films dans le tableau original
      for (let i = 0; i < moviesToProcess.length; i++) {
        movies[startIndex + i] = moviesToProcess[i];
      }
      fs.writeFileSync(filePath, JSON.stringify(movies, null, 2));

      // Sauvegarder le cache
      const cachePath = path.join(process.cwd(), 'data', CACHE_FILE);
      fs.writeFileSync(cachePath, JSON.stringify(tmdbCache, null, 2));
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      updates,
      totalMovies: movies.length,
      processedRange: {
        start: startIndex,
        end: endIndex
      },
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