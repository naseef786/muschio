"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { ShoppingBag, X, Menu, ArrowRight, Play, Search, Instagram, ChevronRight } from 'lucide-react';
import Lenis from 'lenis';

// --- 1. THE LOGO COMPONENT (Minimalist Premium B&W) ---
const MuschioLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M20 80V20L50 50L80 20V80" stroke="currentColor" strokeWidth="2" />
        <circle cx="50" cy="55" r="35" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        <text x="50" y="95" textAnchor="middle" fontSize="10" letterSpacing="5" fill="currentColor" fontFamily="serif">M</text>
    </svg>
);

// --- 2. SMOOTH SCROLL HOOK ---
const useSmoothScroll = () => {
    useEffect(() => {
        const lenis = new Lenis({ duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);
};

// --- 3. UI COMPONENTS ---

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <nav className="fixed w-full z-[100] flex justify-between items-center px-6 md:px-12 py-6 mix-blend-difference text-white">
                <div className="flex items-center gap-4 group cursor-pointer">
                    <MuschioLogo className="w-10 h-10 transition-transform duration-700 group-hover:rotate-180" />
                    <span className="text-2xl font-serif tracking-[0.4em] uppercase hidden md:block">Muschio</span>
                </div>

                <div className="flex gap-8 items-center">
                    <Search className="w-5 h-5 cursor-pointer opacity-70 hover:opacity-100 transition" />
                    <div className="relative cursor-pointer">
                        <ShoppingBag className="w-5 h-5" />
                        <span className="absolute -top-2 -right-2 text-[9px] bg-white text-black rounded-full w-4 h-4 flex items-center justify-center font-bold">0</span>
                    </div>
                    <button onClick={() => setIsOpen(true)} className="flex items-center gap-3">
                        <div className="flex flex-col gap-1.5 items-end">
                            <div className="w-6 h-[1px] bg-white" />
                            <div className="w-4 h-[1px] bg-white" />
                        </div>
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                        className="fixed inset-0 z-[110] bg-black text-white p-12 flex flex-col items-center justify-center text-center"
                    >
                        <X className="absolute top-10 right-10 w-10 h-10 cursor-pointer" onClick={() => setIsOpen(false)} />
                        <div className="space-y-8">
                            {['The Collection', 'Atelier Visit', 'Scent Quiz', 'Heritage', 'Journal'].map((item, i) => (
                                <motion.a
                                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                                    key={item} href="#" className="block text-5xl md:text-7xl font-serif hover:italic transition-all"
                                >
                                    {item}
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

const Hero = () => {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, 150]);
    const opacity = useTransform(scrollY, [0, 400], [1, 0]);

    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
            <motion.div style={{ y, opacity }} className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1557170334-a7c3a4f22038?q=80&w=2000"
                    className="w-full h-full object-cover opacity-60 grayscale"
                    alt="Muschio Essence"
                />
            </motion.div>
            <div className="relative z-10 text-center text-white">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.5 }}>
                    <MuschioLogo className="w-24 h-24 mx-auto mb-10 text-white" />
                </motion.div>
                <motion.h1
                    initial={{ letterSpacing: "0.2em", opacity: 0 }} animate={{ letterSpacing: "1em", opacity: 1 }} transition={{ duration: 2 }}
                    className="text-5xl md:text-8xl font-serif uppercase"
                >
                    Muschio
                </motion.h1>
                <p className="mt-8 text-[10px] tracking-[0.5em] uppercase opacity-50">High Perfumery • Milano</p>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-[1px] h-12 bg-white/30" />
            </div>
        </section>
    );
};

const ProductSection = () => {
    const scrollRef = useRef(null);
    const { scrollXProgress } = useScroll({ target: scrollRef });

    const products = [
        { name: "Lichene Nero", category: "Earth", img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800" },
        { name: "Fumo Bianco", category: "Smoke", img: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800" },
        { name: "Radice II", category: "Root", img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800" },
        { name: "Acqua", category: "Mineral", img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?q=80&w=800" }
    ];

    return (
        <section className="py-32 bg-white text-black">
            <div className="px-6 md:px-12 mb-20 flex justify-between items-end">
                <div>
                    <span className="text-[10px] tracking-widest uppercase text-black/40">Our Signatures</span>
                    <h2 className="text-5xl font-serif mt-4 italic">The Winter Edit</h2>
                </div>
                <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest border-b border-black pb-2 hover:gap-4 transition-all">
                    View All <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="flex gap-8 overflow-x-auto px-6 md:px-12 no-scrollbar">
                {products.map((p, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="min-w-[300px] md:min-w-[450px] group cursor-pointer"
                    >
                        <div className="relative h-[600px] overflow-hidden bg-[#f5f5f5] mb-6">
                            <img src={p.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                            <div className="absolute top-6 left-6 text-[10px] tracking-widest border border-black/20 px-3 py-1 uppercase">
                                {p.category}
                            </div>
                        </div>
                        <h3 className="text-2xl font-serif">{p.name}</h3>
                        <p className="text-[10px] tracking-widest text-black/40 uppercase mt-2">100ml — Eau de Parfum</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

const ScentFinder = () => {
    return (
        <section className="bg-black text-white py-40 px-6 overflow-hidden">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                <div>
                    <h2 className="text-6xl font-serif leading-tight">Can't decide? <br />Distill your <span className="italic">soul.</span></h2>
                    <p className="text-white/50 mt-8 mb-12 text-lg font-light leading-relaxed">
                        Our algorithm matches your aesthetic preferences with our complex fragrance profiles. Find the scent that becomes your invisible armor.
                    </p>
                    <button className="bg-white text-black px-12 py-5 uppercase text-[10px] tracking-widest font-bold hover:invert transition-all">
                        Take the Scent Quiz
                    </button>
                </div>
                <div className="relative h-[600px] border border-white/10 flex items-center justify-center group">
                    <MuschioLogo className="w-64 h-64 opacity-10 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                    <div className="absolute bottom-10 text-center">
                        <span className="text-[10px] tracking-[0.5em] uppercase">Interactive Experience</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default function MuschioApp() {
    useSmoothScroll();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    return (
        <main className="bg-white selection:bg-black selection:text-white">
            <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-black z-[101] origin-left" style={{ scaleX }} />
            <Navbar />
            <Hero />

            {/* Editorial Content */}
            <section className="py-40 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-32 items-center">
                <div className="order-2 md:order-1 space-y-8">
                    <span className="text-xs uppercase tracking-[0.5em] text-black/30">The Process</span>
                    <h2 className="text-5xl font-serif leading-tight">Ethically sourced. <br />Intentionally crafted.</h2>
                    <p className="text-gray-600 leading-relaxed font-light">
                        Each Muschio bottle is hand-poured in small batches. We use raw moss from the Dolomites and distilled minerals to create a fragrance that feels like cold air on a winter morning.
                    </p>
                    <button className="flex items-center gap-4 group uppercase text-[10px] tracking-widest font-bold">
                        Explore the Atelier <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition"><ArrowRight className="w-4 h-4" /></div>
                    </button>
                </div>
                <div className="order-1 md:order-2">
                    <div className="relative h-[700px] w-full bg-[#f9f9f9] overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1615484477201-9f4953340fab?q=80&w=1000" className="w-full h-full object-cover grayscale" alt="Atelier" />
                    </div>
                </div>
            </section>

            {/* <ProductSection /> */}
            <ScentFinder />

            <footer className="bg-white text-black py-24 border-t border-black/5 px-6 md:px-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <MuschioLogo className="w-12 h-12" />
                            <h2 className="text-3xl font-serif tracking-widest uppercase">Muschio</h2>
                        </div>
                        <p className="text-sm text-black/40 max-w-xs uppercase tracking-widest leading-loose">
                            Via della Moscova, 24<br />20121 Milano, Italy
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest">Shop</h4>
                            <ul className="text-xs space-y-4 opacity-60">
                                <li>Best Sellers</li>
                                <li>Discovery Set</li>
                                <li>Home Fragrance</li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest">About</h4>
                            <ul className="text-xs space-y-4 opacity-60">
                                <li>Sustainability</li>
                                <li>Atelier Visit</li>
                                <li>Ingredient Index</li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest">Connect</h4>
                            <div className="flex gap-4">
                                <Instagram className="w-5 h-5 opacity-40 hover:opacity-100 transition cursor-pointer" />
                                <Play className="w-5 h-5 opacity-40 hover:opacity-100 transition cursor-pointer" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-24 pt-8 border-t border-black/5 flex justify-between text-[9px] uppercase tracking-widest opacity-30">
                    <p>© 2025 Muschio Parfums International</p>
                    <p>Created with Intention</p>
                </div>
            </footer>
        </main>
    );
}