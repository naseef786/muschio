const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const prods = await prisma.product.findMany({
    select: {
      slug: true,
      nameEn: true,
      images: true,
      brand: { select: { name: true, slug: true } },
      scentFamily: { select: { nameEn: true, slug: true } },
      tags: { select: { tag: { select: { nameEn: true, slug: true } } } },
      variants: { select: { sku: true, volume: true, price: true, compareAtPrice: true } }
    }
  });
  console.log(JSON.stringify(prods, null, 2));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
