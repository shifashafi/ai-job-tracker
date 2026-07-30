"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) router.push("/");
  }, [user]);

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            // Skip email confirmation for easier onboarding
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        // If email confirmation is disabled in Supabase, user is auto-confirmed
        if (data?.user?.identities?.length === 0) {
          setError("An account with this email already exists. Please sign in.");
          setMode("login");
          return;
        }

        if (data?.session) {
          // Email confirmation is OFF — user is logged in immediately
          router.push("/");
        } else {
          // Email confirmation is ON
          setSuccess("Account created! Check your inbox to confirm your email, then sign in.");
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        router.push("/");
      }
    } catch (e) {
      // Friendly error messages
      const msg = e.message || "";
      if (msg.includes("Invalid login credentials")) {
        setError("Wrong email or password. Please try again.");
      } else if (msg.includes("Email not confirmed")) {
        setError("Please confirm your email first. Check your inbox.");
      } else if (msg.includes("User already registered")) {
        setError("An account with this email already exists. Sign in instead.");
        setMode("login");
      } else if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setError("Connection failed. Check your internet and try again.");
      } else {
        setError(msg || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0A1628]">

      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative">
          <span className="text-white font-bold text-2xl tracking-tight">
            Track<span className="text-blue-400">Hire</span>
          </span>
        </div>

        {/* Hero text */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-300 text-xs font-medium">AI-powered job search</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            Land your next job<br />
            <span className="text-blue-400">smarter, not harder.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-md">
            Paste any job description and get instant AI analysis, a tailored cover letter,
            and an honest resume fit score — all in seconds.
          </p>

          {/* Feature list */}
          <div className="mt-8 space-y-3">
            {[
              { icon: "✦", text: "AI extracts required skills from any JD" },
              { icon: "✦", text: "Tailored cover letter for each application" },
              { icon: "✦", text: "Resume fit score with gap analysis" },
              { icon: "✦", text: "Track every application in one dashboard" },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-blue-400 text-xs">{f.icon}</span>
                <span className="text-slate-300 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-slate-600 text-xs">Free forever · No credit card · Built for job seekers</p>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12">

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <span className="text-white font-bold text-2xl tracking-tight">
            Track<span className="text-blue-400">Hire</span>
          </span>
          <p className="text-slate-500 text-sm mt-1">AI-powered job application tracker</p>
        </div>

        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="bg-[#111E35] border border-white/10 rounded-2xl p-7 shadow-2xl">

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {mode === "login"
                  ? "Sign in to your TrackHire account"
                  : "Start tracking your job search for free"}
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  placeholder="you@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    placeholder="Min. 6 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition text-xs"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Error / Success messages */}
              {error && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5">
                  <span className="text-red-400 text-sm mt-0.5">✕</span>
                  <p className="text-red-400 text-xs leading-relaxed">{error}</p>
                </div>
              )}
              {success && (
                <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3.5 py-2.5">
                  <span className="text-green-400 text-sm mt-0.5">✓</span>
                  <p className="text-green-400 text-xs leading-relaxed">{success}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  mode === "login" ? "Sign in" : "Create account"
                )}
              </button>
            </div>

            {/* Toggle mode */}
            <div className="mt-5 pt-5 border-t border-white/5 text-center">
              <p className="text-slate-500 text-sm">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setError("");
                    setSuccess("");
                  }}
                  className="text-blue-400 font-medium hover:text-blue-300 transition"
                >
                  {mode === "login" ? "Sign up free" : "Sign in"}
                </button>
              </p>
            </div>
          </div>

          {/* Supabase hint for email confirmation */}
          {mode === "signup" && (
            <p className="text-center text-slate-600 text-xs mt-4">
              By signing up you agree to our terms. Your data is private and secure.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
