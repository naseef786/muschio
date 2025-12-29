"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { ShoppingBag, X, Menu, ArrowRight, MousePointer2 } from 'lucide-react';
import Lenis from 'lenis';

// --- SMOOTH SCROLL ---
const useSmoothScroll = () => {
    useEffect(() => {
        const lenis = new Lenis({ duration: 1.5 });
        function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);
};

// --- LOGO COMPONENT ---
const MuschioLogo = ({ className = "w-12 h-12" }) => (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
        <path d="M20 80V20L50 50L80 20V80" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
    </svg>
);

// --- 3D PARALLAX IMAGE COMPONENT ---
const ParallaxImage = ({ src = '', speed = 0.1, className = "" }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], [-100 * speed, 100 * speed]);

    return (
        <div ref={ref} className={`relative overflow-hidden ${className}`}>
            <motion.img
                style={{ y, scale: 1.2 }}
                src={src}
                className="w-full h-full object-cover"
            />
        </div>
    );
};

export default function Muschio3D() {
    useSmoothScroll();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const heroRef = useRef(null);

    const { scrollYProgress } = useScroll();
    const scaleProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    // 3D Hero Parallax
    const yText = useTransform(scrollYProgress, [0, 0.5], [0, 200]);
    const scaleImg = useTransform(scrollYProgress, [0, 0.5], [1, 1.5]);
    const rotateImg = useTransform(scrollYProgress, [0, 0.5], [0, 5]);

    return (
        <main className="bg-[#0a0a0a] text-white selection:bg-white selection:text-black font-sans">
            {/* Scroll Progress */}
            <motion.div style={{ scaleX: scaleProgress }} className="fixed top-0 left-0 right-0 h-1 bg-white z-[200] origin-left" />

            {/* Nav */}
            <nav className="fixed w-full z-[150] mix-blend-difference px-8 py-8 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <MuschioLogo className="w-10 h-10" />
                    <span className="text-2xl font-serif tracking-[0.5em] uppercase">Muschio</span>
                </div>
                <button onClick={() => setIsMenuOpen(true)} className="group flex items-center gap-4">
                    <span className="text-[10px] tracking-[0.3em] uppercase opacity-50 group-hover:opacity-100 transition">Explore</span>
                    <Menu className="w-6 h-6" />
                </button>
            </nav>

            {/* 3D Hero Section */}
            <section ref={heroRef} className="relative h-[120vh] flex items-center justify-center overflow-hidden">
                <motion.div style={{ scale: scaleImg, rotate: rotateImg }} className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1600100397608-f09000a6839e?q=80&w=2000"
                        className="w-full h-full object-cover opacity-50 grayscale"
                    />
                </motion.div>

                {/* Floating 3D Bottle Element */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: [0, -20, 0], opacity: 1 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 w-64 md:w-96 perspective-1000"
                >
                    <motion.img
                        style={{ rotateY: 15, rotateX: 5 }}
                        src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000"
                        className="w-full h-auto drop-shadow-[0_35px_35px_rgba(255,255,255,0.1)] rounded-lg shadow-2xl"
                    />
                </motion.div>

                <motion.div style={{ y: yText }} className="absolute z-20 text-center pointer-events-none">
                    <h1 className="text-[15vw] font-serif leading-none tracking-tighter mix-blend-difference">
                        ESSENZA
                    </h1>
                </motion.div>
            </section>

            {/* Spatial Gallery Section */}
            <section className="py-40 px-6 md:px-20 grid grid-cols-12 gap-10 items-center">
                <div className="col-span-12 md:col-span-5 space-y-10">
                    <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="text-xs uppercase tracking-[0.6em] text-white/40 block"
                    >
                        The Atelier
                    </motion.span>
                    <h2 className="text-6xl md:text-8xl font-serif italic leading-[0.9]">
                        Nature <br /> <span className="not-italic pl-20">Distilled</span>
                    </h2>
                    <p className="text-lg font-light text-white/60 leading-relaxed max-w-md">
                        Using traditional steam distillation, we extract the primitive soul of oakmoss. No shortcuts. No synthetics. Just the earth as it was intended.
                    </p>
                    <button className="group flex items-center gap-6 text-[10px] uppercase tracking-[0.4em] border border-white/20 px-10 py-5 hover:bg-white hover:text-black transition-all">
                        Discover Process <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>

                <div className="col-span-12 md:col-span-7 grid grid-cols-2 gap-4">
                    <ParallaxImage
                        src="https://images.unsplash.com/photo-1615484477201-9f4953340fab?q=80&w=1000"
                        speed={0.2}
                        className="h-[400px] md:h-[600px] mt-20"
                    />
                    <ParallaxImage
                        src="https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=1000"
                        speed={-0.1}
                        className="h-[400px] md:h-[600px]"
                    />
                </div>
            </section>

            {/* 3D Scroll-Driven Text */}
            <section className="h-screen flex items-center justify-center bg-white text-black overflow-hidden relative">
                <motion.div
                    style={{ x: useTransform(scrollYProgress, [0.5, 1], ["-10%", "-50%"]) }}
                    className="whitespace-nowrap flex gap-20 items-center"
                >
                    <span className="text-[20vw] font-serif uppercase tracking-tighter">Wild Moss</span>
                    <span className="text-[20vw] font-serif italic uppercase tracking-tighter text-transparent stroke-black stroke-1" style={{ WebkitTextStroke: "1px black" }}>Milano</span>
                    <span className="text-[20vw] font-serif uppercase tracking-tighter">Wild Moss</span>
                </motion.div>
            </section>

            {/* Deep Footer */}
            <footer className="bg-black py-20 px-10 border-t border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-end gap-10">
                    <div>
                        <MuschioLogo className="w-20 h-20 mb-8" />
                        <div className="text-4xl font-serif tracking-[0.3em] uppercase">Muschio</div>
                    </div>
                    <div className="flex gap-20 text-[10px] uppercase tracking-widest opacity-40">
                        <div className="space-y-4 font-bold">
                            <p className="text-white">Products</p>
                            <p>Home Fragrance</p>
                            <p>Eau de Parfum</p>
                        </div>
                        <div className="space-y-4 font-bold">
                            <p className="text-white">Legacy</p>
                            <p>Sustainability</p>
                            <p>Atelier Visit</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Overlay Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }}
                        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                        className="fixed inset-0 z-[200] bg-white text-black p-10 flex flex-col"
                    >
                        <div className="flex justify-between items-center">
                            <MuschioLogo className="w-12 h-12" />
                            <X className="w-10 h-10 cursor-pointer" onClick={() => setIsMenuOpen(false)} />
                        </div>
                        <div className="flex-1 flex flex-col justify-center items-center gap-8">
                            {['Collection', 'Atelier', 'Journal', 'Archive'].map((link) => (
                                <a key={link} className="text-6xl md:text-9xl font-serif hover:italic transition-all cursor-pointer">{link}</a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}