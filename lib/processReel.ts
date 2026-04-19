import { MovieEntry, addMovie } from "./movies";
import { inferMovieFromText } from "./inference";
import { lookupMovieAndWatchLink } from "./tmdb";
import { extractTextFromReelUrl } from "./extract";

export type ProcessResult =
  | { status: "created"; movie: MovieEntry }
  | { status: "rejected"; message: string }
  | { status: "extraction_failed"; message: string };

export async function processReelInput(
  reel_url: string,
  raw_text: string
): Promise<ProcessResult> {
  let text_to_use = raw_text.trim();

  if (!text_to_use && reel_url) {
    const extracted = await extractTextFromReelUrl(reel_url);
    if (!extracted) {
      return {
        status: "extraction_failed",
        message:
          "We couldn't automatically read this reel yet. Adding caption helps improve detection.",
      };
    }
    text_to_use = extracted;
  }

  if (!text_to_use) {
    return { status: "rejected", message: "No text available to process." };
  }

  const inferred = await inferMovieFromText(text_to_use);

  if (!inferred.is_movie || inferred.confidence < 0.7) {
    return {
      status: "rejected",
      message: "No movie recommendation detected or low confidence.",
    };
  }

  const lookup = await lookupMovieAndWatchLink(inferred.title!);

  if (!lookup) {
    return {
      status: "rejected",
      message: "Could not validate movie via TMDb.",
    };
  }

  const movie = await addMovie({
    reel_url: reel_url || "",
    raw_text: text_to_use,
    title: lookup.title,
    confidence: inferred.confidence,
    watch_link: lookup.watch_link,
  });

  return { status: "created", movie };
}
