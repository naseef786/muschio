import React from "react";
import { buildLocalizedMetadata, type StorefrontLocale } from "../../../lib/page-metadata";

export const dynamic = "force-dynamic";

const sections = [
  {
    title: "1. About these terms",
    body: [
      "These Terms and Conditions explain how you may use the Muschio website, place an order, and receive products from us. By using the website or placing an order, you agree to these terms. If you do not agree, please do not use the website.",
      "Muschio is a fragrance retailer serving customers in the United Arab Emirates and selected GCC destinations. The legal name, licence number, registered address, and VAT details of the operating entity should be shown on your invoice and completed here before publication.",
    ],
  },
  {
    title: "2. Eligibility and account use",
    body: [
      "You must be legally able to enter into a contract in your country of residence. If you create an account, you are responsible for keeping your login details private and for activity carried out through your account.",
      "Please give us accurate contact, delivery, and billing information. Tell us promptly if any information changes. We may suspend an account or refuse an order where we reasonably suspect fraud, misuse, or a security risk.",
    ],
  },
  {
    title: "3. Products and fragrance information",
    body: [
      "We aim to describe each product accurately, including its brand, size, concentration, ingredients or notes where available, images, price, and availability. Product colours and packaging may appear slightly different on different screens.",
      "Fragrance performance varies by person, skin, climate, storage, and application. Product descriptions and scent notes are provided for guidance and are not a guarantee of a particular result. Check the product label and follow the manufacturer's safety instructions before use.",
      "Do not use a fragrance if you know you are allergic or sensitive to any ingredient. Keep products away from children, eyes, heat, and open flame unless the product instructions say otherwise.",
    ],
  },
  {
    title: "4. Prices, VAT, and availability",
    body: [
      "Prices are shown in AED unless another currency is clearly displayed. Applicable taxes, delivery charges, and any other costs will be shown before you submit your order. Prices and availability may change, but a change will not alter an order we have already accepted except where required to correct an obvious error.",
      "We may limit quantities or correct an obvious pricing, description, or availability error. If an error affects an order you have placed, we will contact you and give you the option to confirm the corrected order or receive a refund for the affected item.",
    ],
  },
  {
    title: "5. Orders and acceptance",
    body: [
      "When you submit an order, you are making an offer to buy the selected products. You will receive an order acknowledgement, but that acknowledgement does not by itself mean the order has been accepted. An order is accepted when we confirm it for fulfilment or dispatch it.",
      "We may decline or cancel an order where a product is unavailable, payment cannot be authorised, delivery information is incomplete, fraud controls are triggered, or an obvious error has occurred. If we cancel after payment, we will arrange a refund to the original payment method, subject to the payment provider's processing time.",
      "Please check your order confirmation as soon as you receive it. Contact the concierge team immediately if an address, product, quantity, or contact detail is incorrect.",
    ],
  },
  {
    title: "6. Payment",
    body: [
      "We accept the payment methods shown at checkout. Card payments are processed by our payment provider; Muschio does not receive or store your full card number. Your payment provider may apply its own terms, verification steps, or processing times.",
      "For cash-on-delivery orders, payment is due to the courier at delivery where that option is available. An order may be cancelled or restricted if payment is not completed or if repeated failed deliveries create a security or operational concern.",
    ],
  },
  {
    title: "7. Delivery and receipt",
    body: [
      "We deliver to the destinations and addresses shown at checkout. Delivery estimates are guidance, not a guarantee, because timing can be affected by customs, weather, public holidays, courier capacity, incorrect details, or events outside our reasonable control.",
      "You are responsible for providing a safe and accessible delivery address and for checking the parcel when it arrives. If the parcel appears damaged, record the condition with the courier where possible and contact us promptly with photographs and your order number.",
      "Risk in the products passes to you when you, or a person you nominate, receives the delivery, except where applicable law requires otherwise.",
    ],
  },
  {
    title: "8. Returns, refunds, and damaged items",
    body: [
      "Returns and refunds are handled under our published return policy and applicable UAE consumer-protection rules. Some products may be excluded from return for hygiene, safety, or tamper-related reasons once opened or used. The applicable return conditions will be communicated before or with your order.",
      "If you receive the wrong product, a defective product, or a product damaged in transit, contact us as soon as possible at concierge@muschio.luxury with your order number, a description of the issue, and supporting photographs. We will assess the issue and provide an appropriate remedy, which may include replacement, repair where applicable, or refund.",
      "Nothing in these terms limits any consumer right or remedy that cannot legally be excluded or restricted.",
    ],
  },
  {
    title: "9. Promotions and discount codes",
    body: [
      "Promotions may have additional conditions, including an expiry date, eligible products, minimum spend, quantity limit, or non-combinable offers. Those conditions will be shown with the promotion. We may withdraw a promotion where required by law or where misuse is detected, without affecting an order already accepted.",
    ],
  },
  {
    title: "10. Website content and intellectual property",
    body: [
      "The Muschio name, logo, photographs, product content, design, text, and software are owned by or licensed to Muschio and are protected by applicable intellectual-property laws. You may use the website for personal, non-commercial shopping only.",
      "You must not copy, scrape, reproduce, sell, modify, reverse engineer, or commercially exploit website content without written permission. You must not interfere with the website, introduce malicious code, or use it to conduct unlawful activity.",
    ],
  },
  {
    title: "11. Privacy and communications",
    body: [
      "Our Privacy Policy explains how we collect, use, protect, and retain personal information. By placing an order, you agree that we may use the information needed to process payment, fulfil delivery, provide support, prevent fraud, and meet legal obligations.",
      "We may send service messages about your account or order. Marketing messages are handled according to applicable law and your communication preferences. You can unsubscribe from marketing messages at any time, but service messages may still be sent when necessary to complete or support an order.",
    ],
  },
  {
    title: "12. Service availability and liability",
    body: [
      "We work to keep the website accurate, secure, and available, but we cannot promise that it will always be uninterrupted or error-free. We may change, suspend, or maintain parts of the website when reasonably necessary.",
      "To the extent allowed by law, Muschio is not responsible for loss caused by events outside our reasonable control, misuse of a product, inaccurate information supplied by you, or unauthorised use of your account. Nothing in these terms excludes liability that cannot legally be excluded, including mandatory consumer rights or liability for fraud or personal injury caused by negligence.",
    ],
  },
  {
    title: "13. Complaints and contact",
    body: [
      "If something goes wrong, please contact our concierge team first so we can investigate and resolve it promptly. Include your order number, contact details, and a clear description of the issue.",
      "Email: concierge@muschio.luxury · Phone: +971 4 800 MUSCHIO",
    ],
  },
  {
    title: "14. Governing law and updates",
    body: [
      "These terms are intended to be governed by the laws of the United Arab Emirates and the applicable laws of the emirate in which the operating entity is licensed, subject to any mandatory consumer protections that apply to you. Courts with proper jurisdiction will handle disputes unless the parties agree another lawful process.",
      "We may update these terms when our services, legal requirements, or business processes change. The updated version will be posted on this page with a new effective date. The terms in force when we accept your order will apply to that order.",
    ],
  },
];

