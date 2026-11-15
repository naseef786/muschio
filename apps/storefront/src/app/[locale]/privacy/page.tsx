import React from "react";
import { buildLocalizedMetadata, type StorefrontLocale } from "../../../lib/page-metadata";

export const dynamic = "force-dynamic";

const sections = [
  {
    title: "1. Who we are",
    body: [
      "This Privacy Policy explains how Muschio collects, uses, stores, and protects personal information when you visit muschio.ae, create an account, contact us, or place an order.",
      "Muschio is the business responsible for the website and customer service. The legal name, registered address, licence number, VAT details, and privacy contact for the operating entity must be completed here before this policy is published as final legal notice.",
    ],
  },
  {
    title: "2. Information we collect",
    body: [
      "Account and contact details: name, email address, phone number, password or session information, and communication preferences.",
      "Order and delivery details: products ordered, order number, billing information, delivery address, recipient details, delivery instructions, payment status, returns, and customer-service messages.",
      "Payment details: payment method and transaction references. Full card numbers and security codes are handled by the relevant payment provider and are not stored by Muschio.",
      "Device and usage details: IP address, browser and device type, language, approximate location from technical data, pages visited, referral information, and security logs where collected by the website or hosting systems.",
      "Preferences stored on your device: for example, locale, currency choice, cart items, wishlist items, comparison items, and recent searches. These may be stored in browser storage and are not automatically the same as an account record.",
      "Messages and requests: information you send through contact, concierge, review, or support forms, including any information you choose to include.",
    ],
  },
  {
    title: "3. How we use information",
    body: [
      "We use information to create and secure accounts, process orders and payments, prepare invoices, arrange delivery, handle returns, answer questions, provide order tracking, and send necessary service messages.",
      "We use information to keep the website working, remember preferences, improve search and shopping experiences, prevent fraud and abuse, troubleshoot technical problems, maintain audit records, and comply with legal or regulatory duties.",
      "Where permitted and with the required choice or consent, we may send marketing messages about Muschio products, launches, or offers. You can stop marketing messages using the unsubscribe option or by contacting us.",
    ],
  },
  {
    title: "4. Our reasons for processing",
    body: [
      "Depending on the situation and applicable law, we process information because it is needed to provide a service you requested, perform or prepare a contract, comply with a legal obligation, protect the website and our customers, respond to a request or complaint, or because you have given consent for a specific purpose.",
      "When we rely on consent, you may withdraw it for the future. Withdrawal does not affect processing that was lawful before withdrawal or processing that must continue for an order, legal claim, security reason, or legal obligation.",
    ],
  },
  {
    title: "5. Who may receive information",
    body: [
      "We share only the information needed for the relevant purpose with trusted service providers, such as payment providers, installment providers selected at checkout, delivery and courier partners, email providers, Cloudinary for product and media assets, hosting and database providers, security providers, and professional advisers.",
      "A provider may process information in another country. Before publication, Muschio should maintain a current provider list, confirm the locations and safeguards for international transfers, and make sure its contracts and notices meet applicable UAE requirements.",
      "We may disclose information to regulators, courts, law-enforcement authorities, or other parties where required by law or necessary to protect rights, safety, property, or the integrity of the service. We do not sell customer personal information.",
    ],
  },
  {
    title: "6. Cookies and local storage",
    body: [
      "The website uses essential technical storage and browser storage to keep the cart, wishlist, comparison list, locale, currency choice, login session, and recent searches working. Removing this storage may reset some preferences or prevent parts of the website from working correctly.",
      "If analytics, advertising, or non-essential cookies are enabled in the future, this policy and the consent controls should be updated before those tools are activated. We do not treat essential storage as marketing consent.",
    ],
  },
  {
    title: "7. Retention",
    body: [
      "We keep information only for as long as it is needed for the purpose for which it was collected, to provide services, resolve disputes, maintain security and audit records, meet accounting or legal requirements, or establish and defend legal claims.",
      "Retention periods depend on the type of information and the reason for keeping it. When information is no longer needed, we delete it, anonymise it, or securely restrict it where deletion is not immediately possible.",
    ],
  },
  {
    title: "8. Security",
    body: [
      "We use reasonable technical and organisational safeguards designed to protect information from unauthorised access, loss, misuse, alteration, or disclosure. Payment credentials are handled by payment providers rather than stored as full card details by Muschio.",
      "No online service can guarantee absolute security. Please use a unique password, keep your account details private, and contact us immediately if you suspect unauthorised account activity.",
    ],
  },
  {
    title: "9. Your choices and rights",
    body: [
      "Subject to applicable law and lawful exceptions, you may ask us for information about how your personal information is used, request access to a copy, ask us to correct inaccurate or outdated information, request deletion or restriction where available, object to certain processing including direct marketing, and withdraw consent where processing relies on consent.",
      "We may need to verify your identity before responding. We may retain information where the law requires it or where it is needed to complete an order, protect a person, investigate fraud, or establish or defend a legal claim. If you are unhappy with our response, you may contact the competent data-protection or consumer-protection authority.",
    ],
  },
  {
    title: "10. Children",
    body: [
      "The website is intended for adults who can legally purchase products. We do not knowingly collect personal information from children for independent account creation or marketing. If you believe a child has provided information to us, contact the concierge team so we can investigate and take appropriate action.",
    ],
  },
  {
    title: "11. Links and third-party services",
    body: [
      "The website may link to brand, payment, courier, social-media, or other third-party websites. Their privacy practices are controlled by their own policies. Review those policies before providing information to them.",
    ],
  },
  {
    title: "12. Updates and contact",
    body: [
      "We may update this policy when our services, providers, technology, or legal requirements change. The latest version will be posted on this page with a new effective date.",
      "For privacy questions, access or deletion requests, marketing preferences, or complaints, email concierge@muschio.luxury and include enough information for us to identify your request. You may also contact us at +971 4 800 MUSCHIO.",
    ],
  },
];

