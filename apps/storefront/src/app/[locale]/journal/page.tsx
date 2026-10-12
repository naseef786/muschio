import React from "react";
import Image from "next/image";
import { Link } from "../../../navigation";
import { Badge } from "@muschio/ui";
import { ArrowRight, Clock, User } from "lucide-react";

export default function JournalIndexPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";

  const articles = [
    {
      slug: "art-of-layering-oud-and-taif-rose",
      titleEn: "The Sacred Alchemy: Layering Aged Omani Oud with Mountain Taif Rose",
      titleAr: "الكيمياء المقدسة: فن مزج العود العُماني المعتق مع ورد الطائف الجبلي",
      excerptEn:
        "Discover the centuries-old Gulf tradition of combining wild balsamic agarwood with fresh, honeyed dawn-harvested roses for royal occasions.",
      excerptAr:
        "اكتشف التقاليد الخليجية الأصيلة في مزج العود البري البلسمي مع الورد المقطوف عند بزوغ الفجر في المناسبات الملكية.",
      author: "Salim Al-Harthy",
      readingTime: 6,
      category: isAr ? "فن المزج والتعطير" : "Layering & Haute Technique",
      image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="max-w-3xl space-y-4">
        <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-accent font-medium">
          {isAr ? "مجلة العطار" : "The Perfumer's Journal"}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-zinc-900 dark:text-zinc-100 font-light">
          {isAr ? "مقالات وفنون صناعة العطور النيش" : "Haute Perfumery Essays"}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
          {isAr
            ? "استكشف أسرار الخلاصات النادرة، وتاريخ دور العطور الملكية، وفنون التعطير الخليجية المتوارثة."
            : "Editorial narratives exploring rare natural harvests, master perfumer interviews, and the rich heritage of olfactory art across the Middle East."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/journal/${article.slug}`}
            className="group border border-zinc-200 dark:border-zinc-800 bg-luxury-surface hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div className="relative h-80 w-full bg-zinc-950 overflow-hidden">
              <Image
                src={article.image}
                alt={article.titleEn}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 start-4">
                <Badge variant="gold">{article.category}</Badge>
              </div>
            </div>

            <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-[11px] text-zinc-400 font-sans">
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    <span>{article.author}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{article.readingTime} {isAr ? "دقائق قراءة" : "min read"}</span>
                  </span>
                </div>

                <h2 className="font-serif text-2xl text-zinc-900 dark:text-zinc-100 group-hover:text-accent transition-colors">
                  {isAr ? article.titleAr : article.titleEn}
                </h2>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                  {isAr ? article.excerptAr : article.excerptEn}
                </p>
              </div>

              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-sans uppercase tracking-wider text-accent font-semibold">
                <span>{isAr ? "قراءة المقال الكامل" : "Read Full Story"}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
