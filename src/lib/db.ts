import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not set. Please configure your database connection."
  );
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || "file:./dev.db",
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
