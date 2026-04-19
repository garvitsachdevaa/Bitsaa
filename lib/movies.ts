export type MovieEntry = {
  id: number;
  reel_url: string;
  raw_text: string;
  title: string;
  confidence: number;
  watch_link: string;
};

const store: MovieEntry[] = [];

export async function getAllMovies(): Promise<MovieEntry[]> {
  return store;
}

export async function saveMovies(movies: MovieEntry[]): Promise<void> {
  store.length = 0;
  store.push(...movies);
}

export async function addMovie(
  entry: Omit<MovieEntry, "id">
): Promise<MovieEntry> {
  const maxId = store.reduce((max, m) => Math.max(max, m.id), 0);
  const newMovie: MovieEntry = { id: maxId + 1, ...entry };
  store.push(newMovie);
  return newMovie;
}
