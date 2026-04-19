import { MovieEntry, addMovie } from "./movies";
import { inferMovieFromText } from "./inference";
import { lookupMovieAndWatchLink } from "./tmdb";

export async function processReelInput(
  reel_url: string,
  raw_text: string
): Promise<MovieEntry | null> {
  const inferred = await inferMovieFromText(raw_text);

  if (!inferred.is_movie || inferred.confidence < 0.7) {
    return null;
  }

  const lookup = await lookupMovieAndWatchLink(inferred.title!);

  if (!lookup) {
    return null;
  }

  return addMovie({
    reel_url: reel_url || "",
    raw_text,
    title: lookup.title,
    confidence: inferred.confidence,
    watch_link: lookup.watch_link,
  });
}
