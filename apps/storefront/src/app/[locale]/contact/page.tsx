"use client";

import React, { useState, useEffect } from "react";
import { Link } from "../../../navigation";
import {
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function ContactPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Fragrance Recommendation");
  const [message, setMessage] = useState("");

  // Bot Protection & Spam Traps
  const [honeypot, setHoneypot] = useState("");
  const [renderedAt, setRenderedAt] = useState<number>(0);

  // Status & Loaders
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submittedEnquiryId, setSubmittedEnquiryId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Record render time for bot speed detection
    setRenderedAt(Date.now());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // 1. Bot Honeypot Check: If hidden field is filled, silently discard or reject
    if (honeypot) {
      console.warn("[Bot Protection] Honeypot field filled by automated bot.");
      setSubmittedSuccess(true);
      return;
    }

    // 2. Bot Time-to-Submit Check: Human cannot fill contact form in under 2 seconds
    const timeElapsed = Date.now() - renderedAt;
    if (timeElapsed < 2200) {
      console.warn("[Bot Protection] Submission arrived too quickly (< 2.2s).");
      setErrorMessage(c("Verification notice: Please take a moment before submitting.", "تنبيه التحقق: يرجى الانتظار لحظة قبل إرسال النموذج."));
      return;
    }

    // 3. Spam Check: Basic URL and character checks
    const urlMatches = (message.match(/https?:\/\//g) || []).length;
    if (urlMatches > 2) {
      setErrorMessage(c("Spam protection: Messages cannot contain excessive web links.", "حماية المحتوى: لا يُسمح بإرفاق روابط إلكترونية متعددة في الرسالة."));
      return;
    }

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage(c("Please complete all required fields.", "يرجى ملء جميع الحقول الإلزامية."));
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/v1/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          subject: subject.trim(),
          message: message.trim(),
          fragranceInterest: subject.trim(),
          _honeypot: honeypot,
          _timeElapsed: timeElapsed,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.success) {
        setSubmittedSuccess(true);
        setSubmittedEnquiryId(data?.data?.enquiryId || "");
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        setErrorMessage(
          data?.error?.message ||
            c("Unable to deliver message at this time. Please contact us directly via WhatsApp.", "تعذر إرسال الرسالة، يرجى التواصل معنا مباشرة عبر واتساب.")
        );
      }
    } catch {
      setErrorMessage(
        c("A network error occurred. Please try again or reach our WhatsApp Concierge.", "حدث خطأ في الاتصال، يرجى إعادة المحاولة أو مراسلتنا عبر واتساب.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-luxury-canvas text-luxury-text min-h-screen selection:bg-accent selection:text-white font-sans">
      {/* 1. Header Banner */}
      <section className="border-b border-luxury-border/60 py-12 sm:py-20 bg-luxury-surface/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-luxury-border bg-luxury-surface text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-accent">
            <Sparkles size={13} />
            <span>{c("VIP Concierge & Client Services", "خدمة كبار الشخصيات والاستشارات العطرية")}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-light text-luxury-text tracking-tight">
            {c("We Welcome Your Inquiry", "يسعدنا تواصلكم واستقبال استفساراتكم")}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
            {c(
              "Whether seeking personal fragrance curation, order assistance, or booking a private atelier session, our master concierges are at your service.",
              "سواء كنتم تبحثون عن استشارة عطرية مخصصة، أو استفسار عن طلبكم، أو حجز موعد خاص في صالوناتنا، خبراؤنا في خدمتكم على مدار الساعة."
            )}
          </p>
        </div>
      </section>

      {/* 2. Main Grid: Contact Channels + Submission Form */}
      <section className="py-12 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (5 cols): Direct Lines & Atelier Locations */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent block font-semibold">
                {c("DIRECT CLIENT CHANNELS", "قنوات التواصل المباشرة")}
              </span>
              <h2 className="font-serif text-2xl text-luxury-text">
                {c("Instant Assistance & Concierge", "تواصل مباشر وفوري")}
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              {/* WhatsApp VIP */}
              <a
                href="https://wa.me/97148006872?text=Hello%20Muschio%20Concierge,%20I%20would%20like%20assistance."
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800/60 rounded-sm flex items-center justify-between group hover:border-emerald-500 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <span className="font-medium text-xs text-neutral-900 dark:text-white block">
                      {c("WhatsApp VIP Concierge", "واتساب الاستشارات المباشرة")}
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-mono">
                      +971 4 800 MUSCHIO
                    </span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  {c("Active Now", "متاح الآن")}
                </span>
              </a>

              {/* Direct Telephone */}
              <a
                href="tel:+97148006872"
                className="p-4 bg-luxury-surface border border-luxury-border rounded-sm flex items-center gap-3.5 group hover:border-luxury-borderBold transition-all shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-luxury-surface2 text-luxury-text flex items-center justify-center shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="font-medium text-xs text-neutral-900 dark:text-white block">
                    {c("Atelier Telephone Line", "هاتف الدار الرسمي")}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    +971 4 800 6872446
                  </span>
                </div>
              </a>

              {/* Official Email */}
              <a
                href="mailto:concierge@muschio.luxury"
                className="p-4 bg-luxury-surface border border-luxury-border rounded-sm flex items-center gap-3.5 group hover:border-luxury-borderBold transition-all shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-luxury-surface2 text-luxury-text flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="font-medium text-xs text-neutral-900 dark:text-white block">
                    {c("Client Care Email", "البريد الإلكتروني للعملاء")}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    concierge@muschio.luxury
                  </span>
                </div>
              </a>
            </div>

            {/* Physical Ateliers */}
            <div className="p-5 bg-luxury-surface border border-luxury-border rounded-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                <MapPin size={14} />
                <span>{c("Flagship Salons", "الصالونات الحصرية")}</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-medium text-neutral-900 dark:text-white block">
                    {c("Dubai Atelier & Private Vault", "صالون دبي والأقبية الخاصة")}
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {c("Downtown Dubai & DIFC Gate Precinct, United Arab Emirates", "وسط مدينة دبي ومركز دبي المالي العالمي، الإمارات")}
                  </p>
                </div>
                <div className="pt-2 border-t border-luxury-border/60">
                  <span className="font-medium text-neutral-900 dark:text-white block">
                    {c("Riyadh Salon Privé", "صالون الرياض برايفيت")}
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {c("Al Olaya District, Riyadh, Kingdom of Saudi Arabia", "حي العليا، الرياض، المملكة العربية السعودية")}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-luxury-border/60 flex items-center gap-2 text-[11px] text-neutral-500">
                <Clock size={13} className="text-accent shrink-0" />
                <span>{c("Daily 10:00 AM – 11:00 PM (GST / AST)", "يومياً من ١٠ صباحاً حتى ١١ مساءً")}</span>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Easy Luxury Contact Form */}
          <div className="lg:col-span-7 bg-luxury-surface border border-luxury-border rounded-sm p-6 sm:p-10 shadow-sm space-y-6">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-accent font-semibold block mb-1">
                {c("SEND A DISPATCH", "إرسال رسالة للدار")}
              </span>
              <h3 className="font-serif text-2xl text-luxury-text">
                {c("Message Our Master Perfumery Team", "راسل خبراء دار موسكيو")}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                {c(
                  "We typically respond within 2 to 4 business hours via your preferred channel.",
                  "يقوم فريقنا بالرد خلال ٢ إلى ٤ ساعات عمل عبر وسيلتكم المفضلة."
                )}
              </p>
            </div>

            {submittedSuccess ? (
              <div className="p-8 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-sm text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-xl text-emerald-950 dark:text-emerald-100">
                    {c("Your Message Has Been Received", "تم استلام رسالتكم بنجاح")}
                  </h4>
                  {submittedEnquiryId && (
                    <p className="font-mono text-xs text-emerald-700 dark:text-emerald-300">
                      {c("Reference ID:", "الرقم المرجعي:")} {submittedEnquiryId}
                    </p>
                  )}
                  <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed max-w-md mx-auto pt-1">
                    {c(
                      "Our master fragrance sommelier will review your request and get in touch with you promptly.",
                      "سيقوم مستشار العطور بمراجعة طلبكم والتواصل معكم في أقرب وقت ممكن."
                    )}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSubmittedSuccess(false)}
                    className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
                  >
                    {c("Send Another Message", "إرسال رسالة أخرى")}
                  </button>
                  <Link
                    href="/shop"
                    className="px-5 py-2.5 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors inline-block"
                  >
                    {c("Explore Fragrances", "تصفح العطور")}
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                {/* Honeypot Field (Invisible to Humans, Caught by Bots) */}
                <div
                  aria-hidden="true"
                  style={{
                    opacity: 0,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: 0,
                    width: 0,
                    zIndex: -1,
                    overflow: "hidden",
                  }}
                >
                  <label htmlFor="_muschio_hp_check">Leave this field blank</label>
                  <input
                    type="text"
                    id="_muschio_hp_check"
                    name="_muschio_hp_check"
                    tabIndex={-1}
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-medium text-neutral-800 dark:text-neutral-200 block">
                      {c("Full Name", "الاسم الكامل")} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={c("e.g. Sultan Al-Qasimi", "مثال: سلطان القاسمي")}
                      className="w-full h-11 px-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-sm text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-medium text-neutral-800 dark:text-neutral-200 block">
                      {c("Email Address", "البريد الإلكتروني")} *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@muschio.ae"
                      className="w-full h-11 px-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-sm text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
                    />
                  </div>
                </div>

                {/* Phone & Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-medium text-neutral-800 dark:text-neutral-200 block">
                      {c("Contact Telephone / WhatsApp", "رقم الهاتف / واتساب")}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+971 50 123 4567"
                      className="w-full h-11 px-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-sm text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-medium text-neutral-800 dark:text-neutral-200 block">
                      {c("Purpose of Consultation", "موضوع الاستشارة")}
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full h-11 px-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-sm text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
                    >
                      <option value="Fragrance Recommendation">
                        {c("Bespoke Fragrance Recommendation", "استشارة وتوصية عطرية مخصصة")}
                      </option>
                      <option value="Order Tracking & Logistics">
                        {c("Order Tracking & White-Glove Logistics", "استفسار عن طلب وتوصيل")}
                      </option>
                      <option value="Private Atelier Appointment">
                        {c("Private Atelier Salon Appointment", "حجز موعد خاص في الصالون")}
                      </option>
                      <option value="Corporate & VIP Gifting">
                        {c("Corporate & VIP Gifting Curation", "هدايا الشركات وكبار الشخصيات")}
                      </option>
                      <option value="General Inquiry">
                        {c("General Inquiry", "استفسار عام")}
                      </option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="font-medium text-neutral-800 dark:text-neutral-200 block">
                    {c("Your Message or Consultation Details", "نص الرسالة أو تفاصيل الاستشارة")} *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={c(
                      "Please describe your olfactory preferences, occasion, or any specific maison you wish to explore...",
                      "يرجى توضيح ذوقكم العطري، المناسبة، أو أي دار ترغبون في استكشاف إبداعاتها..."
                    )}
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-sm text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Submit Button with High-End Loader */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                    <span>{c("Encrypted dispatch · Privacy assured", "إرسال مشفر ومحمي بخصوصية تامة")}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3 bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-white text-xs font-semibold uppercase tracking-[0.15em] transition-all rounded-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>{c("Transmitting to Concierge…", "جارٍ الإرسال إلى الدار…")}</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>{c("Transmit Inquiry", "إرسال الاستشارة")}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
