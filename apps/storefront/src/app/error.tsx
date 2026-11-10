"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home, MessageSquare } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Muschio Storefront Exception]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-black text-neutral-900 dark:text-neutral-100 flex flex-col justify-between selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black font-sans">
      {/* Top Luxury Bar */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 px-6 sm:px-12 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif tracking-[0.25em] text-lg font-bold text-neutral-900 dark:text-white hover:opacity-80 transition-opacity"
        >
          MUSCHIO
        </Link>
        <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-neutral-500">
          Client Sanctuary Concierge
        </span>
      </header>

      {/* Main Error Body */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 mb-2">
            <AlertCircle size={24} />
          </div>

          <div className="space-y-2">
            <p className="text-[11px] uppercase font-mono tracking-[0.3em] text-neutral-500">
              500 · System Anomaly
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-neutral-900 dark:text-white leading-tight">
              An Olfactory Interruption
            </h1>
            <p className="font-arabic text-base sm:text-lg text-neutral-600 dark:text-neutral-400 pt-1">
              حدث خطأ غير متوقع أثناء معالجة طلبك
            </p>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
            Our atelier encountered an unexpected condition. Your session and vault remain secure. Please refresh your view or consult our digital concierge.
          </p>

          {error?.digest && (
            <div className="font-mono text-[10px] text-neutral-400 bg-neutral-100 dark:bg-neutral-900 p-2 rounded max-w-xs mx-auto border border-neutral-200 dark:border-neutral-800">
              Digest: {error.digest}
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto px-7 py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 text-white text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-200 rounded-sm shadow-md flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} />
              <span>Retry Session</span>
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-7 py-3 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-200 rounded-sm flex items-center justify-center gap-2"
            >
              <Home size={14} />
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Luxury Footnote */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 px-6 sm:px-12 py-5 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-2">
        <span>© {new Date().getFullYear()} Muschio Haute Parfumerie. Dubai & Arabian Gulf.</span>
        <a
          href="https://wa.me/97148006872"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <MessageSquare size={13} />
          <span>VIP Concierge Support Available 24/7</span>
        </a>
      </footer>
    </div>
  );
}
