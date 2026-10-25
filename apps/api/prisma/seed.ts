import {
  PrismaClient,
  BrandType,
  Concentration,
  GenderCategory,
  NotePosition,
  NoteStatus,
  AdminRole,
  ProductRelationType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Muschio Enterprise Luxury Fragrance Database with Complete Catalog...");

  // 1. Clean existing records in dependency order
  await prisma.auditLog.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.webhookEvent.deleteMany();
  await prisma.paymentEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.returnInspection.deleteMany();
  await prisma.returnItem.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.fulfillmentItem.deleteMany();
  await prisma.fulfillment.deleteMany();
  await prisma.reviewImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.stockLedger.deleteMany();
  await prisma.inventoryLot.deleteMany();
  await prisma.inventoryReservation.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.goodsReceipt.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.marketPrice.deleteMany();
  await prisma.market.deleteMany();
  await prisma.productRelation.deleteMany();
  await prisma.productAccord.deleteMany();
  await prisma.productPerfumer.deleteMany();
  await prisma.productCollection.deleteMany();
  await prisma.productNote.deleteMany();
  await prisma.productOccasion.deleteMany();
  await prisma.productSeason.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.blogPostProduct.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.blogCategory.deleteMany();
  await prisma.contentNode.deleteMany();
  await prisma.product.deleteMany();
  await prisma.note.deleteMany();
  await prisma.accord.deleteMany();
  await prisma.perfumer.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.occasion.deleteMany();
  await prisma.season.deleteMany();
  await prisma.scentFamily.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.exchangeRate.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();

  // 2. Warehouses
  const warehouseDxb = await prisma.warehouse.create({
    data: {
      code: "DXB-MAIN",
      name: "Muschio Dubai Central Vault & Logistics Hub",
      city: "Dubai",
      countryCode: "AE",
      isDefault: true,
    },
  });

  const warehouseRuh = await prisma.warehouse.create({
    data: {
      code: "RUH-HUB",
      name: "Muschio Riyadh Express Fulfillment Facility",
      city: "Riyadh",
      countryCode: "SA",
      isDefault: false,
    },
  });

  // 3. Markets (GCC)
  const marketUae = await prisma.market.create({
    data: {
      code: "AE",
      nameEn: "United Arab Emirates",
      nameAr: "الإمارات العربية المتحدة",
      currency: "AED",
      taxRatePercent: 5.0,
      isEnabled: true,
    },
  });

  const marketKsa = await prisma.market.create({
    data: {
      code: "SA",
      nameEn: "Kingdom of Saudi Arabia",
      nameAr: "المملكة العربية السعودية",
      currency: "SAR",
      taxRatePercent: 15.0,
      isEnabled: true,
    },
  });

  // 4. Suppliers
  const supplierAmouage = await prisma.supplier.create({
    data: {
      code: "SUP-AMO-01",
      name: "Amouage SAOC Muscat Headquarters",
      contactEmail: "concierge@amouage.com",
      country: "Oman",
      paymentTerms: "Net 30",
    },
  });

  // 5. Exchange Rates
  await prisma.exchangeRate.createMany({
    data: [
      { currency: "SAR", rate: 1.021 },
      { currency: "USD", rate: 0.2723 },
    ],
  });

  // 6. Admin Users (RBAC)
  const passwordHash = await bcrypt.hash("MuschioAdmin2026!", 10);
  await prisma.adminUser.createMany({
    data: [
      {
        email: "superadmin@muschio.luxury",
        name: "Director of Haute Parfumerie",
        passwordHash,
        role: AdminRole.SUPER_ADMIN,
      },
      {
        email: "catalog@muschio.luxury",
        name: "Lead Merchandiser",
        passwordHash,
        role: AdminRole.CATALOG_MANAGER,
      },
      {
        email: "inventory@muschio.luxury",
        name: "Supply Chain Manager",
        passwordHash,
        role: AdminRole.INVENTORY_MANAGER,
      },
    ],
  });

  // 7. Scent Families
  const familyOriental = await prisma.scentFamily.create({
    data: {
      nameEn: "Oriental & Amber",
      nameAr: "شرقي وعنبري",
      slug: "oriental-amber",
      descriptionEn: "Opulent, warm compositions rich in resins, precious aged oud, and golden amber.",
      descriptionAr: "تركيبات فاخرة دافئة غنية بالصمغ والعود المعتق والعنبر الذهبي.",
      imageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80",
    },
  });

  const familyWoody = await prisma.scentFamily.create({
    data: {
      nameEn: "Woody & Smoky",
      nameAr: "خشبي ودخاني",
      slug: "woody-smoky",
      descriptionEn: "Noble woods, dry cedarwood, smoky incense, and aristocratic depth.",
      descriptionAr: "أخشاب نبيلة وأرز جاف وبخور دخاني بعمق أرستقراطي.",
      imageUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80",
    },
  });

  const familyFresh = await prisma.scentFamily.create({
    data: {
      nameEn: "Fresh & Citrus",
      nameAr: "حمضي ومنعش",
      slug: "fresh-citrus-aquatic",
      descriptionEn: "Sun-drenched Calabrian bergamot, crisp citrus zest, and Mediterranean elegance.",
      descriptionAr: "برغموت كالابريا المشمس ونفحات حمضية منعشة بأناقة متوسطية.",
      imageUrl: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=80",
    },
  });

  const familyFloral = await prisma.scentFamily.create({
    data: {
      nameEn: "Rare Florals",
      nameAr: "زهور نادرة",
      slug: "rare-florals",
      descriptionEn: "Imperial Taif roses, Florentine orris root, and noble jasmine grandiflorum.",
      descriptionAr: "ورد الطائف الملكي وسوسن فلورنسا المخملي وياسمين غرانديفلوروم النبيل.",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    },
  });

  const familyGourmand = await prisma.scentFamily.create({
    data: {
      nameEn: "Gourmand & Leather",
      nameAr: "غورماند وجلدي",
      slug: "gourmand-leather",
      descriptionEn: "Bourbon vanilla, aromatic spices, and warm saddle leather accords.",
      descriptionAr: "فانيليا بوربون وتوابل عطرية ونفحات جلدية دافئة وفاخرة.",
      imageUrl: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1200&q=80",
    },
  });

  // 8. Accords
  const accordSmoky = await prisma.accord.create({
    data: {
      nameEn: "Smoky & Resinous",
      nameAr: "دخاني وصمغي",
      slug: "smoky-resinous",
      descriptionEn: "Dense aromatic frankincense smoke, birch tar, and charred sacred woods.",
      descriptionAr: "دخان لبان عطري كثيف وقطران البتولا وأخشاب مقدسة محروقة.",
      colorHex: "#3b302a",
    },
  });

  const accordBalsamic = await prisma.accord.create({
    data: {
      nameEn: "Warm Balsamic",
      nameAr: "بلسمي دافئ",
      slug: "warm-balsamic",
      descriptionEn: "Sweet myrrh, benzoin, and rich amber resins that envelop the wearer.",
      descriptionAr: "مر حلو وجاوي وصمغ عنبري غني يحيط بالشخص بحرارة ملكية.",
      colorHex: "#a67c52",
    },
  });

  const accordAmbery = await prisma.accord.create({
    data: {
      nameEn: "Golden Amber",
      nameAr: "عنبر ذهبي",
      slug: "golden-amber",
      descriptionEn: "Radiant, honeyed ambergris and golden labdanum warmth.",
      descriptionAr: "عنبر أشهب مشع وعسل ولابدانوم ذهبي دافئ.",
      colorHex: "#d4af37",
    },
  });

  // 9. Perfumers (Master Noses)
  const perfumerPierre = await prisma.perfumer.create({
    data: {
      name: "Pierre Negrin",
      slug: "pierre-negrin",
      bioEn: "Master Perfumer celebrated for crafting complex, dense extraits and monumental Middle Eastern masterworks.",
      bioAr: "عطار عالمي بارع يشتهر بابتكار أرقى خلاصات العطور الشرقية المعقدة والروائع الملكية.",
      portraitUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      countryOfOrigin: "France",
    },
  });

  const perfumerFrancis = await prisma.perfumer.create({
    data: {
      name: "Francis Kurkdjian",
      slug: "francis-kurkdjian",
      bioEn: "Visionary creator and artistic director blending crystalline French precision with luminous oriental warmth.",
      bioAr: "مبدع استثنائي يمزج الدقة الفرنسية الكريستالية مع الدفء الشرقي المضيء.",
      portraitUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
      countryOfOrigin: "France",
    },
  });

  // 10. Collections
  const colRoyal2026 = await prisma.collection.create({
    data: {
      nameEn: "Middle East Haute Extrait Collection 2026",
      nameAr: "المجموعة الملكية للشرق الأوسط 2026",
      slug: "haute-extrait-2026",
      descriptionEn: "Uncompromising high-concentration extraits de parfum formulated specifically for GCC climates and royal occasions.",
      descriptionAr: "خلاصات عطرية فائقة التركيز صُممت خصيصاً لأجواء الخليج والمناسبات الملكية الكبرى.",
      heroImageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=85",
      isFeatured: true,
    },
  });

  // 11. Occasions & Seasons
  const occasionGala = await prisma.occasion.create({
    data: {
      nameEn: "Royal Gala & Evening Wear",
      nameAr: "المناسبات الملكية والاحتفالات المسائية",
      slug: "royal-gala-evening",
    },
  });

  const seasonWinter = await prisma.season.create({
    data: {
      nameEn: "Winter & Autumn",
      nameAr: "الشتاء والخريف",
      slug: "winter-autumn",
    },
  });

  // 12. Complete 7 Haute Maisons (Brands)
  const brandAmouage = await prisma.brand.create({
    data: {
      name: "Amouage",
      slug: "amouage",
      type: BrandType.NICHE,
      descriptionEn: "The Gift of Kings. Celebrated for royal Silver Frankincense, wild mountain rock rose, and aged Cambodian Oud formulated at up to 53% concentration.",
      descriptionAr: "هدية الملوك. تشتهر باللبان الحوجري الفضي النادر والورد الجبلي وخشب العود المعتق بتركيز يصل إلى 53%.",
      logoUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80",
      heroImageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=85",
      countryOfOrigin: "Sultanate of Oman",
      isFeatured: true,
    },
  });

  const brandMfk = await prisma.brand.create({
    data: {
      name: "Maison Francis Kurkdjian",
      slug: "maison-francis-kurkdjian",
      type: BrandType.NICHE,
      descriptionEn: "L'art du parfum. Parisian craftsmanship expressing contemporary luxury with exceptional materials and crystal-clear olfactory architecture.",
      descriptionAr: "فن العطور الباريسي الرفيع يجسد الفخامة المعاصرة بمكونات استثنائية وبناء عطري متقن.",
      logoUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80",
      heroImageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=85",
      countryOfOrigin: "Paris, France",
      isFeatured: true,
    },
  });

  const brandRoja = await prisma.brand.create({
    data: {
      name: "Roja Parfums",
      slug: "roja-parfums",
      type: BrandType.NICHE,
      descriptionEn: "The finest fragrances in the world. Master Perfumer Roja Dove crafts unapologetic extraits using natural absolutes without cost constraints.",
      descriptionAr: "أرقى عطور العالم بإمضاء صانع العطور روجا دوف، صُنعت بأندر الخلاصات الطبيعية دون أي قيود على التكلفة.",
      logoUrl: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=400&q=80",
      heroImageUrl: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1600&q=85",
      countryOfOrigin: "London, United Kingdom",
      isFeatured: true,
    },
  });

  const brandXerjoff = await prisma.brand.create({
    data: {
      name: "Xerjoff",
      slug: "xerjoff",
      type: BrandType.NICHE,
      descriptionEn: "Italian luxury perfumes combining classical craftsmanship, aged oud absolutes, and breathtaking sculptural flacons.",
      descriptionAr: "دار العطور الإيطالية الفاخرة التي تجمع بين الحرفية العريقة وأندر خلاصات العود في زجاجات منحوتة ساحرة.",
      logoUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80",
      heroImageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=85",
      countryOfOrigin: "Turin, Italy",
      isFeatured: true,
    },
  });

  const brandTomFord = await prisma.brand.create({
    data: {
      name: "Tom Ford",
      slug: "tom-ford",
      type: BrandType.DESIGNER,
      descriptionEn: "The Private Blend Collection. Artisanal scent lab creations designed for true connoisseurs with opulent amber, spice, and leather accords.",
      descriptionAr: "مجموعة برايفيت بليند الخاصة. ابتكارات عطرية استثنائية صُممت لعشاق التميز بنفحات العنبر والتوابل والجلود الغنية.",
      logoUrl: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=400&q=80",
      heroImageUrl: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1600&q=85",
      countryOfOrigin: "New York, USA",
      isFeatured: true,
    },
  });

  const brandClive = await prisma.brand.create({
    data: {
      name: "Clive Christian",
      slug: "clive-christian",
      type: BrandType.NICHE,
      descriptionEn: "Custodian of the Crown Perfumery Company, bearing royal warrant and Queen Victoria's crown on each crystal stopper.",
      descriptionAr: "وريثة دار العطور الملكية البريطانية، الممنوحة إذناً ملكياً بوضع تاج الملكة فيكتوريا على زجاجاتها.",
      logoUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80",
      heroImageUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1600&q=85",
      countryOfOrigin: "London, United Kingdom",
      isFeatured: true,
    },
  });

  const brandCreed = await prisma.brand.create({
    data: {
      name: "Creed",
      slug: "creed",
      type: BrandType.NICHE,
      descriptionEn: "Royal legacy perfumery renowned for artisanal infusion methods and legendary historical royal clientele.",
      descriptionAr: "إرث عطري ملكي ممتد منذ 1760، يشتهر بأساليب التعتيق اليدوية وخدمة البلاط الملكي الأوروبي.",
      logoUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80",
      heroImageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=85",
      countryOfOrigin: "Paris, France",
      isFeatured: true,
    },
  });

  // 13. Dedicated Raw Notes Compendium
  const noteFrankincense = await prisma.note.create({
    data: {
      nameEn: "Silver Frankincense",
      nameAr: "اللبان الحوجري الفضي",
      slugEn: "silver-frankincense",
      slugAr: "silver-frankincense-ar",
      categoryEn: "Resins & Incense",
      categoryAr: "الراتنجات والبخور",
      descriptionEn: "Harvested exclusively from Boswellia sacra trees in the Dhofar mountains of Oman. Sacred, ethereal, and balsamic with radiant citrus undertones.",
      descriptionAr: "يُستخرج حصرياً من أشجار اللبان في ظفار العمانية. نوتة بخورية نقية مع لمحات بلسمية حمضية مضيئة.",
      heroImageUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1600&q=85",
      status: NoteStatus.PUBLISHED,
    },
  });

  const noteOud = await prisma.note.create({
    data: {
      nameEn: "Cambodian Agarwood (Oud)",
      nameAr: "دهن عود كمبودي معتق",
      slugEn: "cambodian-oud",
      slugAr: "cambodian-oud-ar",
      categoryEn: "Woods & Resins",
      categoryAr: "الأخشاب والعود",
      descriptionEn: "Aged wild heartwood distilled to yield resinous, dark, leathery, and deeply balsamic complexity.",
      descriptionAr: "خشب عود بري معتق مقطر ليمنح تعقيداً بلسمياً وجلدياً داكناً لا يُضاهى.",
      heroImageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=85",
      status: NoteStatus.PUBLISHED,
    },
  });

  const noteTaifRose = await prisma.note.create({
    data: {
      nameEn: "Royal Taif Rose",
      nameAr: "ورد الطائف الملكي",
      slugEn: "taif-rose",
      slugAr: "taif-rose-ar",
      categoryEn: "Rare Florals",
      categoryAr: "الزهور الملكية",
      descriptionEn: "Harvested at dawn in the high-altitude mountains of Saudi Arabia. Celebrated for honeyed, intensely deep, and regal floral aroma.",
      descriptionAr: "يُقطف عند بزوغ الفجر في أعالي جبال الطائف بالمملكة العربية السعودية، ويشتهر بأريجه العسلي والزهري الملكي الفواح.",
      heroImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=85",
      status: NoteStatus.PUBLISHED,
    },
  });

  const noteIris = await prisma.note.create({
    data: {
      nameEn: "Florentine Iris (Orris)",
      nameAr: "سوسن فلورنسا المخملي",
      slugEn: "florentine-iris",
      slugAr: "florentine-iris-ar",
      categoryEn: "Rare Florals",
      categoryAr: "الزهور الملكية",
      descriptionEn: "Aged for three full years before slow artisan distillation. Powdery, violet-like, sophisticated, and aristocratically soft.",
      descriptionAr: "تُعتق جذوره لثلاث سنوات كاملة قبل التقطير. نوتة بودرية مخملية مترفة تفيض بالنقاء.",
      heroImageUrl: "https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?auto=format&fit=crop&w=1600&q=85",
      status: NoteStatus.PUBLISHED,
    },
  });

  const noteAmbergris = await prisma.note.create({
    data: {
      nameEn: "Golden Ambergris",
      nameAr: "العنبر الأشهب الذهبي",
      slugEn: "golden-ambergris",
      slugAr: "golden-ambergris-ar",
      categoryEn: "Amber",
      categoryAr: "العنبر",
      descriptionEn: "Oceanic, salty-warm, and solar natural fixative conferring monolithic longevity and crystalline radiance.",
      descriptionAr: "عنبر بحري شمسي أصيل يمنح التكوين العطري ثباتاً ممتداً وإشراقة بلورية جذابة.",
      heroImageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=85",
      status: NoteStatus.PUBLISHED,
    },
  });

  const noteBergamot = await prisma.note.create({
    data: {
      nameEn: "Calabrian Bergamot",
      nameAr: "برغموت كالابريا النقي",
      slugEn: "calabrian-bergamot",
      slugAr: "calabrian-bergamot-ar",
      categoryEn: "Citrus",
      categoryAr: "الحمضيات",
      descriptionEn: "Cold-pressed in Southern Italy. Sparkling, sun-drenched, crisp, and aristocratic citrus opening.",
      descriptionAr: "معصور على البارد في مزارع جنوب إيطاليا. افتتاحية حمضية مبهجة ومشرقة كشمس الصباح.",
      heroImageUrl: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1600&q=85",
      status: NoteStatus.PUBLISHED,
    },
  });

  const noteVanilla = await prisma.note.create({
    data: {
      nameEn: "Madagascar Bourbon Vanilla",
      nameAr: "فانيليا بوربون مدغشقر",
      slugEn: "bourbon-vanilla",
      slugAr: "bourbon-vanilla-ar",
      categoryEn: "Gourmand",
      categoryAr: "غورماند",
      descriptionEn: "Aged black vanilla bean absolute delivering creamy, woody, and liquor-like sweetness.",
      descriptionAr: "خلاصة حبوب الفانيليا المعتقة تمنح حلاوة بلسمية خشبية كريمية ساحرة.",
      heroImageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=85",
      status: NoteStatus.PUBLISHED,
    },
  });

  const noteSaffron = await prisma.note.create({
    data: {
      nameEn: "Kashmiri Saffron",
      nameAr: "زعفران كشمير الأحمر",
      slugEn: "kashmiri-saffron",
      slugAr: "kashmiri-saffron-ar",
      categoryEn: "Spices",
      categoryAr: "التوابل",
      descriptionEn: "The red gold of spices. Bittersweet, metallic, warm-leathery, and distinctly opulent.",
      descriptionAr: "ذهب التوابل الأحمر. نوتة دافئة ذات طابع جلدي حلو تضفي عمقاً ملكياً آسراً.",
      heroImageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=85",
      status: NoteStatus.PUBLISHED,
    },
  });

  // 14. Master Products Catalog (7 Iconic Creations)
  const prodInterlude53 = await prisma.product.create({
    data: {
      slug: "amouage-interlude-53-man",
      nameEn: "Interlude 53 Man Extrait de Parfum",
      nameAr: "إنترلود 53 إكستري دي بارفان",
      taglineEn: "The legendary Blue Beast aged to 53% concentration perfection.",
      taglineAr: "أسطورة الوحش الأزرق معتق بتركيز 53% استثنائي.",
      descriptionEn: "Formulated at a formidable 53% perfume oil concentration and aged for six months in Oman. Interlude 53 reveals harmony in chaos with Silver Frankincense, pimento berry, and smoky Cambodian agarwood.",
      descriptionAr: "بتركيز 53% من الزيوت العطرية النقية ومعتق لمدة 6 أشهر في عُمان. يجمع بين اللبان الفضي وتوت البيمنتو والأوريغانو مع خشب العود الكمبودي الفاخر.",
      brandId: brandAmouage.id,
      scentFamilyId: familyWoody.id,
      concentration: Concentration.EXTRAIT_DE_PARFUM,
      gender: GenderCategory.MEN,
      releaseYear: 2020,
      countryOfOrigin: "Oman",
      sillage: "Monolithic & Unstoppable",
      longevity: "24+ Hours",
      styleCharacter: "Imperial & Dominant",
      images: [
        "/amouage-placeholder.svg",
        "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85",
      ],
      isPublished: true,
      isFeatured: true,
      isBestSeller: true,
      ratingAverage: 4.95,
      ratingCount: 142,
    },
  });

  const prodBaccaratExtrait = await prisma.product.create({
    data: {
      slug: "mfk-baccarat-rouge-540-extrait",
      nameEn: "Baccarat Rouge 540 Extrait de Parfum",
      nameAr: "باكارا روج 540 إكستري دي بارفان",
      taglineEn: "The grand culmination of crystal, fire, and glowing ambergris.",
      taglineAr: "قمة الفخامة التي تجمع بريق الكريستال ودفء العنبر المتوهج.",
      descriptionEn: "An amplified incarnation with Moroccan bitter almond, fiery saffron, Grandiflorum jasmine, and luminous ambergris.",
      descriptionAr: "تجسيد معزز باللوز المغربي المر والزعفران المتوهج وياسمين غرانديفلوروم والعنبر الأشهب المشرق.",
      brandId: brandMfk.id,
      scentFamilyId: familyOriental.id,
      concentration: Concentration.EXTRAIT_DE_PARFUM,
      gender: GenderCategory.UNISEX,
      releaseYear: 2017,
      countryOfOrigin: "France",
      sillage: "Luminous & Intoxicating",
      longevity: "18-24 Hours",
      styleCharacter: "Opulent & Magnetic",
      images: [
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85",
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
      ],
      isPublished: true,
      isFeatured: true,
      isBestSeller: true,
      ratingAverage: 4.98,
      ratingCount: 289,
    },
  });

  const prodElysium = await prisma.product.create({
    data: {
      slug: "roja-parfums-elysium-pour-homme-parfum",
      nameEn: "Elysium Pour Homme Parfum",
      nameAr: "إليزيوم بور هوم بارفان",
      taglineEn: "The paradise of aristocratic citrus and amber depth.",
      taglineAr: "فردوس الحمضيات الأرستقراطية وعمق العنبر النادر.",
      descriptionEn: "A heroic blend of sparkling Calabrian citrus accords, pink pepper, juniper berry, and a deep leather-amber base crafted without compromise.",
      descriptionAr: "مزيج بطولي من أرقى حمضيات كالابريا والفلفل الوردي وحبوب العرعر مع قاعدة جلدية عنبرية مهيبة صُنعت بدون أي قيود.",
      brandId: brandRoja.id,
      scentFamilyId: familyFresh.id,
      concentration: Concentration.PARFUM,
      gender: GenderCategory.MEN,
      releaseYear: 2017,
      countryOfOrigin: "United Kingdom",
      sillage: "Radiant & Commanding",
      longevity: "16-20 Hours",
      styleCharacter: "Noble & Invigorating",
      images: [
        "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=85",
        "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85",
      ],
      isPublished: true,
      isFeatured: true,
      isBestSeller: true,
      ratingAverage: 4.92,
      ratingCount: 198,
    },
  });

  const prodAlexandria = await prisma.product.create({
    data: {
      slug: "xerjoff-alexandria-ii",
      nameEn: "Alexandria II Eau de Parfum",
      nameAr: "ألكسندريا 2 أو دي بارفان",
      taglineEn: "Ancient royal Alexandrian libraries rendered in aged Laos oud.",
      taglineAr: "مكتبات الإسكندرية الملكية القديمة مجسدة بعود لاوس المعتق.",
      descriptionEn: "Sublime combination of sweet lavender, crisp green apple, rosewood, and aged wild Laotian agarwood. Enclosed in an exquisite sculptural flacon.",
      descriptionAr: "مزيج أسطوري يجمع اللافندر النقي والتفاح الأخضر وخشب الورد مع أندر خلاصات عود لاوس البري في زجاجة منحوتة فائقة الجمال.",
      brandId: brandXerjoff.id,
      scentFamilyId: familyWoody.id,
      concentration: Concentration.EAU_DE_PARFUM,
      gender: GenderCategory.UNISEX,
      releaseYear: 2012,
      countryOfOrigin: "Italy",
      sillage: "Enveloping & Majestic",
      longevity: "20+ Hours",
      styleCharacter: "Aristocratic & Timeless",
      images: [
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85",
      ],
      isPublished: true,
      isFeatured: true,
      isBestSeller: true,
      ratingAverage: 4.96,
      ratingCount: 175,
    },
  });

  const prodTobaccoVanille = await prisma.product.create({
    data: {
      slug: "tom-ford-tobacco-vanille",
      nameEn: "Tobacco Vanille Eau de Parfum",
      nameAr: "توباكو فانيلا أو دي بارفان",
      taglineEn: "The iconic private club aroma of tobacco leaf and rich spices.",
      taglineAr: "رائحة أندية النخبة الخاصة من أوراق التبغ والتوابل الغنية.",
      descriptionEn: "Opulent, warm, and iconic. Tom Ford reinvents classic tobacco with creamy tonka bean, Madagascar vanilla, cocoa, dry fruit accords, and sweet wood sap.",
      descriptionAr: "عطر مترف ومميز يعيد فيه توم فورد ابتكار التبغ الكلاسيكي بحبوب التونكا الكريمية وفانيليا مدغشقر والكاكاو والأخشاب الحلوة.",
      brandId: brandTomFord.id,
      scentFamilyId: familyGourmand.id,
      concentration: Concentration.EAU_DE_PARFUM,
      gender: GenderCategory.UNISEX,
      releaseYear: 2007,
      countryOfOrigin: "USA",
      sillage: "Warm & Powerful",
      longevity: "18+ Hours",
      styleCharacter: "Decadent & Warm",
      images: [
        "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1200&q=85",
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85",
      ],
      isPublished: true,
      isFeatured: true,
      isBestSeller: true,
      ratingAverage: 4.88,
      ratingCount: 310,
    },
  });

  const prodNo1 = await prisma.product.create({
    data: {
      slug: "clive-christian-no-1-masculine",
      nameEn: "No. 1 Masculine Edition",
      nameAr: "نمبر 1 الإصدار الرجالي الفاخر",
      taglineEn: "The culmination of rare ingredients and royal heritage.",
      taglineAr: "قمة الفخامة العطرية بأندر المكونات والإرث الملكي البريطاني.",
      descriptionEn: "Created without reference to cost. Contains 50-year-old aged Indian sandalwood, powdery Florentine orris, and royal Tahitian vanilla.",
      descriptionAr: "صُنع دون أي اعتبار للتكلفة، ويحتوي على خشب الصندل الهندي المعتق لخمسين عاماً، وسوسن فلورنسا البودري، وفانيليا تاهيتي الملكية.",
      brandId: brandClive.id,
      scentFamilyId: familyFloral.id,
      concentration: Concentration.PARFUM,
      gender: GenderCategory.MEN,
      releaseYear: 2001,
      countryOfOrigin: "United Kingdom",
      sillage: "Sublime Royal Presence",
      longevity: "20+ Hours",
      styleCharacter: "Sovereign & Rare",
      images: [
        "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85",
        "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1200&q=85",
      ],
      isPublished: true,
      isFeatured: true,
      isBestSeller: false,
      ratingAverage: 4.97,
      ratingCount: 88,
    },
  });

  const prodAventus = await prisma.product.create({
    data: {
      slug: "creed-aventus-millesime",
      nameEn: "Aventus Millésime",
      nameAr: "أفنتوس ميليزيم الفاخر",
      taglineEn: "Celebrating strength, power, and success with smoky pineapple and birch.",
      taglineAr: "احتفال بالقوة والنجاح بنفحات الأناناس المدخن والبتولا الملكي.",
      descriptionEn: "A legendary creation infused with blackcurrant, Italian bergamot, French apple, birch smoke, patchouli, and rare grey ambergris.",
      descriptionAr: "عطر أسطوري بنفحات الكشمش الأسود وبرغموت إيطاليا والتفاح الفرنسي ودخان البتولا والعنبر الأشهب النادر.",
      brandId: brandCreed.id,
      scentFamilyId: familyFresh.id,
      concentration: Concentration.EAU_DE_PARFUM,
      gender: GenderCategory.MEN,
      releaseYear: 2010,
      countryOfOrigin: "France",
      sillage: "Iconic & Magnetic",
      longevity: "14-18 Hours",
      styleCharacter: "Triumphant & Iconic",
      images: [
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85",
        "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=85",
      ],
      isPublished: true,
      isFeatured: true,
      isBestSeller: true,
      ratingAverage: 4.91,
      ratingCount: 420,
    },
  });

  // 15. Product Notes Connections
  await prisma.productNote.createMany({
    data: [
      { productId: prodInterlude53.id, noteId: noteFrankincense.id, position: NotePosition.HEART, prominence: 10 },
      { productId: prodInterlude53.id, noteId: noteOud.id, position: NotePosition.BASE, prominence: 10 },
      { productId: prodInterlude53.id, noteId: noteBergamot.id, position: NotePosition.TOP, prominence: 7 },
      { productId: prodBaccaratExtrait.id, noteId: noteSaffron.id, position: NotePosition.TOP, prominence: 10 },
      { productId: prodBaccaratExtrait.id, noteId: noteAmbergris.id, position: NotePosition.BASE, prominence: 10 },
      { productId: prodBaccaratExtrait.id, noteId: noteTaifRose.id, position: NotePosition.HEART, prominence: 8 },
      { productId: prodElysium.id, noteId: noteBergamot.id, position: NotePosition.TOP, prominence: 10 },
      { productId: prodElysium.id, noteId: noteAmbergris.id, position: NotePosition.BASE, prominence: 8 },
      { productId: prodAlexandria.id, noteId: noteOud.id, position: NotePosition.BASE, prominence: 10 },
      { productId: prodAlexandria.id, noteId: noteTaifRose.id, position: NotePosition.HEART, prominence: 9 },
      { productId: prodTobaccoVanille.id, noteId: noteVanilla.id, position: NotePosition.BASE, prominence: 10 },
      { productId: prodNo1.id, noteId: noteIris.id, position: NotePosition.HEART, prominence: 10 },
      { productId: prodNo1.id, noteId: noteVanilla.id, position: NotePosition.BASE, prominence: 8 },
      { productId: prodAventus.id, noteId: noteBergamot.id, position: NotePosition.TOP, prominence: 9 },
      { productId: prodAventus.id, noteId: noteAmbergris.id, position: NotePosition.BASE, prominence: 8 },
    ],
  });

  // 16. Product Variants & Sample Vials with Inventory for ALL 7 Creations
  const productDefinitions = [
    {
      product: prodInterlude53,
      skuBase: "AMO-INT53",
      flaconVolume: 100,
      flaconLabelEn: "100ml Extrait Bottle",
      flaconLabelAr: "زجاجة 100 مل إكستري",
      flaconCost: 750,
      flaconPrice: 1850,
      flaconCompareAt: 2100,
      flaconQty: 28,
      samplePrice: 65,
      sampleQty: 120,
    },
    {
      product: prodBaccaratExtrait,
      skuBase: "MFK-BR540-EXT",
      flaconVolume: 70,
      flaconLabelEn: "70ml Extrait Bottle",
      flaconLabelAr: "زجاجة 70 مل إكستري",
      flaconCost: 820,
      flaconPrice: 1950,
      flaconCompareAt: 2250,
      flaconQty: 34,
      samplePrice: 65,
      sampleQty: 140,
    },
    {
      product: prodElysium,
      skuBase: "ROJ-ELY-PARFUM",
      flaconVolume: 100,
      flaconLabelEn: "100ml Pure Parfum Bottle",
      flaconLabelAr: "زجاجة 100 مل بارفان نقي",
      flaconCost: 880,
      flaconPrice: 1950,
      flaconCompareAt: 2200,
      flaconQty: 25,
      samplePrice: 65,
      sampleQty: 110,
    },
    {
      product: prodAlexandria,
      skuBase: "XER-ALEX2-EDP",
      flaconVolume: 100,
      flaconLabelEn: "100ml Eau de Parfum Flacon",
      flaconLabelAr: "زجاجة 100 مل أو دي بارفان",
      flaconCost: 950,
      flaconPrice: 2200,
      flaconCompareAt: 2450,
      flaconQty: 20,
      samplePrice: 65,
      sampleQty: 95,
    },
    {
      product: prodTobaccoVanille,
      skuBase: "TF-TOB-VAN",
      flaconVolume: 100,
      flaconLabelEn: "100ml Private Blend Flacon",
      flaconLabelAr: "زجاجة 100 مل برايفيت بليند",
      flaconCost: 780,
      flaconPrice: 1720,
      flaconCompareAt: 1950,
      flaconQty: 30,
      samplePrice: 65,
      sampleQty: 130,
    },
    {
      product: prodNo1,
      skuBase: "CC-NO1-MASC",
      flaconVolume: 50,
      flaconLabelEn: "50ml Crown Flacon",
      flaconLabelAr: "زجاجة 50 مل التاج الملكي",
      flaconCost: 1250,
      flaconPrice: 2850,
      flaconCompareAt: 3200,
      flaconQty: 15,
      samplePrice: 85,
      sampleQty: 80,
    },
    {
      product: prodAventus,
      skuBase: "CRD-AVENTUS",
      flaconVolume: 100,
      flaconLabelEn: "100ml Millésime Flacon",
      flaconLabelAr: "زجاجة 100 مل ميليزيم",
      flaconCost: 790,
      flaconPrice: 1650,
      flaconCompareAt: 1850,
      flaconQty: 40,
      samplePrice: 65,
      sampleQty: 160,
    },
  ];

  for (const def of productDefinitions) {
    // 1. Standard full bottle variant
    const flaconVariant = await prisma.productVariant.create({
      data: {
        productId: def.product.id,
        sku: `${def.skuBase}-${def.flaconVolume}ML`,
        volumeMl: def.flaconVolume,
        sizeLabelEn: def.flaconLabelEn,
        sizeLabelAr: def.flaconLabelAr,
        costPrice: def.flaconCost,
        price: def.flaconPrice,
        compareAtPrice: def.flaconCompareAt,
        barcode: `7016${Math.floor(10000000 + Math.random() * 90000000)}`,
        isSampleVial: false,
      },
    });

    await prisma.inventory.create({
      data: {
        variantId: flaconVariant.id,
        sealedQuantity: def.flaconQty,
        testerQuantity: 5,
        reservedQuantity: 0,
      },
    });

    // 2. Official 2ml sample vial for Discovery Sets
    const sampleVariant = await prisma.productVariant.create({
      data: {
        productId: def.product.id,
        sku: `${def.skuBase}-02ML`,
        volumeMl: 2,
        sizeLabelEn: "2ml Official Sample Vial",
        sizeLabelAr: "عينة رسمية 2 مل",
        costPrice: 15,
        price: def.samplePrice,
        isSampleVial: true,
      },
    });

    await prisma.inventory.create({
      data: {
        variantId: sampleVariant.id,
        sealedQuantity: def.sampleQty,
        testerQuantity: 20,
        reservedQuantity: 0,
      },
    });
  }

  // 17. Editorial Journal Posts
  const blogCat = await prisma.blogCategory.create({
    data: {
      nameEn: "Haute Technique & Layering",
      nameAr: "فن المزج والطقوس العطرية",
      slug: "haute-technique",
    },
  });

  const postLayering = await prisma.blogPost.create({
    data: {
      slug: "art-of-layering-oud-and-taif-rose",
      titleEn: "The Sacred Alchemy: Layering Aged Omani Oud with Mountain Taif Rose",
      titleAr: "الكيمياء المقدسة: فن مزج العود العُماني المعتق مع ورد الطائف الجبلي",
      excerptEn: "Discover the centuries-old Gulf tradition of combining wild balsamic agarwood with fresh, honeyed dawn-harvested roses for royal occasions.",
      excerptAr: "اكتشف التقاليد الخليجية الأصيلة في مزج العود البري البلسمي مع الورد المقطوف عند بزوغ الفجر في المناسبات الملكية.",
      contentEn: "<p>The ritual of scent layering in Arabian culture is not merely cosmetic—it is an architectural craft passed through generations...</p>",
      contentAr: "<p>إن طقس مزج العطور في الثقافة العربية الأصيلة ليس مجرد تجميل، بل هو فن معماري متوارث عبر الأجيال...</p>",
      authorName: "Salim Al-Harthy",
      coverImageUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80",
      readingTimeMinutes: 6,
      categoryId: blogCat.id,
      isPublished: true,
    },
  });

  await prisma.blogPostProduct.create({
    data: {
      postId: postLayering.id,
      productId: prodInterlude53.id,
    },
  });

  const postMaceration = await prisma.blogPost.create({
    data: {
      slug: "architecture-of-extraits-maceration",
      titleEn: "The Architecture of Extraits: Why 53% Concentration Requires 6 Months Maceration",
      titleAr: "هندسة العطور المركزة: لماذا يتطلب تركيز 53% ستة أشهر من التعتيق",
      excerptEn: "An inside look into high-concentration extraits and why aging raw perfume oils at controlled cellar temperatures transforms volatile top notes into seamless silk.",
      excerptAr: "نظرة متعمقة في كواليس صناعة الخلاصات العطرية فائقة التركيز وكيف يحوّل التعتيق البطيء النوتات الحادة إلى حرير عطري منسجم.",
      contentEn: "<p>When perfume oil exceeds 50% concentration, standard formulation principles cease to apply...</p>",
      contentAr: "<p>عندما يتجاوز تركيز الزيت العطري حاجز الـ 50%، تتغير قواعد الصياغة العطرية التقليدية بالكامل...</p>",
      authorName: "Dr. Elena Rostova",
      coverImageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80",
      readingTimeMinutes: 8,
      categoryId: blogCat.id,
      isPublished: true,
    },
  });

  await prisma.blogPostProduct.create({
    data: {
      postId: postMaceration.id,
      productId: prodBaccaratExtrait.id,
    },
  });

  // 18. Customer & Verified Buyer Reviews
  const customerAhmad = await prisma.customer.create({
    data: {
      email: "ahmad.almaktoum@example.ae",
      firstName: "Ahmad",
      lastName: "Al Maktoum",
      phone: "+971501234567",
      isVip: true,
      loyaltyPoints: 1250,
      fragranceProfile: {
        create: {
          preferredFamilies: ["Woody & Smoky", "Oriental & Amber"],
          favoriteNotes: ["Silver Frankincense", "Cambodian Agarwood (Oud)"],
          dislikedNotes: ["Synthetic Calone"],
          preferredSillage: "Intense Royal Projection",
          preferredLongevity: "24 Hours",
          signatureScentSlug: "amouage-interlude-53-man",
        },
      },
    },
  });

  await prisma.address.create({
    data: {
      customerId: customerAhmad.id,
      fullName: "Ahmad Al Maktoum",
      phone: "+971501234567",
      streetAddress: "Villa 14, Frond N, Palm Jumeirah",
      city: "Dubai",
      emirateState: "Dubai",
      countryCode: "AE",
      isDefault: true,
    },
  });

  const customerSultan = await prisma.customer.upsert({
    where: { email: "sultan@muschio.client" },
    update: {
      firstName: "Sultan",
      lastName: "Al-Nuaimi",
      phone: "+971 50 123 4567",
      isVip: true,
      loyaltyPoints: 1450,
    },
    create: {
      email: "sultan@muschio.client",
      firstName: "Sultan",
      lastName: "Al-Nuaimi",
      phone: "+971 50 123 4567",
      isVip: true,
      loyaltyPoints: 1450,
      fragranceProfile: {
        create: {
          preferredFamilies: ["Woody & Smoky", "Oriental & Amber"],
          favoriteNotes: ["Silver Frankincense", "Cambodian Agarwood (Oud)", "Royal Taif Rose"],
          dislikedNotes: [],
          preferredSillage: "Strong & Enveloping",
          preferredLongevity: "Eternal (12+ hours)",
          signatureScentSlug: "amouage-interlude-53-man",
        },
      },
    },
  });

  await prisma.address.create({
    data: {
      customerId: customerSultan.id,
      fullName: "Sultan Al-Nuaimi",
      phone: "+971 50 123 4567",
      streetAddress: "Villa 42, Street 6, Sector E, Emirates Hills",
      city: "Dubai",
      emirateState: "Dubai",
      countryCode: "AE",
      isDefault: true,
    },
  });


  await prisma.review.create({
    data: {
      customerId: customerAhmad.id,
      productId: prodInterlude53.id,
      rating: 5,
      title: "The True Definition of Omani Royalty",
      body: "An absolute masterpiece. The 53% concentration changes the opening entirely—the harsh smoke is smoothed into aged velvet incense with rich balsamic sweetness. Lasts over 24 hours on thobe.",
      longevityRating: 5,
      sillageRating: 5,
      isVerifiedPurchase: true,
      helpfulCount: 38,
    },
  });

  // 19. Content Graph Node (Dubai Haute Buying Guide)
  await prisma.contentNode.create({
    data: {
      slug: "dubai-niche-perfume-guide-2026",
      contentType: "BUYING_GUIDE",
      titleEn: "The Connoisseur's Guide to Haute Perfumery in Dubai & the Arabian Gulf",
      titleAr: "دليل النخبة لاقتناء عطور النيش الفاخرة في دبي والخليج العربي",
      metaTitleEn: "Dubai Niche Perfumes Guide 2026 | Muschio Haute Parfumerie",
      metaTitleAr: "دليل عطور النيش في دبي 2026 | دار مسكيو للعطور الفاخرة",
      metaDescriptionEn: "Discover authentic extraits de parfum, aged attars, and royal frankincense formulations crafted for the Arabian climate.",
      metaDescriptionAr: "اكتشف أندر الخلاصات العطرية والدهون المعتقة المصممة خصيصاً لأجواء الخليج العربي والقصور الملكية.",
      canonicalUrl: "https://muschio.luxury/en/content/dubai-niche-perfume-guide-2026",
      contentEn: "<p>Haute perfumery in Dubai requires fragrances with exceptional maceration, pure oils, and aristocratic longevity...</p>",
      contentAr: "<p>تتطلب العطور الفاخرة في دبي والخليج ثباتاً استثنائياً ونقاءً للزيوت العطرية الملكية المعتقة...</p>",
      heroImageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=85",
      isPublished: true,
    },
  });

  console.log("✅ Muschio Enterprise Database Seeded Successfully with Complete 7-Brand Haute Catalog & Sample Vials!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
