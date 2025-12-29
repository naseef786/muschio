"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, MoveRight, Instagram, Globe, Zap, Compass, Wind, Droplets } from 'lucide-react';
import Lenis from 'lenis';

const useSmoothScroll = () => {
    useEffect(() => {
        const lenis = new Lenis({ duration: 1.5, lerp: 0.05, smoothWheel: true });
        function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);
};

export default function MuschioRevolution() {
    useSmoothScroll();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const container = useRef(null);

    // Parallax Values
    const { scrollYProgress } = useScroll();
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 20]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

    return (
        <main className="bg-[#fcfcfc] text-black selection:bg-black selection:text-white antialiased overflow-x-hidden">

            {/* 1. MINIMAL HUD NAVIGATION */}
            <nav className="fixed w-full z-[100] px-6 md:px-12 py-10 flex justify-between items-start pointer-events-none">
                <div className="flex flex-col pointer-events-auto">
                    <span className="text-4xl font-serif tracking-tighter font-bold">MUSCHIO</span>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[9px] tracking-[0.3em] uppercase opacity-50">Atelier Dubai Live</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-4 pointer-events-auto">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="group relative w-16 h-16 bg-black flex items-center justify-center overflow-hidden transition-all duration-500 hover:w-48"
                    >
                        <span className="absolute left-6 text-white text-[10px] uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity">Explore Menu</span>
                        <Plus className="text-white w-6 h-6 group-hover:rotate-45 transition-transform duration-500" />
                    </button>
                </div>
            </nav>

            {/* 2. HERO: CINEMATIC SCALE */}
            <section className="relative h-screen flex items-center justify-center px-6">
                <motion.div style={{ scale }} className="absolute inset-0 z-0 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2000"
                        className="w-full h-full object-cover grayscale opacity-10"
                    />
                </motion.div>

                <div className="relative z-10 text-center space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center"
                    >
                        <span className="text-[10px] tracking-[1em] uppercase mb-10 opacity-40">The Future of Scent</span>
                        <h1 className="text-8xl md:text-[15vw] font-serif leading-none tracking-tighter">
                            Elegance <br /> <span className="italic">Redefined.</span>
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                        className="flex gap-20 justify-center items-center pt-10 border-t border-black/5"
                    >
                        {['Longevity', 'Adaptive', 'Molecular'].map(stat => (
                            <div key={stat} className="flex flex-col items-center">
                                <span className="text-[10px] uppercase tracking-widest font-bold">{stat}</span>
                                <span className="text-xs opacity-40 mt-1 italic">Verified</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 3. REVOLUTIONARY SPLIT-CANVAS (CONTENT RICH) */}
            <section className="relative flex flex-col lg:flex-row min-h-screen border-y border-black/5">
                {/* Left: Fixed Content */}
                <div className="w-full lg:w-1/2 p-8 md:p-24 bg-white lg:sticky lg:top-0 h-fit lg:h-screen flex flex-col justify-center border-r border-black/5">
                    <Compass className="w-12 h-12 mb-10 text-gray-300" />
                    <h2 className="text-5xl md:text-8xl font-serif mb-10 leading-none">
                        Designed <br /> for the <br /> <span className="italic">Gulf Climate.</span>
                    </h2>
                    <p className="text-xl font-light text-gray-500 leading-relaxed mb-10">
                        Standard perfumes collapse under high humidity. Muschio utilizes **Thermal-Link Molecules** that actually strengthen their bond as the temperature rises. Crafted in Italy, specifically for the UAE heat profile.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                            <Wind className="w-4 h-4" /> Adaptive Sillage Technology
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                            <Droplets className="w-4 h-4" /> 100% Sustainable Extraction
                        </div>
                    </div>
                </div>

                {/* Right: Scrolling Visuals */}
                <div className="w-full lg:w-1/2 p-8 md:p-24 space-y-40">
                    {[
                        { tag: "The Lab", title: "Molecular Precision", src: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000" },
                        { tag: "The Origin", title: "Milanese Craft", src: "https://images.unsplash.com/photo-1615484477201-9f4953340fab?q=80&w=1000" },
                        { tag: "The Destination", title: "Dubai Exclusive", src: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1000" }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ margin: "-100px" }}
                            className="space-y-8"
                        >
                            <div className="aspect-[4/5] overflow-hidden grayscale">
                                <img src={item.src} className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest opacity-40">{item.tag}</span>
                                    <h3 className="text-3xl font-serif mt-2">{item.title}</h3>
                                </div>
                                <Plus className="w-10 h-10 p-2 border border-black/10 rounded-full" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 4. THE INTERACTIVE DIAGNOSTIC ENGINE */}
            <section className="py-40 bg-black text-white flex flex-col items-center justify-center px-6">
                <Zap className="w-10 h-10 mb-10 text-gray-700" />
                <h2 className="text-7xl md:text-[10vw] font-serif mb-20 leading-none text-center">Engine <span className="italic">v2.1</span></h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-7xl">
                    {['Nightly Majlis', 'Desert Noon', 'Coastal Mist', 'Atelier Suite'].map((mode) => (
                        <button key={mode} className="group relative h-64 border border-white/10 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <span className="relative z-10 text-xl font-serif italic group-hover:text-black transition-colors">{mode}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* 5. FOOTER: CONTENT RICH DATA */}
            <footer className="py-32 px-6 md:px-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
                    <div className="col-span-1 lg:col-span-2 space-y-10">
                        <h2 className="text-4xl font-serif font-bold uppercase tracking-tighter">Muschio</h2>
                        <p className="text-lg text-gray-500 font-light max-w-md leading-relaxed">
                            Redefining the relationship between the wearer and their environment. From our private lab in Milan to our flagship suite in Dubai Mall.
                        </p>
                        <div className="flex gap-10">
                            <Instagram className="w-6 h-6" />
                            <Globe className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">The Lab</p>
                        <ul className="space-y-4 text-xs uppercase tracking-widest font-bold">
                            <li>Ingredient Index</li>
                            <li>Thermal Stability</li>
                            <li>Sillage Map</li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">Services</p>
                        <ul className="space-y-4 text-xs uppercase tracking-widest font-bold">
                            <li>Dubai Delivery</li>
                            <li>Concierge VIP</li>
                            <li>Store Locator</li>
                        </ul>
                    </div>
                </div>
            </footer>

            {/* 6. THE MENU BOX (RIGHT SIDE) */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[600px] z-[250] bg-white border-l border-black/5 p-12 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-24">
                            <span className="text-sm font-bold uppercase tracking-widest opacity-40 italic">Navigation Archive</span>
                            <button onClick={() => setIsMenuOpen(false)} className="w-16 h-16 border border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <nav className="flex-1 flex flex-col gap-10">
                            {['Signature Collection', 'Scent Diagnosis', 'Sustainability', 'Atelier Visit', 'VIP Majlis Concierge'].map((item) => (
                                <a key={item} className="text-4xl md:text-6xl font-serif hover:italic group flex items-center gap-6 cursor-pointer">
                                    {item} <MoveRight className="opacity-0 group-hover:opacity-100 -translate-x-10 group-hover:translate-x-0 transition-all w-8 h-8" />
                                </a>
                            ))}
                        </nav>

                        <div className="pt-20 border-t border-black/5 flex justify-between items-end">
                            <div className="space-y-2">
                                <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Contact Dubai Flagship</p>
                                <p className="text-2xl font-serif italic">+971 4 000 0000</p>
                            </div>
                            <span className="text-xs opacity-20">© 2025</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}