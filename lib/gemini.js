const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "openrouter/free";

export async function askGemini(prompt) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "OpenRouter request failed");
  return data.choices[0].message.content;
}

export async function askGeminiJSON(prompt) {
  const raw = await askGemini(prompt);
  const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Model did not return valid JSON: " + cleaned.slice(0, 200));
  }
}