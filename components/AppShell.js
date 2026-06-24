"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const NAV = [
  { label: "Dashboard", href: "/", icon: "▦" },
  { label: "Add Application", href: "/add", icon: "+" },
];

const STATUS_DOT = {
  Applied: "bg-blue-400",
  Interview: "bg-amber-400",
  Offer: "bg-green-400",
  Rejected: "bg-red-400",
};

export default function AppShell({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, loading, pathname]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Show nothing while loading or on the login page
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1724]">
      <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || pathname === "/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0F1724] flex flex-col fixed top-0 left-0 h-full z-20">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <span className="text-white font-semibold text-base tracking-tight">TrackHire</span>
          <span className="ml-1 text-blue-400 font-bold text-base">.</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map(({ label, href, icon }) => {
            const active = pathname === href;
            return (
              <a
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-base w-4 text-center">{icon}</span>
                {label}
              </a>
            );
          })}
        </nav>

        {/* Legend */}
        <div className="px-4 pb-3">
          <p className="text-xs text-slate-600 mb-2 uppercase tracking-wider">Status</p>
          {Object.entries(STATUS_DOT).map(([s, cls]) => (
            <div key={s} className="flex items-center gap-2 py-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${cls}`} />
              <span className="text-xs text-slate-500">{s}</span>
            </div>
          ))}
        </div>

        {/* User footer */}
        <div className="border-t border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-300 text-xs font-semibold">
              {user.email?.[0].toUpperCase()}
            </div>
            <span className="text-xs text-slate-400 truncate">{user.email}</span>
          </div>
          <button onClick={logout} title="Sign out" className="text-slate-600 hover:text-slate-400 text-sm ml-2">
            ↩
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
