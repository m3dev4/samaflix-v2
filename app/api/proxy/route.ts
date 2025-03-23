import { NextResponse } from "next/server";

export const config = {
  runtime: 'edge',
  regions: ['cdg1'], // Région de Paris pour la France
};

const CHUNK_SIZE = 512 * 1024; // Réduction à 512KB pour Vercel
const MAX_CHUNK_SIZE = 2 * 1024 * 1024; // 2MB maximum

async function streamWithRetry(
  url: string,
  headers: HeadersInit,
  retries = 3,
  startByte = 0,
  endByte?: number,
): Promise<Response> {
  let lastError;

  const rangeHeader = endByte
    ? `bytes=${startByte}-${endByte}`
    : `bytes=${startByte}-`;

  const requestHeaders = {
    ...headers,
    Range: rangeHeader,
  };

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: requestHeaders,
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok || response.status === 206) {
        return response;
      }

      if (response.status === 503) {
        console.log(`Server unavailable (503) on try ${i + 1}/${retries}`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }

      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error(`Retry ${i + 1}/${retries} failed:`, error);
      lastError = error;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 4000)),
    );
  }

  throw lastError;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const userAgent = request.headers.get("user-agent") || "";
    const isMobile = /Mobile|Android|iPhone/i.test(userAgent);

    if (!url) {
      return NextResponse.json({ error: "URL manquante" }, { status: 400 });
    }

    const requestHeaders = {
      "User-Agent": userAgent,
      Accept: "*/*",
      "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
      Origin: new URL(request.url).origin,
      Referer: new URL(url).origin,
      Connection: "keep-alive",
      "Cache-Control": "public, max-age=31536000",
    };

    // Gestion des requêtes HEAD
    if (request.method === "HEAD") {
      const response = await fetch(url, {
        method: "HEAD",
        headers: requestHeaders,
      });

      const headers = new Headers();
      headers.set("Accept-Ranges", "bytes");
      headers.set("Content-Length", response.headers.get("Content-Length") || "0");
      headers.set("Content-Type", "video/mp4");
      headers.set("Cache-Control", "public, max-age=31536000");

      return new NextResponse(null, { headers });
    }

    const rangeHeader = request.headers.get("range");
    let startByte = 0;
    let endByte: number | undefined;

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d+)?/);
      if (match) {
        startByte = parseInt(match[1], 10);
        endByte = match[2] ? parseInt(match[2], 10) : undefined;
      }
    }

    // Optimisation de la taille des chunks
    const chunkSize = isMobile ? CHUNK_SIZE / 2 : CHUNK_SIZE;
    if (!endByte && !rangeHeader) {
      endByte = startByte + Math.min(chunkSize, MAX_CHUNK_SIZE);
    }

    const response = await streamWithRetry(
      url,
      requestHeaders,
      3,
      startByte,
      endByte,
    );

    const headers = new Headers();
    headers.set("Content-Type", "video/mp4");
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Range");
    headers.set("Access-Control-Expose-Headers", "Content-Range, Content-Length");

    if (response.headers.has("Content-Range")) {
      headers.set("Content-Range", response.headers.get("Content-Range")!);
    }
    if (response.headers.has("Content-Length")) {
      headers.set("Content-Length", response.headers.get("Content-Length")!);
    }

    return new NextResponse(response.body, {
      status: rangeHeader ? 206 : 200,
      headers,
    });
  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur inconnue",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
