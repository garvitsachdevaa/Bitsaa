"use client";

import { useEffect, useState } from "react";
import type { MovieEntry } from "@/lib/movies";

const API_BASE = "/api";

export default function HomePage() {
  const [movies, setMovies] = useState<MovieEntry[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [reelUrl, setReelUrl] = useState("");
  const [rawText, setRawText] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/movies`)
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

  function confidenceBadge(confidence: number) {
    const pct = Math.round(confidence * 100);
    if (pct >= 85)
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {pct}% match
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        {pct}% match
      </span>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <span className="text-2xl">🎬</span>
          <div>
            <h1 className="text-base font-semibold leading-none">Movies Journal</h1>
            <p className="text-xs text-slate-500 mt-0.5">from Instagram Reels</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto space-y-10">

          {/* Form card */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-widest">
                Add a Reel
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Paste the URL — we'll detect the movie automatically. Add a caption for better accuracy.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Reel URL */}
              <div className="space-y-1.5">
                <label htmlFor="reel_url" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Reel URL
                  <span className="ml-2 normal-case text-blue-400 font-normal tracking-normal">primary</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <LinkIcon />
                  </span>
                  <input
                    id="reel_url"
                    type="url"
                    value={reelUrl}
                    onChange={(e) => setReelUrl(e.target.value)}
                    placeholder="https://www.instagram.com/reel/..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-xs text-slate-600">or add caption</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Caption */}
              <div className="space-y-1.5">
                <label htmlFor="raw_text" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Caption / Transcript
                  <span className="ml-2 normal-case text-slate-500 font-normal tracking-normal">optional — improves accuracy</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-500">
                    <TextIcon />
                  </span>
                  <textarea
                    id="raw_text"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    rows={3}
                    placeholder="Paste the reel caption or transcript here..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  <span className="mt-0.5 shrink-0">⚠</span>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Detecting movie…
                  </>
                ) : (
                  "Add from Reel"
                )}
              </button>
            </form>
          </section>

          {/* Info message */}
          {infoMessage && (
            <div className="flex items-start gap-3 text-sm text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3">
              <span className="text-lg shrink-0">💡</span>
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Movies list */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-widest">
                Saved Movies
              </h2>
              {!initialLoading && movies.length > 0 && (
                <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">
                  {movies.length} {movies.length === 1 ? "film" : "films"}
                </span>
              )}
            </div>

            {initialLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 animate-pulse">
                    <div className="h-4 bg-slate-800 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-slate-800 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : movies.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-4xl">🍿</p>
                <p className="text-slate-400 text-sm">No movies saved yet.</p>
                <p className="text-slate-600 text-xs">Paste a reel above to get started.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} badge={confidenceBadge(movie.confidence)} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-700">
        Powered by OpenAI + TMDb
      </footer>
    </div>
  );
}

function MovieCard({
  movie,
  badge,
}: {
  movie: MovieEntry;
  badge: React.ReactNode;
}) {
  return (
    <li className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 transition-colors">
      <div className="min-w-0 space-y-1.5">
        <p className="font-semibold text-slate-100 truncate">{movie.title}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {badge}
          {movie.reel_url && (
            <a
              href={movie.reel_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-blue-400 transition-colors underline underline-offset-2"
            >
              View Reel ↗
            </a>
          )}
        </div>
      </div>
      <a
        href={movie.watch_link}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
      >
        Watch
      </a>
    </li>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="17" y1="10" x2="3" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
