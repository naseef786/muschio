import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

if (!process.env.DATABASE_URL) {
  dotenv.config();
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const dbUrl = process.env.DATABASE_URL;
export const isDatabaseConfigured = Boolean(dbUrl);
const allowPlaceholderForTestOrBuild = Boolean(
  process.env.VITEST || process.env.NEXT_PHASE === "phase-production-build",
);

if (!dbUrl && !allowPlaceholderForTestOrBuild) {
  throw new Error(
    "[SECURITY ERROR] DATABASE_URL environment variable is mandatory but was not found. Prisma cannot initialize without an explicit DATABASE_URL."
  );
}

const effectiveDbUrl =
  dbUrl || "postgresql://vitest:vitest@localhost:5432/muschio_vitest?schema=public";

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: effectiveDbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
