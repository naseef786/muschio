"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Menu, X, Plus, MoveRight, Instagram, Globe, Zap } from 'lucide-react';
import Lenis from 'lenis';

// --- SMOOTH SCROLL ENGINE ---
const useSmoothScroll = () => {
    useEffect(() => {
        const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
        function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);
};

export default function MuschioSimpleImpact() {
    useSmoothScroll();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { scrollYProgress } = useScroll();
    const smoothY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    return (
        <main className="bg-white text-black selection:bg-black selection:text-white antialiased">
            {/* 1. PROGRESS BAR */}
            <motion.div style={{ scaleX: smoothY }} className="fixed top-0 left-0 right-0 h-1 bg-black z-[200] origin-left" />

            {/* 2. NAVIGATION & MENU BOX */}
            <nav className="fixed w-full z-[150] px-6 md:px-12 py-8 flex justify-between items-center bg-white/80 backdrop-blur-sm border-b border-gray-100">
                <div className="flex flex-col gap-1">
                    <span className="text-2xl font-serif tracking-tighter font-bold uppercase">Muschio</span>
                    <span className="text-[8px] tracking-[0.4em] uppercase opacity-40">Milan — Dubai</span>
                </div>

                <div className="flex items-center gap-6">
                    <button className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
                        <Globe className="w-3 h-3" /> UAE Edition
                    </button>
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="w-12 h-12 flex items-center justify-center bg-black text-white hover:scale-105 transition-transform"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            {/* 3. HERO: MINIMALIST PARALLAX */}
            <header className="relative h-[90vh] flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 z-0 px-6 md:px-12 py-12">
                    <motion.div
                        style={{ y: useTransform(smoothY, [0, 1], [0, -200]) }}
                        className="w-full h-full bg-[#f4f4f4] overflow-hidden"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=2000"
                            className="w-full h-full object-cover grayscale opacity-90"
                        />
                    </motion.div>
                </div>

                <div className="relative z-10 text-center space-y-8">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        className="text-7xl md:text-[12vw] font-serif leading-none tracking-tighter"
                    >
                        Standard <br /> <span className="italic">Impact</span>
                    </motion.h1>
                    <button className="bg-black text-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-800 transition">
                        Discover the Science
                    </button>
                </div>
            </header>

            {/* 4. CONTENT RICH: THE DNA SECTION */}
            <section className="py-32 px-6 md:px-24">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
                    <div className="md:col-span-4 sticky top-40 space-y-8">
                        <span className="text-[10px] tracking-[0.5em] uppercase text-gray-400 font-bold">Introduction</span>
                        <h2 className="text-5xl font-serif">The Revolution of <span className="italic">Adaptive Sillage.</span></h2>
                        <p className="text-gray-500 leading-relaxed font-light">
                            Muschio isn't just a perfume; it’s a molecular response to your environment. Specifically engineered for the United Arab Emirates, our fragrances stabilize against humidity while projecting deeper in dry heat.
                        </p>
                    </div>

                    <div className="md:col-span-8 space-y-32">
                        {[
                            {
                                title: "Longevity Science",
                                body: "Using a unique steam-distillation process in Milan, we ensure our oils remain active on the skin for 24+ hours.",
                                img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000"
                            },
                            {
                                title: "Oud Reimagined",
                                body: "Our 'Imperial Oud' is aged for 12 years before being blended with Italian Oakmoss for a crisp, modern finish.",
                                img: "https://images.unsplash.com/photo-1615484477201-9f4953340fab?q=80&w=1000"
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="group cursor-crosshair"
                            >
                                <div className="overflow-hidden aspect-video bg-gray-100 mb-8">
                                    <img src={item.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                                </div>
                                <h3 className="text-3xl font-serif mb-4">{item.title}</h3>
                                <p className="text-gray-500 max-w-md font-light">{item.body}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. FEATURE RICH: SCENT DIAGNOSTIC APP */}
            <section className="bg-black text-white py-40 px-6 md:px-20 text-center">
                <Zap className="w-8 h-8 text-gray-500 mx-auto mb-10" />
                <h2 className="text-5xl md:text-8xl font-serif mb-12 italic">Diagnostic <br /> <span className="not-italic">Engine v1.0</span></h2>
                <p className="max-w-2xl mx-auto text-gray-400 font-light text-lg mb-16 uppercase tracking-widest text-xs">
                    Input your environment. We provide your molecular match.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {['Indoor / AC', 'Outdoor / High Heat', 'Evening / Coastal'].map((env) => (
                        <button key={env} className="border border-white/20 py-8 px-4 hover:bg-white hover:text-black transition-all font-serif italic text-xl">
                            {env}
                        </button>
                    ))}
                </div>
            </section>

            {/* 6. FOOTER */}
            <footer className="py-24 px-6 md:px-12 border-t border-gray-100">
                <div className="flex flex-col md:flex-row justify-between gap-16">
                    <div className="space-y-6">
                        <h2 className="text-4xl font-serif font-bold uppercase tracking-tighter">Muschio</h2>
                        <p className="text-xs text-gray-400 uppercase tracking-widest max-w-xs leading-loose">
                            Crafting scents that define moments. Available exclusively at Fashion Avenue, Dubai Mall.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-[10px] font-bold uppercase tracking-widest">
                        <div className="space-y-4">
                            <p className="text-gray-300">Explore</p>
                            <p>Collection</p>
                            <p>Science</p>
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-300">Assistance</p>
                            <p>Contact</p>
                            <p>Shipping</p>
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-300">Social</p>
                            <Instagram className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </footer>

            {/* 7. FULLSCREEN MENU BOX */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[450px] z-[250] bg-white shadow-2xl p-12 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-20">
                            <span className="font-serif font-bold uppercase text-xl">Menu</span>
                            <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 flex items-center justify-center border border-black rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <nav className="flex-1 flex flex-col gap-8">
                            {['Home', 'The Collection', 'Scent DNA', 'Atelier Visit', 'Boutique Locator'].map((item) => (
                                <a key={item} className="text-4xl font-serif hover:italic hover:pl-4 transition-all cursor-pointer">
                                    {item}
                                </a>
                            ))}
                        </nav>

                        <div className="pt-10 border-t border-gray-100 space-y-4">
                            <p className="text-[10px] uppercase tracking-widest font-bold">Concierge</p>
                            <p className="text-sm italic">+971 4 000 0000</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}