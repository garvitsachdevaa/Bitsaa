# Updated Prompt: Instagram Movies Journal MVP (Revised Extraction Flow)

You are an expert full-stack engineer. We will build a small web app in clear, reviewable phases.

---

## 🔥 Key Change in Product Direction

We are shifting from:

❌ Caption-required system  
➡️ To  
✅ Reel-first, caption-optional system

Goal:
> User pastes a Reel URL → system attempts automatic extraction → user can optionally add caption for better accuracy

---

## Phase 0 – Tech Stack (Same)

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Node.js 18+
- JSON storage
- OpenAI API
- TMDb API

---

## Phase 1 – Scaffold (Same)

Use create-next-app with:
- TypeScript
- Tailwind
- App Router

---

## Phase 2 – Data Model (Same)

MovieEntry:
- id
- reel_url
- raw_text
- title
- confidence
- watch_link

---

## 🚀 NEW Phase 3 – Extraction Layer (NEW)

Create `lib/extract.ts`

Purpose:
Extract usable text from Reel URL using metadata

Implementation:

- Fetch HTML from reel URL
- Extract:
  - og:description
  - og:title
- Return combined text

Fallback:
- If extraction fails → return null

---

## Phase 4 – OpenAI Inference (Same, but input changes)

Input now becomes:

combined_text = raw_text OR extracted_text

---

## Phase 5 – TMDb Lookup (Same)

---

## 🔥 UPDATED Phase 6 – Processing Logic

Update processReelInput:

Flow:

1. If raw_text exists → use it
2. Else if reel_url exists → extract metadata
3. If no text available → return null with message
4. Run inference
5. If confidence < 0.7 → reject
6. Validate via TMDb
7. Store result

---

## 🔥 UPDATED Phase 7 – API Changes

POST /api/movies:

Validation:

- Require at least ONE:
  - reel_url OR raw_text

NOT BOTH

Error:

- If both missing → 400

Response improvement:

- If extraction failed:
  message: "Could not extract text from reel. Try adding caption."

---

## 🔥 UPDATED Phase 8 – UI Changes

Form:

- Reel URL → PRIMARY input
- Caption → OPTIONAL

Label:

"Caption / transcript (optional — improves accuracy)"

UX behavior:

Case 1: Reel only
→ Attempt auto extraction

Case 2: Caption only
→ Use caption

Case 3: Both
→ Caption takes priority

---

## 🔥 UX Messaging (IMPORTANT)

If extraction fails:

"We couldn’t automatically read this reel yet. Adding caption helps improve detection."

---

## Phase 9 – Future Scope (DO NOT BUILD NOW)

- Video transcription (ASR)
- Frame OCR
- Instagram scraping via headless browser
- ML classification beyond movies

---

## ✅ Final MVP Behavior

User pastes reel → app tries to understand it automatically → optional help via caption → stores movie

---

## 💡 Core Principle

"Automation first, user assist second"

NOT

"User does all the work"

---

## Manual Test Flow

1. Paste Reel URL only
2. Verify extraction attempt
3. Add caption if needed
4. Confirm movie stored
5. Check persistence

---

