"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button, Badge, PriceDisplay } from "@muschio/ui";
import { Check, Gift, CheckCircle2 } from "lucide-react";
import { useCart } from "../../../../context/cart-context";

interface SampleItem {
  id: string;
  nameEn: string;
  nameAr: string;
  brand: string;
  image: string;
  notes: string[];
}

const SAMPLE_SELECTION: SampleItem[] = [
  {
    id: "sample-1",
    nameEn: "Interlude 53 Man Extrait",
    nameAr: "إنترلود 53 إكستري",
    brand: "Amouage",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80",
    notes: ["Silver Frankincense", "Cambodian Oud"],
  },
  {
    id: "sample-2",
    nameEn: "Baccarat Rouge 540 Extrait",
    nameAr: "باكارات روج 540 إكستري",
    brand: "Maison Francis Kurkdjian",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80",
    notes: ["Saffron", "Ambergris"],
  },
  {
    id: "sample-3",
    nameEn: "Elysium Pour Homme Parfum",
    nameAr: "إليزيوم بور هوم بارفان",
    brand: "Roja Parfums",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=400&q=80",
    notes: ["Calabrian Bergamot", "Leather"],
  },
  {
    id: "sample-4",
    nameEn: "Alexandria II Eau de Parfum",
    nameAr: "ألكسندريا 2 أو دي بارفان",
    brand: "Xerjoff",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80",
    notes: ["Laos Oud", "Bulgarian Rose"],
  },
  {
    id: "sample-5",
    nameEn: "Tobacco Vanille Eau de Parfum",
    nameAr: "توباكو فانيلا أو دي بارفان",
    brand: "Tom Ford",
    image: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=400&q=80",
    notes: ["Madagascar Vanilla", "Tobacco Leaf"],
  },
  {
    id: "sample-6",
    nameEn: "Royal Taif Rose Attar",
    nameAr: "ورد الطائف الملكي الخالص",
    brand: "Muschio Privé",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
    notes: ["Taif Rose", "Honeyed Accord"],
  },
];

export default function DiscoverySetsPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const [selectedSamples, setSelectedSamples] = useState<string[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);

  const toggleSample = (id: string) => {
    if (selectedSamples.includes(id)) {
      setSelectedSamples(selectedSamples.filter((s) => s !== id));
    } else {
      if (selectedSamples.length < 5) {
        setSelectedSamples([...selectedSamples, id]);
      }
    }
  };

  const { addItem } = useCart();
  const isComplete = selectedSamples.length === 5;

  const handleAddBox = async () => {
    if (isComplete) {
      setAddedToCart(true);
      await addItem({
        variantId: "set-custom-5x2ml",
        slug: "muschio-custom-discovery-box",
        title: "Bespoke 5 x 2ml Discovery Set + 100% Redeemable Voucher",
        titleAr: "صندوق العينات الاستكشافي المخصص (5 × 2 مل) + قسيمة شراء 100%",
        brand: "Muschio Curated Vault",
        price: 280,
        compareAtPrice: 350,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80",
        sizeLabel: "5 × 2ml Vials",
      });
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 text-gold-dark dark:text-gold text-[11px] font-sans uppercase tracking-[0.2em] font-medium">
          <Gift size={14} />
          <span>{isAr ? "صندوق العينات الملكي" : "Artisanal Discovery Box"}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-zinc-900 dark:text-zinc-100 font-light">
          {isAr ? "صمّم صندوقك الخاص (5 عينات × 2 مل)" : "Curate Your 5 x 2ml Discovery Set"}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
          {isAr
            ? "اختر 5 عينات رسمية بحجم 2 مل لتجربتها في منزلك. سعر الصندوق 280 درهم، ويشمل قسيمة شراء بنفس القيمة (280 درهم) تخصم تلقائياً عند شراء أي زجاجة عطر بالحجم الكامل."
            : "Select five official 2ml sample vials. Priced at 280 AED, your discovery box includes a 100% redeemable 280 AED voucher towards your first full-sized bottle."}
        </p>
      </div>

      {/* Box Status Panel */}
      <div className="sticky top-24 z-20 border border-zinc-200 dark:border-zinc-800 bg-luxury-canvas/95 backdrop-blur-md p-6 shadow-luxury flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-start">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl font-medium">
              {isAr ? `المحدد: ${selectedSamples.length} من أصل 5` : `Selected: ${selectedSamples.length} of 5 Samples`}
            </span>
            {isComplete && <CheckCircle2 size={18} className="text-emerald-500" />}
          </div>
          <p className="text-xs text-zinc-500 font-sans">
            {isComplete
              ? isAr ? "صندوقك جاهز للإضافة إلى حقيبة التسوق" : "Your discovery set is complete and ready to add"
              : isAr ? `يرجى اختيار ${5 - selectedSamples.length} عينات إضافية` : `Please select ${5 - selectedSamples.length} more samples`}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <PriceDisplay price={280} locale={locale} size="lg" />
          <Button
            onClick={handleAddBox}
            disabled={!isComplete}
            variant="accent"
            size="lg"
            className="whitespace-nowrap"
          >
            {addedToCart
              ? isAr ? "تمت الإضافة بنجاح ✓" : "Added to Bag ✓"
              : isAr ? "إضافة الصندوق إلى الحقيبة" : "Add Discovery Set to Bag"}
          </Button>
        </div>
      </div>

      {/* Available Samples Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SAMPLE_SELECTION.map((sample) => {
          const isSelected = selectedSamples.includes(sample.id);
          return (
            <div
              key={sample.id}
              onClick={() => toggleSample(sample.id)}
              className={`group cursor-pointer border p-6 transition-all duration-300 flex items-center justify-between gap-4 ${
                isSelected
                  ? "border-accent bg-accent/5 dark:bg-accent/10 shadow-sm"
                  : "border-zinc-200 dark:border-zinc-800 bg-luxury-surface hover:border-zinc-400"
              }`}
            >
              <div className="relative h-24 w-20 bg-zinc-950 overflow-hidden flex-shrink-0">
                <Image src={sample.image} alt={sample.nameEn} fill className="object-cover object-center" />
              </div>

              <div className="space-y-1.5 flex-1">
                <Badge variant="niche" className="text-[9px]">{sample.brand}</Badge>
                <h4 className="font-serif text-base text-zinc-900 dark:text-zinc-100 group-hover:text-accent transition-colors">
                  {isAr ? sample.nameAr : sample.nameEn}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {sample.notes.map((note, nIdx) => (
                    <span key={nIdx} className="text-[10px] text-zinc-500 font-sans">
                      • {note}
                    </span>
                  ))}
                </div>
              </div>

              <div
                className={`w-7 h-7 rounded-none border flex items-center justify-center transition-colors ${
                  isSelected ? "bg-accent border-accent text-white" : "border-zinc-300 dark:border-zinc-700"
                }`}
              >
                {isSelected && <Check size={16} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
