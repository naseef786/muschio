import Image from "next/image";
import { ArrowRight, Compass, Droplets, BookOpen } from "lucide-react";
import { Link } from "../../../navigation";
import { EditorialReveal } from "../../../components/editorial-reveal";
import styles from "../../../components/editorial-pages.module.css";

export function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const ar = locale === "ar";
  const title = ar
    ? "عن موسكيو | اكتشف عالم العطور"
    : "About Muschio | A More Personal Fragrance Discovery";
  const description = ar
    ? "تعرف على فلسفة موسكيو في اختيار العطور، واستكشف دور العطور والنوتات ومجموعات الاكتشاف."
    : "Meet Muschio. Explore our approach to fragrance, discover the houses behind the scents, and find a collection that feels personal.";
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/about`,
      languages: { "en-AE": "/en/about", "ar-AE": "/ar/about" },
    },
    openGraph: { title, description, url: `/${locale}/about`, type: "website" },
  };
}

export default function AboutPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const c = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const principles = [
    {
      title: c("Character comes first", "الشخصية أولاً"),
      text: c(
        "From a familiar signature to an unexpected composition, we bring together fragrances with a point of view. Explore each house through its individual style.",
        "من توقيع مألوف إلى تركيبة غير متوقعة، نجمع عطوراً تحمل طابعاً مميزاً. اكتشف كل دار من خلال أسلوبها الخاص.",
      ),
    },
    {
      title: c("Details make the difference", "التفاصيل تصنع الفرق"),
      text: c(
        "Notes, concentration, and size should be easy to understand. Our product pages put these details together so you can choose with more context.",
        "النوتات والتركيز والحجم تفاصيل تستحق الوضوح. تجمعها صفحات منتجاتنا لتساعدك على الاختيار بمعرفة أكبر.",
      ),
    },
    {
      title: c("Discovery is personal", "الاكتشاف تجربة شخصية"),
      text: c(
        "Your preferences, your occasion, your pace. Browse by house, explore ingredients, or ask for guidance when you would like a second opinion.",
        "ذوقك ومناسبتك ووقتك. تصفح حسب الدار، واستكشف المكونات، أو اطلب المشورة عندما ترغب في رأي يساعدك.",
      ),
    },
  ];
  const paths = [
    {
      icon: Compass,
      title: c("Follow a house", "ابدأ من الدار"),
      text: c(
        "Discover the distinctive perspective behind the fragrance. Find a familiar favourite or meet a new maison.",
        "اكتشف الرؤية التي تمنح العطر شخصيته. عُد إلى دار تحبها أو تعرّف على اسم جديد.",
      ),
      href: "/brands",
      action: c("Explore the houses", "استكشف دور العطور"),
    },
    {
      icon: Droplets,
      title: c("Start with a note", "اتبع نوتة تحبها"),
      text: c(
        "Drawn to woods, florals, or something brighter? Let the ingredients you love guide your next discovery.",
        "هل تميل إلى الأخشاب أم الأزهار أم الروائح المنعشة؟ دع المكونات التي تحبها تقود اكتشافك القادم.",
      ),
      href: "/notes",
      action: c("Browse scent notes", "تصفح النوتات"),
    },
    {
      icon: BookOpen,
      title: c("Make time to discover", "امنح الاكتشاف وقته"),
      text: c(
        "Explore discovery sets and get to know a fragrance on your own terms, before choosing a full bottle.",
        "استكشف مجموعات العينات وتعرّف على العطر بطريقتك قبل اختيار الزجاجة الكاملة.",
      ),
      href: "/discover/sets",
      action: c("Discover the sets", "اكتشف مجموعات العينات"),
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
          <span aria-current="page">{c("About Muschio", "عن موسكيو")}</span>
        </nav>
        <EditorialReveal>
          <section className={styles.hero} aria-labelledby="about-title">
            <div>
              <span className={styles.eyebrow}>
                {c("The world of Muschio", "عالم موسكيو")}
              </span>
              <h1 id="about-title" className={styles.title}>
                {c("A scent.", "عطر.")}
                <br />
                {c("A feeling.", "إحساس.")}
                <em>{c("Entirely yours.", "يشبهك تماماً.")}</em>
              </h1>
              <p className={styles.intro}>
                {c(
                  "Fragrance is one of the most personal things we wear. Muschio brings together distinctive houses and considered guidance to help you find what feels like you.",
                  "العطر من أكثر ما نرتديه تعبيراً عن شخصيتنا. تجمع موسكيو دوراً مميزة وإرشادات مدروسة لتساعدك في العثور على ما يشبهك.",
                )}
              </p>
              <div className={styles.actions}>
                <Link href="/shop" className={styles.button}>
                  {c("Explore the collection", "استكشف المجموعة")}
                  <ArrowRight
                    size={17}
                    className={styles.arrow}
                    aria-hidden="true"
                  />
                </Link>
                <a href="#our-approach" className={styles.textLink}>
                  {c("Our approach", "فلسفتنا")}
                </a>
              </div>
            </div>
            <div className={styles.visual}>
              <Image
                src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85"
                alt={c(
                  "A study of fragrance bottles and warm light",
                  "زجاجات عطر في إضاءة دافئة",
                )}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className={styles.visualCaption}>
                <span>
                  {c(
                    "Muschio · Haute parfumerie",
                    "موسكيو · عالم العطور الراقية",
                  )}
                </span>
                <p>
                  {c(
                    "A considered collection. An individual expression.",
                    "مجموعة مختارة. تعبير خاص بك.",
                  )}
                </p>
              </div>
            </div>
          </section>
        </EditorialReveal>
        <section
          id="our-approach"
          className={`${styles.section} scroll-mt-40`}
          aria-labelledby="approach-title"
        >
          <EditorialReveal>
            <div className={styles.story}>
              <div>
                <span className={styles.eyebrow}>
                  {c("Our perspective", "رؤيتنا")}
                </span>
                <h2 id="approach-title" className={styles.heading}>
                  {c("More than a finishing touch.", "أكثر من لمسة أخيرة.")}
                </h2>
              </div>
              <div>
                <p className={styles.body}>
                  {c(
                    "A fragrance can mark an occasion, recall a place, or become part of an everyday ritual. In the Gulf, it is also a language of welcome and an expression of identity.",
                    "قد يرافق العطر مناسبة، أو يستحضر مكاناً، أو يصبح جزءاً من طقوسك اليومية. وفي الخليج، هو أيضاً لغة ترحيب وتعبير عن الهوية.",
                  )}
                </p>
                <p className={styles.body}>
                  {c(
                    "We approach our collection with that same sense of curiosity. Muschio brings niche perfumery and designer creations into one place, with different ways to explore and space to find your own preference.",
                    "نتعامل مع مجموعتنا بروح الفضول ذاتها. تجمع موسكيو عطور النيش وإبداعات المصممين في مكان واحد، مع طرق متنوعة للاستكشاف ومساحة لتجد ما تفضله.",
                  )}
                </p>
              </div>
            </div>
            <div className={styles.principles}>
              {principles.map((item, index) => (
                <article key={item.title} className={styles.principle}>
                  <span className={styles.number} aria-hidden="true">
                    0{index + 1}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </EditorialReveal>
        </section>
      </div>
      <section
        className={`${styles.section} ${styles.journey}`}
        aria-labelledby="discovery-title"
      >
        <div className={styles.container}>
          <EditorialReveal>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>
                  {c("Find your starting point", "اختر نقطة البداية")}
                </span>
                <h2 id="discovery-title" className={styles.heading}>
                  {c(
                    "There is no single way to discover.",
                    "للاكتشاف أكثر من طريق.",
                  )}
                </h2>
              </div>
              <p className={styles.body}>
                {c(
                  "Begin with what draws you in. Let your curiosity do the rest.",
                  "ابدأ بما يجذبك، ودع فضولك يقود بقية الرحلة.",
                )}
              </p>
            </div>
            <div className={styles.discoveryGrid}>
              {paths.map(({ icon: Icon, ...path }) => (
                <Link
                  key={path.href}
                  href={path.href}
                  className={styles.discoveryCard}
                >
                  <Icon size={27} strokeWidth={1.3} aria-hidden="true" />
                  <h3>{path.title}</h3>
                  <p>{path.text}</p>
                  <span className={styles.cardAction}>
                    {path.action}
                    <ArrowRight
                      size={17}
                      className={styles.arrow}
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </EditorialReveal>
        </div>
      </section>
      <div className={styles.container}>
        <EditorialReveal>
          <section
            className={styles.invitation}
            aria-labelledby="about-contact-title"
          >
            <div>
              <span className={styles.eyebrow}>
                {c("A little guidance", "قليل من الإرشاد")}
              </span>
              <h2 id="about-contact-title" className={styles.heading}>
                {c(
                  "Let’s find your next favourite.",
                  "لنكتشف عطرك المفضل القادم.",
                )}
              </h2>
              <p>
                {c(
                  "Tell us what you enjoy, what you are looking for, or who you are choosing for. Start a conversation with our team.",
                  "أخبرنا بما تحب، وما تبحث عنه، أو لمن تختار العطر. ابدأ حواراً مع فريقنا.",
                )}
              </p>
            </div>
            <Link href="/contact" className={styles.button}>
              {c("Talk to us", "تحدث معنا")}
              <ArrowRight
                size={17}
                className={styles.arrow}
                aria-hidden="true"
              />
            </Link>
          </section>
        </EditorialReveal>
      </div>
    </div>
  );
}
