import { CloudinaryService } from "../src/services/cloudinary.service";
import { prisma } from "../src/prisma";

interface ProductUploadConfig {
  slug: string;
  nameEn: string;
  primaryPublicId: string;
  primarySourceUrl: string;
  secondaryPublicId: string;
  secondarySourceUrl: string;
}

const PRODUCTS_TO_SYNC: ProductUploadConfig[] = [
  {
    slug: "amouage-interlude-53-man",
    nameEn: "Interlude 53 Man Extrait de Parfum",
    primaryPublicId: "amouage-interlude-53-man-primary",
    // Luxury dark cobalt royal blue bottle with gold detailing
    primarySourceUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85",
    secondaryPublicId: "amouage-interlude-53-man-lifestyle",
    secondarySourceUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85",
  },
  {
    slug: "mfk-baccarat-rouge-540-extrait",
    nameEn: "Baccarat Rouge 540 Extrait de Parfum",
    primaryPublicId: "mfk-baccarat-rouge-540-primary",
    // Fiery crystal extrait bottle with radiant red and gold aesthetic
    primarySourceUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
    secondaryPublicId: "mfk-baccarat-rouge-540-lifestyle",
    secondarySourceUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85",
  },
  {
    slug: "roja-parfums-elysium-pour-homme-parfum",
    nameEn: "Elysium Pour Homme Parfum",
    primaryPublicId: "roja-elysium-pour-homme-primary",
    // Deep sapphire & gold luxury fragrance flacon
    primarySourceUrl: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=85",
    secondaryPublicId: "roja-elysium-pour-homme-lifestyle",
    secondarySourceUrl: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=85",
  },
  {
    slug: "xerjoff-alexandria-ii",
    nameEn: "Alexandria II Eau de Parfum",
    primaryPublicId: "xerjoff-alexandria-ii-primary",
    // Elegant sculptural gold-adorned artisanal flacon
    primarySourceUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85",
    secondaryPublicId: "xerjoff-alexandria-ii-lifestyle",
    secondarySourceUrl: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=1200&q=85",
  },
  {
    slug: "tom-ford-tobacco-vanille",
    nameEn: "Tobacco Vanille Eau de Parfum",
    primaryPublicId: "tom-ford-tobacco-vanille-primary",
    // Architectural dark amber chess flacon
    primarySourceUrl: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1200&q=85",
    secondaryPublicId: "tom-ford-tobacco-vanille-lifestyle",
    secondarySourceUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85",
  },
  {
    slug: "clive-christian-no-1-masculine",
    nameEn: "No. 1 Masculine Edition",
    primaryPublicId: "clive-christian-no1-primary",
    // Imperial gold flacon with royal crown stopper
    primarySourceUrl: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1200&q=85",
    secondaryPublicId: "clive-christian-no1-lifestyle",
    secondarySourceUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
  },
  {
    slug: "creed-aventus-millesime",
    nameEn: "Aventus Millésime",
    primaryPublicId: "creed-aventus-primary",
    // Noble silver and black luxury flacon
    primarySourceUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85",
    secondaryPublicId: "creed-aventus-lifestyle",
    secondarySourceUrl: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=85",
  },
];

async function syncCatalogToCloudinary() {
  console.log("🚀 Starting Cloudinary Media CDN Migration for Muschio...");

  // 1. Process each product
  for (const item of PRODUCTS_TO_SYNC) {
    console.log(`\n📦 Processing Product: ${item.nameEn} (${item.slug})...`);

    // Upload primary image to Cloudinary
    console.log(`  Uploading primary image -> public_id: ${item.primaryPublicId}`);
    const primaryUpload = await CloudinaryService.uploadImage({
      file: item.primarySourceUrl,
      folder: "muschio/products",
      publicId: item.primaryPublicId,
      overwrite: true,
      tags: ["muschio", "product", "primary", item.slug],
    });

    // Upload secondary image to Cloudinary
    console.log(`  Uploading secondary image -> public_id: ${item.secondaryPublicId}`);
    const secondaryUpload = await CloudinaryService.uploadImage({
      file: item.secondarySourceUrl,
      folder: "muschio/products",
      publicId: item.secondaryPublicId,
      overwrite: true,
      tags: ["muschio", "product", "secondary", item.slug],
    });

    const cloudinaryImages = [primaryUpload.secureUrl, secondaryUpload.secureUrl];
    console.log("  ✅ Cloudinary URLs generated:", cloudinaryImages);

    // Update Product record in Neon database
    const updated = await prisma.product.updateMany({
      where: { slug: item.slug },
      data: {
        images: cloudinaryImages,
      },
    });

    // Also ensure all variants have volume string set
    const p = await prisma.product.findUnique({
      where: { slug: item.slug },
      include: { variants: true },
    });
    if (p) {
      for (const v of p.variants) {
        const volStr = v.volume || (v.volumeMl ? `${v.volumeMl}ml` : "100ml");
        await prisma.productVariant.update({
          where: { id: v.id },
          data: {
            volume: volStr,
          },
        });
      }
    }

    console.log(`  💾 Updated DB for ${item.slug}: ${updated.count} record(s).`);
  }

  // 2. Fix the "test" product (Amouage Guidance 46 Extrait)
  console.log("\n📦 Standardizing Guidance product record...");
  const testProd = await prisma.product.findUnique({
    where: { slug: "test" },
    include: { variants: true },
  });

  if (testProd) {
    await prisma.product.update({
      where: { id: testProd.id },
      data: {
        slug: "amouage-guidance-extrait",
        nameEn: "Guidance 46 Extrait de Parfum",
        nameAr: "غايدنس 46 إكستري دي بارفان",
        taglineEn: "The hypnotic, whisper-soft rose, frankincense, and hazelnut extrait.",
        taglineAr: "خلاصة الورد واللبان الحوجري والبندق الفاخر بتركيز استثنائي.",
        descriptionEn: "A monumental 46% concentration extrait de parfum. A luminous tower of floral whispers, ambergris, pear, frankincense, and creamy hazelnut.",
        descriptionAr: "تركيز أسطوري بنسبة 46% من الزيوت النقية يجمع نوتات الكمثرى واللبان الفضي والبندق والعنبر.",
      },
    });

    for (const v of testProd.variants) {
      await prisma.productVariant.update({
        where: { id: v.id },
        data: {
          sku: "AMO-GUID46-100",
          volume: "100ml",
          volumeMl: 100,
          price: 1850,
          compareAtPrice: 2100,
          discountPrice: 1850,
        },
      });
    }
    console.log("  ✅ Updated Guidance product with valid volume, pricing, and slug.");
  }

  console.log("\n✨ Cloudinary Media CDN Migration completed successfully!");
}

syncCatalogToCloudinary()
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
