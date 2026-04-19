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

const IS_VERCEL = !!process.env.VERCEL;
const LOCAL_DB_PATH = path.join(process.cwd(), "data", "movies.json");
const KV_KEY = "movies";

async function kvGet(): Promise<MovieEntry[]> {
  const { kv } = await import("@vercel/kv");
  const data = await kv.get<MovieEntry[]>(KV_KEY);
  return data ?? [];
}

async function kvSet(movies: MovieEntry[]): Promise<void> {
  const { kv } = await import("@vercel/kv");
  await kv.set(KV_KEY, movies);
}

export async function getAllMovies(): Promise<MovieEntry[]> {
  if (IS_VERCEL) return kvGet();
  try {
    const raw = await fs.readFile(LOCAL_DB_PATH, "utf-8");
    return JSON.parse(raw) as MovieEntry[];
  } catch {
    return [];
  }
}

export async function saveMovies(movies: MovieEntry[]): Promise<void> {
  if (IS_VERCEL) return kvSet(movies);
  await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(movies, null, 2), "utf-8");
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
