export async function extractTextFromReelUrl(
  reel_url: string
): Promise<string | null> {
  try {
    const res = await fetch(reel_url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
    });

    if (!res.ok) {
      console.error("extract: HTTP error", res.status);
      return null;
    }

    const html = await res.text();

    const ogDescription = extractMetaContent(html, "og:description");
    const ogTitle = extractMetaContent(html, "og:title");

    const parts = [ogTitle, ogDescription].filter(Boolean);
    if (parts.length === 0) return null;

    return parts.join(" ").trim();
  } catch (err) {
    console.error("extract: failed to fetch reel URL", err);
    return null;
  }
}

function extractMetaContent(html: string, property: string): string | null {
  const regex = new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const altRegex = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
    "i"
  );
  const match = html.match(regex) ?? html.match(altRegex);
  return match ? match[1].trim() : null;
}
