"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { ShoppingBag, X, Menu, ArrowRight, Play, Compass, Droplets, Wind } from 'lucide-react';
import Lenis from 'lenis';

// --- 1. SMOOTH SCROLL ENGINE ---
const useSmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
};

// --- 2. COMPONENTS ---

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "The Collection", sub: "Explore our olfactory range" },
    { name: "Scent Finder", sub: "Discover your signature" },
    { name: "Sustainability", sub: "Our botanical commitment" },
    { name: "The Journal", sub: "Stories of Muschio" },
    { name: "Atelier", sub: "Where nature meets science" }
  ];

  return (
    <>
      <nav className="fixed w-full z-[100] flex justify-between items-center px-8 md:px-16 py-10 mix-blend-difference text-white">
        <div className="text-3xl font-serif tracking-[0.2em] uppercase">Muschio</div>
        
        <div className="flex gap-10 items-center">
          <div className="hidden md:flex gap-8 text-[10px] tracking-[0.3em] uppercase opacity-70">
            <a href="#" className="hover:opacity-100 transition-opacity">Archive</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Boutiques</a>
          </div>
          <button onClick={() => setIsOpen(true)} className="flex items-center gap-3 group">
            <span className="uppercase text-[10px] tracking-[0.3em]">Menu</span>
            <div className="w-8 h-[1px] bg-white group-hover:w-12 transition-all" />
          </button>
        </div>
      </nav>

      {/* MOBILE & DESKTOP DRAWER MENU */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]" 
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 100 }}
              className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-[#0d0d0d] text-white z-[120] p-12 flex flex-col"
            >
              <div className="flex justify-between items-center mb-24">
                <span className="text-xs tracking-[0.4em] uppercase opacity-50 italic">Est. 1995 — Italy</span>
                <X className="w-8 h-8 cursor-pointer hover:rotate-90 transition-transform" onClick={() => setIsOpen(false)} />
              </div>

              <div className="flex flex-col gap-10">
                {menuItems.map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ x: 20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    transition={{ delay: 0.1 * i }}
                    className="group cursor-pointer"
                  >
                    <h3 className="text-4xl font-serif group-hover:italic group-hover:pl-4 transition-all duration-300">
                      {item.name}
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mt-2">{item.sub}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto border-t border-white/10 pt-8 flex justify-between">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest opacity-40">Contact</p>
                  <p className="text-sm">atelier@muschio.it</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition cursor-pointer italic font-serif">I</div>
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition cursor-pointer italic font-serif">F</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const DiscoverySection = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-65%"]);

  const products = [
    { name: "Earth & Moss", note: "Wet Earth, Oakmoss", price: "€185", img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800" },
    { name: "Morning Mist", note: "White Musk, Linen", price: "€160", img: "https://images.unsplash.com/photo-1563170339-2c97a176d890?q=80&w=800" },
    { name: "Obsidian", note: "Smoke, Leather, Bergamot", price: "€210", img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?q=80&w=800" },
    { name: "Verde", note: "Vetiver, Cut Grass", price: "€175", img: "https://images.unsplash.com/photo-1616984268211-09b59639ceaf?q=80&w=800" },
  ];

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-[#f5f5f0]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-12 px-12 md:px-32">
          <div className="min-w-[400px] md:min-w-[600px] flex flex-col justify-center">
            <h2 className="text-7xl md:text-9xl font-serif text-[#1a1a1a] leading-[0.85]">
              The <br/><span className="italic pl-12 md:pl-32">Discovery</span>
            </h2>
            <p className="mt-12 text-sm text-black/50 tracking-widest uppercase max-w-sm ml-12 md:ml-32">
              Four scents, infinite memories. Curated for the modern romantic.
            </p>
          </div>
          
          {products.map((p, i) => (
            <div key={i} className="min-w-[350px] md:min-w-[450px] group">
              <div className="h-[500px] overflow-hidden bg-white mb-6 p-12 flex items-center justify-center">
                <motion.img 
                  whileHover={{ scale: 1.05 }}
                  src={p.img} 
                  alt={p.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div className="flex justify-between items-end border-b border-black/10 pb-4">
                <div>
                  <h4 className="text-2xl font-serif">{p.name}</h4>
                  <p className="text-[10px] uppercase tracking-widest text-black/40 mt-1">{p.note}</p>
                </div>
                <span className="text-sm font-light">{p.price}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const ScentFinderQuiz = () => {
  const [step, setStep] = useState(0);
  const questions = [
    { q: "Where do you feel most at home?", icons: [<Wind key="1"/>, <Droplets key="2"/>, <Compass key="3"/>], options: ["Open Fields", "Dense Forest", "Coastal Cliffs"] },
    { q: "Choose your preferred time.", icons: [], options: ["Crisp Dawn", "Golden Hour", "Deep Midnight"] }
  ];

  return (
    <section className="py-32 px-6 bg-black text-white overflow-hidden relative">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <span className="text-[10px] tracking-[0.5em] uppercase text-white/40 mb-8 block">Interactive</span>
        <h2 className="text-5xl md:text-7xl font-serif mb-16">Find your signature.</h2>
        
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-12 md:p-20 rounded-sm min-h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              <h3 className="text-2xl md:text-3xl font-serif italic">{questions[step].q}</h3>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                {questions[step].options.map((opt, i) => (
                  <button 
                    key={i}
                    onClick={() => step < questions.length - 1 ? setStep(step + 1) : setStep(0)}
                    className="px-10 py-5 border border-white/20 hover:bg-white hover:text-black transition-all uppercase text-[10px] tracking-widest"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-900/20 blur-[150px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[150px]" />
    </section>
  );
};

export default function MuschioLanding() {
  useSmoothScroll();
  const { scrollYProgress } = useScroll();
  const progressScale = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <main className="bg-[#fcfcfc] selection:bg-[#1a1a1a] selection:text-white">
      {/* SCROLL PROGRESS BAR */}
      <motion.div 
        style={{ scaleX: progressScale }} 
        className="fixed top-0 left-0 right-0 h-[2px] bg-black origin-left z-[101]" 
      />
      
      <Navigation />

      {/* HERO SECTION */}
      <section className="relative h-[110vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 0.3], [0, 150]) }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=2000" 
            className="w-full h-full object-cover brightness-75 scale-110"
            alt="Hero Background"
          />
        </motion.div>
        
        <div className="relative z-10 text-center text-white space-y-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
            <p className="text-[10px] tracking-[0.8em] uppercase mb-4 opacity-80">Ancient Roots • Modern Alchemy</p>
            <h1 className="text-[12vw] font-serif leading-none mix-blend-overlay">MUSCHIO</h1>
            <div className="mt-12 flex items-center justify-center gap-6">
              <button className="bg-white text-black px-12 py-5 uppercase text-[10px] tracking-widest font-bold hover:bg-black hover:text-white transition-colors">
                The Winter Collection
              </button>
              <button className="flex items-center gap-3 border-b border-white pb-2 text-[10px] tracking-widest uppercase hover:gap-6 transition-all">
                Discovery Set <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="py-40 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-32 items-center">
        <div className="w-full md:w-1/2 overflow-hidden">
          <motion.img 
            initial={{ scale: 1.2, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5 }}
            src="https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=1000" 
            className="w-full h-[700px] object-cover rounded-sm"
          />
        </div>
        <div className="w-full md:w-1/2 space-y-12">
          <h2 className="text-6xl font-serif text-[#1a1a1a] leading-tight">
            Distilled in the heart of <span className="italic">Tuscany.</span>
          </h2>
          <p className="text-lg text-black/60 leading-relaxed font-light italic">
            "Muschio was born from a desire to capture the scent of the first rain on dry Italian earth. We blend raw oakmoss with synthetic white musks to create an olfactory profile that is at once primal and sophisticated."
          </p>
          <div className="pt-8 grid grid-cols-2 gap-12">
            <div>
              <p className="text-2xl font-serif">100%</p>
              <p className="text-[10px] uppercase tracking-widest text-black/40 mt-2">Organic Bases</p>
            </div>
            <div>
              <p className="text-2xl font-serif">Cruelty</p>
              <p className="text-[10px] uppercase tracking-widest text-black/40 mt-2">Free Synthesis</p>
            </div>
          </div>
        </div>
      </section>

      <DiscoverySection />
      
      <ScentFinderQuiz />

      {/* LUXURY FOOTER */}
      <footer className="bg-[#0a0a0a] text-white pt-32 pb-12 px-8 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-6xl font-serif tracking-widest uppercase mb-10">Muschio</h2>
            <p className="max-w-sm text-white/40 leading-relaxed text-sm">
              Subscribe to the Muschio Newsletter for early access to seasonal distillations and private atelier events.
            </p>
            <div className="mt-8 flex gap-4 border-b border-white/20 pb-4 max-w-md">
              <input type="email" placeholder="Email address" className="bg-transparent focus:outline-none w-full text-sm" />
              <ArrowRight className="w-5 h-5 cursor-pointer" />
            </div>
          </div>
          
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-widest opacity-30 font-bold">Menu</p>
            <ul className="space-y-4 text-sm font-light text-white/70">
              <li className="hover:text-white cursor-pointer transition">Store Locator</li>
              <li className="hover:text-white cursor-pointer transition">Fragrance Care</li>
              <li className="hover:text-white cursor-pointer transition">Our Story</li>
              <li className="hover:text-white cursor-pointer transition">Shipping</li>
            </ul>
          </div>
          
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-widest opacity-30 font-bold">Social</p>
            <ul className="space-y-4 text-sm font-light text-white/70">
              <li className="hover:text-white cursor-pointer transition underline decoration-white/20">Instagram</li>
              <li className="hover:text-white cursor-pointer transition">Pinterest</li>
              <li className="hover:text-white cursor-pointer transition">Vimeo</li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between pt-12 border-t border-white/5 text-[9px] tracking-[0.4em] uppercase text-white/20">
          <p>© 2025 Muschio Parfumerie Italia</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <span>Privacy</span>
            <span>Accessibility</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </main>
  );
}