import { NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/gemini";

export async function POST(req) {
  try {
    const { jdText } = await req.json();

    if (!jdText || jdText.trim().length < 20) {
      return NextResponse.json(
        { error: "Please paste a fuller job description." },
        { status: 400 }
      );
    }

    const prompt = `
You are analyzing a job description. Return ONLY valid JSON, no markdown, no extra text, matching exactly this shape:

{
  "role_title": string,
  "seniority": string,
  "required_skills": string[],
  "nice_to_have_skills": string[],
  "key_responsibilities": string[]
}

Keep each array to at most 6 concise items.

Job description:
"""
${jdText}
"""
`;

    const data = await askGeminiJSON(prompt);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to analyze job description." },
      { status: 500 }
    );
  }
}
