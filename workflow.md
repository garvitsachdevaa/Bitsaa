# Prompt: Build “Instagram Movies Journal” MVP with OpenAI + TMDb

You are an expert full‑stack engineer. We will build a small web app in clear, reviewable phases.

## Overall product idea (for context)

Goal: A Movies-only MVP of an “Instagram Journal” app.

User story:
> “As a movie enthusiast, I want to see all movie recommendations from my saved Instagram reels in one place, so I can decide what to watch without digging through Instagram.”

For this MVP:
- User pastes:
  - a Reel URL (optional), and
  - free text from the Reel (caption and/or transcript).
- Backend uses **OpenAI API** to infer whether the text is a movie recommendation and guess the movie title.
- Backend then calls **TMDb** to validate the title and get a canonical movie.
- App stores the movie in a small JSON “database”.
- Frontend displays a **Movies list** with a “Watch” link for each movie.

No auth, no real Instagram API, no full ASR/OCR – the user just pastes the text.

---

## Phase 0 – Tech stack & constraints

Use this stack:

- Runtime: Node.js 18+
- Framework: **Next.js 14** with the App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Persistence: a JSON file (`data/movies.json`) storing an array of movie entries
- External APIs:
  - **OpenAI API** (chat/completions with JSON / structured output) for inference
  - **TMDb API** for movie search and canonical titles

Assume I will provide:

- `OPENAI_API_KEY`
- `TMDB_API_KEY`

in a `.env.local` file.

Please acknowledge the stack, then move to Phase 1.

---

## Phase 1 – Scaffold project

Tasks:

1. Generate the commands to scaffold a Next.js + TypeScript + Tailwind app called `journal-movies`.
   - Use `create-next-app` with:
     - TypeScript
     - Tailwind
     - App Router
     - ESLint
2. Show the exact CLI command(s) you want me to run.
3. Assume the resulting project structure is standard Next.js 14.

Do NOT write app code yet; only show the scaffold commands and confirm assumptions.

---

## Phase 2 – Data model & JSON “database”

Now design the data model and persistence layer.

### 2.1 Define `MovieEntry` type

Create `lib/movies.ts` with:

```ts
export type MovieEntry = {
  id: number;
  reel_url: string;    // optional in UI, but store as empty string if missing
  raw_text: string;    // original caption/transcript text
  title: string;       // final movie title (canonical)
  confidence: number;  // 0–1 confidence score from OpenAI
  watch_link: string;  // URL to watch/search
};
```

### 2.2 JSON file helpers

In `lib/movies.ts`, add:

- A helper to get the absolute path to `data/movies.json` using `process.cwd()` and `path.join`.
- `async function getAllMovies(): Promise<MovieEntry[]>`
  - If file exists, read and parse JSON into `MovieEntry[]`.
  - If file is missing or invalid, return `[]` and create/overwrite the file with `[]` when saving.
- `async function saveMovies(movies: MovieEntry[]): Promise<void>`
  - Serialize as pretty JSON and write back to the file.
- `async function addMovie(entry: Omit<MovieEntry, "id">): Promise<MovieEntry>`
  - Load existing movies.
  - Compute new `id` = 1 + max existing ID (or 1 if empty).
  - Create `MovieEntry`, push, save, return.

Show the full TypeScript code for `lib/movies.ts`.

---

## Phase 3 – OpenAI helper to infer movie from text

We now build a helper that calls the **OpenAI API** to infer whether a Reel text is a movie recommendation and extract a title.

### 3.1 Install OpenAI client

Show the `npm` command to install the official OpenAI client and then add the import you will use, e.g.:

```ts
import OpenAI from "openai";
```

### 3.2 Implement `inferMovieFromText`

Create `lib/inference.ts` with:

```ts
export type InferredMovie = {
  is_movie: boolean;
  title: string | null;
  confidence: number; // 0–1
  reason: string;
};

export async function inferMovieFromText(raw_text: string): Promise<InferredMovie> {
  // implementation using OpenAI chat/completions with JSON output
}
```

Requirements:

- Read `OPENAI_API_KEY` from `process.env.OPENAI_API_KEY`.
- If `raw_text` is empty/whitespace, immediately return:
  - `{ is_movie: false, title: null, confidence: 0, reason: "No text provided" }`.
- Otherwise, call the OpenAI API using a modern chat model (e.g. `gpt-4o` or current recommended model) with **JSON response mode**:
  - Use `response_format: { type: "json_object" }` so the model returns valid JSON only.
  - Prompt should clearly instruct:
    - Decide if this text is a **movie recommendation**.
    - If yes, infer the most likely movie title.
    - Return JSON with keys: `is_movie`, `title`, `confidence` (0–1 float), `reason`.
- Parse the response JSON safely:
  - If parsing fails or keys are missing, treat it as `is_movie: false`.

Show the full TypeScript implementation for `inferMovieFromText`.

---

## Phase 4 – TMDb lookup helper

Now we connect the inferred title to TMDb.

Create `lib/tmdb.ts` with:

```ts
export type MovieLookupResult = {
  title: string;      // canonical title from TMDb
  watch_link: string; // URL we will show in the UI
};

export async function lookupMovieAndWatchLink(candidateTitle: string): Promise<MovieLookupResult | null> {
  // implementation using TMDb search API
}
```

Requirements:

- Read `TMDB_API_KEY` from `process.env.TMDB_API_KEY`.
- Call TMDb **search movie** endpoint with `query=candidateTitle`.
- If `results` is non-empty:
  - Take the first result.
  - Use `results[0].title` as `title`.
  - Construct a `watch_link` as either:
    - `https://www.themoviedb.org/movie/{id}` or
    - `https://www.netflix.com/search?q=${encodeURIComponent(title)}`.
