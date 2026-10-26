"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Compass, Home } from "lucide-react";

export default function LocaleNotFound() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-32 flex flex-col items-center justify-center text-center">
      <div className="max-w-xl space-y-6">
        <span className="eyebrow text-accent">OLFACTORY VAULT 404</span>
        <h1 className="font-serif text-4xl sm:text-5xl text-luxury-text font-normal leading-tight">
          This Creation Remains Elusive.
        </h1>
        <p className="font-serif text-xl sm:text-2xl text-luxury-muted font-light italic">
          هذه التحفة العطرية غير متوفرة حالياً
        </p>
        <p className="text-xs sm:text-sm text-luxury-muted leading-relaxed max-w-md mx-auto">
          The flacon or olfactory note you are seeking may have moved to our private archive, or the link has changed. Explore our curated maison collection below.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="editorial-button flex items-center gap-2 text-xs"
          >
            <span>Explore Collection</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/brands"
            className="editorial-button-secondary flex items-center gap-2 text-xs"
          >
            <Compass size={14} />
            <span>The Houses</span>
          </Link>
          <Link
            href="/"
            className="editorial-button-secondary flex items-center gap-2 text-xs"
          >
            <Home size={14} />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
