import { NextResponse } from "next/server";
import { askGemini } from "@/lib/gemini";

export async function POST(req) {
  try {
    const { resumeText, jdText, companyName, roleTitle } = await req.json();

    if (!resumeText || !jdText) {
      return NextResponse.json(
        { error: "Resume text and job description are both required." },
        { status: 400 }
      );
    }

    const prompt = `
Write a tailored, concise, genuine-sounding cover letter (max 280 words) for this application.

Company: ${companyName || "the company"}
Role: ${roleTitle || "the role"}

Candidate resume:
"""
${resumeText}
"""

Job description:
"""
${jdText}
"""

Rules:
- Do not invent experience that isn't in the resume.
- Sound like a real person, not a template. Avoid cliches like "I am writing to express my interest".
- Open with something specific to the role/company, not a generic greeting.
- 3 short paragraphs max.
- Return plain text only, no markdown formatting.
`;

    const letter = await askGemini(prompt);
    return NextResponse.json({ letter });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to generate cover letter." },
      { status: 500 }
    );
  }
}
