"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ApplicationDetail({ params }) {
  const { id } = params;
  const [app, setApp] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [letter, setLetter] = useState("");
  const [fit, setFit] = useState(null);
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [loadingFit, setLoadingFit] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchApp();
    const saved = localStorage.getItem("resumeText");
    if (saved) setResumeText(saved);
  }, []);

  async function fetchApp() {
    const { data } = await supabase.from("applications").select("*").eq("id", id).single();
    setApp(data);
    if (data?.cover_letter) setLetter(data.cover_letter);
    if (data?.fit_score != null) setFit({ fit_score: data.fit_score, ...data.fit_details });
  }

  function saveResume(text) {
    setResumeText(text);
    localStorage.setItem("resumeText", text);
  }

  async function generateLetter() {
    setError(""); setLoadingLetter(true);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jdText: app.jd_text, companyName: app.company, roleTitle: app.role_title }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLetter(data.letter);
      await supabase.from("applications").update({ cover_letter: data.letter }).eq("id", id);
    } catch (e) { setError(e.message); }
    finally { setLoadingLetter(false); }
  }

  async function computeFit() {
    setError(""); setLoadingFit(true);
    try {
      const res = await fetch("/api/fit-score", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jdText: app.jd_text }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFit(data);
      await supabase.from("applications").update({
        fit_score: data.fit_score,
        fit_details: { matching_strengths: data.matching_strengths, missing_or_weak: data.missing_or_weak, summary: data.summary }
      }).eq("id", id);
    } catch (e) { setError(e.message); }
    finally { setLoadingFit(false); }
  }

  function copyLetter() {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!app) return (
    <div className="flex items-center justify-center h-40">
      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="fade-up max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <a href="/" className="text-xs text-slate-400 hover:text-slate-600 mb-2 inline-block">← Back to dashboard</a>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0F1724]">{app.role_title}</h1>
        <p className="text-slate-500 text-sm mt-0.5">{app.company}</p>
      </div>

      {/* Resume input */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Your Resume
          <span className="text-slate-300 normal-case font-normal ml-1">(saved in browser only)</span>
        </label>
        <textarea value={resumeText} onChange={e => saveResume(e.target.value)} rows={5}
          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          placeholder="Paste your resume as plain text. Required for AI features — stored only in your browser." />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 mb-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* AI Cards — stack on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Fit Score */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#0F1724]">Fit Score</h2>
            <button onClick={computeFit} disabled={loadingFit || !resumeText}
              className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 font-medium transition flex items-center gap-1.5">
              {loadingFit ? <><Spinner />Scoring...</> : "✦ Score my fit"}
            </button>
          </div>

          {fit ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <ScoreRing score={fit.fit_score} />
                <p className="text-sm text-slate-500 flex-1">{fit.summary}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-green-600 mb-1.5">✓ Strengths</p>
                <ul className="space-y-1">
                  {fit.matching_strengths?.map(s => (
                    <li key={s} className="text-xs text-slate-600 flex gap-1.5">
                      <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-500 mb-1.5">✗ Gaps to address</p>
                <ul className="space-y-1">
                  {fit.missing_or_weak?.map(s => (
                    <li key={s} className="text-xs text-slate-600 flex gap-1.5">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-300">
              <div className="text-4xl mb-2">◎</div>
              <p className="text-sm">Add your resume then score this role</p>
            </div>
          )}
        </div>

        {/* Cover Letter */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-semibold text-[#0F1724]">Cover Letter</h2>
            <div className="flex gap-2">
              {letter && (
                <button onClick={copyLetter}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 font-medium transition">
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              )}
              <button onClick={generateLetter} disabled={loadingLetter || !resumeText}
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 font-medium transition flex items-center gap-1.5">
                {loadingLetter ? <><Spinner />Generating...</> : "✦ Generate"}
              </button>
            </div>
          </div>

          {letter ? (
            <textarea value={letter} onChange={e => setLetter(e.target.value)} rows={14}
              className="w-full border border-slate-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-slate-50" />
          ) : (
            <div className="text-center py-8 text-slate-300">
              <div className="text-4xl mb-2">✉</div>
              <p className="text-sm">Generate a tailored cover letter</p>
            </div>
          )}
        </div>
      </div>

      {/* JD Analysis */}
      {app.analysis && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mt-5">
          <h2 className="font-semibold text-[#0F1724] mb-3">JD Analysis</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Required skills</p>
              <div className="flex flex-wrap gap-1.5">
                {app.analysis?.required_skills?.map(s => (
                  <span key={s} className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full border border-blue-100">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nice to have</p>
              <div className="flex flex-wrap gap-1.5">
                {app.analysis?.nice_to_have_skills?.map(s => (
                  <span key={s} className="bg-slate-100 text-slate-500 text-xs px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <details className="mt-4 text-sm text-slate-400 cursor-pointer">
        <summary className="hover:text-slate-600 font-medium">View original job description</summary>
        <p className="whitespace-pre-wrap mt-2 text-slate-500 text-xs leading-relaxed bg-white border border-slate-100 rounded-xl p-4">{app.jd_text}</p>
      </details>
    </div>
  );
}

function ScoreRing({ score }) {
  const radius = 40;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? "#22C55E" : score >= 40 ? "#F59E0B" : "#EF4444";
  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-[#0F1724]">{score}%</span>
      </div>
    </div>
  );
}

function Spinner() {
  return <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />;
}
