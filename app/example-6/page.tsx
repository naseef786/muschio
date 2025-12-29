"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Menu, X, Instagram, ArrowDown } from 'lucide-react';
import Lenis from 'lenis';

// --- PERFORMANCE OPTIMIZED SMOOTH SCROLL ---
const useSmoothScroll = () => {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            smoothWheel: true,
            wheelMultiplier: 1.1,
            touchMultiplier: 1.5,
        });
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);
};

export default function MuschioStandard() {
    useSmoothScroll();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const heroRef = useRef(null);

    // Scroll tracking for global parallax
    const { scrollYProgress } = useScroll();
    const smoothY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    // Hero Parallax Transforms
    const textY = useTransform(smoothY, [0, 0.2], [0, 100]);
    const imgScale = useTransform(smoothY, [0, 0.3], [1, 1.15]);
    const opacityFade = useTransform(smoothY, [0, 0.15], [1, 0]);

    return (
        <main className="relative bg-[#ffffff] text-[#1a1a1a] antialiased selection:bg-[#1a1a1a] selection:text-white">
            {/* 1. MINIMALIST NAV */}
            <nav className="fixed w-full z-[100] px-6 md:px-12 py-8 flex justify-between items-center mix-blend-difference text-white">
                <div className="flex flex-col">
                    <span className="text-2xl font-serif tracking-[0.3em] uppercase font-light">Muschio</span>
                    <span className="text-[8px] tracking-[0.4em] uppercase opacity-60">Dubai / Milano</span>
                </div>

                <div className="flex items-center gap-10">
                    <div className="hidden lg:flex gap-10 text-[10px] tracking-[0.3em] uppercase font-medium">
                        <a href="#" className="hover:line-through transition">Collections</a>
                        <a href="#" className="hover:line-through transition">The Heritage</a>
                    </div>
                    <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-3 group">
                        <div className="flex flex-col gap-1 items-end">
                            <div className="w-8 h-[1px] bg-white group-hover:w-12 transition-all duration-500" />
                            <div className="w-5 h-[1px] bg-white" />
                        </div>
                    </button>
                </div>
            </nav>

            {/* 2. HERO SECTION: Full-Bleed Parallax */}
            <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
                <motion.div style={{ scale: imgScale }} className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=2000"
                        className="w-full h-full object-cover opacity-80 brightness-75"
                        alt="Muschio Signature"
                    />
                </motion.div>

                <motion.div style={{ y: textY, opacity: opacityFade }} className="relative z-10 text-center text-white px-4">
                    <h1 className="text-7xl md:text-[12vw] font-serif leading-none tracking-tighter mb-8">
                        Muschio <span className="italic font-light">Noir</span>
                    </h1>
                    <div className="flex flex-col items-center gap-6">
                        <button className="px-10 py-4 bg-white text-black text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-transparent hover:text-white border border-white transition-all duration-500">
                            Discover the Scent
                        </button>
                        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                            <ArrowDown className="w-5 h-5 opacity-40" />
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* 3. PRODUCT STORY: Split-Screen Parallax */}
            <section className="py-24 md:py-48 px-6 md:px-20 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-screen-2xl mx-auto">
                <div className="relative h-[600px] md:h-[800px] overflow-hidden">
                    <motion.img
                        initial={{ scale: 1.2 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        src="https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="space-y-12">
                    <span className="text-[10px] tracking-[0.5em] uppercase text-gray-400 font-bold block">The Extraction</span>
                    <h2 className="text-5xl md:text-7xl font-serif leading-[1.1]">
                        Complexity in its <br /> <span className="italic">purest form.</span>
                    </h2>
                    <p className="text-lg text-gray-500 font-light leading-relaxed max-w-lg">
                        Our scents are developed to react with your skin's natural pH. For our UAE clients, we’ve intensified the base notes of Oud and Musk to withstand the warmth of the Gulf climate.
                    </p>
                    <div className="pt-8">
                        <button className="flex items-center gap-6 text-[11px] tracking-[0.4em] uppercase font-bold group">
                            Explore the Archive <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* 4. DYNAMIC GRID: Responsive & Animated */}
            <section className="bg-[#f9f9f9] py-32 px-6 md:px-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { name: "Verde", cat: "Botanical", img: "https://images.unsplash.com/photo-1616984268211-09b59639ceaf?q=80&w=800" },
                        { name: "Sabbia", cat: "Mineral", img: "https://images.unsplash.com/photo-1615484477201-9f4953340fab?q=80&w=800" },
                        { name: "Oud II", cat: "Wood", img: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=800" }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.15 }}
                            className="bg-white p-8 group cursor-pointer"
                        >
                            <div className="h-[400px] overflow-hidden mb-8">
                                <img src={item.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                            </div>
                            <span className="text-[9px] tracking-[0.4em] uppercase opacity-40">{item.cat}</span>
                            <div className="flex justify-between items-center mt-2">
                                <h3 className="text-2xl font-serif uppercase tracking-widest">{item.name}</h3>
                                <ShoppingBag className="w-5 h-5 opacity-20 group-hover:opacity-100 transition" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 5. FOOTER: High-Impact Information Design */}
            <footer className="bg-white border-t border-gray-100 py-24 px-6 md:px-12">
                <div className="flex flex-col md:flex-row justify-between gap-20">
                    <div className="max-w-md">
                        <h2 className="text-4xl font-serif tracking-widest uppercase mb-6">Muschio</h2>
                        <p className="text-sm text-gray-400 leading-relaxed uppercase tracking-widest">
                            Crafting scents that define moments. <br /> From the ateliers of Milan to the heart of Dubai Mall.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
                        <div className="flex flex-col gap-4">
                            <span className="text-[10px] font-bold tracking-widest uppercase mb-4">Services</span>
                            <a href="#" className="text-xs text-gray-500 hover:text-black transition">Personalization</a>
                            <a href="#" className="text-xs text-gray-500 hover:text-black transition">Same-day Delivery</a>
                        </div>
                        <div className="flex flex-col gap-4">
                            <span className="text-[10px] font-bold tracking-widest uppercase mb-4">Contact</span>
                            <a href="#" className="text-xs text-gray-500 hover:text-black transition">WhatsApp Us</a>
                            <a href="#" className="text-xs text-gray-500 hover:text-black transition">Store Locator</a>
                        </div>
                        <div className="flex flex-col gap-4">
                            <span className="text-[10px] font-bold tracking-widest uppercase mb-4">Social</span>
                            <Instagram className="w-5 h-5 text-gray-300 hover:text-black transition cursor-pointer" />
                        </div>
                    </div>
                </div>
            </footer>

            {/* FULL-SCREEN NAVIGATION MODAL */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 200 }}
                        className="fixed inset-0 z-[200] bg-[#1a1a1a] text-white p-12 flex flex-col"
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-serif tracking-widest">MUSCHIO</span>
                            <X className="w-10 h-10 cursor-pointer" onClick={() => setIsMenuOpen(false)} />
                        </div>
                        <div className="flex-1 flex flex-col justify-center gap-6">
                            {['Signature Collection', 'Limited Editions', 'The Majlis Room', 'Sustainability'].map((item, i) => (
                                <motion.a
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                    key={item} className="text-4xl md:text-7xl font-serif hover:italic transition-all cursor-pointer"
                                >
                                    {item}
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}