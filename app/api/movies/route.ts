import { NextRequest, NextResponse } from "next/server";
import { getAllMovies } from "@/lib/movies";
import { processReelInput } from "@/lib/processReel";

export const dynamic = "force-dynamic";

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

    const hasUrl = reel_url && reel_url.trim();
    const hasText = raw_text && raw_text.trim();

    if (!hasUrl && !hasText) {
      return NextResponse.json(
        { error: "Provide at least a reel_url or raw_text." },
        { status: 400 }
      );
    }

    const result = await processReelInput(reel_url ?? "", raw_text ?? "");

    if (result.status === "created") {
      return NextResponse.json({ created: true, movie: result.movie }, { status: 201 });
    }

    if (result.status === "extraction_failed") {
      return NextResponse.json(
        { created: false, message: result.message },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { created: false, message: result.message },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/movies error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
