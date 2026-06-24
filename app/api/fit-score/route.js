import { NextResponse } from "next/server";
import { askGeminiJSON } from "@/lib/gemini";

export async function POST(req) {
  try {
    const { resumeText, jdText } = await req.json();

    if (!resumeText || !jdText) {
      return NextResponse.json(
        { error: "Resume text and job description are both required." },
        { status: 400 }
      );
    }

    const prompt = `
Compare this resume against this job description. Return ONLY valid JSON, no markdown, matching exactly:

{
  "fit_score": number,        // 0-100, how well the resume matches the JD
  "matching_strengths": string[],  // at most 4, specific
  "missing_or_weak": string[],     // at most 4, specific, actionable
  "summary": string           // one or two honest sentences
}

Resume:
"""
${resumeText}
"""

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
      { error: "Failed to compute fit score." },
      { status: 500 }
    );
  }
}
