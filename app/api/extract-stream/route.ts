import { extractDuLourd } from "@/utils/sites";
import { error } from "console";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seriesName, season, episode } = body;

    if (!seriesName || !season || !episode) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields",
        status: 400,
      });
    }

    const streams = await extractDuLourd(seriesName, season, episode);

    if (!streams || streams.length === 0) {
      return NextResponse.json({ error: "No streams found" }, { status: 404 });
    }

    const uqloadSource = streams.find((s) => s.player === "uqload");
    const streamUrl = (uqloadSource || streams[0]).url;

    return NextResponse.json({ success: true, streamUrl });
  } catch (error) {
    console.error("Error extracting stream:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      status: 500,
    });
  }
}
