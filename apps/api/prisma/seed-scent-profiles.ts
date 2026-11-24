import { PrismaClient } from "@prisma/client";
import { DEFAULT_SCENT_PROFILES } from "@muschio/types";

const prisma = new PrismaClient();

async function run() {
  console.log("Upserting 12 default scent profiles...");
  const profileMap = new Map<string, string>();

  for (const p of DEFAULT_SCENT_PROFILES) {
    const record = await prisma.scentProfile.upsert({
      where: { slug: p.slug },
      update: {
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        descriptionEn: p.descriptionEn,
        descriptionAr: p.descriptionAr,
        imageUrl: p.imageUrl,
        colorHex: p.colorHex,
        isFeatured: p.isFeatured,
        sortOrder: p.sortOrder,
      },
      create: {
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        slug: p.slug,
        descriptionEn: p.descriptionEn,
        descriptionAr: p.descriptionAr,
        imageUrl: p.imageUrl,
        colorHex: p.colorHex,
        isFeatured: p.isFeatured,
        sortOrder: p.sortOrder,
      },
    });
    profileMap.set(p.slug, record.id);
    console.log(`- Upserted: ${record.nameEn} (${record.slug}) -> ${record.id}`);
  }

  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      slug: true,
      nameEn: true,
      notes: {
        include: {
          note: true,
        },
      },
      accords: {
        include: {
          accord: true,
        },
      },
    },
  });

  console.log(`\nFound ${allProducts.length} products to map.`);

  // Define sensible mappings for common luxury fragrances in catalog
  // Multiple profiles per fragrance (e.g. Afternoon Swim: Fresh, Citrus, Aromatic)
  const profileAssignments: Record<string, string[]> = {
    // Fresh & Citrus
    "afternoon-swim": ["fresh", "citrus", "aromatic"],
    "colonia-intensa": ["citrus", "woody", "spicy", "aromatic"],
    "hacivat-extrait-de-parfum": ["fruity", "woody", "citrus", "musky"],
    "decision": ["woody", "spicy", "amber", "oud"],
    "portrait-of-a-lady": ["floral", "amber", "spicy", "woody"],
    "aventus": ["fruity", "woody", "musky", "fresh"],
    "baccarat-rouge-540-extrait": ["amber", "woody", "gourmand", "spicy"],
    "oud-wood": ["oud", "woody", "spicy", "amber"],
    "angels-share": ["gourmand", "spicy", "amber", "woody"],
    "silver-mountain-water": ["fresh", "citrus", "musky", "aromatic"],
    "black-phantom": ["gourmand", "woody", "spicy"],
    "tuscan-leather": ["leather", "spicy", "woody", "amber"],
    "ombre-nomade": ["oud", "leather", "amber", "spicy"],
    "fabulous": ["leather", "amber", "aromatic", "gourmand"],
    "santal-33": ["woody", "aromatic", "spicy", "leather"],
    "musc-ravageur": ["musky", "amber", "spicy", "gourmand"],
    "grand-soir": ["amber", "gourmand", "woody"],
    "interlude-man": ["amber", "spicy", "woody", "oud"],
    "delina-exclusif": ["floral", "fruity", "amber", "musky"],
    "erba-pura": ["fruity", "citrus", "musky", "amber"],
  };

  // Generic heuristic based on note names, accords, or product slug/name if not explicitly in profileAssignments
  for (const product of allProducts) {
    const slugKey = product.slug.toLowerCase();
    let assignedSlugs = Object.entries(profileAssignments).find(([key]) => slugKey.includes(key))?.[1];

    if (!assignedSlugs || assignedSlugs.length === 0) {
      // Heuristic fallback matching notes/accords/text
      const text = `${product.nameEn} ${product.slug} ${product.accords.map(a => a.accord.nameEn).join(" ")} ${product.notes.map(n => n.note.nameEn).join(" ")}`.toLowerCase();
      const detected = new Set<string>();

      if (text.includes("citrus") || text.includes("bergamot") || text.includes("lemon") || text.includes("mandarin") || text.includes("orange")) {
        detected.add("citrus");
        detected.add("fresh");
      }
      if (text.includes("rose") || text.includes("jasmine") || text.includes("floral") || text.includes("iris") || text.includes("tuberose")) {
        detected.add("floral");
      }
      if (text.includes("oud") || text.includes("agarwood") || text.includes("cambodian") || text.includes("assam")) {
        detected.add("oud");
        detected.add("woody");
      }
      if (text.includes("wood") || text.includes("cedar") || text.includes("sandalwood") || text.includes("vetiver") || text.includes("patchouli")) {
        detected.add("woody");
      }
      if (text.includes("amber") || text.includes("resin") || text.includes("benzoin") || text.includes("labdanum")) {
        detected.add("amber");
      }
      if (text.includes("leather") || text.includes("suede") || text.includes("birch")) {
        detected.add("leather");
      }
      if (text.includes("vanilla") || text.includes("caramel") || text.includes("tonka") || text.includes("chocolate") || text.includes("gourmand") || text.includes("praline")) {
        detected.add("gourmand");
      }
      if (text.includes("spice") || text.includes("pepper") || text.includes("cardamom") || text.includes("cinnamon") || text.includes("saffron") || text.includes("clove")) {
        detected.add("spicy");
      }
      if (text.includes("musk") || text.includes("cashmere") || text.includes("clean")) {
        detected.add("musky");
      }
      if (text.includes("apple") || text.includes("peach") || text.includes("berry") || text.includes("pineapple") || text.includes("blackcurrant") || text.includes("fruit")) {
        detected.add("fruity");
      }
      if (text.includes("lavender") || text.includes("sage") || text.includes("rosemary") || text.includes("mint") || text.includes("aromatic") || text.includes("herb")) {
        detected.add("aromatic");
      }
      if (detected.size === 0) {
        // Default luxury pair
        detected.add("woody");
        detected.add("amber");
      }
      assignedSlugs = Array.from(detected);
    }

    console.log(`Mapping ${product.nameEn} (${product.slug}) -> ${assignedSlugs.join(", ")}`);

    for (const slug of assignedSlugs) {
      const profileId = profileMap.get(slug);
      if (!profileId) continue;
      await prisma.productScentProfile.upsert({
        where: {
          productId_scentProfileId: {
            productId: product.id,
            scentProfileId: profileId,
          },
        },
        update: {},
        create: {
          productId: product.id,
          scentProfileId: profileId,
        },
      });
    }
  }

  // Count products per profile to verify distribution
  const counts = await prisma.scentProfile.findMany({
    select: {
      nameEn: true,
      slug: true,
      _count: {
        select: { products: true },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  console.log("\nScent Profile distribution:");
  for (const c of counts) {
    console.log(`- ${c.nameEn} (${c.slug}): ${c._count.products} products`);
  }

  console.log("\nSeed completed successfully.");
}

run()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
