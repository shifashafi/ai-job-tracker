"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, loading, pathname]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1628]">
      <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || pathname === "/login") return <>{children}</>;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <span className="text-white font-bold text-lg tracking-tight">
          Track<span className="text-blue-400">Hire</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV.map(({ label, href, icon }) => {
          const active = pathname === href;
          return (
            <a
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              {label}
            </a>
          );
        })}
      </nav>

      {/* Status legend */}
      <div className="px-5 pb-4">
        <p className="text-xs text-slate-600 mb-2 uppercase tracking-wider font-medium">Status</p>
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
          <div className="w-7 h-7 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-300 text-xs font-bold flex-shrink-0">
            {user.email?.[0].toUpperCase()}
          </div>
          <span className="text-xs text-slate-400 truncate">{user.email}</span>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="text-slate-500 hover:text-red-400 transition text-xs ml-2 flex-shrink-0 font-medium"
        >
          Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 bg-[#0A1628] flex-col fixed top-0 left-0 h-full z-20">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#0A1628] border-b border-white/10 flex items-center justify-between px-4 py-3">
        <span className="text-white font-bold text-base tracking-tight">
          Track<span className="text-blue-400">Hire</span>
        </span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-slate-400 hover:text-white transition p-1"
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed top-0 left-0 h-full w-64 bg-[#0A1628] z-50 flex flex-col">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="lg:ml-56 flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
