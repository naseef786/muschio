"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Menu, X, Instagram, MapPin, Phone, Award, ShieldCheck } from 'lucide-react';
import Lenis from 'lenis';

const useSmoothScroll = () => {
    useEffect(() => {
        const lenis = new Lenis({ duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);
};

export default function MuschioUAE() {
    useSmoothScroll();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const container = useRef(null);

    const { scrollYProgress } = useScroll();
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    // Parallax transforms
    const heroTextY = useTransform(scrollYProgress, [0, 0.2], [0, -150]);
    const desertScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2]);

    return (
        <main className="bg-[#080808] text-[#f4f4f4] selection:bg-[#D4AF37] selection:text-black font-sans antialiased">
            {/* 24K Gold Progress Bar */}
            <motion.div style={{ scaleX: smoothProgress }} className="fixed top-0 left-0 right-0 h-[2px] bg-[#D4AF37] z-[200] origin-left" />

            {/* FIXED NAVIGATION */}
            <nav className="fixed w-full z-[150] px-6 md:px-16 py-10 flex justify-between items-center mix-blend-difference">
                <div className="flex flex-col">
                    <span className="text-3xl font-serif tracking-[0.5em] uppercase text-[#D4AF37]">Muschio</span>
                    <span className="text-[9px] tracking-[0.4em] uppercase opacity-60">Private Atelier • Dubai Mall</span>
                </div>
                <div className="flex items-center gap-12">
                    <div className="hidden lg:flex gap-10 text-[10px] tracking-[0.3em] uppercase font-bold text-white/70">
                        <a href="#collection" className="hover:text-[#D4AF37] transition">The Collection</a>
                        <a href="#heritage" className="hover:text-[#D4AF37] transition">Our Heritage</a>
                        <a href="#majlis" className="hover:text-[#D4AF37] transition">The Majlis</a>
                    </div>
                    <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-4 group">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] tracking-widest uppercase font-bold">Menu</p>
                        </div>
                        <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center group-hover:border-[#D4AF37] transition-all">
                            <Menu className="w-5 h-5 group-hover:scale-90 transition-transform" />
                        </div>
                    </button>
                </div>
            </nav>

            {/* HERO: CINEMATIC ENTRANCE */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <motion.div style={{ scale: desertScale }} className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1547483157-ca177890b144?q=80&w=2000"
                        className="w-full h-full object-cover opacity-40 grayscale sepia-[0.2]"
                        alt="Dubai Skyline Night"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#080808]" />
                </motion.div>

                <motion.div style={{ y: heroTextY }} className="relative z-10 text-center px-4">
                    <motion.span
                        initial={{ opacity: 0, letterSpacing: "0em" }}
                        animate={{ opacity: 1, letterSpacing: "1em" }}
                        transition={{ duration: 2 }}
                        className="block text-xs uppercase mb-8 text-[#D4AF37] font-bold"
                    >
                        The Zenith of Scent
                    </motion.span>
                    <h1 className="text-7xl md:text-[13vw] font-serif leading-none tracking-tighter text-white mb-10">
                        Musk <span className="italic font-light text-[#D4AF37]">Imperial</span>
                    </h1>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        <button className="px-12 py-5 bg-[#D4AF37] text-black text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-white transition-all duration-500 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                            Reserve Your Essence
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* STORYTELLING: THE ARABIAN SOUL */}
            <section id="heritage" className="py-40 px-6 md:px-20 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                    <div className="relative group">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.2 }}
                            className="overflow-hidden border border-white/5"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000"
                                className="w-full h-[700px] object-cover opacity-80"
                                alt="Muschio Atelier"
                            />
                        </motion.div>
                        <div className="absolute -bottom-10 -left-10 bg-black p-12 border border-[#D4AF37]/30 hidden md:block">
                            <Award className="text-[#D4AF37] w-10 h-10 mb-4" />
                            <p className="text-sm tracking-widest uppercase text-white/50">Voted Best Fragrance</p>
                            <p className="text-xl font-serif text-[#D4AF37]">Middle East Awards 2024</p>
                        </div>
                    </div>

                    <div className="space-y-12">
                        <h2 className="text-6xl md:text-8xl font-serif leading-tight">
                            A Bridge Between <br /> <span className="italic text-[#D4AF37]">Two Worlds.</span>
                        </h2>
                        <p className="text-xl text-white/60 font-light leading-relaxed">
                            Muschio was envisioned for those who walk the marble halls of Milan and the golden sands of the UAE. We’ve combined the crisp, botanical sharpness of Italian oakmoss with the deep, intoxicating warmth of rare Cambodian Oud.
                        </p>
                        <div className="space-y-6">
                            <div className="flex items-center gap-6 group cursor-pointer">
                                <div className="w-12 h-[1px] bg-[#D4AF37] group-hover:w-20 transition-all" />
                                <span className="text-[10px] uppercase tracking-[0.5em] font-bold">The Scent Profile</span>
                            </div>
                            <div className="flex items-center gap-6 group cursor-pointer">
                                <div className="w-12 h-[1px] bg-[#D4AF37] group-hover:w-20 transition-all" />
                                <span className="text-[10px] uppercase tracking-[0.5em] font-bold">Atelier Craftsmanship</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* THE MAJLIS SECTION (Home Fragrance) */}
            <section id="majlis" className="bg-white text-black py-40">
                <div className="max-w-screen-2xl mx-auto px-6 md:px-20 flex flex-col items-center">
                    <span className="text-[10px] tracking-[0.8em] uppercase text-black/40 mb-10">Hospitality Reimagined</span>
                    <h2 className="text-7xl md:text-9xl font-serif mb-20 text-center">The <span className="italic">Majlis</span> Collection</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
                        <div className="h-[600px] relative group overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=1000" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                            <div className="absolute bottom-10 left-10 text-white">
                                <p className="text-2xl font-serif">Imperial Diffusers</p>
                                <p className="text-[10px] uppercase tracking-widest opacity-70">Starting AED 1,200</p>
                            </div>
                        </div>
                        <div className="h-[600px] relative group overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1615484477201-9f4953340fab?q=80&w=1000" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                            <div className="absolute bottom-10 left-10 text-white">
                                <p className="text-2xl font-serif">Hand-Poured Candles</p>
                                <p className="text-[10px] uppercase tracking-widest opacity-70">Starting AED 450</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* VIP SERVICES GRID */}
            <section className="py-40 px-6 md:px-20 bg-[#080808]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    <div className="p-12 border border-white/5 space-y-6 hover:border-[#D4AF37]/50 transition-colors group">
                        <ShieldCheck className="w-12 h-12 text-[#D4AF37] mb-8" />
                        <h3 className="text-2xl font-serif">VIP Concierge</h3>
                        <p className="text-sm text-white/40 leading-relaxed font-light">Exclusive access to limited editions and 24-hour delivery across all 7 Emirates.</p>
                    </div>
                    <div className="p-12 border border-white/5 space-y-6 hover:border-[#D4AF37]/50 transition-colors group">
                        <MapPin className="w-12 h-12 text-[#D4AF37] mb-8" />
                        <h3 className="text-2xl font-serif">Private Atelier</h3>
                        <p className="text-sm text-white/40 leading-relaxed font-light">Book a private scent-matching session at our Dubai Mall flagship boutique.</p>
                    </div>
                    <div className="p-12 border border-white/5 space-y-6 hover:border-[#D4AF37]/50 transition-colors group">
                        <Instagram className="w-12 h-12 text-[#D4AF37] mb-8" />
                        <h3 className="text-2xl font-serif">Scent Styling</h3>
                        <p className="text-sm text-white/40 leading-relaxed font-light">Bespoke fragrance styling for royal weddings and private events in the GCC.</p>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-black py-32 px-6 md:px-20 border-t border-white/5">
                <div className="flex flex-col md:flex-row justify-between gap-20">
                    <div>
                        <h2 className="text-5xl font-serif text-[#D4AF37] mb-10">MUSCHIO</h2>
                        <div className="flex items-center gap-4 text-[10px] tracking-widest uppercase font-bold text-white/40">
                            <span>Dubai Mall</span>
                            <div className="w-1 h-1 bg-[#D4AF37] rounded-full" />
                            <span>Milan</span>
                            <div className="w-1 h-1 bg-[#D4AF37] rounded-full" />
                            <span>London</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
                        <div className="space-y-6">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-[#D4AF37]">Explore</p>
                            <ul className="text-xs space-y-4 opacity-50">
                                <li>Best Sellers</li>
                                <li>Exclusive UAE Oud</li>
                                <li>Gift Sets</li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-[#D4AF37]">Assistance</p>
                            <ul className="text-xs space-y-4 opacity-50">
                                <li>VIP Delivery</li>
                                <li>Store Locator</li>
                                <li>Contact Us</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-32 pt-10 border-t border-white/5 flex justify-between items-center text-[9px] uppercase tracking-[0.4em] opacity-30">
                    <p>© 2025 Muschio Parfumerie Middle East</p>
                    <div className="flex gap-10">
                        <span>Privacy Policy</span>
                        <span>Terms of Service</span>
                    </div>
                </div>
            </footer>

            {/* MOBILE FULLSCREEN MENU */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 200 }}
                        className="fixed inset-0 z-[250] bg-[#D4AF37] text-black p-12 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-20">
                            <span className="text-xl font-serif tracking-widest">MUSCHIO</span>
                            <X className="w-10 h-10 cursor-pointer" onClick={() => setIsMenuOpen(false)} />
                        </div>
                        <div className="flex-1 flex flex-col justify-center gap-8">
                            {['Signature Collection', 'The Majlis', 'Private Atelier', 'UAE Exclusives'].map((item, i) => (
                                <a key={item} className="text-5xl md:text-8xl font-serif hover:italic transition-all cursor-pointer leading-none">
                                    {item}
                                </a>
                            ))}
                        </div>
                        <div className="pt-10 border-t border-black/10 flex flex-col gap-4 text-[10px] uppercase tracking-widest font-bold">
                            <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> +971 4 000 0000</div>
                            <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Fashion Avenue, Dubai Mall</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}