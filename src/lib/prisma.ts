import { PrismaClient } from "@prisma/client";

// Create a global Prisma instance to prevent multiple instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };


export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

// In development, cache the Prisma instance globally to prevent multiple connections
// This prevents creating a new Prisma Client on every hot reload
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}