const arabicSections = [
  ["1. حول هذه الشروط", "توضح هذه الشروط كيفية استخدام موقع موسكيو وإتمام الطلبات واستلام المنتجات. باستخدام الموقع أو تقديم طلب، فإنك توافق على هذه الشروط. إذا لم توافق عليها، يرجى عدم استخدام الموقع."],
  ["2. الأهلية واستخدام الحساب", "يجب أن تكون مؤهلاً قانونياً لإبرام عقد في بلد إقامتك. إذا أنشأت حساباً، فأنت مسؤول عن حماية بيانات الدخول وتقديم معلومات صحيحة للتواصل والفوترة والتوصيل."],
  ["3. المنتجات ومعلومات العطور", "نسعى إلى عرض معلومات دقيقة عن المنتجات، بما في ذلك العلامة والحجم والتركيز والصور والتوفر. قد تختلف الألوان والتغليف قليلاً حسب الشاشة. يختلف أداء العطر من شخص لآخر، ويجب اتباع تعليمات السلامة الموجودة على المنتج."],
  ["4. الأسعار والضريبة والتوفر", "تظهر الأسعار بالدرهم الإماراتي ما لم يذكر خلاف ذلك. ستظهر الضرائب ورسوم التوصيل والتكاليف الأخرى قبل تأكيد الطلب. قد تتغير الأسعار والتوفر، ولا يؤثر ذلك على الطلبات التي تم قبولها، باستثناء تصحيح خطأ واضح."],
  ["5. الطلبات والقبول", "عند إرسال الطلب، تقدم عرضاً لشراء المنتجات. يصبح الطلب مقبولاً عند تأكيده للتجهيز أو شحنه. قد نرفض أو نلغي الطلب عند عدم توفر المنتج أو فشل الدفع أو وجود معلومات ناقصة أو سبب أمني، مع رد المبلغ عند الاقتضاء."],
  ["6. الدفع", "نقبل وسائل الدفع الظاهرة في صفحة الدفع. تتم معالجة البطاقات من خلال مزود الدفع ولا تحتفظ موسكيو برقم بطاقتك الكامل. عند توفر الدفع عند الاستلام، يكون المبلغ مستحقاً لمندوب التوصيل."],
  ["7. التوصيل والاستلام", "نوصل إلى الوجهات والعناوين الظاهرة عند الدفع. مواعيد التوصيل تقديرية وقد تتأثر بالجمارك والطقس والعطلات وقدرة شركة التوصيل. يجب تقديم عنوان آمن ومتاح وفحص الطرد عند استلامه."],
  ["8. الإرجاع والاسترداد والمنتجات التالفة", "تتم معالجة الإرجاع والاسترداد وفق سياسة الإرجاع المنشورة وقواعد حماية المستهلك المطبقة في الإمارات. إذا وصل المنتج خاطئاً أو معيباً أو تالفاً، تواصل معنا سريعاً عبر البريد مع رقم الطلب والصور. لا تحد هذه الشروط من أي حق للمستهلك لا يجوز استبعاده قانوناً."],
  ["9. العروض ورموز الخصم", "قد تتضمن العروض شروطاً إضافية مثل تاريخ الانتهاء أو حد أدنى للطلب أو منتجات مؤهلة. ستظهر هذه الشروط مع العرض."],
  ["10. محتوى الموقع والملكية الفكرية", "اسم موسكيو وشعاره وصوره ونصوصه وتصميمه وبرمجياته مملوكة لموسكيو أو مرخصة لها. يسمح باستخدام الموقع للتسوق الشخصي فقط، ولا يجوز نسخ المحتوى أو استغلاله تجارياً دون إذن."],
  ["11. الخصوصية والتواصل", "توضح سياسة الخصوصية كيفية جمع المعلومات واستخدامها وحمايتها والاحتفاظ بها. نستخدم المعلومات اللازمة للدفع والتوصيل والدعم ومنع الاحتيال والالتزامات القانونية. يمكن إلغاء الرسائل التسويقية، بينما قد تستمر رسائل الخدمة الخاصة بالطلب."],
  ["12. توفر الخدمة والمسؤولية", "نسعى إلى إبقاء الموقع دقيقاً وآمناً ومتاحاً، لكن لا نضمن عدم انقطاعه. لا تستبعد هذه الشروط أي مسؤولية أو حق للمستهلك لا يجوز استبعاده قانوناً."],
  ["13. الشكاوى والتواصل", "يرجى التواصل مع فريق الكونسيرج أولاً لحل أي مشكلة بسرعة. البريد الإلكتروني: concierge@muschio.luxury · الهاتف: +971 4 800 MUSCHIO"],
  ["14. القانون والتحديثات", "تهدف هذه الشروط إلى الخضوع لقوانين دولة الإمارات والقوانين المطبقة في الإمارة التي ترخص الكيان المشغل، مع مراعاة حقوق المستهلك الإلزامية. قد نحدث الشروط عند تغير الخدمات أو المتطلبات القانونية، وسيظهر تاريخ النفاذ الجديد على هذه الصفحة."],
];