const arabicSections = [
  ["1. من نحن", "توضح سياسة الخصوصية كيفية جمع موسكيو للمعلومات الشخصية واستخدامها وتخزينها وحمايتها عند زيارة الموقع أو إنشاء حساب أو التواصل معنا أو تقديم طلب. يجب استكمال الاسم القانوني والعنوان ورقم الرخصة وبيانات الضريبة وبيانات مسؤول الخصوصية قبل النشر النهائي."],
  ["2. المعلومات التي نجمعها", "قد نجمع الاسم والبريد الإلكتروني ورقم الهاتف ومعلومات الحساب والطلبات والفوترة والتوصيل وحالة الدفع ورسائل خدمة العملاء. قد نجمع أيضاً بيانات تقنية مثل عنوان IP ونوع الجهاز واللغة وسجلات الأمان. وقد تُحفظ تفضيلات مثل اللغة والعملة وسلة المشتريات وقائمة الرغبات وعمليات البحث في متصفحك."],
  ["3. كيفية استخدام المعلومات", "نستخدم المعلومات لإنشاء الحسابات وتأمينها، ومعالجة الطلبات والدفع والتوصيل والاسترجاع، وإصدار الفواتير، والرد على الأسئلة، وتوفير تتبع الطلبات، وتحسين الموقع، ومنع الاحتيال، والامتثال للالتزامات القانونية. قد نرسل رسائل تسويقية وفق القانون وإعداداتك ويمكنك إيقافها."],
  ["4. أسباب معالجة المعلومات", "قد نعالج المعلومات لتنفيذ خدمة أو عقد طلبته، أو للامتثال لالتزام قانوني، أو لحماية الموقع والعملاء، أو للرد على طلب أو شكوى، أو بناءً على موافقتك لغرض محدد. يمكنك سحب موافقتك للمستقبل عندما تكون المعالجة قائمة عليها."],
  ["5. الجهات التي قد تستلم المعلومات", "نشارك المعلومات اللازمة فقط مع مزودي الدفع والتقسيط وشركات التوصيل والبريد الإلكتروني وCloudinary لمحتوى الوسائط ومزودي الاستضافة وقواعد البيانات ومزودي الأمان والمستشارين. قد تتم المعالجة خارج الإمارات، ويجب على موسكيو تأكيد الضمانات والعقود المطلوبة قبل النشر. لا نبيع معلومات العملاء."],
  ["6. ملفات الارتباط والتخزين المحلي", "يستخدم الموقع التخزين التقني الضروري لحفظ السلة وقائمة الرغبات والمقارنة واللغة والعملة وجلسة الدخول وعمليات البحث الأخيرة. قد يؤدي حذف هذه البيانات إلى إعادة ضبط بعض التفضيلات. يجب تحديث السياسة وأدوات الموافقة قبل تفعيل أي أدوات تحليل أو إعلانات غير ضرورية."],
  ["7. الاحتفاظ بالمعلومات", "نحتفظ بالمعلومات للمدة اللازمة لتقديم الخدمة وحل النزاعات وحماية الأمان والاحتفاظ بسجلات التدقيق والامتثال للمتطلبات القانونية أو الدفاع عن المطالبات. عندما لا تعود المعلومات ضرورية، نحذفها أو نجعلها مجهولة أو نقيد الوصول إليها بشكل آمن."],
  ["8. الأمان", "نستخدم ضمانات تقنية وتنظيمية معقولة لحماية المعلومات من الوصول غير المصرح به أو الفقدان أو سوء الاستخدام. لا توجد خدمة إلكترونية آمنة بشكل مطلق. استخدم كلمة مرور فريدة وأبلغنا فوراً عن أي نشاط غير مصرح به."],
  ["9. اختياراتك وحقوقك", "وفق القانون والاستثناءات المشروعة، يمكنك طلب معلومات عن استخدام بياناتك، والحصول على نسخة منها، وتصحيحها أو طلب حذفها أو تقييد معالجتها، والاعتراض على التسويق المباشر، وسحب الموافقة عند انطباق ذلك. قد نتحقق من هويتك ونحتفظ بمعلومات مطلوبة للطلبات أو القانون أو الأمن أو المطالبات."],
  ["10. الأطفال", "الموقع مخصص للبالغين القادرين قانونياً على الشراء. لا نقصد جمع معلومات الأطفال لإنشاء حسابات مستقلة أو للتسويق. تواصل معنا إذا اعتقدت أن طفلاً قدم معلوماته."],
  ["11. الروابط والخدمات الخارجية", "قد يحتوي الموقع على روابط لمواقع العلامات التجارية أو الدفع أو التوصيل أو التواصل الاجتماعي. تخضع هذه المواقع لسياساتها الخاصة، لذا يرجى مراجعتها قبل تقديم المعلومات."],
  ["12. التحديثات والتواصل", "قد نحدث السياسة عند تغير الخدمات أو المزودين أو التقنية أو المتطلبات القانونية. للاستفسارات أو طلبات الوصول أو الحذف أو تفضيلات التسويق، تواصل عبر concierge@muschio.luxury أو +971 4 800 MUSCHIO."],
];

