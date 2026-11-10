const path = require('path');
const { PrismaClient } = require(path.resolve(__dirname, '../apps/api/node_modules/@prisma/client'));
const prisma = new PrismaClient();

async function check() {
  const [categories, posts, brands, products, banners, sections] = await Promise.all([
    prisma.blogCategory.findMany(),
    prisma.blogPost.findMany({ select: { slug: true, titleEn: true } }),
    prisma.brand.findMany({ select: { slug: true, name: true, isFeatured: true } }),
    prisma.product.findMany({ select: { slug: true, nameEn: true }, take: 5 }),
    prisma.banner.findMany(),
    prisma.homepageSection.findMany()
  ]);

  console.log(JSON.stringify({
    categoriesCount: categories.length,
    postsCount: posts.length,
    brandsCount: brands.length,
    productsCount: products.length,
    bannersCount: banners.length,
    sectionsCount: sections.length,
    posts,
    sampleBrands: brands.slice(0, 8),
  }, null, 2));
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
