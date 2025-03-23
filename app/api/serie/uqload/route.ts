import { NextResponse } from "next/server";

// Helper pour décoder les entités HTML
function decodeHTML(html: string): string {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#039;/g, "'");
}

async function extractVideoUrl(html: string): Promise<string | null> {
  console.log("[Serie Uqload] Analyse du HTML pour extraction de l'URL...");

  // Chercher d'abord les URLs directes dans le HTML
  const directPatterns = [
    /https?:\/\/m\d+\.uqload\.net\/\w+\.mp4/i,
    /https?:\/\/[^"'\s]+\.mp4/i,
    /https?:\/\/[^"'\s]+\.m3u8/i
  ];

  for (const pattern of directPatterns) {
    const match = html.match(pattern);
    if (match) {
      const url = match[0];
      console.log("[Serie Uqload] URL directe trouvée:", url);
      return url;
    }
  }

  // Chercher dans les scripts
  const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
  console.log(`[Serie Uqload] Nombre de scripts trouvés: ${scripts.length}`);

  for (const script of scripts) {
    // Chercher les URLs directes dans chaque script
    for (const pattern of directPatterns) {
      const match = script.match(pattern);
      if (match) {
        const url = match[0];
        console.log("[Serie Uqload] URL trouvée dans un script:", url);
        return url;
      }
    }

    // Chercher les variables qui contiennent une URL
    const varMatches = script.match(/var\s+\w+\s*=\s*["']([^"']+\.(?:mp4|m3u8)[^"']*)["']/gi);
    if (varMatches) {
      for (const varMatch of varMatches) {
        const url = varMatch.match(/["']([^"']+)["']/)?.[1];
        if (url && (url.includes('.mp4') || url.includes('.m3u8'))) {
          console.log('[Serie Uqload] URL trouvée dans une variable:', url);
          return url;
        }
      }
    }
  }

  // Chercher dans le HTML pour les patterns encodés
  const encodedMatch = html.match(/escape\(['"]([^'"]+)['"]\)/i);
  if (encodedMatch) {
    try {
      const decodedUrl = decodeURIComponent(encodedMatch[1]);
      if (decodedUrl.includes('.mp4') || decodedUrl.includes('.m3u8')) {
        console.log('[Serie Uqload] URL encodée trouvée et décodée:', decodedUrl);
        return decodedUrl;
      }
    } catch (error) {
      console.error('[Serie Uqload] Erreur lors du décodage de l\'URL:', error);
    }
  }

  // Chercher les URLs de type vmp4
  const vmp4Match = html.match(/vmp4\?url=([^"&\s]+)/i);
  if (vmp4Match && vmp4Match[1]) {
    try {
      const decodedUrl = decodeURIComponent(vmp4Match[1]);
      console.log('[Serie Uqload] URL vmp4 trouvée et décodée:', decodedUrl);
      return decodedUrl;
    } catch (error) {
      console.error('[Serie Uqload] Erreur lors du décodage de l\'URL vmp4:', error);
    }
  }

  // Sauvegarder un extrait du HTML pour debug
  console.log("[Serie Uqload] Extrait du HTML reçu:", html.substring(0, 1000));
  console.log("[Serie Uqload] Aucune URL vidéo trouvée");
  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de la série manquant" }, { status: 400 });
    }

    console.log("[Serie Uqload] Traitement de l'ID:", id);
    const embedUrl = `https://uqload.net/embed-${id}.html`;
    console.log("[Serie Uqload] Récupération de l'URL:", embedUrl);

    const response = await fetch(embedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
        "Referer": "https://uqload.net/",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
    });

    if (!response.ok) {
      console.error("[Serie Uqload] Erreur lors de la récupération:", response.status, response.statusText);
      return NextResponse.json(
        { error: `Erreur lors de la récupération de la série: ${response.status}` },
        { status: response.status }
      );
    }

    const html = await response.text();
    console.log("[Serie Uqload] Longueur du HTML reçu:", html.length);

    if (html.includes("File was deleted") || html.includes("File not found")) {
      console.log("[Serie Uqload] Épisode non trouvé ou supprimé");
      return NextResponse.json(
        { error: "L'épisode n'est plus disponible" },
        { status: 404 }
      );
    }

    const videoUrl = await extractVideoUrl(html);

    if (!videoUrl) {
      console.error("[Serie Uqload] URL vidéo non trouvée dans le HTML");
      return NextResponse.json(
        { error: "URL de l'épisode non trouvée" },
        { status: 404 }
      );
    }

    console.log("[Serie Uqload] URL vidéo trouvée:", videoUrl);

    // Si l'URL contient vmp4, on la traite différemment
    if (videoUrl.includes('vmp4')) {
      try {
        const vmp4Response = await fetch(videoUrl);
        if (!vmp4Response.ok) {
          throw new Error(`Erreur vmp4: ${vmp4Response.status}`);
        }
        const finalUrl = await vmp4Response.text();
        console.log("[Serie Uqload] URL finale après vmp4:", finalUrl);
        return NextResponse.json({
          videoUrl: finalUrl.trim(),
          type: finalUrl.includes(".m3u8") ? "hls" : "mp4"
        });
      } catch (error) {
        console.error("[Serie Uqload] Erreur lors de la récupération vmp4:", error);
        return NextResponse.json(
          { error: "Erreur lors de la récupération de l'URL finale" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      videoUrl,
      type: videoUrl.includes(".m3u8") ? "hls" : "mp4"
    });
  } catch (error) {
    console.error("[Serie Uqload] Erreur:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur inconnue",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 