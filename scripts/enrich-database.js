const path = require('path');
const { PrismaClient } = require(path.resolve(__dirname, '../apps/api/node_modules/@prisma/client'));
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Muschio Backend Database Enrichment...');

  // 1. Clean up test / duplicate brands
  await prisma.brand.deleteMany({
    where: {
      slug: { in: ['yyyy', 'amouage-1019', 'acqua-di-parma-4056'] }
    }
  }).catch((e) => console.warn('Could not remove test brands:', e.message));

  // 2. Ensure Muschio Privé brand exists for discovery sets and bespoke house creations
  const brandMuschio = await prisma.brand.upsert({
    where: { slug: 'muschio-prive' },
    create: {
      name: 'Muschio Privé',
      slug: 'muschio-prive',
      type: 'NICHE',
      countryOfOrigin: 'Dubai, United Arab Emirates',
      isFeatured: true,
      descriptionEn: 'The private bespoke atelier of Muschio, crafting ultra-rare high-concentration discovery boxes and numbered batch extraits for royalty and collectors across the Gulf.',
      descriptionAr: 'الأتيلييه الخاص والمخصص لدار موسكيو، يُعنى بابتكار مجموعات العينات الملكية الفاخرة وخلاصات العطور المرقمة المحدودة لصفوة العملاء في الخليج العربي.',
      heroImageUrl: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1600&q=85',
    },
    update: {
      countryOfOrigin: 'Dubai, United Arab Emirates',
      isFeatured: true,
    }
  });

  // 3. Ensure top luxury houses have complete metadata
  const luxuryHouses = [
    {
      slug: 'amouage',
      name: 'Amouage',
      countryOfOrigin: 'Sultanate of Oman',
      isFeatured: true,
      descriptionEn: 'Founded in the Sultanate of Oman in 1983 as The Gift of Kings, Amouage defines high perfumery with majestic Silver Frankincense, Mountain Rock Rose, and masterfully macerated extraits.',
      descriptionAr: 'تأسست دار أمواج في سلطنة عُمان عام 1983 كـ "هدية الملوك"، لتعيد صياغة مفهوم الفخامة العطرية بنقاء اللبان الحوجري الفضي وورد الجبل الأخضر وخلاصات العطور المعتقة بحرفية استثنائية.',
      heroImageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1600&q=85'
    },
    {
      slug: 'maison-francis-kurkdjian',
      name: 'Maison Francis Kurkdjian',
      countryOfOrigin: 'Paris, France',
      isFeatured: true,
      descriptionEn: 'Co-founded by master perfumer Francis Kurkdjian, expressing Parisian elegance, luminous ambergris crystals, and seamless modern craftsmanship.',
      descriptionAr: 'شارك في تأسيسها صانع العطور الشهير فرانسيس كوركدجيان، وتجسد الأناقة الباريسية المطلقة وكريستالات العنبر المتوهجة والدقة المتناهية.',
      heroImageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=85'
    },
    {
      slug: 'roja-parfums',
      name: 'Roja Parfums',
      countryOfOrigin: 'London, United Kingdom',
      isFeatured: true,
      descriptionEn: 'Conceived by master perfumer Roja Dove, renowned worldwide for unapologetic opulence, gold-leaf caps, and the most precious natural extractions on earth.',
      descriptionAr: 'ابتكرها كبير صانعي العطور روجا دوف، وتشتهر عالمياً بالفخامة الفائقة واستخدام أندر المكونات الطبيعية على وجه الأرض.',
      heroImageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1600&q=85'
    },
    {
      slug: 'xerjoff',
      name: 'Xerjoff',
      countryOfOrigin: 'Turin, Italy',
      isFeatured: true,
      descriptionEn: 'Italian artistic perfumery uniting hand-carved Tuscan flacons, rare Calabrian bergamot, and rich balsamic tobacco in the acclaimed 1861 and Shooting Stars collections.',
      descriptionAr: 'قمة الإبداع الإيطالي في العطور النيش، تجمع بين الزجاج الفني المنحوت وخلاصات البرغموت الكالابري والتبغ البلسمي الفاخر.',
      heroImageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=85'
    },
    {
      slug: 'tom-ford',
      name: 'Tom Ford Private Blend',
      countryOfOrigin: 'New York, USA',
      isFeatured: true,
      descriptionEn: 'Tom Ford’s personal scent laboratory: unbound by mainstream convention, presenting monolithic statements of raw dark woods, smoky leather, and decadent amber.',
      descriptionAr: 'المختبر العطري الخاص لتوم فورد: متحرر من القوالب التقليدية، ويقدم تجارب عميقة من الأخشاب الداكنة والجلود المدخنة والعنبر الملكي.',
      heroImageUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1600&q=85'
    },
    {
      slug: 'clive-christian',
      name: 'Clive Christian',
      countryOfOrigin: 'London, United Kingdom',
      isFeatured: true,
      descriptionEn: 'The custodian of the historic Crown Perfumery (est. 1872), granted the right to use Queen Victoria’s crown, renowned for creating the world’s most concentrated perfumes.',
      descriptionAr: 'وريث دار العطور الملكية البريطانية العريقة (تأسست 1872) والحاصل على إذن حمل تاج الملكة فيكتوريا، ويشتهر بتركيزاته العطرية القياسية.',
      heroImageUrl: 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=1600&q=85'
    },
    {
      slug: 'creed',
      name: 'Creed',
      countryOfOrigin: 'Paris, France',
      isFeatured: true,
      descriptionEn: 'Generations of royal artisan perfumery, crafting millesime masterpieces through traditional infusion methods from noble citrus and smoky birch.',
      descriptionAr: 'أجيال من الحرفية العطرية الملكية، تقدم تحف الميليسيم بطرق الاستخلاص التقليدية العريقة من الحمضيات النبيلة وأخشاب البتولا المدخنة.',
      heroImageUrl: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=1600&q=85'
    }
  ];

  for (const h of luxuryHouses) {
    await prisma.brand.upsert({
      where: { slug: h.slug },
      create: {
        name: h.name,
        slug: h.slug,
        type: 'NICHE',
        countryOfOrigin: h.countryOfOrigin,
        isFeatured: h.isFeatured,
        descriptionEn: h.descriptionEn,
        descriptionAr: h.descriptionAr,
        heroImageUrl: h.heroImageUrl
      },
      update: {
        name: h.name,
        countryOfOrigin: h.countryOfOrigin,
        isFeatured: h.isFeatured,
        descriptionEn: h.descriptionEn,
        descriptionAr: h.descriptionAr,
        heroImageUrl: h.heroImageUrl
      }
    });
  }

  // 4. Ensure Blog Categories
  const categoriesData = [
    {
      slug: 'haute-technique',
      nameEn: 'Haute Technique & Layering',
      nameAr: 'فن المزج والطقوس العطرية'
    },
    {
      slug: 'raw-harvests',
      nameEn: 'Raw Harvests & Provenance',
      nameAr: 'أصول المكونات النادرة'
    },
    {
      slug: 'olfactory-architecture',
      nameEn: 'Olfactory Architecture',
      nameAr: 'هندسة العطور والتركيز'
    },
    {
      slug: 'arabian-heritage',
      nameEn: 'Scent Heritage of Arabia',
      nameAr: 'تراث العطور العربية والخليجية'
    }
  ];

  const categoryMap = {};
  for (const c of categoriesData) {
    const cat = await prisma.blogCategory.upsert({
      where: { slug: c.slug },
      create: c,
      update: c
    });
    categoryMap[c.slug] = cat.id;
  }

  // 5. Query Products for links
  const sampleProducts = await prisma.product.findMany({
    select: { id: true, slug: true },
    take: 10
  });
  const firstProdId = sampleProducts[0]?.id;
  const secondProdId = sampleProducts[1]?.id || firstProdId;

  // 6. Rich Luxury Journal Articles
  const journalPosts = [
    {
      slug: 'art-of-layering-oud-and-taif-rose',
      titleEn: 'The Sacred Alchemy: Layering Aged Omani Oud with Mountain Taif Rose',
      titleAr: 'الكيمياء المقدسة: فن مزج العود العُماني المعتق مع ورد الطائف الجبلي',
      excerptEn: 'Discover the centuries-old Gulf tradition of combining wild balsamic agarwood with fresh, honeyed dawn-harvested roses for royal occasions.',
      excerptAr: 'اكتشف التقاليد الخليجية الأصيلة في مزج العود البري البلسمي مع الورد المقطوف عند بزوغ الفجر في المناسبات الملكية.',
      contentEn: `
        <p class="lead text-lg font-serif italic text-luxury-text mb-6">
          In the private majalis of Muscat, Riyadh, and Abu Dhabi, perfume is never worn as a solitary note. It is built as an invisible architecture—a bespoke aura where dense resinous woods anchor ethereal florals.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">1. The Golden Ratio of Arabian Layering</h3>
        <p>
          The ritual always begins on warm skin. A dense base—preferably a pure dehn al oud or a 50%+ extrait de parfum—is applied to pulse points: the carotid hollow, behind the earlobes, and inside the wrists. This foundational layer provides the gravitational center of your sillage.
        </p>
        <p class="mt-4">
          Once the heavy resins warm to body temperature, a luminous crystalline floral is misted across natural textile fibers: fine cashmere, raw silk, and embroidered thobes. The mountain rose of Taif, distilled at high altitudes where morning mist traps volatile monoterpenes, floats above the dark oud like sunlight piercing an ancient forest.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">2. Temperature & Longevity Dynamics</h3>
        <p>
          In GCC climates exceeding 40°C, commercial alcohol-heavy colognes evaporate within minutes. By locking the volatile rose molecules into an aged agarwood resin mantle, the evaporation curve extends smoothly beyond 18 to 24 hours. The resulting sillage changes continuously from sunrise to midnight.
        </p>
      `,
      contentAr: `
        <p class="lead text-lg font-serif italic text-luxury-text mb-6">
          في المجالس الخاصة في مسقط والرياض وأبوظبي، لا يُوضع العطر كنوتة منفردة أبداً. بل يُبنى كصرح معماري غير مرئي—هالة استثنائية ترتكز فيها الأخشاب الصمغية العميقة لتحتضن النفحات الزهرية الأثيرية.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">١. النسبة الذهبية للتعطير الخليجي</h3>
        <p>
          يبدأ الطقس دائماً على البشرة الدافئة. توضع قطرات من دهن العود المعتق أو خلاصة عطرية مركزة تفوق 50% على نقاط النبض الأساسية: جانبي العنق، وخلف الأذنين، ومعصم اليد. هذه الطبقة هي مركز الجاذبية لهالتك العطرية.
        </p>
        <p class="mt-4">
          وعندما تتفاعل الراتنجات الدافئة مع حرارة الجسد، يتم رش رذاذ ناعم من الورد الطائفي النقي على الأقمشة الطبيعية كالكشمير والحرير وثياب القطن الفاخر. يطفو الورد الجبلي المقطوف فجراً فوق العود الداكن كأشعة شمس تخترق غابة أسطورية.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">٢. الثبات الفائق وتحدي المناخ الصحراوي</h3>
        <p>
          في حرارة الصيف التي تتجاوز الأربعين درجة مئوية، تتبخر العطور الخفيفة خلال دقائق. ولكن احتضان جزيئات الورد داخل درع العود البلسمي يطيل منحنى الفوحان إلى أكثر من 24 ساعة، لتتجدد الرائحة بتناغم مذهل طوال اليوم.
        </p>
      `,
      authorName: 'Salim Al-Harthy',
      coverImageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1600&q=85',
      readingTimeMinutes: 6,
      categoryId: categoryMap['haute-technique'],
      isPublished: true,
      publishedAt: new Date('2026-10-15T10:00:00Z'),
    },
    {
      slug: 'architecture-of-extraits-maceration',
      titleEn: 'The Architecture of Extraits: Why 53% Concentration Requires 6 Months Maceration',
      titleAr: 'هندسة العطور المركزة: لماذا يتطلب تركيز 53% ستة أشهر من التعتيق البطيء',
      excerptEn: 'An inside look into high-concentration extraits and why aging raw perfume oils at controlled cellar temperatures transforms volatile top notes into seamless silk.',
      excerptAr: 'نظرة متعمقة في كواليس صناعة الخلاصات العطرية فائقة التركيز وكيف يحوّل التعتيق البطيء النوتات الحادة إلى حرير عطري منسجم.',
      contentEn: `
        <p class="lead text-lg font-serif italic text-luxury-text mb-6">
          When perfume oil concentration crosses the 50% threshold, standard formulation rules cease to apply. The sheer physical density of molecules requires subterranean patience.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">1. Maturation vs. Maceration</h3>
        <p>
          Maturation is the silent chemical bonding of raw botanical and synthetic concentrates before the addition of organic ethanol. Maceration begins the moment the alcohol is introduced. In extraits formulated between 40% and 53% (such as Amouage Exceptional Extraits), freshly combined molecules clash aggressively.
        </p>
        <p class="mt-4">
          Without months in temperature-controlled darkness at 14°C, raw patchouli, ambergris tinctures, and frankincense resins remain coarse and disjointed. During the six months of cellar aging, esterification rounds every sharp edge, forging an unbreakable molecular fabric.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">2. Skin Longevity of 24+ Hours</h3>
        <p>
          High concentration is not merely about volume—it is about density. While an Eau de Parfum disperses into an explosive 2-hour cloud followed by a rapid taper, a 53% extrait moves across skin with velvet weight, releasing its heart notes progressively over 24 to 36 hours.
        </p>
      `,
      contentAr: `
        <p class="lead text-lg font-serif italic text-luxury-text mb-6">
          عندما يتجاوز تركيز الزيت العطري حاجز 50%، تتغير قواعد الصياغة التقليدية بالكامل. تتطلب الكثافة الجزيئية الاستثنائية صبراً عميقاً في أقبية التعتيق الهادئة.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">١. التعتيق البطيء في الظلام المحكم</h3>
        <p>
          التعتيق هو عملية الاتحاد الكيميائي الهادئ بين الزيوت العطرية النقية والإيثانول الطبيعي. في التراكيز العالية جداً بين 40% و53%، تكون الجزيئات حديثة المزج حادة ومتباعدة.
        </p>
        <p class="mt-4">
          تحتاج الخلاصات إلى 6 أشهر كاملة في درجات حرارة ثابتة تبلغ 14 درجة مئوية. خلال هذه الفترة، تكتمل تفاعلات الأسترة وتلتئم نوتات الباتشولي واللبان والعنبر لتصبح نسيجاً متصلاً يشبه الحرير الخالص.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">٢. أثر عطري يدوم لأكثر من 24 ساعة</h3>
        <p>
          التركيز الفائق لا يعني فقط قوة الرائحة، بل عمق ثباتها. فبينما يتبخر ماء العطر العادي خلال ساعات، يلتصق الإكستريت بالبشرة كطبقة ملكية ثانية، ويستمر في إطلاق نوتات قلبه العطري على مدار يومين متواصلين.
        </p>
      `,
      authorName: 'Dr. Elena Rostova',
      coverImageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=85',
      readingTimeMinutes: 8,
      categoryId: categoryMap['olfactory-architecture'],
      isPublished: true,
      publishedAt: new Date('2026-10-20T12:00:00Z'),
    },
    {
      slug: 'the-secrets-of-ambergris-oceanic-gold',
      titleEn: 'Oceanic Gold: The Mystery and Alchemy of Natural Ambergris in Royal Parfumerie',
      titleAr: 'الذهب المحيطي: أسرار وسحر العنبر الطبيعي في صناعة العطور الملكية',
      excerptEn: 'From floating for decades on open ocean currents to curing on Arabian shores, how wild white ambergris bestows an incomparable velvet glow to haute parfumerie.',
      excerptAr: 'من رحلة التعتيق لعقود فوق أمواج المحيطات إلى شواطئ الجزيرة العربية، كيف يمنح العنبر الأبيض الطبيعي هالة مخملية لا تضاهى لأفخم العطور.',
      contentEn: `
        <p class="lead text-lg font-serif italic text-luxury-text mb-6">
          There is no synthetic molecule known to modern science that can replicate the biological wonder of aged marine ambergris. It is the holy grail of fixatives.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">1. The Metamorphosis of Floating Amber</h3>
        <p>
          Cast off into the deep oceans, raw ambergris begins as a dark, unpromising resin. Over 20 to 50 years of relentless exposure to saltwater, tropical sunlight, and oceanic winds, oxidation transforms it into pale silver-white nodules with a scent profile resembling sweet sea air, sun-bleached driftwood, and warm skin.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">2. The Legendary Tincture</h3>
        <p>
          In traditional Gulf perfumery, white ambergris is crushed by hand and suspended in pure grain alcohol for a minimum of 24 months. When introduced to a fragrance blend, ambergris does not dominate; rather, it acts as an acoustic amplifier, elevating every companion note into crystalline three-dimensional relief.
        </p>
      `,
      contentAr: `
        <p class="lead text-lg font-serif italic text-luxury-text mb-6">
          لا يوجد جزيء اصطناعي واحد استطاع العلم الحديث ابتكاره يضاهي الأعجوبة البيولوجية للعنبر البحري الطبيعي المعتق. إنه سر الخلود في دنيا العطور.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">١. تحول العنبر عبر عقود في مياه المحيط</h3>
        <p>
          يبدأ العنبر رحلته في أعماق البحار ككتلة داكنة خشنة. وعلى مدار 20 إلى 50 عاماً من التعرض المستمر لمياه المحيط المالحة وحرارة الشمس والرياح، تؤكسد الطبيعة هذه المادة لتحولها إلى كتل بيضاء فضية ذات رائحة تجمع بين نسيم البحر العذب، وخشب الصندل الدافئ، وحرارة الجلد الطبيعي.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">٢. منقوع العنبر الملكي</h3>
        <p>
          في تقاليد العطور الخليجية الملكية، يُسحق العنبر الأبيض بعناية فائقة ويُنقع لمدة لا تقل عن سنتين كاملتين. وعند إضافته إلى التوليفة العطرية، لا يطغى برائحته، بل يعمل كمكبر صوت نقي يرفع كل نوتة مجاورة ويمنحها بعداً ثلاثي الأبعاد لا ينسى.
        </p>
      `,
      authorName: 'Farzeen Al-Tamimi',
      coverImageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=85',
      readingTimeMinutes: 7,
      categoryId: categoryMap['raw-harvests'],
      isPublished: true,
      publishedAt: new Date('2026-10-28T09:00:00Z'),
    },
    {
      slug: 'frankincense-trail-dhofar-to-versailles',
      titleEn: 'The Sacred Boswellia Sacra: From the Valleys of Dhofar to Parisian Ateliers',
      titleAr: 'اللبان الحوجري المقدس: من أودية ظفار الساحرة إلى كبرى دور العطور الباريسية',
      excerptEn: 'Why Oman’s Silver Hojari frankincense remains the undisputed jewel of sacred perfumery, coveted by the world’s most prestigious fragrance houses.',
      excerptAr: 'لماذا يظل اللبان الحوجري الفضي العُماني جوهرة العطور المقدسة بلا منازع، ومحط أنظار كبرى دور العطور العالمية في باريس ولندن.',
      contentEn: `
        <p class="lead text-lg font-serif italic text-luxury-text mb-6">
          High in the arid limestone crags of the Dhofar mountains in southern Oman, gnarly Boswellia sacra trees yield a resin revered by pharaohs, Roman emperors, and modern haute parfumeurs alike.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">1. The Silver Hojari Harvest</h3>
        <p>
          Not all frankincense is created equal. The highest tier—Royal Green and Silver Hojari—is harvested exclusively during the driest summer weeks from trees growing furthest inland. Its resin tears are crystal clear with a faint greenish-silver cast, releasing bright lime zest and sacred balsamic smoke upon warming.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">2. The Modern Perfumer’s Palette</h3>
        <p>
          Master perfumers in Paris and Grasse prize Hojari resin for its remarkable dual personality: an invigorating, sparkling citrus top note paired with a solemn, meditative, mineral-amber base that anchors heavy compositions without turning muddy.
        </p>
      `,
      contentAr: `
        <p class="lead text-lg font-serif italic text-luxury-text mb-6">
          في أعالي المنحدرات الجيرية لجبال ظفار في جنوب سلطنة عُمان، تنمو أشجار اللبان المقدس (بوزويليا ساكرا) لتقدم راتنجاً تنافس عليه الفراعنة وأباطرة روما وصناع العطور الباريسيون.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">١. حصاد الحوجري الفضي الملكي</h3>
        <p>
          لا تتساوى أنواع اللبان في جودتها. فأعلاها قدراً—اللبان الحوجري الأخضر والفضي—يُحصد حصراً في أكثر أسابيع الصيف جفافاً من الأشجار البعيدة عن الرطوبة البحرية. تكون حباته نقية كحبات البرد الفضي، وتطلق نفحات تجمع بين انتعاش الليمون الأخضر والدخان البلسمي الصافي.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">٢. الحضور المهيب في العطور العالمية</h3>
        <p>
          يعشق كبار صانعي العطور في غراس وباريس لبان ظفار بفضل طبيعته المزدوجة النادرة: فهو يبدأ بانتعاش حمضي متلألئ في قمة العطر، وينتهي بقاعدة معدنية عنبرية وقورة تثبت العطور دون أن تثقلها.
        </p>
      `,
      authorName: 'Salim Al-Harthy',
      coverImageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1600&q=85',
      readingTimeMinutes: 5,
      categoryId: categoryMap['arabian-heritage'],
      isPublished: true,
      publishedAt: new Date('2026-11-01T14:30:00Z'),
    },
    {
      slug: 'perfumers-guide-gcc-summer-fragrances',
      titleEn: 'Defying the Gulf Heat: The Science of High-Heat Sillage & Volatile Evaporation',
      titleAr: 'فن اختيار عطور الصيف في الخليج: صراع التركيز والحرارة الشديدة',
      excerptEn: 'Mastering olfactory longevity in 45°C conditions: why high concentration beats aquatic freshness and how dry woods triumph in dry desert air.',
      excerptAr: 'دليل الخبراء للثبات العطري في حرارة 45 مئوية: لماذا تتفوق الخلاصات النقية على العطور المائية، وسر انتصار الأخشاب الجافة في الصيف.',
      contentEn: `
        <p class="lead text-lg font-serif italic text-luxury-text mb-6">
          Conventional Western fragrance advice dictates light citrus colognes for summer heat. In the Arabian Peninsula, this advice fails completely.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">1. The Thermodynamic Fallacy</h3>
        <p>
          Light alcohol-heavy citrus eau de toilettes flash off heated skin in under twenty minutes in 45°C ambient air. What remains is a dry synthetic white-musk screech. The connoisseurs of the Gulf have known for generations that heat requires density.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">2. The Dry Woods Solution</h3>
        <p>
          Instead of heavy sweet vanilla or sticky gourmands, opt for high-concentration extraits featuring dry Virginian cedarwood, green Vetiver from Haiti, and bitter bergamot. The dry wood absorbs the heat without expanding into overwhelming cloying sweetness, preserving pristine regal freshness throughout an Arabian summer afternoon.
        </p>
      `,
      contentAr: `
        <p class="lead text-lg font-serif italic text-luxury-text mb-6">
          تنصح كتب العطور الغربية التقليدية باستخدام العطور الحمضية الخفيفة في فصل الصيف. ولكن في مناخ الخليج العربي، تفشل هذه النصيحة فشلاً ذريعاً.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">١. وهم العطور المائية الخفيفة</h3>
        <p>
          تتبخر كولونيات الصيف الخفيفة المحملة بالكحول عن الجلد في أقل من عشرين دقيقة تحت شمس الخليج الحارقة. ما يتبقى بعدها مجرد رائحة مسك اصطناعي باهت. ولهذا أدرك عشاق العطور في الخليج منذ أجيال أن الحرارة الشديدة تحتاج إلى تركيز وثبات زيتي عميق.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">٢. حل الأخشاب الجافة والنجيل العطري</h3>
        <p>
          بدلاً من العطور السكرية الثقيلة التي تختنق في الحرارة، يكمن الحل في خلاصات العطور النقية المرتكزة على خشب الأرز الجاف، ونجيل الهند (الفيتيفر) الأخضر والبرغموت الإيطالي المر. تمتص هذه المكونات حرارة الجو وتطلق هالة انتعاش ارستقراطية تدوم طوال النهار.
        </p>
      `,
      authorName: 'Dr. Elena Rostova',
      coverImageUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1600&q=85',
      readingTimeMinutes: 6,
      categoryId: categoryMap['olfactory-architecture'],
      isPublished: true,
      publishedAt: new Date('2026-11-04T11:15:00Z'),
    },
    {
      slug: 'attar-vs-extrait-heritage-distillation',
      titleEn: 'Attars, Dehn al Oud, and Extraits: An Expert Decryption of Arabian Scent Formats',
      titleAr: 'بين دهن العود والخلاصات النقية: دليل شامل لأشكال العطور الشرقية وتراكيزها',
      excerptEn: 'Demystifying the spectrum from steam-distilled pure sandalwood attars and wild agarwood oils to high-maceration modern alcohol extraits.',
      excerptAr: 'فهم الفروق الدقيقة بين دهن العود البري، والأطياب التراثية المقطرة على خشب الصندل، والخلاصات العطرية الحديثة فائقة الفخامة.',
      contentEn: `
        <p class="lead text-lg font-serif italic text-luxury-text mb-6">
          To navigate the pinnacle of perfumery, one must distinguish between three distinct physical mediums: the pure botanical attar, the aged single-origin dehn, and the modern extrait de parfum.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">1. Traditional Attars (Ittar)</h3>
        <p>
          A true attar is completely alcohol-free. It is produced through ancient co-distillation in copper degs, where floral or resinous vapors are condensed directly into a receiver flask containing pure Mysore sandalwood oil. The sandalwood acts as an organic, living sponge, preserving the delicate soul of the flowers.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">2. Dehn Al Oud</h3>
        <p>
          Dehn al Oud represents the pure oil of infected aquilaria heartwood, extracted via water distillation and aged in glass carboys under natural sunlight. From the barnyard, balsamic depth of vintage Hindi to the crystalline fruit-sweetness of Cambodian and Papuan wild harvests, it is a perfume in itself.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">3. The Modern Extrait</h3>
        <p>
          The extrait bridges both worlds: offering the explosive diffusion of organic perfume alcohol alongside the velvet density and 24-hour persistence of traditional oils.
        </p>
      `,
      contentAr: `
        <p class="lead text-lg font-serif italic text-luxury-text mb-6">
          للإبحار في عالم العطور الفاخرة، يجب التمييز بين ثلاثة أشكال رئيسية للطيب: العطر الزيتي التراثي (الأتار)، ودهن العود النقي المعتق، وخلاصة العطر الحديثة (الإكستريت).
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">١. الأطياب الزيتية التقليدية (الأتار)</h3>
        <p>
          الأتار الأصيل خالٍ تماماً من الكحول. يُنتج بواسطة التقطير التشاركي في قدور النحاس التراثية، حيث يُكثف بخار الورد أو اللبان مباشرة داخل زيت خشب الصندل الصافي، الذي يحتفظ بقلب الزهرة الطبيعي لسنوات طويلة.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">٢. دهن العود الصافي</h3>
        <p>
          دهن العود هو خلاصة خشب أشجار العود البري المعمر، يُستخرج بالتقطير المائي البطيء ويُعتق في قوارير زجاجية تحت أشعة الشمس. تتنوع نوتاته من العود الهندي البلسمي العتيق إلى العود الكمبودي والماليزي السويتي الفاخر.
        </p>
        <h3 class="text-xl font-serif text-luxury-text mt-8 mb-4">٣. خلاصة العطر (Extrait de Parfum)</h3>
        <p>
          يجمع الإكستريت بين ميزتي العالمين: الانتشار الإشعاعي الفوري الذي يمنحه الكحول العطري النقي، مع الكثافة المخملية والثبات الذي يدوم لأيام مثل الأدهان التراثية.
        </p>
      `,
      authorName: 'Farzeen Al-Tamimi',
      coverImageUrl: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1600&q=85',
      readingTimeMinutes: 7,
      categoryId: categoryMap['arabian-heritage'],
      isPublished: true,
      publishedAt: new Date('2026-11-06T16:00:00Z'),
    }
  ];

  for (const post of journalPosts) {
    const upserted = await prisma.blogPost.upsert({
      where: { slug: post.slug },
      create: post,
      update: post
    });

    // Link with product if not linked
    const existingLink = await prisma.blogPostProduct.findFirst({
      where: { postId: upserted.id }
    });
    if (!existingLink && firstProdId) {
      await prisma.blogPostProduct.create({
        data: {
          postId: upserted.id,
          productId: post.slug.includes('oud') ? firstProdId : secondProdId
        }
      }).catch(() => {});
    }
  }

  // 7. Ensure Discovery Set 5x2ml Product in DB
  const warehouse = await prisma.warehouse.findFirst({ where: { isDefault: true } }) || await prisma.warehouse.findFirst();

  const discProduct = await prisma.product.upsert({
    where: { slug: 'discovery-set-5x2ml' },
    create: {
      slug: 'discovery-set-5x2ml',
      nameEn: 'Artisanal Discovery Set (5 x 2ml)',
      nameAr: 'مجموعة العينات الملكية المخصصة (٥ × ٢ مل)',
      descriptionEn: 'Select five official 2ml atomizers from our vault to experience on bare skin. Includes a 100% redeemable 280 AED voucher toward any full flacon.',
      descriptionAr: 'اختر ٥ عينات رسمية بحجم ٢ مل لتجربتها على بشرتك في هدوء منزلك. تشمل قسيمة شراء مستردة بالكامل بقيمة ٢٨٠ درهم تخصم عند طلب زجاجة بالحجم الكامل.',
      brandId: brandMuschio.id,
      concentration: 'EXTRAIT_DE_PARFUM',
      gender: 'UNISEX',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85'
      ]
    },
    update: {
      nameEn: 'Artisanal Discovery Set (5 x 2ml)',
      nameAr: 'مجموعة العينات الملكية المخصصة (٥ × ٢ مل)',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85'
      ]
    }
  });

  // Ensure Discovery Set Variant with specific SKU
  let discVariant = await prisma.productVariant.findFirst({
    where: { productId: discProduct.id }
  });

  if (!discVariant) {
    discVariant = await prisma.productVariant.create({
      data: {
        id: 'discovery-set-5x2ml-box',
        productId: discProduct.id,
        sku: 'DISC-SET-5X2ML',
        volume: '5 x 2ml',
        volumeMl: 10,
        sizeLabelEn: '5 x 2ml Vials',
        sizeLabelAr: '٥ عينات × ٢ مل',
        price: 280,
        compareAtPrice: 350,
        isDefault: true,
      }
    });
  } else {
    await prisma.productVariant.update({
      where: { id: discVariant.id },
      data: {
        volume: '5 x 2ml',
        sizeLabelEn: '5 x 2ml Vials',
        sizeLabelAr: '٥ عينات × ٢ مل',
        price: 280,
        compareAtPrice: 350,
      }
    });
  }

  // Ensure Inventory for Discovery Set Variant
  if (discVariant) {
    await prisma.inventory.upsert({
      where: {
        variantId: discVariant.id
      },
      create: {
        variantId: discVariant.id,
        sealedQuantity: 250,
        testerQuantity: 10,
        reservedQuantity: 0,
        lowStockThreshold: 10,
      },
      update: {
        sealedQuantity: 250,
      }
    });
  }

  // 8. Ensure Default Banners and Sections are in DB
  const bannerCount = await prisma.banner.count();
  if (bannerCount === 0) {
    await prisma.banner.createMany({
      data: [
        {
          slot: 'HERO_SLIDER',
          eyebrowEn: 'HAUTE PARFUMERIE · ARABIAN GULF',
          eyebrowAr: 'دار العطور الراقية · الخليج العربي',
          titleEn: 'The Art of | Noble Sillage',
          titleAr: 'فن | الحضور المهيب',
          subtitleEn: "Curating the world's most formidable extraits de parfum, aged attars, and raw olfactory essences for the connoisseurs of the Gulf.",
          subtitleAr: 'ننتقي أرقى خلاصات العطور العالمية المعتقة والزيوت النادرة لعشاق العطور الراقية في الخليج العربي.',
          ctaTextEn: 'Shop the Collection',
          ctaTextAr: 'تسوق المجموعة',
          ctaUrl: '/shop',
          secondaryCtaTextEn: 'AI Sommelier',
          secondaryCtaTextAr: 'مستشار العطور',
          secondaryCtaUrl: '/discover/ai',
          imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1400&q=85',
          overlayLabelEn: 'MUSCHIO SELECTION / 2026',
          overlayLabelAr: 'مختارات موسكيو / ٢٠٢٦',
          sortOrder: 0,
          isActive: true,
        },
        {
          slot: 'CAMPAIGN_MID',
          eyebrowEn: 'LIMITED PROMOTIONAL OFFER · EXCLUSIVE DEALS',
          eyebrowAr: 'عرض ترويجي حصري · صفقات خاصة',
          titleEn: 'Private Client Reserve | Up to 20% Off',
          titleAr: 'مختارات كبار الشخصيات | خصم حتى ٢٠٪',
          subtitleEn: 'Acquire rare artisanal extraits and pure parfums with complimentary white-glove courier delivery across the GCC.',
          subtitleAr: 'اقتنِ أنقى خلاصات العطور النيش النادرة مع توصيل مبرد مجاني لكافة مدن الخليج العربي.',
          ctaTextEn: 'Explore Privé Deals',
          ctaTextAr: 'استكشف العروض الحصرية',
          ctaUrl: '/shop?deal=true',
          imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1400&q=85',
          overlayLabelEn: 'VIP DEAL CODE: MUSCHIO20',
          overlayLabelAr: 'رمز العرض: MUSCHIO20',
          sortOrder: 1,
          isActive: true,
        },
        {
          slot: 'PROMO_STRIP',
          eyebrowEn: 'SPECIAL OFFER',
          eyebrowAr: 'عرض خاص',
          titleEn: 'Complimentary 5-Piece Maison Discovery Box on Orders Over 850 AED',
          titleAr: 'صندوق عينات فاخر مجاني (٥ عينات) عند الطلب بقيمة أكثر من ٨٥٠ د.إ',
          ctaTextEn: 'Claim Offer',
          ctaTextAr: 'استفد من العرض',
          ctaUrl: '/shop',
          imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85',
          sortOrder: 2,
          isActive: true,
        },
      ]
    });
  }

  const finalPosts = await prisma.blogPost.count();
  const finalBrands = await prisma.brand.count();
  const finalProducts = await prisma.product.count();

  console.log(`✅ Enrichment Complete!`);
  console.log(`- Total Published Journal Posts: ${finalPosts}`);
  console.log(`- Total Curated Luxury Brands: ${finalBrands}`);
  console.log(`- Total Catalog Products: ${finalProducts}`);
}

main()
  .catch((err) => {
    console.error('❌ Enrichment failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
