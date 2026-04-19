import OpenAI from "openai";

export type InferredMovie = {
  is_movie: boolean;
  title: string | null;
  confidence: number;
  reason: string;
};

export async function inferMovieFromText(
  raw_text: string
): Promise<InferredMovie> {
  if (!raw_text.trim()) {
    return { is_movie: false, title: null, confidence: 0, reason: "No text provided" };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a movie recommendation detector. Given text from a social media reel caption or transcript, decide if it is recommending a specific movie. Return a JSON object with exactly these keys: is_movie (boolean), title (string or null — the movie title if detected), confidence (float 0-1), reason (string explaining your decision).",
      },
      {
        role: "user",
        content: raw_text,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";

  try {
    const parsed = JSON.parse(raw) as Partial<InferredMovie>;
    return {
      is_movie: Boolean(parsed.is_movie),
      title: parsed.title ?? null,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
      reason: parsed.reason ?? "",
    };
  } catch {
    return { is_movie: false, title: null, confidence: 0, reason: "Failed to parse OpenAI response" };
  }
}
