import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const defaultDatabaseUrl =
  "postgresql://neondb_owner:npg_sQVMUZS9i7gC@ep-noisy-band-b4h6frtw-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

const dbUrl = process.env.DATABASE_URL || defaultDatabaseUrl;

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
