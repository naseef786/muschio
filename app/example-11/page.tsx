"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Menu, Heart, ChevronRight, Droplets, Leaf, Instagram } from 'lucide-react';
import Lenis from 'lenis';

// --- SMOOTH SCROLL ---
const useSmoothScroll = () => {
    useEffect(() => {
        const lenis = new Lenis({ duration: 1.8, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),smoothWheel: true });
        function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);
};

export default function MuschioElegant() {
    useSmoothScroll();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const heroRef = useRef(null);

    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const heroTextOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const heroTextScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

    return (
        <main className="bg-[#fcfafa] text-black selection:bg-[#c49b6d] selection:text-white font-serif antialiased overflow-x-hidden">
            {/* --- Progress Bar (Subtle Gold) --- */}
            <motion.div style={{ scaleX: useSpring(scrollYProgress, { stiffness: 100, damping: 30 }) }} className="fixed top-0 left-0 right-0 h-[2px] bg-[#c49b6d] z-[200] origin-left" />

            {/* --- Floating Navigation --- */}
            <nav className="fixed w-full z-[150] px-6 md:px-16 py-10 flex justify-between items-center bg-transparent mix-blend-difference text-white">
                <div className="flex flex-col">
                    <span className="text-3xl font-bold tracking-[0.4em] uppercase text-shadow-sm">Muschio</span>
                    <span className="text-[8px] tracking-[0.3em] uppercase opacity-70 text-shadow-sm">Haute Parfumerie</span>
                </div>

                <div className="flex items-center gap-10">
                    <button className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-80 hover:opacity-100 transition">
                        <Heart className="w-4 h-4" /> Wishlist
                    </button>
                    <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-4 group">
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-80 group-hover:opacity-100 transition hidden sm:block">Explore</span>
                        <div className="w-10 h-10 border border-white/50 rounded-full flex items-center justify-center group-hover:bg-white/10 transition">
                            <Menu className="w-5 h-5" />
                        </div>
                    </button>
                </div>
            </nav>

            {/* --- HERO: Ethereal Entrance --- */}
            <section ref={heroRef} className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
                <motion.div style={{ y: heroImageY }} className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1547483157-ca177890b144?q=80&w=2000"
                        className="w-full h-full object-cover opacity-60 grayscale brightness-75"
                        alt="Ethereal scent clouds"
                    />
                </motion.div>

                <motion.div style={{ opacity: heroTextOpacity, scale: heroTextScale }} className="relative z-10 text-center px-6 text-white text-shadow-lg">
                    <span className="block text-[10px] tracking-[0.8em] uppercase mb-8 opacity-70">The Art of Scent</span>
                    <h1 className="text-8xl md:text-[14vw] leading-none tracking-tight mb-12">
                        The <span className="italic text-[#c49b6d]">Invisible</span> <br /> Veil.
                    </h1>
                    <button className="px-12 py-5 border border-white/50 text-white text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-500">
                        Discover the Collection
                    </button>
                </motion.div>
            </section>

            {/* --- THE ESSENCE: Sensory Rich Content --- */}
            <section className="py-40 px-6 md:px-20 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="relative group">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.5 }}
                            viewport={{ once: true, amount: 0.5 }}
                            className="overflow-hidden bg-gray-50 border border-gray-100 p-4"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000"
                                className="w-full h-[600px] object-cover hover:scale-105 transition-transform duration-1000"
                                alt="Muschio bottle in elegant setting"
                            />
                        </motion.div>
                        <div className="absolute -bottom-8 -left-8 bg-black text-white p-6 md:p-10 shadow-lg hidden md:block">
                            <Droplets className="w-8 h-8 text-[#c49b6d] mb-4" />
                            <p className="text-sm uppercase tracking-widest opacity-70">A Velvet Sillage</p>
                            <p className="text-2xl mt-2 italic">Muschio Noir</p>
                        </div>
                    </div>

                    <div className="space-y-12">
                        <span className="text-[10px] tracking-[0.6em] uppercase text-gray-400 block">The Signature</span>
                        <h2 className="text-6xl md:text-8xl leading-tight">
                            An <span className="italic text-[#c49b6d]">Intimate</span> <br /> Revelation.
                        </h2>
                        <p className="text-xl text-gray-600 leading-relaxed font-light">
                            Muschio perfumes are composed for those who seek more than a scent; they seek a presence. Each note is a memory, each chord a journey. Crafted in limited batches, a true testament to haute parfumerie.
                        </p>
                        <button className="flex items-center gap-6 text-[11px] uppercase tracking-[0.4em] group border-b border-black/20 pb-2 hover:border-black transition">
                            Explore Our Narrative <ChevronRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* --- THE COLLECTION: Gentle Reveals --- */}
            <section className="bg-gradient-to-b from-white to-[#f0f0f0] py-40">
                <div className="max-w-screen-2xl mx-auto px-6 md:px-20">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
                        <h2 className="text-6xl md:text-8xl leading-none">The <span className="italic text-[#c49b6d]">Éditions.</span></h2>
                        <p className="max-w-md text-sm text-gray-500 uppercase tracking-widest leading-loose">
                            Discover the curated selection of Muschio masterpieces, each designed to evoke a distinct emotion and story.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { name: "Veridian", notes: "Oakmoss, Bergamot", img: "https://images.unsplash.com/photo-1616984268211-09b59639ceaf?q=80&w=800" },
                            { name: "Sabbia", notes: "Desert Oud, Sandalwood", img: "https://images.unsplash.com/photo-1615484477201-9f4953340fab?q=80&w=800" },
                            { name: "Luna", notes: "White Musk, Jasmine", img: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800" }
                        ].map((perfume, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.15, duration: 0.8 }}
                                viewport={{ once: true, amount: 0.3 }}
                                className="group cursor-pointer bg-white shadow-sm hover:shadow-lg transition-shadow duration-500 p-6"
                            >
                                <div className="h-[450px] overflow-hidden mb-8">
                                    <img src={perfume.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                                </div>
                                <h3 className="text-3xl mb-2">{perfume.name}</h3>
                                <p className="text-sm text-gray-500 italic">{perfume.notes}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CLOSING: Bespoke Experience --- */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-black text-white">
                <motion.img
                    initial={{ scale: 1.1 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    viewport={{ once: true }}
                    src="https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=2000"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale brightness-50"
                    alt="Luxury interior"
                />
                <div className="relative z-10 text-center px-6">
                    <h2 className="text-6xl md:text-9xl leading-tight mb-12">
                        Your Private <span className="italic text-[#c49b6d]">Atelier.</span>
                    </h2>
                    <button className="px-12 py-5 border border-white/50 text-white text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-500">
                        Book a Personal Consultation
                    </button>
                </div>
            </section>

            {/* --- FOOTER: Refined Information --- */}
            <footer className="py-24 px-6 md:px-20 border-t border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16">
                    <div className="space-y-6">
                        <h2 className="text-4xl font-bold tracking-tighter uppercase">Muschio</h2>
                        <p className="text-xs text-gray-400 uppercase tracking-widest max-w-sm leading-loose">
                            Crafting stories, drop by drop. From Milanese craftsmanship to Dubai's refined tastes.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-[10px] uppercase tracking-widest font-bold">
                        <div className="space-y-4">
                            <p className="text-gray-300">Collections</p>
                            <p>Éditions</p>
                            <p>Essentials</p>
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-300">Services</p>
                            <p>Bespoke</p>
                            <p>Concierge</p>
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-300">Social</p>
                            <Instagram className="w-5 h-5 text-gray-400 hover:text-black transition" />
                        </div>
                    </div>
                </div>
            </footer>

            {/* --- FULLSCREEN MENU OVERLAY --- */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-[250] bg-black text-white p-12 flex flex-col items-center justify-center text-center"
                    >
                        <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 w-12 h-12 border border-white/50 rounded-full flex items-center justify-center hover:bg-white/10 transition">
                            <X className="w-6 h-6" />
                        </button>

                        <nav className="flex flex-col gap-10">
                            {['Home', 'The Éditions', 'Atelier Consult', 'Our Heritage', 'Concierge'].map((item) => (
                                <a key={item} className="text-5xl md:text-8xl hover:italic group flex items-center gap-6 cursor-pointer">
                                    {item} <ChevronRight className="opacity-0 group-hover:opacity-100 -translate-x-10 group-hover:translate-x-0 transition-all w-8 h-8" />
                                </a>
                            ))}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}