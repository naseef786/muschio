import {
  PrismaClient,
  BrandType,
  Concentration,
  GenderCategory,
  NotePosition,
  NoteStatus,
  AdminRole,
  ProductRelationType,
  PaymentMethodType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Muschio Enterprise Luxury Fragrance Database...");

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
      defaultLanguage: "ar",
      taxRatePercent: 5.0,
      freeShippingThreshold: 500,
      standardShippingFee: 30,
      isEnabled: true,
      supportedPaymentTypes: [
        PaymentMethodType.TABBY,
        PaymentMethodType.TAMARA,
        PaymentMethodType.CREDIT_CARD,
        PaymentMethodType.APPLE_PAY,
        PaymentMethodType.GOOGLE_PAY,
        PaymentMethodType.CASH_ON_DELIVERY,
      ],
    },
  });

  const marketKsa = await prisma.market.create({
    data: {
      code: "SA",
      nameEn: "Kingdom of Saudi Arabia",
      nameAr: "المملكة العربية السعودية",
      currency: "SAR",
      defaultLanguage: "ar",
      taxRatePercent: 15.0,
      freeShippingThreshold: 600,
      standardShippingFee: 45,
      isEnabled: true,
      supportedPaymentTypes: [
        PaymentMethodType.TABBY,
        PaymentMethodType.TAMARA,
        PaymentMethodType.CREDIT_CARD,
        PaymentMethodType.APPLE_PAY,
        PaymentMethodType.GOOGLE_PAY,
      ],
    },
  });

  // 4. Suppliers
  const supplierAmouage = await prisma.supplier.create({
    data: {
      code: "SUP-AMO-01",
      name: "Amouage Royal Attars & Parfums LLC",
      contactEmail: "allocations@amouage.com",
      country: "Oman",
      paymentTerms: "Net 30",
    },
  });

  const supplierMfk = await prisma.supplier.create({
    data: {
      code: "SUP-MFK-02",
      name: "Maison Francis Kurkdjian Paris Distribution",
      contactEmail: "orders@franciskurkdjian.com",
      country: "France",
      paymentTerms: "Net 45",
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

  // 12. Brands
  const brandAmouage = await prisma.brand.create({
    data: {
      name: "Amouage",
      slug: "amouage",
      type: BrandType.NICHE,
      descriptionEn: "The Gift of Kings. Founded in the Sultanate of Oman in 1983, Amouage crafts the finest haute perfumery using rare Silver Frankincense, Mountain Rock Rose, and aged Oud.",
      descriptionAr: "هدية الملوك. تأسست في سلطنة عُمان عام 1983، وتصنع أرقى العطور النيش باستخدام اللبان الحوجري الفضي والورد الجبلي والعود المعتق.",
      logoUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80",
      heroImageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=85",
      countryOfOrigin: "Oman",
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
      countryOfOrigin: "France",
      isFeatured: true,
    },
  });

  // 13. Dedicated Notes
  const noteFrankincense = await prisma.note.create({
    data: {
      nameEn: "Silver Frankincense",
      nameAr: "اللبان الحوجري الفضي",
      slugEn: "silver-frankincense",
      slugAr: "silver-frankincense-ar",
      categoryEn: "Resins & Incense",
      categoryAr: "الراتنجات والبخور",
      descriptionEn: "Harvested exclusively from Boswellia sacra trees in the Dhofar mountains of Oman. Radiating balsamic, ethereal incense and citrusy nuances.",
      descriptionAr: "يُحصد حصرياً من أشجار اللبان الحوجري في جبال ظفار بسلطنة عُمان. يمنح العطر طابعاً بخورياً مقدساً ونقاءً استثنائياً.",
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
      categoryEn: "Floral",
      categoryAr: "الزهور الملكية",
      descriptionEn: "Harvested at dawn in the high-altitude mountains of Saudi Arabia. Celebrated for honeyed, intensely deep, and regal floral aroma.",
      descriptionAr: "يُقطف عند بزوغ الفجر في أعالي جبال الطائف بالمملكة العربية السعودية، ويشتهر بأريجه العسلي والزهري الملكي الفواح.",
      heroImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=85",
      status: NoteStatus.PUBLISHED,
    },
  });

  // 14. Products
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
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85",
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

  // 15. Product Notes, Accords, Perfumers & Relations
  await prisma.productNote.createMany({
    data: [
      { productId: prodInterlude53.id, noteId: noteFrankincense.id, position: NotePosition.HEART, prominence: 10 },
      { productId: prodInterlude53.id, noteId: noteOud.id, position: NotePosition.BASE, prominence: 10 },
      { productId: prodBaccaratExtrait.id, noteId: noteTaifRose.id, position: NotePosition.HEART, prominence: 8 },
    ],
  });

  await prisma.productAccord.createMany({
    data: [
      { productId: prodInterlude53.id, accordId: accordSmoky.id, prominence: 10 },
      { productId: prodInterlude53.id, accordId: accordBalsamic.id, prominence: 8 },
      { productId: prodBaccaratExtrait.id, accordId: accordAmbery.id, prominence: 10 },
    ],
  });

  await prisma.productPerfumer.createMany({
    data: [
      { productId: prodInterlude53.id, perfumerId: perfumerPierre.id, isLead: true },
      { productId: prodBaccaratExtrait.id, perfumerId: perfumerFrancis.id, isLead: true },
    ],
  });

  await prisma.productCollection.createMany({
    data: [
      { productId: prodInterlude53.id, collectionId: colRoyal2026.id, displayOrder: 1 },
      { productId: prodBaccaratExtrait.id, collectionId: colRoyal2026.id, displayOrder: 2 },
    ],
  });

  await prisma.productOccasion.createMany({
    data: [
      { productId: prodInterlude53.id, occasionId: occasionGala.id },
      { productId: prodBaccaratExtrait.id, occasionId: occasionGala.id },
    ],
  });

  await prisma.productSeason.createMany({
    data: [
      { productId: prodInterlude53.id, seasonId: seasonWinter.id },
      { productId: prodBaccaratExtrait.id, seasonId: seasonWinter.id },
    ],
  });

  await prisma.productRelation.create({
    data: {
      productId: prodInterlude53.id,
      relatedProductId: prodBaccaratExtrait.id,
      relationType: ProductRelationType.COMPLEMENTARY_LAYERING,
      notes: "Layering Interlude 53 with Baccarat Rouge 540 Extrait creates the ultimate smoky-sweet royal trail.",
    },
  });

  // 16. Product Variants & Physical Inventory Lots
  const varInterlude100 = await prisma.productVariant.create({
    data: {
      productId: prodInterlude53.id,
      sku: "AMO-INT53-100ML",
      volumeMl: 100,
      sizeLabelEn: "100ml Extrait Bottle",
      sizeLabelAr: "زجاجة 100 مل إكستري",
      costPrice: 750,
      price: 1850,
      compareAtPrice: 2100,
      barcode: "701666320141",
    },
  });

  const varInterludeSample = await prisma.productVariant.create({
    data: {
      productId: prodInterlude53.id,
      sku: "AMO-INT53-02ML",
      volumeMl: 2,
      sizeLabelEn: "2ml Official Sample Extrait",
      sizeLabelAr: "عينة 2 مل رسمية",
      costPrice: 15,
      price: 65,
      isSampleVial: true,
    },
  });

  const varBaccarat70 = await prisma.productVariant.create({
    data: {
      productId: prodBaccaratExtrait.id,
      sku: "MFK-BR540-EXT-70ML",
      volumeMl: 70,
      sizeLabelEn: "70ml Extrait Bottle",
      sizeLabelAr: "زجاجة 70 مل إكستري",
      costPrice: 820,
      price: 1950,
      compareAtPrice: 2250,
      barcode: "3700559605805",
    },
  });

  // Inventory Aggregate
  await prisma.inventory.createMany({
    data: [
      { variantId: varInterlude100.id, sealedQuantity: 28, testerQuantity: 5, reservedQuantity: 0 },
      { variantId: varInterludeSample.id, sealedQuantity: 120, testerQuantity: 0, reservedQuantity: 0 },
      { variantId: varBaccarat70.id, sealedQuantity: 34, testerQuantity: 4, reservedQuantity: 0 },
    ],
  });

  // Physical Inventory Lots & Stock Ledger
  const lotInterlude = await prisma.inventoryLot.create({
    data: {
      warehouseId: warehouseDxb.id,
      variantId: varInterlude100.id,
      supplierId: supplierAmouage.id,
      batchCode: "BATCH-AMO-2026-01",
      purchaseCost: 750,
      quantityReceived: 30,
      quantityAvailable: 28,
      quantityTester: 2,
    },
  });

  await prisma.stockLedger.create({
    data: {
      warehouseId: warehouseDxb.id,
      lotId: lotInterlude.id,
      variantId: varInterlude100.id,
      movementType: "GOODS_RECEIPT",
      quantity: 30,
      referenceType: "INITIAL_SEED_GRN",
      notes: "Initial direct import allocation from Amouage Oman",
    },
  });

  // 17. Multi-Market Pricing (KSA SAR pricing)
  await prisma.marketPrice.createMany({
    data: [
      { marketId: marketKsa.id, variantId: varInterlude100.id, price: 1890, compareAtPrice: 2150 },
      { marketId: marketKsa.id, variantId: varBaccarat70.id, price: 1990, compareAtPrice: 2300 },
    ],
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

  console.log("✅ Muschio Enterprise Database Seeded Successfully with All 19 Domain Specifications!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
