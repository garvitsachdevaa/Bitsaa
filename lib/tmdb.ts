export type MovieLookupResult = {
  title: string;
  watch_link: string;
};

type TMDbSearchResult = {
  id: number;
  title: string;
};

type TMDbSearchResponse = {
  results: TMDbSearchResult[];
};

export async function lookupMovieAndWatchLink(
  candidateTitle: string
): Promise<MovieLookupResult | null> {
  const apiKey = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(candidateTitle)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("TMDb API error:", res.status, res.statusText);
      return null;
    }

    const data = (await res.json()) as TMDbSearchResponse;

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const first = data.results[0];
    return {
      title: first.title,
      watch_link: `https://www.themoviedb.org/movie/${first.id}`,
    };
  } catch (err) {
    console.error("TMDb lookup failed:", err);
    return null;
  }
}
