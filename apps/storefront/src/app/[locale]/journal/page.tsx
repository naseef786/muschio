import React from "react";
import Image from "next/image";
import { Link } from "../../../navigation";
import { ArrowUpRight, Clock, User } from "lucide-react";

export default function JournalIndexPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

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
      categoryEn: "Layering & Haute Technique",
      categoryAr: "فن المزج والطقوس العطرية",
      image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10 space-y-10">
      {/* 1. Header */}
      <div className="pb-6 border-b border-[#E6E4DE] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="eyebrow mb-1">
            {c("HAUTE PERFUMERY ESSAYS", "مقالات وتاريخ العطور")}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#171917] font-normal">
            {c("The Muschio Journal", "مجلة موسكيو")}
          </h1>
          <p className="text-xs sm:text-sm text-[#77776F] mt-1 max-w-xl">
            {c(
              "Editorial essays on rare natural harvests, master perfumer philosophies, and traditional Gulf layering rituals.",
              "مقالات عطرية تستكشف أسرار الخلاصات الطبيعية النادرة، وفلسفة كبار صناع العطور، وطقوس التعطير الخليجية العريقة.",
            )}
          </p>
        </div>
      </div>

      {/* 2. Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/journal/${article.slug}`}
            className="group border border-[#E6E4DE] bg-white flex flex-col justify-between hover:border-[#171917] transition-all overflow-hidden"
          >
            <div className="relative aspect-[16/9] w-full bg-[#F3F1EC] overflow-hidden">
              <Image
                src={article.image}
                alt={c(article.titleEn, article.titleAr)}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 inset-inline-start-3 text-[10px] font-sans uppercase tracking-[0.14em] px-2.5 py-1 bg-white/95 text-[#171917] border border-[#E6E4DE]">
                {c(article.categoryEn, article.categoryAr)}
              </span>
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-xs text-[#77776F]">
                  <span className="flex items-center gap-1">
                    <User size={13} />
                    <span>{article.author}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    <span>{article.readingTime} {c("min read", "دقائق قراءة")}</span>
                  </span>
                </div>

                <h2 className="font-serif text-2xl text-[#171917] font-normal group-hover:underline leading-snug">
                  {c(article.titleEn, article.titleAr)}
                </h2>

                <p className="text-xs text-[#77776F] leading-relaxed line-clamp-2">
                  {c(article.excerptEn, article.excerptAr)}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E6E4DE] flex items-center justify-between text-xs text-[#171917] font-medium group-hover:text-[#46513B]">
                <span>{c("Read Essay", "اقرأ المقال")}</span>
                <ArrowUpRight size={15} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
