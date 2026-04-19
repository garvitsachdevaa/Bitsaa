import { NextRequest, NextResponse } from "next/server";
import { getAllMovies } from "@/lib/movies";
import { processReelInput } from "@/lib/processReel";

export async function GET() {
  const movies = await getAllMovies();
  return NextResponse.json({ movies }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reel_url, raw_text } = body as {
      reel_url?: string;
      raw_text?: string;
    };

    if (!raw_text || !raw_text.trim()) {
      return NextResponse.json(
        { error: "raw_text is required" },
        { status: 400 }
      );
    }

    const movie = await processReelInput(reel_url ?? "", raw_text);

    if (!movie) {
      return NextResponse.json(
        { created: false, message: "No movie recommendation detected or low confidence" },
        { status: 200 }
      );
    }

    return NextResponse.json({ created: true, movie }, { status: 201 });
  } catch (err) {
    console.error("POST /api/movies error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
