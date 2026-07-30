"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

const STATUS_CONFIG = {
  Applied:   { bg: "bg-blue-50",  text: "text-blue-600",  dot: "bg-blue-400",  border: "border-blue-200" },
  Interview: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400", border: "border-amber-200" },
  Offer:     { bg: "bg-green-50", text: "text-green-600", dot: "bg-green-400", border: "border-green-200" },
  Rejected:  { bg: "bg-red-50",   text: "text-red-500",   dot: "bg-red-400",   border: "border-red-200" },
};

export default function Home() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => { if (user) fetchApps(); }, [user]);

  async function fetchApps() {
    setLoading(true);
    const { data } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setApps(data || []);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    await supabase.from("applications").update({ status }).eq("id", id);
    fetchApps();
  }

  async function deleteApp(id) {
    if (!confirm("Delete this application?")) return;
    await supabase.from("applications").delete().eq("id", id);
    fetchApps();
  }

  const stats = {
    total: apps.length,
    interview: apps.filter(a => a.status === "Interview").length,
    offer: apps.filter(a => a.status === "Offer").length,
    avgFit: apps.filter(a => a.fit_score).length
      ? Math.round(apps.filter(a => a.fit_score).reduce((s, a) => s + a.fit_score, 0) / apps.filter(a => a.fit_score).length)
      : null,
  };

  const filters = ["All", "Applied", "Interview", "Offer", "Rejected"];
  const visible = filter === "All" ? apps : apps.filter(a => a.status === filter);

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F1724]">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track every opportunity, miss nothing.</p>
        </div>
        <a href="/add"
          className="inline-flex items-center justify-center gap-2 bg-[#0F1724] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-slate-800 transition w-full sm:w-auto">
          <span className="text-lg leading-none">+</span> Add Application
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Applied" value={stats.total} color="text-[#0F1724]" />
        <StatCard label="Interviews" value={stats.interview} color="text-amber-500" />
        <StatCard label="Offers" value={stats.offer} color="text-green-500" />
        <StatCard label="Avg Fit Score" value={stats.avgFit ? `${stats.avgFit}%` : "—"} color="text-blue-500" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${
              filter === f ? "bg-[#0F1724] text-white" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
            }`}>
            {f}
            {f !== "All" && <span className="ml-1 opacity-50">{apps.filter(a => a.status === f).length}</span>}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && <p className="text-sm text-slate-400 py-8 text-center">Loading...</p>}

      {/* Empty */}
      {!loading && visible.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 sm:p-16 text-center">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-slate-600 font-medium">No applications yet</p>
          <p className="text-sm text-slate-400 mt-1">
            <a href="/add" className="text-blue-500 hover:underline">Add your first one</a> to get started.
          </p>
        </div>
      )}

      {/* Desktop table */}
      {visible.length > 0 && (
        <>
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Role", "Company", "Fit", "Status", "Date", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visible.map(app => {
                  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.Applied;
                  return (
                    <tr key={app.id} className="hover:bg-slate-50 transition group">
                      <td className="px-4 py-3.5">
                        <a href={`/application/${app.id}`} className="font-medium text-[#0F1724] hover:text-blue-600 transition">
                          {app.role_title || "Untitled role"}
                        </a>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{app.company}</td>
                      <td className="px-4 py-3.5">
                        {app.fit_score != null ? <FitBadge score={app.fit_score} /> : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <select value={app.status} onChange={e => updateStatus(app.id, e.target.value)}
                          className={`text-xs font-medium rounded-full px-3 py-1 border cursor-pointer ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {["Applied", "Interview", "Offer", "Rejected"].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs">
                        {new Date(app.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button onClick={() => deleteApp(app.id)}
                          className="text-slate-300 hover:text-red-400 transition text-xs opacity-0 group-hover:opacity-100">
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {visible.map(app => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.Applied;
              return (
                <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <a href={`/application/${app.id}`} className="font-medium text-[#0F1724] text-sm hover:text-blue-600">
                        {app.role_title || "Untitled role"}
                      </a>
                      <p className="text-xs text-slate-500 mt-0.5">{app.company}</p>
                    </div>
                    {app.fit_score != null && <FitBadge score={app.fit_score} />}
                  </div>
                  <div className="flex items-center justify-between">
                    <select value={app.status} onChange={e => updateStatus(app.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-3 py-1 border cursor-pointer ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      {["Applied", "Interview", "Offer", "Rejected"].map(s => <option key={s}>{s}</option>)}
                    </select>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">
                        {new Date(app.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                      <button onClick={() => deleteApp(app.id)} className="text-xs text-red-400">Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-1 font-medium">{label}</div>
    </div>
  );
}

function FitBadge({ score }) {
  const color = score >= 70 ? "text-green-600 bg-green-50" : score >= 40 ? "text-amber-600 bg-amber-50" : "text-red-500 bg-red-50";
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{score}%</span>;
}
