"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  MessageSquare,
  Package,
  Phone,
  Plus,
  Loader2,
} from "lucide-react";
import { Link } from "../../../navigation";
import { EditorialReveal } from "../../../components/editorial-reveal";
import styles from "../../../components/editorial-pages.module.css";

export interface ContactDetails {
  email: string;
  phone: string;
  phoneHref: string;
  whatsappUrl: string;
}

export function ContactClient({
  locale,
  contact,
}: {
  locale: "en" | "ar";
  contact: ContactDetails;
}) {
  const c = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Fragrance Recommendation");
  const [orderReference, setOrderReference] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [renderedAt, setRenderedAt] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submittedEnquiryId, setSubmittedEnquiryId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const feedbackRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);
  const orderTopic = subject === "Order Tracking & Logistics";
  useEffect(() => {
    setRenderedAt(Date.now());
  }, []);
  useEffect(() => {
    if (submittedSuccess || errorMessage) feedbackRef.current?.focus();
  }, [submittedSuccess, errorMessage]);

  const topics = [
    {
      value: "Fragrance Recommendation",
      label: c("Fragrance advice", "نصيحة عطرية"),
      hint: c(
        "Tell us about scents you enjoy, the occasion, and your preferred budget.",
        "أخبرنا بالعطور التي تحبها والمناسبة والميزانية المناسبة لك.",
      ),
    },
    {
      value: "Order Tracking & Logistics",
      label: c("My order", "طلبي"),
      hint: c(
        "Include what you need help with. Your order reference helps us find the details.",
        "وضح ما تحتاج إليه. يساعدنا رقم الطلب في الوصول إلى التفاصيل.",
      ),
    },
    {
      value: "Corporate & VIP Gifting",
      label: c("Gifting", "الهدايا"),
      hint: c(
        "Share the occasion, quantity, budget, and any date you have in mind.",
        "أخبرنا بالمناسبة والكمية والميزانية والتاريخ الذي تفكر فيه.",
      ),
    },
    {
      value: "General Inquiry",
      label: c("Something else", "استفسار آخر"),
      hint: c(
        "Tell us how we can help. Please do not include passwords or payment details.",
        "أخبرنا كيف يمكننا مساعدتك. يرجى عدم مشاركة كلمات المرور أو بيانات الدفع.",
      ),
    },
  ];
  const selectedTopic = topics.find((topic) => topic.value === subject)!;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    setErrorMessage("");
    if (honeypot) {
      setSubmittedSuccess(true);
      return;
    }
    const timeElapsed = Date.now() - renderedAt;
    if (timeElapsed < 2000) {
      setErrorMessage(
        c(
          "Please take a moment before sending your message.",
          "يرجى الانتظار لحظة قبل إرسال رسالتك.",
        ),
      );
      return;
    }
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage(
        c(
          "Please complete your name, email, and message.",
          "يرجى إدخال اسمك وبريدك الإلكتروني ورسالتك.",
        ),
      );
      return;
    }
    if ((message.match(/https?:\/\//gi) || []).length > 2) {
      setErrorMessage(
        c(
          "Please include no more than two web links.",
          "يرجى إرفاق رابطين على الأكثر.",
        ),
      );
      return;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/v1/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          subject,
          message:
            orderTopic && orderReference.trim()
              ? `Order reference: ${orderReference.trim()}\n\n${message.trim()}`
              : message.trim(),
          fragranceInterest: subject,
          _honeypot: honeypot,
          _timeElapsed: timeElapsed,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.success) {
        setErrorMessage(
          locale === "en" && typeof data?.error?.message === "string"
            ? data.error.message
            : c(
                "Your message could not be sent. Please try again or contact us directly.",
                "تعذر إرسال رسالتك. يرجى المحاولة مجدداً أو التواصل معنا مباشرة.",
              ),
        );
        return;
      }
      setSubmittedEnquiryId(data.data?.enquiryId || "");
      setSubmittedSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setOrderReference("");
    } catch {
      setErrorMessage(
        c(
          "We could not confirm receipt. Your message is still here; please check your connection and try again, or contact us directly.",
          "لم نتمكن من تأكيد الاستلام. رسالتك ما زالت محفوظة هنا؛ تحقق من الاتصال وحاول مجدداً أو تواصل معنا مباشرة.",
        ),
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  const faqs = [
    {
      q: c("Where can I check my order?", "أين أتابع طلبي؟"),
      a: c(
        "Use Track an order above, or open My Orders in your account. If you need further help, choose My order in the form and include your order reference.",
        "استخدم رابط تتبع الطلب أعلاه، أو افتح طلباتي في حسابك. لمزيد من المساعدة، اختر طلبي في النموذج وأرفق رقم الطلب.",
      ),
    },
    {
      q: c(
        "Can you help me choose a fragrance?",
        "هل يمكنكم مساعدتي في اختيار عطر؟",
      ),
      a: c(
        "Yes. Tell us a few scents you enjoy, when you plan to wear the fragrance, and your budget. You can also explore our scent notes and discovery sets to narrow down your preferences.",
        "نعم. أخبرنا ببعض الروائح التي تحبها ومتى ترغب في استخدام العطر وميزانيتك. يمكنك أيضاً استكشاف النوتات ومجموعات العينات لتحديد تفضيلاتك.",
      ),
    },
    {
      q: c(
        "How do I ask about a return or delivery?",
        "كيف أستفسر عن الإرجاع أو التوصيل؟",
      ),
      a: c(
        "Choose My order and describe the issue, including your order reference if available. For delivery destinations and options, visit our Delivery page. Our team can clarify the options that apply to your order.",
        "اختر طلبي واشرح المشكلة مع رقم الطلب إن توفر. لمعرفة وجهات وخيارات التوصيل، زر صفحة التوصيل. يمكن لفريقنا توضيح الخيارات المتاحة لطلبك.",
      ),
    },
    {
      q: c(
        "Can I arrange a gift or a larger order?",
        "هل يمكنني تنسيق هدية أو طلب بكمية أكبر؟",
      ),
      a: c(
        "Select Gifting and share your requirements, quantity, and preferred date. Our team can discuss availability and the next steps with you.",
        "اختر الهدايا وأخبرنا بمتطلباتك والكمية والتاريخ المفضل. سيتواصل فريقنا معك لمناقشة التوفر والخطوات التالية.",
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav
          aria-label={c("Breadcrumb", "مسار التصفح")}
          className={styles.crumb}
        >
          <Link href="/">{c("Home", "الرئيسية")}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{c("Contact us", "تواصل معنا")}</span>
        </nav>
        <EditorialReveal>
          <header className={styles.contactHero}>
            <span className={styles.eyebrow}>
              {c("Client care · Muschio", "خدمة العملاء · موسكيو")}
            </span>
            <h1 className={styles.title}>
              {c("A good conversation.", "حوار جميل.")}
              <em>{c("A more personal experience.", "وتجربة أقرب إليك.")}</em>
            </h1>
            <p className={styles.intro}>
              {c(
                "Choosing a fragrance, finding a gift, or checking an order? Start here. We’ll help you take the next step.",
                "تختار عطراً أو تبحث عن هدية أو تتابع طلباً؟ ابدأ من هنا. سنساعدك في الخطوة التالية.",
              )}
            </p>
          </header>
        </EditorialReveal>
        <nav
          className={styles.quickLinks}
          aria-label={c("Quick assistance", "مساعدة سريعة")}
        >
          <Link href="/track" className={styles.quickLink}>
            <Package size={22} strokeWidth={1.4} aria-hidden="true" />
            <div>
              <strong>{c("Track an order", "تتبع طلباً")}</strong>
              <span>{c("Check its latest status", "اطلع على آخر تحديث")}</span>
            </div>
            <ArrowRight size={17} className={styles.arrow} aria-hidden="true" />
          </Link>
          <a
            href={contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.quickLink}
          >
            <MessageSquare size={22} strokeWidth={1.4} aria-hidden="true" />
            <div>
              <strong>{c("Talk on WhatsApp", "تحدث عبر واتساب")}</strong>
              <span>{c("Opens in a new tab", "يفتح في نافذة جديدة")}</span>
            </div>
            <ArrowRight size={17} className={styles.arrow} aria-hidden="true" />
          </a>
          <a href="#contact-form" className={styles.quickLink}>
            <Mail size={22} strokeWidth={1.4} aria-hidden="true" />
            <div>
              <strong>{c("Send a message", "أرسل رسالة")}</strong>
              <span>{c("Tell us what you need", "أخبرنا بما تحتاج إليه")}</span>
            </div>
            <ArrowRight size={17} className={styles.arrow} aria-hidden="true" />
          </a>
        </nav>
        <div className={styles.contactGrid}>
          <EditorialReveal>
            <aside className={styles.contactAside}>
              <span className={styles.eyebrow}>
                {c("Here to help", "هنا لمساعدتك")}
              </span>
              <h2 className={styles.heading}>
                {c(
                  "The right help,\nfor your next step.",
                  "المساعدة المناسبة لخطوتك القادمة.",
                )}
              </h2>
              <p className={styles.body}>
                {c(
                  "Share a little about what you need. Whether it is a first discovery or a question about an order, our team is here to guide you.",
                  "شاركنا ما تحتاج إليه. سواء كان اكتشافك الأول أو سؤالاً عن طلب، فريقنا هنا لإرشادك.",
                )}
              </p>
              <div className={styles.channel}>
                <Mail size={19} aria-hidden="true" />
                <div>
                  <strong>{c("Email us", "راسلنا بالبريد")}</strong>
                  <a href={`mailto:${contact.email}`} dir="ltr">
                    {contact.email}
                  </a>
                </div>
              </div>
              <div className={styles.channel}>
                <Phone size={19} aria-hidden="true" />
                <div>
                  <strong>{c("Call us", "اتصل بنا")}</strong>
                  <a href={contact.phoneHref} dir="ltr">
                    {contact.phone}
                  </a>
                </div>
              </div>
              <div className={styles.note}>
                {c(
                  "For an existing order, include the order reference and use the email you checked out with. Please keep payment details and passwords out of your message.",
                  "إذا كان استفسارك عن طلب قائم، أرفق رقمه واستخدم بريد الشراء نفسه. يرجى عدم إدراج بيانات الدفع أو كلمات المرور في رسالتك.",
                )}
              </div>
              <div className={styles.actions}>
                <Link href="/delivery" className={styles.textLink}>
                  {c("Delivery information", "معلومات التوصيل")}
                  <ArrowRight
                    size={16}
                    className={styles.arrow}
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </aside>
          </EditorialReveal>
          <section
            id="contact-form"
            className={styles.formPanel}
            aria-labelledby="message-heading"
          >
            {submittedSuccess ? (
              <div
                ref={feedbackRef}
                tabIndex={-1}
                role="status"
                className={styles.success}
              >
                <CheckCircle2 size={42} strokeWidth={1.3} aria-hidden="true" />
                <h2 id="message-heading">
                  {c("Your message is with us.", "رسالتك وصلت إلينا.")}
                </h2>
                <p>
                  {c(
                    "Thank you for getting in touch. Our team will review your enquiry and reply using the contact details you shared.",
                    "شكراً لتواصلك. سيراجع فريقنا استفسارك ويرد عبر بيانات التواصل التي شاركتها.",
                  )}
                </p>
                {submittedEnquiryId && (
                  <div className={styles.reference}>
                    {c("Your reference", "رقمك المرجعي")}:{" "}
                    <bdi>{submittedEnquiryId}</bdi>
                  </div>
                )}
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => {
                      setSubmittedSuccess(false);
                      setSubmittedEnquiryId("");
                      setRenderedAt(Date.now());
                    }}
                  >
                    {c("Send another message", "أرسل رسالة أخرى")}
                  </button>
                  <Link href="/shop" className={styles.textLink}>
                    {c("Explore fragrances", "استكشف العطور")}
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h2 id="message-heading">
                  {c("How can we help?", "كيف نساعدك؟")}
                </h2>
                <p className={styles.formIntro}>
                  {c(
                    "Choose a topic and leave us a message. Fields marked * are required.",
                    "اختر موضوعاً واترك لنا رسالة. الحقول المميزة بعلامة * مطلوبة.",
                  )}
                </p>
                <form
                  onSubmit={handleSubmit}
                  className={styles.form}
                  aria-busy={isSubmitting}
                >
                  <div className="sr-only" aria-hidden="true">
                    <label htmlFor="contact-website">Leave this blank</label>
                    <input
                      id="contact-website"
                      name="_muschio_hp_check"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>
                  {errorMessage && (
                    <div
                      ref={feedbackRef}
                      tabIndex={-1}
                      role="alert"
                      className={styles.feedback}
                    >
                      {errorMessage}
                    </div>
                  )}
                  <fieldset className={styles.fieldset} disabled={isSubmitting}>
                    <legend>
                      {c("I’d like help with", "أحتاج مساعدة في")}
                    </legend>
                    <div className={styles.topics}>
                      {topics.map((topic) => (
                        <label key={topic.value} className={styles.topic}>
                          <input
                            type="radio"
                            name="subject"
                            value={topic.value}
                            checked={subject === topic.value}
                            onChange={() => setSubject(topic.value)}
                          />
                          <span>{topic.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.field}>
                        <label htmlFor="contact-name">
                          {c("Your name", "اسمك")} *
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          autoComplete="name"
                          maxLength={120}
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="contact-email">
                          {c("Email address", "البريد الإلكتروني")} *
                        </label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          dir="ltr"
                          autoComplete="email"
                          maxLength={254}
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className={orderTopic ? styles.formRow : undefined}>
                      <div className={styles.field}>
                        <label htmlFor="contact-phone">
                          {c("Phone · optional", "الهاتف · اختياري")}
                        </label>
                        <input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          dir="ltr"
                          autoComplete="tel"
                          maxLength={40}
                          placeholder="+971"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      {orderTopic && (
                        <div className={styles.field}>
                          <label htmlFor="contact-order">
                            {c(
                              "Order reference · optional",
                              "رقم الطلب · اختياري",
                            )}
                          </label>
                          <input
                            id="contact-order"
                            name="orderReference"
                            dir="ltr"
                            maxLength={100}
                            value={orderReference}
                            onChange={(e) => setOrderReference(e.target.value)}
                          />
                          <Link href="/track" className={styles.textLink}>
                            {c("Track your order", "تتبع طلبك")}
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="contact-message">
                        {c("Your message", "رسالتك")} *
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={5}
                        required
                        maxLength={4000}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        aria-describedby="message-hint"
                      />
                      <div className={styles.hint}>
                        <span id="message-hint">{selectedTopic.hint}</span>
                        <span dir="ltr" className="shrink-0">
                          {message.length}/4000
                        </span>
                      </div>
                    </div>
                    <div className={styles.submitRow}>
                      <p>
                        {c(
                          "We’ll use these details to respond to your enquiry.",
                          "سنستخدم هذه البيانات للرد على استفسارك.",
                        )}
                      </p>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={styles.button}
                      >
                        {isSubmitting ? (
                          <Loader2
                            size={17}
                            className={styles.spin}
                            aria-hidden="true"
                          />
                        ) : (
                          <ArrowRight
                            size={17}
                            className={styles.arrow}
                            aria-hidden="true"
                          />
                        )}
                        {isSubmitting
                          ? c("Sending…", "جارٍ الإرسال…")
                          : c("Send message", "إرسال الرسالة")}
                      </button>
                    </div>
                  </fieldset>
                </form>
              </>
            )}
          </section>
        </div>
        <section className={styles.section} aria-labelledby="faq-heading">
          <EditorialReveal>
            <div className={styles.faqGrid}>
              <div>
                <span className={styles.eyebrow}>
                  {c("A few helpful answers", "إجابات قد تساعدك")}
                </span>
                <h2 id="faq-heading" className={styles.heading}>
                  {c("Before you ask.", "قبل أن تسأل.")}
                </h2>
                <p className={`${styles.body} mt-5`}>
                  {c(
                    "A starting point for the questions we can help with.",
                    "نقطة بداية للأسئلة التي يمكننا مساعدتك فيها.",
                  )}
                </p>
              </div>
              <div className={styles.faqList}>
                {faqs.map((faq) => (
                  <details key={faq.q} className={styles.faq}>
                    <summary>
                      {faq.q}
                      <Plus size={19} aria-hidden="true" />
                    </summary>
                    <p>{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </EditorialReveal>
        </section>
      </div>
    </div>
  );
}
