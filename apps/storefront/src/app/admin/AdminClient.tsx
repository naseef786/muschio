"use client";

import dynamic from "next/dynamic";
import React from "react";

const AdminDashboard = dynamic(
  () => import("@muschio/admin").then((mod) => mod.App),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#090D14] flex flex-col items-center justify-center text-slate-300">
        <div className="w-10 h-10 border-2 border-amber-500/60 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-center space-y-1">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-400/90 font-medium">
            Muschio Haute Parfumerie
          </p>
          <p className="text-xs text-slate-500 font-sans">
            Initializing Administrative Suite & Secure Storage...
          </p>
        </div>
      </div>
    ),
  }
);

export function AdminClient() {
  return <AdminDashboard />;
}
