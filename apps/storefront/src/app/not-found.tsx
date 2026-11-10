import React from "react";
import Link from "next/link";
import { Sparkles, Compass, ArrowLeft, ShieldCheck } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-black text-neutral-900 dark:text-neutral-100 flex flex-col justify-between selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Top Luxury Bar */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 px-6 sm:px-12 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif tracking-[0.25em] text-lg font-bold text-neutral-900 dark:text-white hover:opacity-80 transition-opacity"
        >
          MUSCHIO
        </Link>
        <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-neutral-500">
          Haute Parfumerie · GCC
        </span>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm text-neutral-700 dark:text-neutral-300 mb-2">
            <Sparkles size={22} className="opacity-80" />
          </div>

          <div className="space-y-2">
            <p className="text-[11px] uppercase font-mono tracking-[0.3em] text-neutral-500">
              404 · Flacon Not Found
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-neutral-900 dark:text-white leading-tight">
              The Sillage Has Faded
            </h1>
            <p className="font-arabic text-base sm:text-lg text-neutral-600 dark:text-neutral-400 pt-1">
              الصفحة أو العطر المطلوب غير متوفر حالياً في دارنا
            </p>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
            The olfactory creation or page you are seeking is no longer in our sanctuary. Allow us to guide you to our collection of rare extraits de parfum or consult our digital fragrance concierge.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-7 py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 text-white text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-200 rounded-sm shadow-md flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} />
              <span>Return Home</span>
            </Link>
            <Link
              href="/shop"
              className="w-full sm:w-auto px-7 py-3 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-200 rounded-sm flex items-center justify-center gap-2"
            >
              <Compass size={14} />
              <span>Explore All Houses</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Luxury Footer Footnote */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 px-6 sm:px-12 py-5 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-2">
        <span>© {new Date().getFullYear()} Muschio Haute Parfumerie. Dubai & Arabian Gulf.</span>
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>100% Authentic Maison Extraits & Curated Collections</span>
        </div>
      </footer>
    </div>
  );
}
