import { NextResponse } from "next/server";

// Helper to safely decode HTML entities
function decodeHTML(html: string): string {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#039;/g, "'");
}

async function fetchWithHeaders(url: string, options: RequestInit = {}) {
  const defaultHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
  };

  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
}

async function extractVideoUrl(html: string): Promise<string | null> {
  // Debug: Log a sample of the HTML for inspection
  console.log("Received HTML sample:", html.substring(0, 500));

  const patterns = [
    // New patterns specific to uqload
    /sources:\s*\[\s*{\s*file:\s*["']([^"']+)["']/i,
    /player\.src\(\s*{\s*sources:\s*\[\s*{\s*src:\s*["']([^"']+)["']/i,
    /source\s+src="([^"]+)"/i,
    /file:\s*"([^"]+)"/,
    // Look for a script block containing the player configuration
    /<script>[^<]*sources\s*:\s*\[{file:"([^"]+)"/,
  ];

  // First try to find a specific script block that might contain the player config
  const scriptMatch = html.match(
    /<script>\s*var\s+player\s*=\s*([^<]+)<\/script>/i,
  );
  if (scriptMatch) {
    console.log("Found player script block:", scriptMatch[1]);
    const playerConfig = scriptMatch[1];
    // Look for the file URL in the player configuration
    const urlMatch = playerConfig.match(/file:\s*["']([^"']+)["']/i);
    if (urlMatch) {
      return decodeHTML(urlMatch[1]);
    }
  }

  // Try all patterns if script block approach failed
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      console.log("Found URL with pattern:", pattern, match[1]);
      const url = decodeHTML(match[1].trim());
      if (url.startsWith("http")) {
        return url;
      }
    }
  }

  // Last resort: try to find any URL that looks like a video file
  const videoUrlPattern = /https?:\/\/[^"'\s]+\.(?:mp4|m3u8)(?:[^"'\s]*)/i;
  const videoMatch = html.match(videoUrlPattern);
  if (videoMatch) {
    console.log("Found video URL with generic pattern:", videoMatch[0]);
    return videoMatch[0];
  }

  return null;
}

async function handleUqloadRequest(id: string) {
  const embedUrl = `https://uqload.net/embed-${id}.html`;
  console.log("Fetching URL:", embedUrl);

  const response = await fetchWithHeaders(embedUrl);

  if (!response.ok) {
    console.error(
      "Failed to fetch embed URL:",
      response.status,
      response.statusText,
    );
    return NextResponse.json(
      { error: `Erreur de récupération: ${response.status}` },
      { status: response.status },
    );
  }

  const html = await response.text();
  console.log("Received HTML length:", html.length);

  if (html.includes("File was deleted") || html.includes("File not found")) {
    return NextResponse.json(
      { error: "La vidéo n'est plus disponible" },
      { status: 404 },
    );
  }

  const videoUrl = await extractVideoUrl(html);

  if (!videoUrl) {
    console.error("No video URL found in HTML");
    return NextResponse.json(
      { error: "URL vidéo non trouvée dans la source" },
      { status: 404 },
    );
  }

  console.log("Found video URL:", videoUrl);

  return NextResponse.json({
    videoUrl,
    type: videoUrl.includes(".m3u8")
      ? "hls"
      : videoUrl.includes(".ts")
        ? "ts"
        : "mp4",
  });
}

async function handleGenericProxy(url: string, options: RequestInit = {}) {
  console.log("Proxying URL:", url, "with options:", options);
  
  const response = await fetchWithHeaders(url, options);
  
  if (!response.ok) {
    return NextResponse.json(
      { error: `Erreur de récupération: ${response.status}` },
      { status: response.status },
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("text/html")) {
    const html = await response.text();
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Pour les autres types de contenu, renvoyer tel quel
  const blob = await response.blob();
  return new NextResponse(blob, {
    headers: { "Content-Type": contentType || "application/octet-stream" },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const url = searchParams.get("url");

    if (id) {
      return handleUqloadRequest(id);
    } else if (url) {
      return handleGenericProxy(url);
    } else {
      return NextResponse.json(
        { error: "Paramètre 'id' ou 'url' manquant" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur inconnue",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, method = 'GET', headers = {}, body: requestBody } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL manquante dans le corps de la requête" },
        { status: 400 },
      );
    }

    // Construire les options de la requête
    const options: RequestInit = {
      method,
      headers,
    };

    // Ajouter le body si présent
    if (requestBody) {
      options.body = requestBody;
    }

    return handleGenericProxy(url, options);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur inconnue",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}