export async function generateMetadata({ params }: { params: Promise<{ locale: StorefrontLocale }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    path: "/privacy",
    title: locale === "ar" ? "سياسة الخصوصية | موسكيو" : "Privacy Policy | Muschio",
    description: locale === "ar" ? "تعرف على كيفية جمع موسكيو للمعلومات الشخصية واستخدامها وحمايتها عند استخدام الموقع أو تقديم طلب." : "Learn how Muschio collects, uses, stores, and protects personal information when you use the website or place an order.",
  });
}

export default async function PrivacyPage(props: { params: Promise<{ locale: "en" | "ar" }> }) {
  const { locale } = await props.params;
  const isAr = locale === "ar";

  return (
    <article className="editorial-section min-h-[70vh]" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto">
        <header className="border-b border-luxury-border pb-10 mb-10">
          <p className="eyebrow mb-4">{isAr ? "الخصوصية والبيانات" : "Privacy & data"}</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-luxury-text leading-tight mb-5">
            {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
          </h1>
          <p className="text-base sm:text-lg text-luxury-muted leading-relaxed max-w-3xl">
            {isAr ? "نوضح هنا المعلومات التي نجمعها وكيف نستخدمها ونحميها." : "This page explains what information we collect, why we use it, and how we protect it."}
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
            ? "ملاحظة للنشر: يجب مراجعة الاسم القانوني للجهة المتحكمة بالبيانات، ومواقع المزودين، وفترات الاحتفاظ، وآلية طلبات أصحاب البيانات مع مستشار قانوني في الإمارات قبل اعتماد هذه الصفحة."
            : "Publication note: Before launch, confirm the legal data-controller identity, provider locations, retention schedule, and data-subject request process with UAE counsel."}
        </aside>
      </div>
    </article>
  );
}
