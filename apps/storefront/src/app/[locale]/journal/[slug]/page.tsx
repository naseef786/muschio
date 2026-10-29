import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "../../../../navigation";
import { ProductCard } from "../../../../components/product-card";
import { ArrowLeft, Clock, User } from "lucide-react";
import { muschioApi } from "../../../../lib/api";

export default async function JournalDetailPage({
  params: { locale, slug },
}: {
  params: { locale: "en" | "ar"; slug: string };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const post = await muschioApi.getBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const featuredProduct = post.featuredProducts?.[0]?.product;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 space-y-10">
      {/* 1. Back link */}
      <Link
        href="/journal"
        className="inline-flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest text-luxury-muted hover:text-luxury-text transition-colors"
      >
        <ArrowLeft size={14} className="rtl:rotate-180" />
        <span>{c("Back to Journal", "العودة للمجلة")}</span>
      </Link>

      {/* 2. Article Header */}
      <div className="space-y-4">
        {post.category && (
          <span className="eyebrow text-accent">
            {c(post.category.nameEn, post.category.nameAr)}
          </span>
        )}
        <h1 className="font-serif text-3xl sm:text-5xl text-luxury-text font-normal leading-tight">
          {c(post.titleEn, post.titleAr)}
        </h1>

        <div className="flex items-center gap-6 text-xs text-luxury-muted font-sans border-y border-luxury-border py-3">
          <span className="flex items-center gap-1.5">
            <User size={13} />
            <span>{post.authorName}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} />
            <span>{post.readingTimeMinutes} {c("min read", "دقائق قراءة")}</span>
          </span>
          <span>{c("Muschio Editorial", "تحرير موسكيو")}</span>
        </div>
      </div>

      {/* 3. Hero Visual */}
      <div className="relative aspect-[16/9] w-full bg-luxury-surface2 border border-luxury-border overflow-hidden">
        <Image
          src={post.coverImageUrl || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1600&q=85"}
          alt={c(post.titleEn, post.titleAr)}
          fill
          priority
          sizes="(max-width: 896px) 100vw, 896px"
          className="object-cover"
        />
      </div>

      {/* 4. Essay Copy (Rendered from DB) */}
      <div
        className="text-luxury-text font-sans text-sm sm:text-base leading-relaxed space-y-6 prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{
          __html: isAr ? (post.contentAr || post.contentEn) : (post.contentEn || post.contentAr),
        }}
      />

      {/* 5. Featured Shoppable Fragrance Card (if linked in DB) */}
      {featuredProduct && (
        <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-8 space-y-6">
          <div>
            <span className="eyebrow mb-1">
              {c("FEATURED IN THIS STORY", "عطور مذكورة في هذا المقال")}
            </span>
            <h3 className="font-serif text-2xl text-luxury-text font-normal">
              {c(featuredProduct.nameEn, featuredProduct.nameAr)}
            </h3>
          </div>

          <div className="max-w-xs">
            <ProductCard
              slug={featuredProduct.slug}
              nameEn={featuredProduct.nameEn}
              nameAr={featuredProduct.nameAr}
              brand={featuredProduct.brand?.name || "Haute Parfumerie"}
              concentration={featuredProduct.concentration?.replaceAll("_", " ") || "Extrait de Parfum"}
              price={featuredProduct.variants?.[0]?.price || 0}
              compareAtPrice={featuredProduct.variants?.[0]?.compareAtPrice}
              variants={featuredProduct.variants}
              image={featuredProduct.images?.[0] || "/product-placeholder.svg"}
              locale={locale}
            />
          </div>
        </div>
      )}
    </div>
  );
}
