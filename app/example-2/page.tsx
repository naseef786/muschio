"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { ShoppingBag, X, Menu, ArrowRight, MapPin, Phone, Globe } from 'lucide-react';
import Lenis from 'lenis';

// --- SMOOTH SCROLL ---
const useSmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, orientation: 'vertical', smoothWheel: true });
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
};

// --- 3D MOUSE TILT BOTTLE ---
const FloatingBottle = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  function handleMouse(event: React.MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  return (
    <motion.div 
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, perspective: 1000 }}
      className="relative w-full max-w-[300px] md:max-w-[450px] aspect-[3/4] cursor-pointer"
    >
      <motion.img 
        src="https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000" 
        className="w-full h-full object-cover rounded-sm shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
        alt="Muschio Oud Edition"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-gold/20 to-transparent pointer-events-none" />
    </motion.div>
  );
};

export default function MuschioUAE() {
  useSmoothScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <main className="bg-[#050505] text-[#F5F5F5] selection:bg-[#D4AF37] selection:text-black overflow-x-hidden">
      {/* UAE Gold Progress Bar */}
      <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-[3px] bg-[#D4AF37] z-[200] origin-left" />

      {/* Responsive Navbar */}
      <nav className="fixed w-full z-[150] px-6 md:px-16 py-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <div className="text-2xl md:text-3xl font-serif tracking-[0.3em] uppercase text-[#D4AF37]">Muschio</div>
          <span className="hidden md:block text-[9px] tracking-widest opacity-40 border-l border-white/20 pl-4">DUBAI • MILANO</span>
        </div>
        
        <div className="flex gap-6 md:gap-10 items-center">
          <div className="hidden lg:flex gap-8 text-[10px] tracking-[0.2em] uppercase">
            <a href="#" className="hover:text-[#D4AF37] transition">Collections</a>
            <a href="#" className="hover:text-[#D4AF37] transition">The Majlis</a>
          </div>
          <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-3 group">
            <span className="text-[10px] tracking-[0.3em] uppercase hidden sm:block">Explore</span>
            <div className="space-y-1">
              <div className="w-6 h-[1px] bg-white group-hover:bg-[#D4AF37] transition" />
              <div className="w-4 h-[1px] bg-white group-hover:w-6 transition" />
            </div>
          </button>
        </div>
      </nav>

      {/* HERO: The Desert Spirit */}
      <section className="relative min-h-screen flex flex-col md:flex-row items-center justify-center px-6 md:px-20 pt-20">
        <div className="absolute inset-0 z-0 opacity-30">
          <img src="https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=2000" className="w-full h-full object-cover grayscale" />
        </div>

        <div className="w-full md:w-1/2 z-10 flex flex-col items-center md:items-start text-center md:text-left space-y-8">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-[#D4AF37] tracking-[0.5em] text-[10px] uppercase">Exclusively in the UAE</motion.p>
          <motion.h1 
            initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="text-6xl lg:text-9xl font-serif leading-none"
          >
            Oud <br/> <span className="italic text-[#D4AF37]">Muschio</span>
          </motion.h1>
          <p className="max-w-md text-white/50 text-sm md:text-base font-light leading-relaxed">
            A celebration of the Arabian desert. Rare Aged Oud blended with the coolness of European Moss. The bridge between two worlds.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 pt-4 w-full md:w-auto">
            <button className="bg-[#D4AF37] text-black px-12 py-5 text-[10px] font-bold tracking-widest uppercase hover:bg-white transition-colors">Shop Now</button>
            <button className="border border-white/20 px-12 py-5 text-[10px] font-bold tracking-widest uppercase hover:bg-white/10 transition">Boutique Locator</button>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex justify-center items-center mt-20 md:mt-0 z-10">
          <FloatingBottle />
        </div>
      </section>

      {/* FEATURE: The Ingredients Scroll */}
      <section className="py-32 bg-[#0a0a0a]">
        <div className="px-6 md:px-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "Cambodian Oud", desc: "Aged for 15 years for a deep, smoky resonance.", img: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=800" },
            { title: "Damascus Rose", desc: "Hand-picked at dawn to preserve the floral essence.", img: "https://images.unsplash.com/photo-1559563458-527698bf5295?q=80&w=800" },
            { title: "Italian Moss", desc: "Sourced from the heart of the Dolomites.", img: "https://images.unsplash.com/photo-1615484477201-9f4953340fab?q=80&w=800" }
          ].map((item, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}
              className="group cursor-pointer"
            >
              <div className="h-[450px] overflow-hidden mb-6 relative">
                <img src={item.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
              </div>
              <h3 className="text-xl font-serif text-[#D4AF37]">{item.title}</h3>
              <p className="text-sm text-white/40 mt-3 font-light">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PARALLAX STATS: UAE Presence */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [-50, 50]) }}
          className="absolute inset-0 grayscale brightness-50"
        >
          <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2000" className="w-full h-full object-cover" />
        </motion.div>
        <div className="relative z-10 text-center grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-32">
          {[
            { val: "Dubai", label: "Flagship" },
            { val: "Abu Dhabi", label: "Boutique" },
            { val: "7", label: "Emirates" },
            { val: "24h", label: "Concierge" }
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-4xl md:text-6xl font-serif text-[#D4AF37]">{stat.val}</p>
              <p className="text-[10px] tracking-widest uppercase text-white/60 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER: Contact UAE */}
      <footer className="bg-black py-24 px-6 md:px-16 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between gap-20">
          <div className="space-y-8">
            <h2 className="text-4xl font-serif text-[#D4AF37] tracking-widest uppercase">Muschio</h2>
            <div className="flex flex-col gap-4 text-sm text-white/50">
              <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-[#D4AF37]"/> Dubai Mall, Level 1, Fashion Avenue</div>
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-[#D4AF37]"/> +971 4 000 0000</div>
              <div className="flex items-center gap-3"><Globe className="w-4 h-4 text-[#D4AF37]"/> muschio.ae</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 md:gap-32">
            <div className="space-y-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Explore</p>
              <ul className="text-xs space-y-4 opacity-50">
                <li>Best Sellers</li>
                <li>New Arrivals</li>
                <li>Majlis Collection</li>
              </ul>
            </div>
            <div className="space-y-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Assistance</p>
              <ul className="text-xs space-y-4 opacity-50">
                <li>VIP Delivery</li>
                <li>Corporate Gifting</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-[9px] uppercase tracking-[0.3em] opacity-30 text-center md:text-left">
          <p>© 2025 Muschio Parfumerie Middle East</p>
          <div className="flex justify-center gap-6">
            <span>Privacy</span>
            <span>Accessibility</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>

      {/* Fullscreen Mobile-Ready Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[210] bg-[#050505] flex flex-col p-10"
          >
            <div className="flex justify-between items-center mb-20">
              <span className="text-[#D4AF37] font-serif tracking-widest text-xl">Muschio UAE</span>
              <X className="w-10 h-10 cursor-pointer" onClick={() => setIsMenuOpen(false)} />
            </div>
            <div className="flex flex-col gap-6 items-center justify-center flex-1">
              {['The Collection', 'Boutique Locator', 'Scent Profile', 'Gift Concierge'].map((link) => (
                <a key={link} className="text-4xl md:text-7xl font-serif hover:text-[#D4AF37] transition cursor-pointer">{link}</a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}