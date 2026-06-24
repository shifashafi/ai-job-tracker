"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const STATUS_COLORS = {
  Applied: "bg-blue-100 text-blue-700",
  Interview: "bg-amber-100 text-amber-700",
  Offer: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function Home() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApps();
  }, []);

  async function fetchApps() {
    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setApps(data || []);
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
    interview: apps.filter((a) => a.status === "Interview").length,
    offer: apps.filter((a) => a.status === "Offer").length,
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Applications" value={stats.total} />
        <StatCard label="Interviews" value={stats.interview} />
        <StatCard label="Offers" value={stats.offer} />
      </div>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      {!loading && apps.length === 0 && (
        <div className="border border-dashed rounded-xl p-10 text-center text-gray-500">
          No applications yet.{" "}
          <a href="/add" className="underline">
            Add your first one
          </a>
          .
        </div>
      )}

      <div className="space-y-3">
        {apps.map((app) => (
          <div
            key={app.id}
            className="border rounded-xl p-4 flex items-center justify-between bg-white"
          >
            <a href={`/application/${app.id}`} className="flex-1">
              <div className="font-medium">{app.role_title || app.role}</div>
              <div className="text-sm text-gray-500">{app.company}</div>
            </a>

            <div className="flex items-center gap-3">
              {app.fit_score != null && (
                <span className="text-xs text-gray-500">
                  fit {app.fit_score}%
                </span>
              )}
              <select
                value={app.status}
                onChange={(e) => updateStatus(app.id, e.target.value)}
                className={`text-xs rounded-full px-3 py-1 border-none ${
                  STATUS_COLORS[app.status] || "bg-gray-100 text-gray-700"
                }`}
              >
                {["Applied", "Interview", "Offer", "Rejected"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                onClick={() => deleteApp(app.id)}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="border rounded-xl p-4 bg-white">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
