import React from "react";
import { Link } from "../../../navigation";
import { Sparkles, ShieldCheck, Compass, ThermometerSnowflake, Crown, ArrowRight, HeartHandshake } from "lucide-react";

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

  return (
    <div className="bg-luxury-canvas text-luxury-text min-h-screen selection:bg-accent selection:text-white font-sans">
      {/* 1. Hero Section */}
      <section className="relative border-b border-luxury-border/60 py-16 sm:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient opacity-40 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-luxury-border bg-luxury-surface text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-accent">
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
      <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs uppercase font-mono tracking-[0.2em] text-accent block font-semibold">
              {c("OUR PHILOSOPHY", "فلسفتنا العطرية")}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-luxury-text leading-snug">
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

          <div className="p-8 sm:p-10 bg-luxury-surface border border-luxury-border rounded-sm space-y-6 shadow-sm">
            <div className="border-b border-luxury-border/60 pb-4">
              <span className="font-serif text-3xl sm:text-4xl text-luxury-text block">100%</span>
              <span className="text-xs text-neutral-500 font-mono uppercase tracking-wider block mt-1">
                {c("Authentic Maison Flacons", "عطور أصلية معتمدة من الدار")}
              </span>
            </div>
            <div className="border-b border-luxury-border/60 pb-4">
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

      {/* 3. The Four Pillars */}
      <section className="py-16 sm:py-20 bg-luxury-surface border-y border-luxury-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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
                  className="p-6 bg-luxury-canvas border border-luxury-border/70 rounded-sm space-y-3 flex flex-col justify-between hover:border-luxury-border transition-colors"
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
        </div>
      </section>

      {/* 4. Sourcing & Noble Ingredients */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs uppercase font-mono tracking-[0.2em] text-accent font-semibold block">
            {c("NOBLE INGREDIENTS", "أندر المكونات العطرية")}
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-luxury-text">
            {c("The Olfactory Cartography", "خريطة استخلاص النوتات النبيلة")}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            {c(
              "We prioritize maisons that preserve regenerative farming and centuries-old distillation methods.",
              "ندعم الدور التي تحافظ على طرق التقطير التراثية والزراعة العضوية النادرة."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {origins.map((orig, i) => (
            <div
              key={i}
              className="p-6 bg-luxury-surface border border-luxury-border rounded-sm space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 text-accent text-xs font-mono">
                <Compass size={14} />
                <span>{orig.region}</span>
              </div>
              <h4 className="font-serif text-base text-luxury-text">{orig.note}</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">{orig.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Physical Salons & VIP Concierge */}
      <section className="py-16 bg-neutral-900 text-white border-t border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-3">
            <span className="text-xs uppercase font-mono tracking-[0.25em] text-[#C5A059] block">
              {c("PRIVATE APPOINTMENTS", "زيارات واستشارات خاصة")}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-white">
              {c("Experience The Atelier in Person", "تفضل بزيارة صالوناتنا العطرية")}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
              {c(
                "Private tasting salons in Downtown Dubai and Riyadh Olaya offer discreet one-on-one olfactory consultations with certified master sommeliers.",
                "تفضل بزيارة صالوناتنا في دبي والرياض لجلسة تذوق عطري خاصة واستشارة منفردة مع كبار خبراء العطور لدينا."
              )}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#C5A059] hover:bg-[#b08e4d] text-neutral-950 text-xs font-semibold uppercase tracking-[0.15em] transition-all rounded-sm shadow-md flex items-center justify-center gap-2"
            >
              <span>{c("Schedule Consultation", "حجز موعد استشارة")}</span>
              <ArrowRight size={14} />
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