- If `results` is empty, return `null`.
- Handle errors gracefully and log them.

Show the full implementation for `lookupMovieAndWatchLink`.

---

## Phase 5 – Combined processing helper

Create `lib/processReel.ts` with a single exported function that orchestrates everything:

```ts
import { MovieEntry, addMovie } from "./movies";
import { inferMovieFromText } from "./inference";
import { lookupMovieAndWatchLink } from "./tmdb";

export async function processReelInput(reel_url: string, raw_text: string): Promise<MovieEntry | null> {
  // 1) Use inferMovieFromText
  // 2) If not is_movie or confidence < 0.7, return null
  // 3) Use lookupMovieAndWatchLink
  // 4) If TMDb returns null, return null
  // 5) Call addMovie and return the new MovieEntry
}
```

Logic:

1. Call `inferMovieFromText(raw_text)`.
2. If `is_movie === false` or `confidence < 0.7`, return `null`.
3. Call `lookupMovieAndWatchLink(inferred.title!)`.
4. If that returns `null`, return `null`.
5. Build `Omit<MovieEntry, "id">` with:
   - `reel_url` (or empty string),
   - `raw_text`,
   - canonical `title`,
   - `confidence`,
   - `watch_link`.
6. Call `addMovie` and return the created entry.

Show the full TypeScript implementation.

---

## Phase 6 – API routes

Implement a Next.js App Router API route at `app/api/movies/route.ts`.

### 6.1 GET /api/movies

- Call `getAllMovies()` from `lib/movies`.
- Return JSON `{ movies: MovieEntry[] }` with status `200`.

### 6.2 POST /api/movies

Expected JSON body:

```json
{
  "reel_url": "https://www.instagram.com/reel/...",
  "raw_text": "caption or transcript text"
}
```

Handler logic:

1. Parse JSON body.
2. Validate `raw_text`: if empty, return `400` with `{ error: "raw_text is required" }`.
3. Call `processReelInput(reel_url ?? "", raw_text)`.
4. If it returns `null`, respond `200` with:
   - `{ created: false, message: "No movie recommendation detected or low confidence" }`.
5. If it returns a `MovieEntry`, respond `201` with:
   - `{ created: true, movie: MovieEntry }`.
6. Wrap in `try/catch` and respond `500` with `{ error: "Server error" }` on unexpected errors.

Show the full `route.ts` file.

---

## Phase 7 – Frontend UI (Movies page)

Implement `app/page.tsx` as a **client component**.

### 7.1 State & hooks

Use React hooks to manage:

- `movies: MovieEntry[]`
- `loading: boolean` (for form submissions)
- `initialLoading: boolean` (for initial fetch)
- `error: string | null`
- `infoMessage: string | null`
- `form` fields: `reel_url`, `raw_text`

On mount (`useEffect`), fetch `/api/movies` and populate `movies`.

### 7.2 Layout and styling (Tailwind)

Page layout:

- Main container centered with `max-w-xl` or similar and padding.
- Title: “Movies from Instagram Reels”.
- Short description of the user story.
- Card-style form section with:
  - Input for `Reel URL` (optional).
  - Textarea for `Reel caption / transcript` (required).
  - Submit button “Add from Reel”.
- Below form:
  - Show `infoMessage` in subtle text if present.
  - If loading initial data, show a simple “Loading…” indicator.
  - If no movies, show an empty state message.
  - Otherwise, show a list or table of movies:
    - Show `title`, `confidence` (as e.g. “93%”), optional `reel_url` (shortened), and a `Watch` button.

The `Watch` button should:

```tsx
<a
  href={movie.watch_link}
  target="_blank"
  rel="noopener noreferrer"
>
  Watch
</a>
```

Use Tailwind to make it readable but not over-designed.

### 7.3 Form behaviour

- Validate on the client:
  - If `raw_text` is empty, show a small error and prevent submit.
- On submit:
  - Set `loading = true`, clear `error` and `infoMessage`.
  - POST to `/api/movies` with `{ reel_url, raw_text }`.
  - If response has `created = false`, set `infoMessage` to the message.
  - If `created = true`, append the new movie to `movies` and clear the form + `infoMessage`.
  - Handle network or server errors by setting `error` to a user-friendly message.
  - Always set `loading = false` at the end.

Show the full `page.tsx` implementation.

---

## Phase 8 – Environment variables & configuration

Add documentation/comments for:

- `.env.local` keys:

```bash
OPENAI_API_KEY=...
TMDB_API_KEY=...
```

- How the code reads them (`process.env.OPENAI_API_KEY`, `process.env.TMDB_API_KEY`).
- Any required Next.js configuration (e.g. enabling `process.env` on server only).

Optionally add a simple `README.md` describing:

- How to run:
  - `npm install`
  - `npm run dev`
- How to set env vars.
- Basic usage steps.

---

## Phase 9 – Manual test checklist

Finally, provide a short checklist I can follow manually:

1. Start dev server.
2. Open app in browser.
3. Paste an example caption like:
   - “You *have* to watch this Christopher Nolan dream-heist movie, it’s Inception-level good.”
4. Optionally add a Reel URL.
5. Click **Add from Reel**.
6. Verify:
   - A new row appears with title inferred by OpenAI and canonicalized by TMDb.
   - Confidence is shown.
   - Clicking **Watch** opens the movie page/search in a new tab.
7. Add a second caption to ensure multiple entries display and persist.
8. Restart dev server and confirm movies are still present (JSON persistence works).

After each phase, stop and show me the complete files you created or modified so I can review them before continuing.