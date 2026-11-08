import { prisma } from "../prisma";

export interface TagCreateInput {
  nameEn: string;
  nameAr: string;
  slug?: string;
  description?: string;
  colorHex?: string;
  isFeatured?: boolean;
}

export interface TagUpdateInput {
  nameEn?: string;
  nameAr?: string;
  slug?: string;
  description?: string;
  colorHex?: string;
  isFeatured?: boolean;
}

export class TagService {
  /**
   * Helper to slugify a string
   */
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Get all tags with product count and optional search or featured filter
   */
  static async getTags(params?: { search?: string; isFeatured?: boolean }) {
    await this.ensureDefaultTags();

    const where: any = {};
    if (params?.isFeatured !== undefined) {
      where.isFeatured = params.isFeatured;
    }
    if (params?.search) {
      where.OR = [
        { nameEn: { contains: params.search, mode: "insensitive" } },
        { nameAr: { contains: params.search, mode: "insensitive" } },
        { slug: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const tags = await prisma.tag.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { nameEn: "asc" }],
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return tags.map((t) => ({
      id: t.id,
      nameEn: t.nameEn,
      nameAr: t.nameAr,
      slug: t.slug,
      description: t.description,
      colorHex: t.colorHex || "#171717",
      isFeatured: t.isFeatured,
      productCount: t._count.products,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  }

  /**
   * Get single tag by slug or ID with associated products
   */
  static async getTagBySlug(slugOrId: string) {
    return prisma.tag.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
      include: {
        products: {
          include: {
            product: {
              include: {
                brand: true,
                variants: { orderBy: { price: "asc" } },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Create a new tag with auto-slug generation
   */
  static async createTag(data: TagCreateInput) {
    const slug = data.slug ? this.slugify(data.slug) : this.slugify(data.nameEn);
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.tag.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter++}`;
    }

    return prisma.tag.create({
      data: {
        nameEn: data.nameEn.trim(),
        nameAr: data.nameAr.trim(),
        slug: finalSlug,
        description: data.description?.trim(),
        colorHex: data.colorHex || "#171717",
        isFeatured: Boolean(data.isFeatured),
      },
    });
  }

  /**
   * Update an existing tag
   */
  static async updateTag(id: string, data: TagUpdateInput) {
    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) throw new Error(`Tag with ID ${id} not found`);

    let finalSlug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      finalSlug = this.slugify(data.slug);
      const clash = await prisma.tag.findFirst({
        where: { slug: finalSlug, NOT: { id } },
      });
      if (clash) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    return prisma.tag.update({
      where: { id },
      data: {
        nameEn: data.nameEn !== undefined ? data.nameEn.trim() : undefined,
        nameAr: data.nameAr !== undefined ? data.nameAr.trim() : undefined,
        slug: finalSlug,
        description: data.description !== undefined ? data.description?.trim() : undefined,
        colorHex: data.colorHex !== undefined ? data.colorHex : undefined,
        isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : undefined,
      },
    });
  }

  /**
   * Delete a tag and dissociate its product links
   */
  static async deleteTag(id: string) {
    return prisma.tag.delete({
      where: { id },
    });
  }

  /**
   * Synchronize tags for a specific product
   */
  static async setProductTags(productId: string, tagIdsOrNames: string[]) {
    const validTagIds: string[] = [];
    for (const item of tagIdsOrNames) {
      if (!item) continue;
      const byId = await prisma.tag.findUnique({ where: { id: item } });
      if (byId) {
        validTagIds.push(byId.id);
        continue;
      }
      const bySlugOrName = await prisma.tag.findFirst({
        where: {
          OR: [
            { slug: this.slugify(item) },
            { nameEn: { equals: item, mode: "insensitive" } },
            { nameAr: { equals: item, mode: "insensitive" } },
          ],
        },
      });
      if (bySlugOrName) {
        validTagIds.push(bySlugOrName.id);
      } else {
        const created = await this.createTag({
          nameEn: item,
          nameAr: item,
        });
        validTagIds.push(created.id);
      }
    }

    // Delete existing ProductTag relations
    await prisma.productTag.deleteMany({
      where: { productId },
    });

    // Re-create new relations
    if (validTagIds.length > 0) {
      await prisma.productTag.createMany({
        data: validTagIds.map((tagId) => ({
          productId,
          tagId,
        })),
        skipDuplicates: true,
      });
    }

    return this.getProductTags(productId);
  }

  /**
   * Get tags for a specific product
   */
  static async getProductTags(productId: string) {
    const productTags = await prisma.productTag.findMany({
      where: { productId },
      include: { tag: true },
      orderBy: { tag: { nameEn: "asc" } },
    });

    return productTags.map((pt) => ({
      id: pt.tag.id,
      nameEn: pt.tag.nameEn,
      nameAr: pt.tag.nameAr,
      slug: pt.tag.slug,
      colorHex: pt.tag.colorHex || "#171717",
      isFeatured: pt.tag.isFeatured,
    }));
  }

  /**
   * Seed curated authentic luxury tags if table is empty
   */
  static async ensureDefaultTags() {
    const count = await prisma.tag.count();
    if (count > 0) return;

    const defaultTags: TagCreateInput[] = [
      { nameEn: "Signature Scent", nameAr: "عطر التوقيع", slug: "signature-scent", colorHex: "#d4af37", isFeatured: true },
      { nameEn: "Royal Oud", nameAr: "عود ملكي", slug: "royal-oud", colorHex: "#78350f", isFeatured: true },
      { nameEn: "Evening Black-Tie", nameAr: "أمسيات راقية", slug: "evening-black-tie", colorHex: "#000000", isFeatured: true },
      { nameEn: "Summer Fresh", nameAr: "صيفي منعش", slug: "summer-fresh", colorHex: "#0284c7", isFeatured: false },
      { nameEn: "Extrait Concentration", nameAr: "تركيز إكستريت فائق", slug: "extrait-concentration", colorHex: "#854d0e", isFeatured: true },
      { nameEn: "Dubai Exclusive", nameAr: "حصري دبي", slug: "dubai-exclusive", colorHex: "#b45309", isFeatured: true },
      { nameEn: "Sensual Amber", nameAr: "عنبر دافئ", slug: "sensual-amber", colorHex: "#c2410c", isFeatured: false },
      { nameEn: "Gift Idea", nameAr: "هدية فاخرة", slug: "gift-idea", colorHex: "#4338ca", isFeatured: true },
      { nameEn: "Rare Vintage", nameAr: "إصدار نادر", slug: "rare-vintage", colorHex: "#701a75", isFeatured: false },
      { nameEn: "Bespoke Layering", nameAr: "مثالي للمزج والطبقات", slug: "bespoke-layering", colorHex: "#047857", isFeatured: false },
    ];

    for (const t of defaultTags) {
      await prisma.tag.upsert({
        where: { slug: t.slug! },
        create: {
          nameEn: t.nameEn,
          nameAr: t.nameAr,
          slug: t.slug!,
          colorHex: t.colorHex,
          isFeatured: t.isFeatured,
        },
        update: {},
      });
    }

    // Attach tags to existing products if available
    const products = await prisma.product.findMany({ take: 10 });
    const createdTags = await prisma.tag.findMany();
    if (products.length > 0 && createdTags.length > 0) {
      for (let i = 0; i < products.length; i++) {
        const prod = products[i];
        if (!prod) continue;
        const tag1 = createdTags[i % createdTags.length];
        const tag2 = createdTags[(i + 1) % createdTags.length];
        const assignedTags = [tag1?.id, tag2?.id].filter(Boolean) as string[];

        await this.setProductTags(prod.id, assignedTags);
      }
    }
  }
}

