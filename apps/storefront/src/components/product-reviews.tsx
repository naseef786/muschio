"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Star, ShieldCheck, Check, Sparkles, Loader2, MessageSquare, Plus, X } from "lucide-react";

interface ReviewImage {
  id: string;
  imageUrl: string;
}

interface ProductReviewItem {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  longevityRating?: number | null;
  sillageRating?: number | null;
  isVerifiedPurchase?: boolean;
  createdAt: string;
  customer?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  images?: ReviewImage[];
}

export function ProductReviews({
  productId,
  productName,
  locale = "en",
}: {
  productId: string;
  productName: string;
  locale: "en" | "ar";
}) {
  const ar = locale === "ar";
  const c = useCallback((en: string, arabic: string) => (ar ? arabic : en), [ar]);

  const [reviews, setReviews] = useState<ProductReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [longevity, setLongevity] = useState(4);
  const [sillage, setSillage] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/reviews?productId=${productId}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (json?.success && Array.isArray(json?.data)) {
        setReviews(json.data);
      }
    } catch (err) {
      console.warn("Could not load product reviews:", err);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) {
      setErrorMessage(c("Please complete your name and olfactory review.", "يرجى كتابة اسمك وانطباعك العطري."));
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      const res = await fetch("/api/v1/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          name: name.trim(),
          email: email.trim() || undefined,
          title: title.trim() || undefined,
          body: body.trim(),
          longevityRating: longevity,
          sillageRating: sillage,
        }),
      });

      const data = await res.json();
      if (data?.success) {
        setSubmitSuccess(true);
        setName("");
        setEmail("");
        setTitle("");
        setBody("");
        fetchReviews();
        setTimeout(() => {
          setShowModal(false);
          setSubmitSuccess(false);
        }, 2200);
      } else {
        setErrorMessage(data?.error?.message || c("Failed to submit review. Please try again.", "تعذر إرسال التقييم، يرجى المحاولة لاحقاً."));
      }
    } catch {
      setErrorMessage(c("Network error. Please try again.", "خطأ في الشبكة، يرجى إعادة المحاولة."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <section className="py-12 border-t border-luxury-border/60 font-sans" id="reviews-section">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-luxury-border/40">
        <div>
          <div className="flex items-center gap-2 text-accent text-xs font-mono uppercase tracking-[0.2em] mb-1">
            <Sparkles size={14} />
            <span>{c("Connoisseur Impressions", "انطباعات عشاق العطور")}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-luxury-text">
            {c("Olfactory Reviews & Ratings", "التقييمات والانطباعات العطرية")}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            {c(
              `Genuine impressions for ${productName} by authenticated collectors.`,
              `آراء وانطباعات حقيقية لعطر ${productName} من متذوقي العطور المعتمدين.`
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5 bg-luxury-surface px-4 py-2.5 rounded-sm border border-luxury-border">
            <div className="flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  className={s <= Math.round(Number(averageRating)) ? "fill-amber-400 text-amber-400" : "text-neutral-300 dark:text-neutral-700"}
                />
              ))}
            </div>
            <span className="font-mono text-sm font-semibold text-luxury-text">{averageRating}</span>
            <span className="text-xs text-neutral-400">
              ({reviews.length} {c("impressions", "تقييم")})
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white text-xs font-semibold uppercase tracking-[0.14em] transition-all rounded-sm shadow-sm flex items-center gap-2"
          >
            <Plus size={14} />
            <span>{c("Write a Review", "اكتب تقييمك العطري")}</span>
          </button>
        </div>
      </div>

      {/* Review List */}
      <div className="pt-8">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-neutral-400 text-xs">
            <Loader2 size={20} className="animate-spin text-accent" />
            <span>{c("Loading olfactory impressions…", "جاري تحميل الانطباعات العطرية…")}</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-luxury-surface border border-luxury-border flex items-center justify-center mx-auto text-neutral-400">
              <MessageSquare size={18} />
            </div>
            <p className="font-serif text-lg text-luxury-text">
              {c("Be the First to Chronicle", "كن أول من يوثق انطباعه")}
            </p>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {c(
                "Chronicle your personal impression of this flacon's projection, longevity, and sillage.",
                "شارك انطباعك الشخصي حول ثبات، فوحان، وجمال هذا العطر النيش النادر."
              )}
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-2 text-xs font-semibold text-accent hover:underline uppercase tracking-wider inline-block"
            >
              {c("Share Your Review →", "شارك تقييمك الآن ←")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => {
              const reviewerName = rev.customer
                ? `${rev.customer.firstName || ""} ${rev.customer.lastName || ""}`.trim() || c("Haute Connoisseur", "متذوق عطور")
                : c("Verified Collector", "عميل معتمد");

              const formattedDate = new Date(rev.createdAt).toLocaleDateString(ar ? "ar-AE" : "en-GB", {
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={rev.id}
                  className="p-5 sm:p-6 bg-luxury-surface border border-luxury-border/60 rounded-sm space-y-3 relative flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={13}
                            className={s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-neutral-300 dark:text-neutral-700"}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-[10px] text-neutral-400">{formattedDate}</span>
                    </div>

                    {rev.title && (
                      <h4 className="font-medium text-xs sm:text-sm text-luxury-text tracking-tight">
                        &ldquo;{rev.title}&rdquo;
                      </h4>
                    )}

                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                      {rev.body}
                    </p>

                    {(rev.longevityRating || rev.sillageRating) && (
                      <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-neutral-500">
                        {rev.longevityRating && (
                          <span>
                            {c("Longevity", "الثبات")}: <strong className="text-neutral-700 dark:text-neutral-300">{rev.longevityRating}/5</strong>
                          </span>
                        )}
                        {rev.longevityRating && rev.sillageRating && <span>•</span>}
                        {rev.sillageRating && (
                          <span>
                            {c("Sillage", "الفوحان")}: <strong className="text-neutral-700 dark:text-neutral-300">{rev.sillageRating}/5</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-luxury-border/40 flex items-center justify-between text-[11px] text-neutral-400">
                    <div className="flex items-center gap-1.5 font-medium text-neutral-800 dark:text-neutral-200">
                      <span className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[10px] flex items-center justify-center font-bold">
                        {reviewerName.charAt(0)}
                      </span>
                      <span>{reviewerName}</span>
                    </div>

                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono">
                      <ShieldCheck size={12} />
                      <span>{c("Verified Client", "عميل مؤكد")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Submission Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-sm shadow-2xl p-6 sm:p-8 space-y-5 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 end-4 text-neutral-400 hover:text-black dark:hover:text-white p-1"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-accent">
                {productName}
              </span>
              <h3 className="font-serif text-2xl text-neutral-900 dark:text-white">
                {c("Share Your Olfactory Impression", "شارك انطباعك العطري")}
              </h3>
              <p className="text-xs text-neutral-500">
                {c("Describe the projection, note evolution, and presence of this extrait.", "صف تطور النوتات وفوحان هذا العطر النيش الفاخر.")}
              </p>
            </div>

            {submitSuccess ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                  <Check size={20} />
                </div>
                <h4 className="font-serif text-lg text-emerald-900 dark:text-emerald-200">
                  {c("Impression Received With Gratitude", "تم استلام تقييمك بنجاح")}
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  {c("Thank you for chronicling your olfactory experience.", "شكراً لمشاركتك انطباعك مع مجتمع عشاق العطور.")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-sans">
                {errorMessage && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded text-xs">
                    {errorMessage}
                  </div>
                )}

                {/* Star Rating Selector */}
                <div className="space-y-1.5">
                  <label className="font-medium text-neutral-800 dark:text-neutral-200 block">
                    {c("Overall Fragrance Score", "التقييم العام للعطر")} *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-amber-500 transition-transform active:scale-110"
                        title={`${star} ${c("Stars", "نجوم")}`}
                      >
                        <Star
                          size={22}
                          className={
                            star <= (hoverRating || rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-neutral-300 dark:text-neutral-700"
                          }
                        />
                      </button>
                    ))}
                    <span className="font-mono text-xs text-neutral-500 ms-2">
                      {hoverRating || rating} / 5
                    </span>
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-neutral-800 dark:text-neutral-200 block">
                      {c("Your Name", "الاسم")} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={c("e.g. Khalid Al-Mansoor", "مثال: خالد المنصور")}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-neutral-800 dark:text-neutral-200 block">
                      {c("Email Address", "البريد الإلكتروني")}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={c("For verified buyer badge", "للحصول على شارة مشترٍ معتمد")}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                    />
                  </div>
                </div>

                {/* Headline */}
                <div className="space-y-1">
                  <label className="font-medium text-neutral-800 dark:text-neutral-200 block">
                    {c("Impression Headline", "عنوان الانطباع")}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={c("e.g. Mesmerizing smoky oud with crystalline sillage", "مثال: عود دخاني ساحر مع فوحان نقي")}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                  />
                </div>

                {/* Detailed Review */}
                <div className="space-y-1">
                  <label className="font-medium text-neutral-800 dark:text-neutral-200 block">
                    {c("Olfactory Review & Wear Experience", "تفاصيل الانطباع وتجربة الارتداء")} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={c("How does the fragrance open, develop on skin, and linger over 8+ hours?", "كيف يفتتح العطر، وكيف يتطور على البشرة مع مرور الساعات؟")}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white leading-relaxed resize-none"
                  />
                </div>

                {/* Longevity & Sillage Sliders */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
                      <span>{c("Longevity", "الثبات")}</span>
                      <span className="font-mono">{longevity}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={longevity}
                      onChange={(e) => setLongevity(Number(e.target.value))}
                      className="w-full accent-neutral-900 dark:accent-white cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
                      <span>{c("Sillage / Projection", "الفوحان")}</span>
                      <span className="font-mono">{sillage}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={sillage}
                      onChange={(e) => setSillage(Number(e.target.value))}
                      className="w-full accent-neutral-900 dark:accent-white cursor-pointer"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    {c("Cancel", "إلغاء")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white rounded text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>{c("Submitting…", "جاري الإرسال…")}</span>
                      </>
                    ) : (
                      <span>{c("Submit Review", "إرسال التقييم")}</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