export async function generateMetadata({ params }: { params: Promise<{ locale: StorefrontLocale }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    path: "/terms",
    title: locale === "ar" ? "الشروط والأحكام | موسكيو" : "Terms & Conditions | Muschio",
    description: locale === "ar" ? "اقرأ شروط استخدام موقع موسكيو وشراء العطور والدفع والتوصيل والإرجاع." : "Read the Muschio terms for using the website, ordering fragrances, payment, delivery, returns, and customer rights.",
  });
}

export default async function TermsPage(props: { params: Promise<{ locale: "en" | "ar" }> }) {
  const { locale } = await props.params;
  const isAr = locale === "ar";

  return (
    <article className="editorial-section min-h-[70vh]" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto">
        <header className="border-b border-luxury-border pb-10 mb-10">
          <p className="eyebrow mb-4">{isAr ? "معلومات قانونية" : "Legal information"}</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-luxury-text leading-tight mb-5">
            {isAr ? "الشروط والأحكام" : "Terms & Conditions"}
          </h1>
          <p className="text-base sm:text-lg text-luxury-muted leading-relaxed max-w-3xl">
            {isAr ? "توضح هذه الصفحة قواعد استخدام موقع موسكيو وشراء المنتجات منه." : "These terms explain the rules for using Muschio and buying products from us."}
          </p>
          <p className="text-sm text-luxury-muted mt-5">
            {isAr ? "تاريخ النفاذ: 15 نوفمبر 2026" : "Effective date: 15 November 2026"}
          </p>
        </header>

        <div className="space-y-10 text-base leading-8 text-luxury-text">
          {isAr
            ? arabicSections.map(([title, body]) => (
                <section key={title}>
                  <h2 className="font-serif text-2xl sm:text-3xl mb-3">{title}</h2>
                  <p className="text-luxury-muted">{body}</p>
                </section>
              ))
            : sections.map((section) => (
                <section key={section.title}>
                  <h2 className="font-serif text-2xl sm:text-3xl mb-3">{section.title}</h2>
                  <div className="space-y-3 text-luxury-muted">
                    {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                </section>
              ))}
        </div>

        <aside className="mt-12 p-5 sm:p-6 border border-accent/30 bg-accent/5 text-sm leading-7 text-luxury-muted">
          {isAr
            ? "ملاحظة للنشر: يجب على الجهة المشغلة مراجعة الاسم القانوني ورقم الرخصة والعنوان المسجل وسياسة الإرجاع النهائية مع مستشار قانوني في الإمارات قبل اعتماد هذه الصفحة." 
            : "Publication note: Before launch, the operating entity should have the legal name, licence number, registered address, final return policy, and this wording reviewed by UAE counsel."}
        </aside>
      </div>
    </article>
  );
}
