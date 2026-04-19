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

const LOCAL_DB_PATH = path.join(process.cwd(), "data", "movies.json");
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const HAS_REDIS = !!UPSTASH_URL && !!UPSTASH_TOKEN;

async function redisGet(): Promise<MovieEntry[]> {
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([["GET", "movies"]]),
    cache: "no-store",
  });
  const json = (await res.json()) as [{ result: string | null }];
  return json[0].result ? (JSON.parse(json[0].result) as MovieEntry[]) : [];
}

async function redisSet(movies: MovieEntry[]): Promise<void> {
  await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([["SET", "movies", JSON.stringify(movies)]]),
  });
}

export async function getAllMovies(): Promise<MovieEntry[]> {
  if (HAS_REDIS) return redisGet();
  try {
    const raw = await fs.readFile(LOCAL_DB_PATH, "utf-8");
    return JSON.parse(raw) as MovieEntry[];
  } catch {
    return [];
  }
}

export async function saveMovies(movies: MovieEntry[]): Promise<void> {
  if (HAS_REDIS) return redisSet(movies);
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
