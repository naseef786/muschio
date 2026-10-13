import Image from "next/image";
import { Link } from "../../navigation";
import { ArrowUpRight } from "lucide-react";

const photo = (id: string, width = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
export default function HomePage({ params: { locale } }: { params: { locale: "en" | "ar" } }) {
  const ar = locale === "ar";
  const c = (en: string, arabic: string) => ar ? arabic : en;
  const edits = [
    { href: "/shop?search=Amouage", image: "photo-1594035910387-fea47794261f", label: c("THE EVENING EDIT", "اختيارات المساء"), title: c("Leave a little mystery.", "اترك شيئاً من الغموض."), text: c("Incense, woods, and scents that stay with you.", "بخور وأخشاب وعطور تبقى في الذاكرة.") },
    { href: "/shop?search=Baccarat", image: "photo-1523293182086-7651a899d37f", label: c("EVERYDAY SIGNATURES", "بصمتك اليومية"), title: c("Your scent. Your story.", "عطرك. حكايتك."), text: c("Find the fragrance that feels like you.", "اكتشف العطر الذي يشبهك.") },
    { href: "/discover/sets", image: "photo-1592945403244-b3fbafd7f539", label: c("THE DISCOVERY EDIT", "اختيارات الاكتشاف"), title: c("Start with curiosity.", "ابدأ بالفضول."), text: c("Explore samples before choosing your bottle.", "جرّب العينات قبل اختيار زجاجتك.") },
  ];
  return <div className="editorial-home">
    <section className="editorial-hero">
      <div className="hero-copy"><span className="eyebrow">{c("A WORLD OF SCENT, WELL DISCOVERED", "عالم من العطور يستحق الاكتشاف")}</span>
        <h1>{c("The art of", "فن")}<br /><em>{c("feeling yourself.", "أن تكون أنت.")}</em></h1>
        <p>{c("Fragrance is personal. Discover remarkable houses, unexpected notes, and the rituals that make a scent your own.", "العطر تجربة شخصية. اكتشف دور العطور الاستثنائية والنوتات المميزة والطقوس التي تجعل عطرك خاصاً بك.")}</p>
        <Link className="editorial-button" href="/shop">{c("Explore the collection", "استكشف المجموعة")}<ArrowUpRight size={18} /></Link>
        <Link className="editorial-text-link" href="/discover/ai">{c("Find your signature scent", "اكتشف عطرك المميز")} ↗</Link>
      </div>
      <div className="hero-photo"><Image src={photo("photo-1594035910387-fea47794261f", 1600)} alt={c("A fragrance still life", "زجاجة عطر")} fill priority sizes="(max-width: 760px) 100vw, 55vw" className="object-cover" /><span className="photo-caption">{c("THE MUSCHIO EDIT / NO. 01", "اختيارات موسكيو / ٠١")}</span></div>
    </section>
    <nav className="discovery-strip" aria-label={c("Discover Muschio", "استكشف موسكيو")}>{[["/brands", c("The fragrance houses", "دور العطور")], ["/notes", c("Explore by note", "اكتشف حسب النوتة")], ["/discover/sets", c("Try something new", "جرّب شيئاً جديداً")], ["/guide", c("Your fragrance guide", "دليلك إلى العطور")]].map(([href, title]) => <Link href={href!} key={href}>{title}<ArrowUpRight size={16} /></Link>)}</nav>
    <section className="editorial-section">
      <div className="section-heading"><div><span className="eyebrow">{c("CURATED FOR YOUR EVERYDAY", "مختارة لأيامك")}</span><h2>{c("Find your kind of fragrance.", "اكتشف العطر الذي يناسبك.")}</h2></div><Link className="editorial-text-link" href="/shop">{c("Shop all fragrances", "تسوق جميع العطور")} ↗</Link></div>
      <div className="edit-grid">{edits.map(edit => <Link className="edit-card" href={edit.href} key={edit.href}><div className="edit-image"><Image src={photo(edit.image, 800)} alt={edit.title} fill sizes="(max-width: 760px) 100vw, 33vw" className="object-cover" /><span className="image-arrow"><ArrowUpRight size={22} /></span></div><span className="eyebrow">{edit.label}</span><h3>{edit.title}</h3><p>{edit.text}</p></Link>)}</div>
    </section>
    <section className="ritual-section"><div className="ritual-image"><Image src={photo("photo-1547887537-6158d64c35b3")} alt={c("Fragrance ritual", "طقوس العطر")} fill sizes="(max-width: 760px) 100vw, 50vw" className="object-cover" /></div><div className="ritual-copy"><span className="eyebrow">{c("LESS GUESSWORK. MORE DISCOVERY.", "اكتشاف أكثر، تخمين أقل.")}</span><h2>{c("A signature scent starts with a small discovery.", "عطرك المميز يبدأ باكتشاف صغير.")}</h2><p>{c("Take your time. Build a five-sample discovery set and explore how each fragrance feels on your skin, through your day.", "خذ وقتك. اختر خمس عينات واكتشف كيف يتغير كل عطر على بشرتك خلال يومك.")}</p><Link className="editorial-button" href="/discover/sets">{c("Build your discovery set", "صمّم مجموعة الاكتشاف")}<ArrowUpRight size={18} /></Link></div></section>
    <section className="editorial-section"><div className="section-heading"><div><span className="eyebrow">{c("READ. EXPLORE. MAKE IT YOURS.", "اقرأ. اكتشف. اجعلها تجربتك.")}</span><h2>{c("The scent journal.", "مجلة العطور.")}</h2></div><Link className="editorial-text-link" href="/journal">{c("Visit the journal", "تصفح المجلة")} ↗</Link></div>
      <div className="journal-grid"><Link href="/journal/art-of-layering-oud-and-taif-rose" className="journal-feature"><span className="eyebrow">{c("THE ART OF LAYERING", "فن مزج العطور")}</span><h3>{c("Rose meets oud. A ritual worth knowing.", "الورد يلتقي بالعود. طقوس تستحق المعرفة.")}</h3><p>{c("Discover the Gulf tradition of fragrance layering, one beautiful note at a time.", "اكتشف التقاليد الخليجية لمزج العطور، نوتة جميلة في كل مرة.")}</p><span className="editorial-text-link">{c("Read the story", "اقرأ الحكاية")} ↗</span></Link><div className="journal-links">{[["/notes", c("What makes a fragrance feel like home?", "ما الذي يجعل العطر يشعرك بالانتماء؟"), c("THE NOTE LIBRARY", "مكتبة النوتات")], ["/guide", c("A little guide to wearing fragrance well.", "دليل بسيط للاستمتاع بالعطر."), c("SCENT SCHOOL", "مدرسة العطور")]].map(([href, title, label]) => <Link href={href!} key={href}><span className="eyebrow">{label}</span><h3>{title}</h3><ArrowUpRight size={20} /></Link>)}</div></div>
    </section>
    <section className="concierge-band"><span className="eyebrow">{c("YOUR NEXT CHAPTER", "فصلك التالي")}</span><h2>{c("Not sure where to begin?", "لا تعرف من أين تبدأ؟")}</h2><p>{c("Tell us the notes you love, the mood you want, or a memory you would like to bottle.", "أخبرنا بالنوتات التي تحبها أو المزاج الذي تبحث عنه أو ذكرى ترغب في الاحتفاظ بها.")}</p><Link className="editorial-button" href="/discover/ai">{c("Find my fragrance", "اكتشف عطري")}<ArrowUpRight size={18} /></Link></section>
  </div>;
}
