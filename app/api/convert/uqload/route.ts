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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID vidéo manquant" }, { status: 400 });
    }

    const embedUrl = `https://uqload.net/embed-${id}.html`;
    console.log("Fetching URL:", embedUrl);

    const response = await fetch(embedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
        Referer: "https://uqload.net/",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
      },
    });

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
