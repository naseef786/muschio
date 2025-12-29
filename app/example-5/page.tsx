"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Menu, X, Instagram, MapPin } from 'lucide-react';
import Lenis from 'lenis';

// --- SMOOTH SCROLL ENGINE ---
const useSmoothScroll = () => {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);
};

// --- REUSABLE PARALLAX WRAPPER ---
function ParallaxSection({ children, speed = 1, className = "" }: any) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], [0, 100 * speed]);
    return (
        <motion.div ref={ref} style={{ y }} className={className}>
            {children}
        </motion.div>
    );
}

export default function MuschioElite() {
    useSmoothScroll();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const container = useRef(null);
    const { scrollYProgress } = useScroll();

    // Spring physics for the progress bar and smooth transforms
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 500]);
    const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

    return (
        <main className="bg-[#0c0c0c] text-[#ececec] selection:bg-[#c5a35d] selection:text-black">
            {/* Dynamic Progress Bar */}
            <motion.div
                style={{ scaleX: smoothProgress }}
                className="fixed top-0 left-0 right-0 h-[2px] bg-[#c5a35d] z-[200] origin-left"
            />

            {/* Floating Header */}
            <nav className="fixed w-full z-[150] px-6 md:px-12 py-8 flex justify-between items-center mix-blend-difference">
                <div className="flex items-center gap-4">
                    <span className="text-2xl font-serif tracking-[0.4em] uppercase">Muschio</span>
                </div>
                <div className="flex items-center gap-8">
                    <div className="hidden md:flex gap-10 text-[10px] tracking-[0.3em] uppercase opacity-60">
                        <a href="#" className="hover:opacity-100 transition">Atelier</a>
                        <a href="#" className="hover:opacity-100 transition">The Majlis</a>
                    </div>
                    <button onClick={() => setIsMenuOpen(true)} className="p-2 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            {/* HERO SECTION with Layered Parallax */}
            <section className="relative h-[110vh] flex items-center justify-center overflow-hidden">
                <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1547483157-ca177890b144?q=80&w=2000"
                        className="w-full h-full object-cover opacity-40 grayscale"
                        alt="Dubai Desert Night"
                    />
                </motion.div>

                <div className="relative z-10 text-center px-6">
                    <ParallaxSection speed={-0.5}>
                        <motion.span
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="block text-[10px] tracking-[0.8em] uppercase mb-6 text-[#c5a35d]"
                        >
                            Exclusively for UAE
                        </motion.span>
                    </ParallaxSection>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }}
                        className="text-7xl md:text-[14vw] font-serif leading-none tracking-tighter"
                    >
                        Musk <span className="italic">Oud</span>
                    </motion.h1>

                    <ParallaxSection speed={0.2}>
                        <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8">
                            <button className="px-12 py-5 bg-[#c5a35d] text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all">
                                Shop the Signature
                            </button>
                            <button className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] border-b border-white/20 pb-2 hover:border-white transition">
                                The Discovery Film <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </ParallaxSection>
                </div>
            </section>

            {/* OVERLAPPING CONTENT SECTION */}
            <section className="relative z-20 py-32 px-6 md:px-20 bg-[#0c0c0c]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                    <div className="relative group">
                        <ParallaxSection speed={-0.2}>
                            <div className="overflow-hidden bg-[#161616]">
                                <img
                                    src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000"
                                    className="w-full h-[600px] object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
                                    alt="Perfume Bottle"
                                />
                            </div>
                        </ParallaxSection>
                        {/* Floating Detail Label */}
                        <ParallaxSection speed={0.4} className="absolute -bottom-10 -right-10 hidden md:block">
                            <div className="bg-[#c5a35d] p-10 text-black">
                                <p className="text-xs font-bold uppercase tracking-widest">Base Notes</p>
                                <p className="text-2xl font-serif italic mt-2">Smoked Oud & <br />White Moss</p>
                            </div>
                        </ParallaxSection>
                    </div>

                    <div className="space-y-10">
                        <h2 className="text-5xl md:text-7xl font-serif leading-tight">
                            A sensory <br /> <span className="italic pl-16">mirage.</span>
                        </h2>
                        <p className="text-white/50 leading-relaxed font-light text-lg">
                            Crafted in limited quantities for the GCC region, Musk Oud combines the earthy chill of Northern Italy with the smoldering warmth of the Rub' al Khali desert.
                        </p>
                        <div className="grid grid-cols-2 gap-10 pt-10 border-t border-white/10">
                            <div>
                                <span className="text-[10px] uppercase tracking-widest opacity-40">Concentration</span>
                                <p className="text-xl mt-2 font-serif">Extrait de Parfum</p>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-widest opacity-40">Sillage</span>
                                <p className="text-xl mt-2 font-serif">Deep & Eternal</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HORIZONTAL SCROLL PRODUCT GALLERY */}
            <section className="bg-white text-black py-40 overflow-hidden">
                <div className="px-6 md:px-20 mb-20 flex justify-between items-end">
                    <h2 className="text-6xl font-serif">Collection</h2>
                    <span className="text-[10px] tracking-[0.4em] uppercase border-b border-black pb-2">Scroll to explore</span>
                </div>

                <motion.div
                    style={{ x: useTransform(scrollYProgress, [0.4, 0.8], ["0%", "-50%"]) }}
                    className="flex gap-12 px-20"
                >
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="min-w-[350px] md:min-w-[500px]">
                            <div className="h-[600px] bg-[#f2f2f2] overflow-hidden">
                                <img
                                    src={`https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&sig=${i}`}
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                />
                            </div>
                            <div className="mt-6 flex justify-between items-center italic">
                                <span className="text-2xl font-serif">Essence 0{i}</span>
                                <span className="text-sm tracking-widest uppercase not-italic">AED 850</span>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* LUXURY FOOTER */}
            <footer className="bg-[#0c0c0c] pt-40 pb-10 px-6 md:px-20">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-20 mb-40">
                    <div className="col-span-1 md:col-span-6">
                        <h2 className="text-8xl font-serif tracking-tighter mb-10">Muschio</h2>
                        <div className="flex gap-4">
                            <input placeholder="Join the list" className="bg-transparent border-b border-white/20 py-4 w-full focus:outline-none focus:border-[#c5a35d] transition" />
                            <button className="px-8 py-4 bg-white text-black text-[10px] font-bold uppercase">Submit</button>
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-3 space-y-6">
                        <p className="text-[10px] uppercase tracking-widest text-[#c5a35d]">Boutiques</p>
                        <div className="text-sm space-y-4 opacity-50">
                            <p className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Dubai Mall, UAE</p>
                            <p className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Galleria Mall, Abu Dhabi</p>
                            <p className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Via Montenapoleone, Milan</p>
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-3 space-y-6 text-right">
                        <p className="text-[10px] uppercase tracking-widest text-[#c5a35d]">Follow</p>
                        <div className="flex justify-end gap-6">
                            <Instagram className="w-5 h-5 opacity-40 hover:opacity-100 cursor-pointer" />
                        </div>
                    </div>
                </div>
                <div className="text-[9px] uppercase tracking-[0.5em] text-white/20 text-center">
                    © 2025 Muschio Parfumerie Middle East • All Rights Reserved
                </div>
            </footer>

            {/* FULL-SCREEN OVERLAY MENU */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }}
                        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                        className="fixed inset-0 z-[250] bg-[#c5a35d] text-black p-12 flex flex-col"
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-serif uppercase tracking-widest">Muschio</span>
                            <X className="w-10 h-10 cursor-pointer" onClick={() => setIsMenuOpen(false)} />
                        </div>
                        <div className="flex-1 flex flex-col justify-center gap-8">
                            {['Collection', 'The Majlis', 'Sustainability', 'Atelier'].map((item) => (
                                <a key={item} className="text-6xl md:text-9xl font-serif leading-none hover:italic transition-all cursor-pointer">
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