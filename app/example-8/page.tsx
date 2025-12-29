"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight, Wind, Zap, Layers, Share2, MessageCircle } from 'lucide-react';
import Lenis from 'lenis';

// --- ENGINE: SMOOTH DYNAMICS ---
const useSmoothScroll = () => {
    useEffect(() => {
        const lenis = new Lenis({ duration: 1.5, lerp: 0.1 });
        function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);
};

export default function MuschioRevolution() {
    useSmoothScroll();
    const [activeMood, setActiveMood] = useState('Velvet');
    const [showQuiz, setShowQuiz] = useState(false);

    const moods = {
        'Velvet': { color: '#1a1a1a', note: 'Oud & Rose', image: 'https://images.unsplash.com/photo-1547483157-ca177890b144?q=80&w=1000' },
        'Glass': { color: '#f0f4f8', note: 'White Moss & Bergamot', image: 'https://images.unsplash.com/photo-1615484477201-9f4953340fab?q=80&w=1000' },
        'Gold': { color: '#D4AF37', note: 'Saffron & Amber', image: 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1000' }
    };

    return (
        <main className="min-h-screen transition-colors duration-1000" style={{ backgroundColor: moods[activeMood].color }}>
            <nav className="fixed w-full z-50 px-8 py-8 flex justify-between items-center mix-blend-difference text-white">
                <span className="text-3xl font-serif tracking-[0.5em] uppercase">Muschio</span>
                <div className="flex gap-8 items-center uppercase text-[10px] tracking-widest font-bold">
                    <a href="#" className="hover:text-[#D4AF37] transition">The Science</a>
                    <button className="bg-white text-black px-6 py-3 rounded-full flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" /> Cart (0)
                    </button>
                </div>
            </nav>

            {/* REVOLUTIONARY HERO: THE MOOD SHIFTER */}
            <section className="relative h-screen flex flex-col items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <AnimatePresence mode='wait'>
                        <motion.img
                            key={activeMood}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 0.4, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 1.5 }}
                            src={moods[activeMood].image}
                            className="w-full h-full object-cover grayscale"
                        />
                    </AnimatePresence>
                </div>

                <div className="relative z-10 text-center max-w-4xl px-6">
                    <motion.h1
                        key={activeMood}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-[12vw] font-serif leading-none text-white mix-blend-difference mb-12"
                    >
                        {activeMood}
                    </motion.h1>

                    {/* MOOD SELECTOR - IMPACTFUL INTERACTION */}
                    <div className="flex gap-4 justify-center">
                        {Object.keys(moods).map((mood) => (
                            <button
                                key={mood}
                                onClick={() => setActiveMood(mood)}
                                className={`px-8 py-2 rounded-full border transition-all text-[10px] uppercase tracking-widest ${activeMood === mood ? 'bg-white text-black border-white' : 'border-white/30 text-white hover:border-white'}`}
                            >
                                {mood}
                            </button>
                        ))}
                    </div>

                    <p className="mt-10 text-white/60 tracking-[0.3em] uppercase text-xs">Note: {moods[activeMood].note}</p>
                </div>
            </section>

            {/* THE IMPACT SECTION: MOLECULAR DATA */}
            <section className="py-40 px-6 md:px-20 bg-black text-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center max-w-7xl mx-auto">
                    <div className="space-y-12">
                        <div className="flex items-center gap-4 text-[#D4AF37]">
                            <Zap className="w-6 h-6" />
                            <span className="uppercase tracking-[0.4em] text-xs font-bold">Technological Revolution</span>
                        </div>
                        <h2 className="text-6xl md:text-8xl font-serif">Scent <br /> <span className="italic text-[#D4AF37]">Analytics.</span></h2>
                        <p className="text-xl text-white/40 leading-relaxed font-light">
                            We have mapped 10,000 olfactory variables to match your biometrics. By analyzing your lifestyle and climate (from Dubai humidity to Milan chill), we create a "Scent Fingerprint" unique to you.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
                            <div className="border-l-2 border-[#D4AF37] pl-6 py-2">
                                <Wind className="w-5 h-5 mb-4 opacity-50" />
                                <h4 className="text-lg font-serif">Aero-Diffusion</h4>
                                <p className="text-sm opacity-40 mt-2">Engineered for high-heat performance.</p>
                            </div>
                            <div className="border-l-2 border-[#D4AF37] pl-6 py-2">
                                <Layers className="w-5 h-5 mb-4 opacity-50" />
                                <h4 className="text-lg font-serif">Molecular Layering</h4>
                                <p className="text-sm opacity-40 mt-2">Adjusts its sillage throughout the day.</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-[#D4AF37] blur-[150px] opacity-10 animate-pulse" />
                        <div className="relative border border-white/10 p-4 rounded-2xl overflow-hidden aspect-square">
                            <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000" className="w-full h-full object-cover grayscale opacity-80" />
                        </div>
                    </div>
                </div>
            </section>

            {/* THE REVOLUTIONARY FEATURE: START THE QUIZ */}
            <section className="h-screen bg-white text-black flex flex-col items-center justify-center px-6">
                <motion.div
                    whileHover={{ scale: 0.98 }}
                    onClick={() => setShowQuiz(true)}
                    className="cursor-pointer text-center group"
                >
                    <span className="text-[10px] tracking-[0.6em] uppercase text-black/40 mb-10 block">Discovery Engine v1.0</span>
                    <h2 className="text-7xl md:text-[10vw] font-serif leading-none mb-10 group-hover:italic transition-all">Find Your <br /> Scent DNA.</h2>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-20 h-[1px] bg-black" />
                        <button className="text-[10px] uppercase tracking-widest font-bold">Begin Algorithm</button>
                        <div className="w-20 h-[1px] bg-black" />
                    </div>
                </motion.div>
            </section>

            {/* PRIVATE CONCIERGE FOOTER */}
            <footer className="bg-black py-24 px-10 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col items-center md:items-start">
                        <h2 className="text-3xl font-serif text-[#D4AF37] tracking-[0.4em] mb-4">MUSCHIO</h2>
                        <p className="text-[9px] uppercase tracking-widest opacity-40">Innovation in Fragrance</p>
                    </div>
                    <div className="flex gap-12">
                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                            <MessageCircle className="w-6 h-6 text-[#D4AF37] group-hover:scale-110 transition" />
                            <span className="text-[9px] uppercase tracking-widest font-bold">WhatsApp Concierge</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                            <Share2 className="w-6 h-6 text-[#D4AF37] group-hover:scale-110 transition" />
                            <span className="text-[9px] uppercase tracking-widest font-bold">Share My Profile</span>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}