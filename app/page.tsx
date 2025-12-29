"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Compass, Layers } from 'lucide-react';
import Lenis from 'lenis';

export default function MasterArchive() {
  // Smooth scroll for the index
  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  // Generate the 12 items
  const templates = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Experience ${String(i + 1).padStart(2, '0')}`,
    tag: i % 2 === 0 ? "Revolutionary" : "Standard Impact",
    path: `/example-${i + 1}`,
    color: i % 3 === 0 ? "#f4f4f4" : "white"
  }));

  return (
    <main className="bg-white text-black min-h-screen p-6 md:p-12 selection:bg-black selection:text-white">
      {/* HEADER HUD */}
      <header className="flex justify-between items-end border-b border-black pb-10 mb-20">
        <div className="flex flex-col">
          <span className="text-[10px] tracking-[0.5em] uppercase font-bold opacity-40">System v1.0</span>
          <h1 className="text-6xl md:text-8xl font-serif tracking-tighter">THE <br /> ARCHIVE.</h1>
        </div>
        <div className="hidden md:block text-right max-w-xs uppercase tracking-widest text-[9px] font-bold leading-relaxed opacity-60">
          A curated collection of 12 luxury digital experiences for the modern fragrance market.
        </div>
      </header>

      {/* REVOLUTIONARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/10 border border-black/10">
        {templates.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            viewport={{ once: true }}
            className="group relative bg-white aspect-square overflow-hidden flex flex-col p-10 hover:bg-black hover:text-white transition-all duration-700"
          >
            {/* Numbering */}
            <span className="text-[10px] font-black tracking-widest uppercase opacity-20 group-hover:opacity-40">
              Template — {String(item.id).padStart(2, '0')}
            </span>

            {/* Content Body */}
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-4xl md:text-5xl font-serif group-hover:italic transition-all">
                {item.name}
              </h2>
              <div className="flex items-center gap-3 mt-4 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                <div className="w-8 h-px bg-white" />
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold">{item.tag}</span>
              </div>
            </div>

            {/* Navigation Link */}
            <Link
              href={item.path}
              className="absolute inset-0 flex items-end justify-end p-10 z-10"
            >
              <div className="w-16 h-16 border border-black/10 rounded-full flex items-center justify-center group-hover:border-white/30 group-hover:bg-white group-hover:text-black transition-all">
                <ArrowUpRight className="w-6 h-6" />
              </div>
            </Link>

            {/* Background Hint (Visual Revolution) */}
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-100 transition-opacity">
              {idx % 2 === 0 ? <Compass className="w-12 h-12" /> : <Layers className="w-12 h-12" />}
            </div>
          </motion.div>
        ))}
      </div>

      {/* FOOTER DATA */}
      <footer className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-20 border-t border-black/5 pt-20">
        <div className="space-y-6">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Vision</p>
          <p className="text-xl font-serif italic">To transform digital scent shopping into a molecular journey.</p>
        </div>
        <div className="space-y-6">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Metrics</p>
          <ul className="text-xs uppercase tracking-widest space-y-2 opacity-50">
            <li>12 Experiences</li>
            <li>Fully Responsive</li>
            <li>Lighthouse Optimized</li>
          </ul>
        </div>
        <div className="flex justify-end items-end">
          <span className="text-6xl font-serif opacity-5">2025</span>
        </div>
      </footer>
    </main>
  );
}