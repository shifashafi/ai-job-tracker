"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Account created! Check your email to confirm, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0F1724]">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12">
        <div>
          <span className="text-white font-semibold text-xl tracking-tight">TrackHire</span>
          <span className="text-blue-400 font-bold text-xl">.</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-snug mb-4">
            Your job search,<br />
            <span className="text-blue-400">supercharged by AI.</span>
          </h1>
          <p className="text-slate-400 text-base max-w-sm">
            Paste any job description and get instant skill analysis, a tailored cover letter,
            and an honest resume fit score — all in one place.
          </p>
          <div className="mt-8 space-y-3">
            {["AI-powered JD analysis", "Tailored cover letter per application", "Resume fit score with gap analysis"].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-xs">✓</span>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-600 text-sm">Free. No credit card. Built for job seekers.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#0F1724]">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {mode === "login" ? "Sign in to your TrackHire account" : "Start tracking smarter today"}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">{success}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              className="w-full bg-[#0F1724] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {loading ? "..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 mt-5">
            {mode === "login" ? "No account?" : "Already have one?"}{" "}
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}
              className="text-blue-500 font-medium"
            >
              {mode === "login" ? "Sign up free" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
