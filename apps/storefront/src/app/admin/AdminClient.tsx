"use client";

import dynamic from "next/dynamic";
import React from "react";

const AdminDashboard = dynamic(
  () => import("@muschio/admin").then((mod) => mod.App),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center text-neutral-900 dark:text-neutral-100">
        <div className="w-10 h-10 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-center space-y-1">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-900 dark:text-white font-medium">
            Muschio Haute Parfumerie
          </p>
          <p className="text-xs text-neutral-500 font-sans">
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
