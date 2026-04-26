import { getGoogleAiKey, getSummaryTargetWords } from "@/lib/env";

function fallbackSummary(body: string, targetWords: number): string {
  const words = body.replace(/\s+/g, " ").trim().split(" ");
  return words.slice(0, targetWords).join(" ");
}

export async function generatePostSummary(
  title: string,
  body: string,
): Promise<string> {
  const targetWords = getSummaryTargetWords();
  const apiKey = getGoogleAiKey();

  if (!apiKey) {
    return fallbackSummary(body, targetWords);
  }

  const prompt = [
    `You are a blog summarizer.`,
    `Write a concise, neutral summary in around ${targetWords} words.`,
    `Do not add facts that are not in the source content.`,
    "",
    `Title: ${title}`,
    "",
    "Body:",
    body,
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        },
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return fallbackSummary(body, targetWords);
  }

  const json = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    return fallbackSummary(body, targetWords);
  }

  return text;
}
