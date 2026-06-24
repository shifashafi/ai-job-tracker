"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

export default function AddApplication() {
  const router = useRouter();
  const { user } = useAuth();
  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function analyzeJD() {
    setError("");
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data);
      if (!roleTitle && data.role_title) setRoleTitle(data.role_title);
    } catch (e) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function saveApplication() {
    setSaving(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("applications")
        .insert({ company, role_title: roleTitle, jd_text: jdText, status: "Applied", analysis: analysis || null, user_id: user.id })
        .select().single();
      if (error) throw error;
      router.push(`/application/${data.id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fade-up max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1724]">Add Application</h1>
        <p className="text-sm text-slate-500 mt-0.5">Paste the JD and let AI do the heavy lifting.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company">
            <input value={company} onChange={e => setCompany(e.target.value)}
              className="input" placeholder="e.g. Emirates Group" />
          </Field>
          <Field label="Role title">
            <input value={roleTitle} onChange={e => setRoleTitle(e.target.value)}
              className="input" placeholder="e.g. Frontend Developer" />
          </Field>
        </div>

        <Field label="Job description">
          <textarea value={jdText} onChange={e => setJdText(e.target.value)}
            rows={9} className="input resize-none" placeholder="Paste the full job description here..." />
        </Field>

        <div className="flex items-center gap-3">
          <button onClick={analyzeJD} disabled={analyzing || jdText.trim().length < 20}
            className="text-sm border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-50 disabled:opacity-40 transition font-medium flex items-center gap-2">
            {analyzing ? <><Spinner /> Analysing...</> : "✦ Analyse with AI"}
          </button>
          {analysis && <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Analysis ready</span>}
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        {analysis && (
          <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-3 border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Seniority</span>
              <span className="bg-white border border-slate-200 rounded-full px-2 py-0.5 text-xs">{analysis.seniority}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Required</p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.required_skills?.map(s => (
                  <span key={s} className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full border border-blue-100">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nice to have</p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.nice_to_have_skills?.map(s => (
                  <span key={s} className="bg-slate-100 text-slate-500 text-xs px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="pt-1">
          <button onClick={saveApplication} disabled={saving || !company || !roleTitle}
            className="bg-[#0F1724] text-white text-sm font-medium px-5 py-2.5 rounded-xl disabled:opacity-40 hover:bg-slate-800 transition">
            {saving ? "Saving..." : "Save Application →"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .input { width: 100%; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 0.6rem 0.75rem; font-size: 0.875rem; outline: none; transition: box-shadow 0.15s; }
        .input:focus { box-shadow: 0 0 0 3px rgba(79,142,247,0.15); border-color: #4F8EF7; }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function Spinner() {
  return <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />;
}
