"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Menu, X, Plus, Minus, MoveRight } from 'lucide-react';
import Lenis from 'lenis';

// --- SMOOTH SCROLL ENGINE ---
const useSmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, orientation: 'vertical', smoothWheel: true });
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
};

export default function MuschioStandardImpact() {
  useSmoothScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <main className="bg-white text-black antialiased selection:bg-black selection:text-white overflow-x-hidden">
      {/* 1. PROGRESS TRACKER */}
      <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-[3px] bg-black z-[200] origin-left" />

      {/* 2. ARCHITECTURAL NAV */}
      <nav className="fixed w-full z-[150] px-6 md:px-20 py-10 flex justify-between items-end border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="flex flex-col leading-none">
          <span className="text-4xl font-serif tracking-tighter uppercase font-bold">Muschio</span>
          <span className="text-[10px] tracking-[0.5em] uppercase mt-2 opacity-40 italic">Innovation in Scent</span>
        </div>
        
        <div className="flex items-center gap-12">
          <div className="hidden lg:flex gap-12 text-[10px] tracking-[0.3em] uppercase font-bold">
            <a href="#" className="hover:line-through">Collection</a>
            <a href="#" className="hover:line-through">Scent DNA</a>
            <a href="#" className="hover:line-through">UAE Flagship</a>
          </div>
          <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-4 group">
            <span className="text-[10px] tracking-[0.3em] uppercase font-black">Archive</span>
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Menu className="w-4 h-4" />
            </div>
          </button>
        </div>
      </nav>

      {/* 3. HERO: IMPACTFUL TYPOGRAPHY */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-20 pt-40">
        <div className="max-w-screen-2xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-7 flex flex-col justify-center">
            <motion.h1 
              initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}
              className="text-7xl md:text-[10vw] font-serif leading-[0.85] tracking-tighter mb-10"
            >
              Beyond <br/> <span className="italic">Fragrance.</span>
            </motion.h1>
            <p className="text-xl md:text-2xl font-light leading-relaxed max-w-xl text-black/60 mb-12">
              Muschio introduces the world’s first <span className="text-black font-medium">Climate-Adaptive Scent</span>. Formulated in Milan, perfected for the Arabian heat.
            </p>
            <div className="flex gap-6">
              <button className="bg-black text-white px-12 py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-black/80 transition shadow-2xl">
                Explore Scent DNA
              </button>
              <button className="border border-black px-12 py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition">
                The Collection
              </button>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }}
            className="md:col-span-5 relative aspect-[3/4] overflow-hidden group"
          >
            <img 
              src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000" 
              className="w-full h-full object-cover grayscale transition-transform duration-1000 group-hover:scale-105"
              alt="Muschio Signature Bottle"
            />
            <div className="absolute top-10 right-10 bg-white p-6 shadow-xl">
               <p className="text-[10px] font-bold uppercase tracking-widest">Model: 01-A</p>
               <p className="text-2xl font-serif italic mt-1">Oud / Moss</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. THE REVOLUTION: DNA SPECS */}
      <section className="py-40 bg-[#f9f9f9]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
            <h2 className="text-5xl md:text-8xl font-serif leading-none">Olfactory <br/>Engineering.</h2>
            <p className="max-w-md text-sm text-black/50 uppercase tracking-widest leading-loose">
              Every Muschio molecule is engineered to expand in heat and stabilize in humidity, ensuring your signature lasts from the sunrise in Dubai to the moon in Abu Dhabi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-1 pt-20 border-t border-black/10">
            {[
              { label: "Longevity", value: "24h+", desc: "Stabilized molecular structure." },
              { label: "Sillage", value: "High", desc: "Adaptive projection based on air." },
              { label: "Origin", value: "Milan", desc: "Crafted in our private atelier." },
              { label: "Exclusivity", value: "Rare", desc: "Batch numbers under 500." }
            ].map((spec, i) => (
              <div key={i} className="bg-white p-12 hover:bg-black hover:text-white transition-all duration-500 group">
                <span className="text-[10px] uppercase tracking-widest opacity-40 group-hover:text-white/60">{spec.label}</span>
                <p className="text-5xl font-serif mt-4 mb-6">{spec.value}</p>
                <p className="text-xs opacity-60 font-light">{spec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL GALLERY: PARALLAX CONTENT */}
      <section className="py-40 px-6 md:px-20 max-w-screen-2xl mx-auto">
         <div className="grid grid-cols-1 md:grid-cols-12 gap-20 items-center">
            <div className="md:col-span-5 order-2 md:order-1">
               <span className="text-[10px] tracking-[0.5em] uppercase text-black/30 font-bold mb-10 block">The Experience</span>
               <h3 className="text-5xl md:text-7xl font-serif mb-8">Personalized <br/> <span className="italic">to the Atom.</span></h3>
               <p className="text-lg font-light text-black/60 leading-relaxed mb-10">
                  Our digital diagnostic uses your current geolocation to suggest the exact concentration of perfume oil needed for your environment. It’s not just shopping; it’s science.
               </p>
               <button className="flex items-center gap-6 group text-[10px] uppercase tracking-[0.4em] font-bold">
                  Start Diagnostic <div className="w-12 h-12 border border-black rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all"><MoveRight className="w-5 h-5"/></div>
               </button>
            </div>
            <div className="md:col-span-7 order-1 md:order-2 relative h-[800px] overflow-hidden">
               <motion.img 
                  style={{ y: useTransform(scrollYProgress, [0.3, 0.7], [0, -200]) }}
                  src="https://images.unsplash.com/photo-1615484477201-9f4953340fab?q=80&w=1200" 
                  className="w-full h-[120%] object-cover grayscale"
               />
            </div>
         </div>
      </section>

      {/* 6. CONCIERGE FOOTER */}
      <footer className="bg-black text-white py-40 px-6 md:px-20">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
          <div>
            <h2 className="text-6xl font-serif tracking-tighter mb-12">MUSCHIO</h2>
            <div className="space-y-4">
              <p className="text-sm opacity-40 uppercase tracking-widest">Flagship Boutique</p>
              <p className="text-xl font-light">Fashion Avenue, Dubai Mall <br/> Level 1, Private Suite 42</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-20">
            <div className="space-y-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Connect</p>
              <ul className="text-sm space-y-4 opacity-60">
                <li>WhatsApp VIP</li>
                <li>Atelier Visit</li>
                <li>Instagram</li>
              </ul>
            </div>
            <div className="space-y-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Science</p>
              <ul className="text-sm space-y-4 opacity-60">
                <li>Scent DNA</li>
                <li>Ingredient Index</li>
                <li>Adaptive Sillage</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* FULL-SCREEN OVERLAY MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[210] bg-black text-white p-10 flex flex-col items-center justify-center text-center"
          >
            <X className="absolute top-10 right-10 w-12 h-12 cursor-pointer" onClick={() => setIsMenuOpen(false)} />
            <div className="space-y-10">
              {['The Collection', 'Scent DNA Quiz', 'Majlis Services', 'Atelier Visit'].map((item) => (
                <a key={item} className="block text-4xl md:text-8xl font-serif hover:italic transition-all cursor-pointer">
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}