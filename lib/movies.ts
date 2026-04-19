import fs from "fs/promises";
import path from "path";

export type MovieEntry = {
  id: number;
  reel_url: string;
  raw_text: string;
  title: string;
  confidence: number;
  watch_link: string;
};

const DB_PATH = path.join(process.cwd(), "data", "movies.json");

export async function getAllMovies(): Promise<MovieEntry[]> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw) as MovieEntry[];
  } catch {
    try { await saveMovies([]); } catch { /* read-only fs on Vercel — ignore */ }
    return [];
  }
}

export async function saveMovies(movies: MovieEntry[]): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(movies, null, 2), "utf-8");
}

export async function addMovie(
  entry: Omit<MovieEntry, "id">
): Promise<MovieEntry> {
  const movies = await getAllMovies();
  const maxId = movies.reduce((max, m) => Math.max(max, m.id), 0);
  const newMovie: MovieEntry = { id: maxId + 1, ...entry };
  movies.push(newMovie);
  await saveMovies(movies);
  return newMovie;
}
