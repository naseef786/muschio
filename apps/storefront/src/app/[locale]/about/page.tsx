import React from "react";
import { Link } from "../../../navigation";
import {
  Sparkles,
  ShieldCheck,
  Compass,
  ThermometerSnowflake,
  Crown,
  ArrowRight,
  HeartHandshake,
  MapPin,
  Clock,
  Quote,
} from "lucide-react";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isAr = locale === "ar";
  return {
    title: isAr
      ? "عن دار موسكيو — قصة دار العطور النيش النادرة والفاخرة | دبي والخليج العربي"
      : "About Us — The Sanctuary of Rare Extraits & Haute Parfumerie | Muschio",
    description: isAr
      ? "تعرف على دار موسكيو للعطور النادرة. ننتقي خلاصات العطور النقية والزيوت المعتقة من أرقى الدور العالمية المعتمدة في دبي والرياض والخليج."
      : "Discover the story of Muschio Haute Parfumerie. Curating rare extraits de parfum, aged attars, and crystalline creations for connoisseurs in Dubai, Riyadh, and the GCC.",
  };
}

export default function AboutPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const pillars = [
    {
      icon: Crown,
      title: c("Pure Extrait Concentration", "خلاصات عطرية نقية ومركزة"),
      desc: c(
        "We curate creations bearing minimum 25% to 40% pure oil concentrations. Formulated with aged artisanal attars, wild Cambodian oud, Taif rose, and natural ambergris.",
        "ننتقي إبداعات عطرية بتركيز نقي يتراوح بين ٢٥٪ إلى ٤٠٪، معتقة بأندر الزيوت الطبيعية من العود الكمبودي والورد الطائفي والعنبر الأصيل."
      ),
    },
    {
      icon: ThermometerSnowflake,
      title: c("Climate-Controlled Vaults", "مستودعات مبردة ومحمية"),
      desc: c(
        "Fine fragrances are delicate living creations. Every flacon in our possession is stored in darkness at a constant 18°C to ensure zero degradation before arriving at your door.",
        "العطور الراقية إبداعات حية وحساسة. نحفظ كل زجاجة في أقبية مبردة بدرجة حرارة ثابتة ١٨ مئوية بعيداً عن الضوء لضمان بقاء ثباتها وجمالها الأصلي."
      ),
    },
    {
      icon: ShieldCheck,
      title: c("100% Verified Authenticity", "أصالة مضمونة ١٠٠٪"),
      desc: c(
        "Zero grey-market sourcing. Every extrait is obtained directly from master perfumers and authorized luxury maisons, dispatched with serial-tracked certificates.",
        "لا نتعامل إطلاقاً مع الأسواق الموازية. عطورنا تأتي مباشرة من أيدي كبار صناع العطور والدور الحصرية مع شهادة أصالة ورقم تتبع معتمد."
      ),
    },
    {
      icon: HeartHandshake,
      title: c("Bespoke Gulf Concierge", "استشارات عطرية خاصة بالخليج"),
      desc: c(
        "Our scent advisors understand the nuances of the Arabian climate, layering rituals, and seasonal evolution. We guide you to your signature olfactory aura.",
        "مستشارونا يدركون خصوصية طقس الخليج، وتقاليد مزج العطور (Layering)، وتطور النوتات لضمان اختيار الهالة العطرية التي تعبر عن حضورك."
      ),
    },
  ];

  const origins = [
    {
      region: c("Taif, Saudi Arabia", "الطائف، المملكة العربية السعودية"),
      note: c("Rose Ward Taifi", "الورد الطائفي النقي"),
      desc: c("Hand-harvested at dawn in the high-altitude Sarawat mountains.", "يُقطف يدوياً عند الفجر في جبال السروات الشاهقة."),
    },
    {
      region: c("Grasse, France", "غراس، فرنسا"),
      note: c("Jasmine Grandiflorum & May Rose", "الياسمين الملكي ووردة مايو"),
      desc: c("The world capital of extraction with centuries of artisanal craftsmanship.", "عاصمة العطور العالمية ذات القرون من التقاليد الحرفية."),
    },
    {
      region: c("Pursat, Cambodia", "بورسات، كمبوديا"),
      note: c("Wild Aged Agarwood (Oud)", "دهن العود الكمبودي المعتق"),
      desc: c("Resinous heartwood aged over three decades in artisanal distillations.", "خشب العود الراتينجي المعتق لأكثر من ثلاثة عقود."),
    },
    {
      region: c("Madagascar", "مدغشقر"),
      note: c("Bourbon Vanilla Absolute", "خلاصة فانيليا البوربون"),
      desc: c("Sun-cured orchid pods delivering deep balsamic, smoky sweetness.", "قرون الفانيليا المجففة تحت الشمس بنغمات بلسمية ساحرة."),
    },
  ];

  const milestones = [
    {
      year: "2021",
      title: c("The Private Atelier Inception", "تأسيس الصالون الخاص في دبي"),
      desc: c(
        "Conceived in Downtown Dubai as an exclusive private collector's salon, catering to bespoke perfume commissions.",
        "انطلقت الدار كصالون خاص لمتذوقي العطور النادرة في وسط مدينة دبي."
      ),
    },
    {
      year: "2023",
      title: c("Direct European Maison Alliances", "شراكات حصرية مع كبرى دور النيش"),
      desc: c(
        "Established direct importing rights with premier independent perfumers in Grasse, Milan, and London.",
        "توقيع اتفاقيات استيراد مباشرة مع كبار صناع العطور المستقلين في غراس وميلانو ولندن."
      ),
    },
    {
      year: "2024",
      title: c("Climate-Protected GCC Courier", "تدشين الشحن المبرد في الخليج"),
      desc: c(
        "Pioneered thermal-insulated constant 18°C dispatch across UAE, Saudi Arabia, Qatar, and Kuwait.",
        "إطلاق أول شبكة توصيل مبردة تضمن وصول العطور بدرجة حرارة ثابتة ١٨ مئوية في كافة دول الخليج."
      ),
    },
    {
      year: "2026",
      title: c("Digital Sanctuary & AI Sommelier", "الملاذ الرقمي ومستشار العطور الذكي"),
      desc: c(
        "Launched the global digital boutique and our proprietary AI Scent Sommelier for personalized olfactory discovery.",
        "إطلاق المنصة الرقمية المتطورة ومستشار العطور الذكي لاكتشاف التوقيع العطري المثالي."
      ),
    },
  ];

  const salons = [
    {
      city: c("Dubai Flagship Atelier", "صالون دبي الرئيسي"),
      address: c("Fashion Avenue, Level 1 · The Dubai Mall, Downtown Dubai", "جناح الأزياء، الطابق الأول · دبي مول، وسط مدينة دبي"),
      hours: c("Daily: 10:00 AM – 12:00 Midnight (GST)", "يومياً: ١٠:٠٠ صباحاً – ١٢:٠٠ منتصف الليل"),
      phone: "+971 4 800 MUSCHIO",
    },
    {
      city: c("Riyadh Salon Privé", "صالون الرياض برايفيت"),
      address: c("Centria Mall, Olaya Luxury Boulevard · Riyadh, Saudi Arabia", "سنتريا مول، بوليفارد العليا الراقي · الرياض، المملكة العربية السعودية"),
      hours: c("Sat – Thu: 10:00 AM – 11:00 PM | Fri: 2:00 PM – 11:30 PM", "السبت – الخميس: ١٠:٠٠ ص – ١١:٠٠ م | الجمعة: ٢:٠٠ م – ١١:٣٠ م"),
      phone: "+966 11 800 MUSCHIO",
    },
    {
      city: c("Doha VIP Suite", "جناح الدوحة لكبار الشخصيات"),
      address: c("Place Vendôme Mall, Canal Precinct · Lusail, Qatar", "بلاس فاندوم مول، منطقة القناة المائية · لوسيل، قطر"),
      hours: c("Sat – Wed: 10:00 AM – 10:00 PM | Thu – Fri: 10:00 AM – 11:00 PM", "السبت – الأربعاء: ١٠:٠٠ ص – ١٠:٠٠ م | الخميس والجمعة: ١٠:٠٠ ص – ١١:٠٠ م"),
      phone: "+974 4 800 MUSCHIO",
    },
  ];

  return (
    <div className="bg-luxury-canvas text-luxury-text min-h-screen selection:bg-accent selection:text-white font-sans">
      {/* 1. Hero Section */}
      <section className="relative border-b border-luxury-border/60 py-16 sm:py-24 lg:py-32 overflow-hidden bg-luxury-surface/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-luxury-border bg-luxury-surface text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-accent">
            <Sparkles size={13} />
            <span>{c("L'Atelier De Haute Parfumerie · UAE & GCC", "دار العطور النادرة والفاخرة · الخليج العربي")}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-luxury-text tracking-tight leading-[1.15]">
            {c("The Sanctuary of Rare Extraits & Crystalline Scents", "ملاذ خلاصات العطور النادرة والإبداعات الشذية")}
          </h1>

          <p className="font-serif text-base sm:text-xl text-neutral-600 dark:text-neutral-400 font-light leading-relaxed max-w-2xl mx-auto">
            {c(
              "Born in Dubai to elevate the connoisseurship of rare artisanal perfumery across the Arabian Gulf.",
              "تأسست موسكيو في دبي لترتقي بذائقة العطور النيش النادرة وتقدم تجربة تليق بعشاق الفخامة في الخليج."
            )}
          </p>
        </div>
      </section>

      {/* 2. Brand Story / Manifesto */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="md:col-span-7 space-y-5">
            <span className="text-xs uppercase font-mono tracking-[0.2em] text-accent block font-semibold">
              {c("OUR PHILOSOPHY", "فلسفتنا العطرية")}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-luxury-text leading-snug">
              {c("Where Ancient Arabian Heritage Meets Grasse Mastery", "حيث يلتقي عبق التراث العربي الأصيل بحرفية غراس الأوروبية")}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {c(
                "In the Arabian Gulf, fragrance is not merely an accessory — it is an identity, a welcome, and an intimate ritual passed down through generations. Muschio was conceived as an authentic bridge between this profound regional reverence and the world's most gifted independent perfumers.",
                "في الخليج العربي، لا يُعد العطر مجرد لمسة تجميلية، بل هو هوية، وحفاوة استقبال، وطقس أصيل يتوارثه الأجيال. وُلدت موسكيو لتكون جسراً موثوقاً يربط هذا الشغف العريق بأبرز صناع العطور النيش المستقلين حول العالم."
              )}
            </p>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {c(
                "We do not stock mass-market trends. Each flacon is selected for its extraordinary concentration, nuanced evolution on the skin, and crystalline sillage.",
                "نحن لا نقدم العطور الاستهلاكية المكررة، بل ننتقي بعناية كل زجاجة لتميزها بنقاء تركيزها العالي، وثباتها الاستثنائي، وهالتها العطرية الفريدة."
              )}
            </p>
          </div>

          <div className="md:col-span-5 p-8 sm:p-10 bg-luxury-surface border border-luxury-border rounded-sm space-y-6 shadow-sm">
            <div className="border-b border-luxury-border/60 pb-5">
              <span className="font-serif text-3xl sm:text-4xl text-luxury-text block">100%</span>
              <span className="text-xs text-neutral-500 font-mono uppercase tracking-wider block mt-1">
                {c("Direct Maison Authenticity", "أصالة مباشرة ومضمونة من الدار")}
              </span>
            </div>
            <div className="border-b border-luxury-border/60 pb-5">
              <span className="font-serif text-3xl sm:text-4xl text-luxury-text block">18°C</span>
              <span className="text-xs text-neutral-500 font-mono uppercase tracking-wider block mt-1">
                {c("Climate-Controlled Vault Preservation", "أقبية حفظ مبردة على مدار الساعة")}
              </span>
            </div>
            <div>
              <span className="font-serif text-3xl sm:text-4xl text-luxury-text block">GCC</span>
              <span className="text-xs text-neutral-500 font-mono uppercase tracking-wider block mt-1">
                {c("White-Glove Temperature Courier", "شحن مبرد فاخر لكافة دول الخليج")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Master Perfumer Quote Banner */}
      <section className="py-14 sm:py-20 border-y border-luxury-border/60 bg-luxury-surface/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <Quote size={28} className="mx-auto text-accent opacity-60" />
          <p className="font-serif text-lg sm:text-2xl text-luxury-text font-light italic leading-relaxed">
            {c(
              "\"In the warmth of the Arabian night, an authentic extrait does not evaporate — it blooms, announcing your presence before a single word is spoken.\"",
              "«في سحر ليالي الخليج، لا يتبخر العطر النقي، بل يتفتح ويزهر معلناً عن حضورك المهيب قبل أن تنطق بكلمة واحدة.»"
            )}
          </p>
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block pt-2">
            {c("Muschio Olfactory Direction · Dubai", "الإدارة الإبداعية للعطور · دار موسكيو دبي")}
          </span>
        </div>
      </section>

      {/* 4. The Four Pillars */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs uppercase font-mono tracking-[0.2em] text-accent font-semibold block">
            {c("STANDARDS OF EXCELLENCE", "معايير التميز في موسكيو")}
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-luxury-text">
            {c("The Muschio Commitments", "التزاماتنا لعملائنا في الخليج")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-luxury-surface border border-luxury-border rounded-sm space-y-3 flex flex-col justify-between hover:border-luxury-borderBold transition-colors shadow-sm"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-serif text-lg text-luxury-text">{p.title}</h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Sourcing & Noble Ingredients Cartography */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 border-t border-luxury-border/60">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs uppercase font-mono tracking-[0.2em] text-accent font-semibold block">
            {c("NOBLE INGREDIENTS", "أندر المكونات العطرية")}
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-luxury-text">
            {c("The Olfactory Cartography", "خريطة استخلاص النوتات النبيلة")}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto">
            {c(
              "We prioritize maisons that preserve regenerative farming, ethical harvesting, and centuries-old distillation methods.",
              "ندعم الدور التي تحافظ على طرق التقطير التراثية، الحصاد الأخلاقي، والزراعة العضوية النادرة."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {origins.map((orig, i) => (
            <div
              key={i}
              className="p-6 bg-luxury-surface border border-luxury-border rounded-sm space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 text-accent text-xs font-mono font-medium">
                <Compass size={14} />
                <span>{orig.region}</span>
              </div>
              <h4 className="font-serif text-base text-luxury-text">{orig.note}</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">{orig.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Heritage Journey / Milestones */}
      <section className="py-16 sm:py-24 bg-luxury-surface/40 border-t border-luxury-border/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-mono tracking-[0.2em] text-accent font-semibold block">
              {c("THE CHRONOLOGY", "مسيرة التميز")}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-luxury-text">
              {c("Milestones of Our Atelier", "محطات بارزة في رحلتنا")}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="p-6 bg-luxury-surface border border-luxury-border rounded-sm space-y-3 relative"
              >
                <span className="font-serif text-2xl sm:text-3xl font-light text-accent block">
                  {m.year}
                </span>
                <h4 className="font-serif text-sm font-medium text-luxury-text">
                  {m.title}
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Flagship Salons & Private Tasting Appointment CTA */}
      <section className="py-16 sm:py-24 bg-neutral-950 text-white border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-mono tracking-[0.25em] text-[#C5A059] block">
              {c("PHYSICAL PRESENCE", "الصالونات الحصرية")}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-white">
              {c("Experience The Atelier in Person", "تفضل بزيارة صالوناتنا العطرية")}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              {c(
                "Private tasting salons in Downtown Dubai, Riyadh, and Lusail offer discreet one-on-one olfactory consultations with certified master sommeliers.",
                "تفضل بزيارة صالوناتنا في دبي والرياض والدوحة لجلسة تذوق عطري خاصة واستشارة منفردة مع كبار خبراء العطور لدينا."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {salons.map((salon, i) => (
              <div
                key={i}
                className="p-6 rounded-sm bg-white/[0.04] border border-white/10 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#C5A059]">
                    <MapPin size={14} />
                    <span>{salon.city}</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">{salon.address}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-white/10 text-[11px] text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-[#C5A059] shrink-0" />
                    <span>{salon.hours}</span>
                  </div>
                  <div className="font-mono text-[#C5A059]">{salon.phone}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#C5A059] hover:bg-[#b08e4d] text-neutral-950 text-xs font-semibold uppercase tracking-[0.15em] transition-all rounded-sm shadow-md flex items-center justify-center gap-2"
            >
              <span>{c("Schedule Private Appointment", "حجز موعد استشارة خاصة")}</span>
              <ArrowRight size={14} className="rtl:rotate-180" />
            </Link>
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent hover:bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-[0.15em] transition-all rounded-sm flex items-center justify-center gap-2"
            >
              <span>{c("Explore The Collection", "تصفح مجموعة العطور")}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
