# Movies Journal

A Movies-only Instagram Reels Journal. Paste a reel caption or transcript and the app uses OpenAI to detect movie recommendations, validates them via TMDb, and saves them to a local JSON store.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env.local`** in the project root:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   TMDB_API_KEY=your_tmdb_api_key_here
   ```
   - Get an OpenAI key at https://platform.openai.com/api-keys
   - Get a TMDb key at https://www.themoviedb.org/settings/api

3. **Run the dev server**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Paste a reel caption or transcript (e.g. *"You have to watch this Nolan dream-heist movie – Inception level good"*).
2. Optionally add the Reel URL.
3. Click **Add from Reel**.
4. A movie row appears with title, confidence score, and a **Watch** link.
5. Movies persist in `data/movies.json` across server restarts.

## Manual test checklist (Phase 9)

- [ ] Start dev server (`npm run dev`)
- [ ] Open http://localhost:3000
- [ ] Paste: *"You have to watch this Christopher Nolan dream-heist movie, it's Inception-level good."*
- [ ] Optionally add a Reel URL
- [ ] Click **Add from Reel** — a new row should appear with "Inception", confidence %, and Watch link
- [ ] Click **Watch** — opens TMDb movie page in a new tab
- [ ] Add a second caption and verify two entries display
- [ ] Restart dev server — confirm both movies persist (JSON file read on startup)
