"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home, MessageCircle, AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console or telemetry
    console.error("[Muschio Error Boundary Encountered]:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-24 sm:py-36 flex flex-col items-center justify-center text-center">
      <div className="max-w-xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-full text-[11px] font-mono tracking-widest uppercase text-neutral-600 dark:text-neutral-400">
          <AlertCircle size={13} className="text-amber-600" />
          <span>Olfactory Sanctuary · Error 500</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl text-neutral-900 dark:text-white font-light tracking-tight leading-tight">
          An Unexpected Encounter.
        </h1>
        <p className="font-serif text-xl sm:text-2xl text-neutral-500 font-light italic">
          حدث خطأ غير متوقع في تجربة التسوق
        </p>

        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
          We encountered an interruption while rendering this bespoke flacon experience.
          Our white-glove engineering team has been notified. You may retry your request or reach our VIP Concierge directly.
        </p>

        {error?.digest && (
          <p className="text-[10px] font-mono text-neutral-400">
            Reference ID: {error.digest}
          </p>
        )}

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="editorial-button flex items-center gap-2 text-xs py-3 px-6 shadow-sm cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Retry Experience</span>
          </button>

          <Link
            href="/"
            className="editorial-button-secondary flex items-center gap-2 text-xs py-3 px-6"
          >
            <Home size={14} />
            <span>Maison Home</span>
          </Link>

          <a
            href="https://wa.me/97148006872?text=Hello%20Muschio%20Concierge,%20I%20experienced%20an%20issue%20on%20the%20storefront."
            target="_blank"
            rel="noopener noreferrer"
            className="editorial-button-secondary flex items-center gap-2 text-xs py-3 px-6 text-emerald-600 dark:text-emerald-400"
          >
            <MessageCircle size={14} />
            <span>VIP Concierge</span>
          </a>
        </div>
      </div>
    </div>
  );
}
