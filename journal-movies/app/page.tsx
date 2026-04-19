"use client";

import { useEffect, useState } from "react";
import type { MovieEntry } from "@/lib/movies";

export default function HomePage() {
  const [movies, setMovies] = useState<MovieEntry[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [reelUrl, setReelUrl] = useState("");
  const [rawText, setRawText] = useState("");

  useEffect(() => {
    fetch("/api/movies")
      .then((r) => r.json())
      .then((data) => setMovies(data.movies ?? []))
      .catch(() => setError("Failed to load movies."))
      .finally(() => setInitialLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!reelUrl.trim() && !rawText.trim()) {
      setError("Please provide a Reel URL or a caption.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reel_url: reelUrl, raw_text: rawText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      if (data.created) {
        setMovies((prev) => [data.movie, ...prev]);
        setReelUrl("");
        setRawText("");
      } else {
        setInfoMessage(data.message);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Movies from Instagram Reels</h1>
          <p className="text-sm text-gray-500 mt-1">
            Paste a Reel URL — we'll try to detect the movie automatically. Add a caption for better accuracy.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="reel_url">
              Reel URL <span className="text-blue-500 text-xs font-normal">(primary)</span>
            </label>
            <input
              id="reel_url"
              type="url"
              value={reelUrl}
              onChange={(e) => setReelUrl(e.target.value)}
              placeholder="https://www.instagram.com/reel/..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="raw_text">
              Caption / transcript{" "}
              <span className="text-gray-400 text-xs font-normal">
                (optional — improves accuracy)
              </span>
            </label>
            <textarea
              id="raw_text"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={3}
              placeholder="Paste the reel caption or transcript here..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Processing…" : "Add from Reel"}
          </button>
        </form>

        {infoMessage && (
          <p className="text-sm text-amber-600 text-center bg-amber-50 rounded-lg px-4 py-3">
            {infoMessage}
          </p>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-3">Saved Movies</h2>

          {initialLoading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : movies.length === 0 ? (
            <p className="text-sm text-gray-400">
              No movies saved yet. Paste a reel above to get started.
            </p>
          ) : (
            <ul className="space-y-3">
              {movies.map((movie) => (
                <li
                  key={movie.id}
                  className="bg-white rounded-xl shadow px-5 py-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{movie.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Confidence: {Math.round(movie.confidence * 100)}%
                      {movie.reel_url && (
                        <>
                          {" · "}
                          <a
                            href={movie.reel_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-500"
                          >
                            Reel
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                  <a
                    href={movie.watch_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Watch
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
